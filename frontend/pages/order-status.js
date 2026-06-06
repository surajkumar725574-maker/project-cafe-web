// =====================================================
// ORDER STATUS PAGE
// =====================================================
//
// Responsibilities:
//
// 1. Read order id from URL
// 2. Fetch exact order from backend
// 3. Show current status
// 4. Render order items
// 5. Render timeline
// 6. Poll backend every 5 seconds
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
// URL:
//
// order-status.html?id=ORDER_ID
//
// window.location.search gives:
//
// ?id=ORDER_ID
//

const params = new URLSearchParams(window.location.search);

let orderId = params.get("id");


// =====================================================
// FALLBACK ORDER ID
// =====================================================
//
// If user opens order-status.html directly,
// URL may not contain id.
//
// In that case we try localStorage.
// payment.js stores currentOrderId after order save.
//

if (!orderId) {

    orderId = localStorage.getItem("currentOrderId");

}


// =====================================================
// DOM REFERENCES
// =====================================================

let statusText = document.getElementById("status-text");
let orderItems = document.getElementById("order-items");


// =====================================================
// FETCH ORDER STATUS
// =====================================================
//
// This asks backend:
//
// GET /order/:id
//
// Backend returns one order object.
//

function fetchOrderStatus() {

    if (!orderId) {

        statusText.innerText = "Order ID not found";

        orderItems.innerHTML = `
            <p>
                No recent order found.
                Please place an order first.
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

function renderOrder(order) {

    statusText.innerText =
        "Current status: " + formatStatus(order.status);

    renderTimeline(order);

    renderItems(order.items, order.total);

}


// =====================================================
// RENDER TIMELINE
// =====================================================
//
// Normal flow:
//
// new → accepted → preparing → completed
//
// Cancelled is treated separately because it is not a
// normal forward step. It can happen at any point.
//

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

    if (currentIndex === -1) {
        return;
    }

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
// SET TIMELINE TIME
// =====================================================

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
// Polling:
//
// Every 5 seconds this page asks backend for latest order.
// If admin updates status, user page updates automatically.
//

setInterval(fetchOrderStatus, 5000);


console.log("order-status.js connected");