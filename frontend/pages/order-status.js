// =====================================================
// ORDER STATUS PAGE
// =====================================================
//
// Responsibilities:
//
// 1. Read order id from URL
// 2. Fetch that exact order from backend
// 3. Show current order status
// 4. Render ordered items
// 5. Update timeline according to admin status
// 6. Keep checking backend repeatedly for live updates
//
// Backend route used:
//
// GET /order/:id
//
// Example:
//
// /order/6860abcd123
//
// =====================================================


// =====================================================
// API BASE URL
// =====================================================

const API_URL = "https://project-cafe-web.onrender.com";


// =====================================================
// READ ORDER ID FROM URL
// =====================================================
//
// URL example:
//
// order-status.html?id=6860abcd123
//
// window.location.search gives:
//
// ?id=6860abcd123
//
// URLSearchParams helps extract only the id value.
//

const params = new URLSearchParams(window.location.search);

let orderId = params.get("id");


// =====================================================
// DOM REFERENCES
// =====================================================

let statusText = document.getElementById("status-text");

let orderItems = document.getElementById("order-items");


// =====================================================
// OLD BASIC FETCH IDEA
// =====================================================
//
// Earlier:
//
// function fetchOrderStatus() {
//     fetch(`${API_URL}/order/${orderId}`)
//     .then(function(response) {
//         return response.json();
//     })
//     .then(function(order) {
//         renderOrder(order);
//     })
//     .catch(function(error) {
//         console.log("Failed to fetch order:", error);
//         statusText.innerText = "Unable to load order status";
//     });
// }
//
// Why we improved it:
//
// 1. It assumed backend always returns valid JSON.
// 2. It did not check if orderId exists.
// 3. If backend returned 404 or 500, user saw unclear error.
// 4. Better frontend should handle failed response properly.
//
// =====================================================


// =====================================================
// FETCH ORDER STATUS FROM BACKEND
// =====================================================

function fetchOrderStatus() {

    if (!orderId) {

        statusText.innerText = "Order ID not found";

        orderItems.innerHTML = `
            <p>
                This page needs a valid order id.
            </p>
        `;

        return;

    }

    fetch(`${API_URL}/order/${orderId}`)
    .then(function(response) {

        if (!response.ok) {
            throw new Error("Order could not be loaded");
        }

        return response.json();

    })
    .then(function(order) {

        renderOrder(order);

    })
    .catch(function(error) {

        console.log("Failed to fetch order:", error);

        statusText.innerText = "Unable to load order status";

    });

}


// =====================================================
// RENDER ORDER
// =====================================================
//
// This function receives one order object from backend.
//
// Example order:
//
// {
//     _id: "...",
//     items: [...],
//     total: 250,
//     status: "accepted",
//     createdAt: "...",
//     acceptedAt: "...",
//     preparingAt: null,
//     completedAt: null,
//     cancelledAt: null
// }
//

function renderOrder(order) {

    statusText.innerText =
        "Current status: " + formatStatus(order.status);

    renderTimeline(order);

    renderItems(order.items, order.total);

}


// =====================================================
// OLD TIMELINE METHOD
// =====================================================
//
// Earlier:
//
// function renderTimeline(status) {
//     let steps = ["new", "accepted", "preparing", "completed"];
//
//     document.querySelectorAll(".step").forEach(function(step) {
//         step.classList.remove("active");
//     });
//
//     if (status === "cancelled") {
//         document.getElementById("step-cancelled").classList.add("active");
//         return;
//     }
//
//     let currentIndex = steps.indexOf(status);
//
//     for (let i = 0; i <= currentIndex; i++) {
//         document.getElementById("step-" + steps[i]).classList.add("active");
//     }
// }
//
// Why we dropped this:
//
// 1. It only received status.
// 2. It could not show timestamps.
// 3. It could not access createdAt, acceptedAt, preparingAt.
// 4. Real tracker needs full order data, not just status.
//
// New method:
//
// renderTimeline(order)
//
// Because order contains:
// - status
// - createdAt
// - acceptedAt
// - preparingAt
// - completedAt
// - cancelledAt
//
// =====================================================


// =====================================================
// RENDER TIMELINE
// =====================================================

function renderTimeline(order) {

    let status = order.status;

    let normalSteps = [
        "new",
        "accepted",
        "preparing",
        "completed"
    ];

    resetTimeline();

    setTimelineTime("new", order.createdAt);
    setTimelineTime("accepted", order.acceptedAt);
    setTimelineTime("preparing", order.preparingAt);
    setTimelineTime("completed", order.completedAt);
    setTimelineTime("cancelled", order.cancelledAt);

    if (status === "cancelled") {

        document
            .getElementById("step-cancelled")
            .classList.add("active", "cancelled-active");

        return;

    }

    let currentIndex = normalSteps.indexOf(status);

    for (let i = 0; i <= currentIndex; i++) {

        let stepId = "step-" + normalSteps[i];

        document
            .getElementById(stepId)
            .classList.add("active");

    }

}


// =====================================================
// RESET TIMELINE
// =====================================================
//
// Before rendering current status, remove old active classes.
// This prevents old UI state from staying stuck.
//

function resetTimeline() {

    let allSteps = document.querySelectorAll(".timeline-step");

    for (let i = 0; i < allSteps.length; i++) {

        allSteps[i].classList.remove(
            "active",
            "cancelled-active"
        );

    }

}


// =====================================================
// SET TIME TEXT
// =====================================================
//
// If timestamp exists:
// show readable time.
//
// If timestamp does not exist:
// show Pending.
//

function setTimelineTime(step, timeValue) {

    let timeElement = document.getElementById(
        "time-" + step
    );

    if (!timeElement) {
        return;
    }

    if (!timeValue) {

        timeElement.innerText = "Pending";

        return;

    }

    timeElement.innerText = formatTime(timeValue);

}


// =====================================================
// RENDER ORDER ITEMS
// =====================================================

function renderItems(items, total) {

    let html = "";

    if (!Array.isArray(items) || items.length === 0) {

        orderItems.innerHTML = `
            <p>No items found in this order.</p>
        `;

        return;

    }

    for (let i = 0; i < items.length; i++) {

        html += `
            <div class="order-status-item">

                <p>
                    <strong>${items[i].name}</strong>
                </p>

                <p>
                    ₹${items[i].price} × ${items[i].quantity}
                </p>

                <p>
                    Item total: ₹${items[i].price * items[i].quantity}
                </p>

            </div>
        `;

    }

    html += `
        <div class="order-status-total">
            <strong>Total: ₹${total}</strong>
        </div>
    `;

    orderItems.innerHTML = html;

}


// =====================================================
// FORMAT STATUS TEXT
// =====================================================

function formatStatus(status) {

    if (status === "new") {
        return "Order Placed";
    }

    if (status === "accepted") {
        return "Accepted";
    }

    if (status === "preparing") {
        return "Preparing";
    }

    if (status === "completed") {
        return "Completed";
    }

    if (status === "cancelled") {
        return "Cancelled";
    }

    return status;

}


// =====================================================
// FORMAT TIME
// =====================================================
//
// MongoDB stores date like:
//
// 2026-06-06T12:45:22.123Z
//
// new Date() converts it into a JavaScript Date object.
// toLocaleTimeString() makes it readable.
//

function formatTime(timeValue) {

    let date = new Date(timeValue);

    return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });

}


// =====================================================
// INITIAL LOAD
// =====================================================

fetchOrderStatus();


// =====================================================
// LIVE UPDATE CHECKER
// =====================================================
//
// Every 5 seconds, this page asks backend:
//
// "What is the current status of this order?"
//
// If admin changed status from admin panel,
// backend returns new status,
// and timeline updates automatically.
//
// This is called polling.
//
// Why polling:
//
// 1. Easy for beginner project.
// 2. No WebSocket complexity.
// 3. Works well for small café system.
// 4. Similar result for user, even if not technically real-time.
//

setInterval(fetchOrderStatus, 5000);


console.log("order-status.js connected");