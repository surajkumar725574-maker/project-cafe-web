// =====================================================
// CONFIG
// =====================================================

// const API_URL = "https://project-cafe-web.onrender.com";

//retrieving the customer id from local storage




// =====================================================
// ORDER ID FROM URL
// =====================================================

const params = new URLSearchParams(window.location.search);
const id = params.get("id");



// =====================================================
// DOM REFERENCES
// =====================================================

const info = document.getElementById("order-info");
const orderItemContainer = document.getElementById("order-items");

if (!id) {
    info.innerHTML = `
        <div class="info-card">
            Order ID not found. Please place an order first.
        </div>
    `;
}
else {
    fetchOrder();
    setInterval(fetchOrder, 5000);
}

//fetch all orders of a customer


// =====================================================
// FETCH  single ORDER
// =====================================================



function fetchOrder() {
    console.log(`${API_URL}/order/${id}`);

    fetch(`${API_URL}/order/${id}`)

        .then(function (response) {
            return response.json();
        })

        .then(function (order) {
            renderOrder(order);
        });

}


// =====================================================
// MASTER RENDER FUNCTION
// =====================================================

function renderOrder(order) {
    console.log(order);
    console.log(order.items);

    renderStatusCard(order);

    renderTimeline(order);


    orderItemContainer.innerHTML =
        renderItems(order.items);

}


// =====================================================
// STATUS CARD
// =====================================================

function renderStatusCard(order) {

    info.innerHTML = `
        <div class="info-card">

            <div class="item">
                Order #${order.orderNumber}
            </div>

            <div class="item">
                Status : ${order.status}
            </div>

            <div class="item">
                ${getETA(order.status)}
            </div>

        </div>
    `;

}


// =====================================================
// ETA MESSAGES
// =====================================================

function getETA(status) {

    if (status === "new") {
        return "Waiting for cafe confirmation";
    }

    if (status === "accepted") {
        return "Estimated preparation time: 15–20 minutes";
    }

    if (status === "preparing") {
        return "Estimated preparation time: 8–12 minutes";
    }

    if (status === "completed") {
        return "Your order is ready";
    }

    if (status === "cancelled") {
        return "Order cancelled";
    }

    return "";

}


// =====================================================
// TIME FORMATTER
// =====================================================

function formatTime(timeValue) {

    if (!timeValue) {
        return "Pending";
    }

    const date = new Date(timeValue);

    return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });

}


// =====================================================
// TIMELINE ACTIVATION
// =====================================================

function setTimeline(status) {

    const steps = [
        "new",
        "accepted",
        "preparing",
        "completed"
    ];

    if (status === "cancelled") {

        document
            .getElementById("step-cancelled")
            .classList.add("deactive");

        return;

    }

    const currentIndex = steps.indexOf(status);

    for (let i = 0; i <= currentIndex; i++) {

        const stepId = "step-" + steps[i];

        document
            .getElementById(stepId)
            .classList.add("active");

    }

}


// =====================================================
// TIMELINE RESET
// =====================================================

function resetTimeline() {

    const steps = [
        "new",
        "accepted",
        "preparing",
        "completed",
        "cancelled"
    ];

    for (let i = 0; i < steps.length; i++) {

        const stepId = "step-" + steps[i];

        const element =
            document.getElementById(stepId);

        element.classList.remove("active");
        element.classList.remove("deactive");

    }

}


// =====================================================
// SINGLE TIMELINE TIME
// =====================================================

function setTimelineTime(step, timeValue) {

    const stepId = "time-" + step;

    const element =
        document.getElementById(stepId);

    if (!timeValue) {

        element.innerHTML = "Pending";

        return;

    }

    element.innerHTML =
        formatTime(timeValue);

}


// =====================================================
// TIMELINE RENDER
// =====================================================

function renderTimeline(order) {

    resetTimeline();

    setTimeline(order.status);

    setTimelineTime("new", order.createdAt);

    setTimelineTime("accepted", order.acceptedAt);

    setTimelineTime("preparing", order.preparingAt);

    setTimelineTime("completed", order.completedAt);

    setTimelineTime("cancelled", order.cancelledAt);

}


// =====================================================
// ORDER ITEMS
// =====================================================

function renderItems(items) {

    if(!items){
        return;
    }
    console.log(items);
    let html = "";

    let grandTotal = 0;

    for (let i = 0; i < items.length; i++) {

        const itemTotal =
            items[i].price * items[i].quantity;

        grandTotal += itemTotal;

        html += `
            <div class="item-card">

                <div class="items">
                    ${items[i].name}
                </div>

                <div class="items">
                    ₹${items[i].price}
                    ×
                    ${items[i].quantity}
                </div>

                <div class="items">
                    Item Total :
                    ₹${itemTotal}
                </div>

            </div>
        `;
    }

    html += `
        <div class="grand-total">
            Grand Total :
            ₹${grandTotal}
        </div>
    `;

    return html;

}


// =====================================================
// INITIAL LOAD
// =====================================================




// =====================================================
// LIVE POLLING
// =====================================================

//added both feature on the top of the js.....