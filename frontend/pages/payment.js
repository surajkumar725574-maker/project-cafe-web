// =====================================================
// PAYMENT PAGE
// =====================================================
//
// Responsibilities:
//
// 1. Load cart from backend
// 2. Show order summary
// 3. Calculate payable total
// 4. Start Razorpay payment
// 5. Verify payment
// 6. Save order in MongoDB
// 7. Clear cart
// 8. Redirect customer to order-status page
//
// =====================================================


// =====================================================
// API BASE URL
// =====================================================

const API_URL = "https://project-cafe-web.onrender.com";


// =====================================================
// DATA STORAGE
// =====================================================

let cart = [];
let total = 0;


// =====================================================
// DOM REFERENCES
// =====================================================

let orderSummary = document.getElementById("order-summary");
let totalAmount = document.getElementById("total-amount");
let paymentMessage = document.getElementById("payment-message");


// =====================================================
// CART LOADER
// =====================================================
//
// Old issue:
//
// Earlier cart was localStorage based.
// Now cart is stored in MongoDB through backend.
//
// So payment page fetches cart from backend.
//

function cartLoader() {

    fetch(`${API_URL}/cart`)
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {

        cart = data;

        calculateTotal();
        renderOrderSummary();

    })
    .catch(function(error) {

        console.log("Failed to load cart:", error);
        paymentMessage.innerText = "Unable to load cart";

    });

}


// =====================================================
// TOTAL CALCULATOR
// =====================================================

function calculateTotal() {

    total = 0;

    for (let i = 0; i < cart.length; i++) {
        total += cart[i].price * cart[i].quantity;
    }
document.getElementById("total-amount").innerHTML =
`₹${total}`;
document.getElementById("sticky-total").innerText =
`₹${total}`;
    return total;

}


// =====================================================
// ORDER SUMMARY RENDERER
// =====================================================

function renderOrderSummary() {

    orderSummary.innerHTML = "";

    if (cart.length === 0) {

        orderSummary.innerHTML = `
            <p>Your cart is empty.</p>
        `;

        totalAmount.innerHTML = `
            <div id="total-amount-card">
                <p>Total amount : ₹0</p>
            </div>
        `;

        return;

    }

    for (let i = 0; i < cart.length; i++) {

        orderSummary.innerHTML += `
            <div class="payment-cart-item">

                <p>
                    <strong>${cart[i].name}</strong>:
                    ₹${cart[i].price} × ${cart[i].quantity}
                </p>

                <hr>

            </div>
        `;

    }

    totalAmount.innerHTML = `
        <div id="total-amount-card">
            <p>Total amount : ₹${total}</p>
        </div>
    `;

}


// =====================================================
// START PAYMENT
// =====================================================
//
// Real flow:
//
// Customer clicks Pay Now
// ↓
// Backend creates Razorpay order
// ↓
// Razorpay popup opens
// ↓
// On success, paymentSuccessHandler() runs
//

function startPayment() {

    if (cart.length === 0) {

        paymentMessage.innerText = "Cart is empty";

        return;

    }

    fetch(`${API_URL}/create-razorpay-order`, {
        method: "POST"
    })
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {

        if (!data.orderId) {
            paymentMessage.innerText = data.message || "Unable to start payment";
            return;
        }

        let options = {

            key: "rzp_test_SxrR7Km1WeaFiV",

            amount: data.amount,

            currency: data.currency,

            order_id: data.orderId,

            name: "Suraj Cafe",

            handler: function(response) {

                paymentSuccessHandler(response);

            }

        };

        let paymentObject = new Razorpay(options);

        paymentObject.on("payment.failed", function(response) {

            paymentFailureHandler(response.error);

        });

        paymentObject.open();

    })
    .catch(function(error) {

        console.log("Payment start failed:", error);
        paymentMessage.innerText = "Unable to start payment";

    });

}


// =====================================================
// PAYMENT SUCCESS HANDLER
// =====================================================
//
// Current learning mode:
//
// Backend still accepts test_payment values.
// Later, when using real Razorpay response,
// pass actual response.razorpay_payment_id,
// response.razorpay_order_id,
// response.razorpay_signature.
//

function paymentSuccessHandler(razorpayResponse) {

    fetch(`${API_URL}/payment/verify`, {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({

            // Temporary test values.
            // Keep this while backend test verification is active.

            razorpay_payment_id: "test_payment",
            razorpay_order_id: "test_order",
            razorpay_signature: "test_signature"

            /*
            Real Razorpay version later:

            razorpay_payment_id: razorpayResponse.razorpay_payment_id,
            razorpay_order_id: razorpayResponse.razorpay_order_id,
            razorpay_signature: razorpayResponse.razorpay_signature
            */

        })

    })
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {

        if (data.verified) {

            placeOrder();

        }
        else {

            paymentFailureHandler();

        }

    })
    .catch(function(error) {

        console.log("Payment verification failed:", error);
        paymentMessage.innerText = "Payment verification failed";

    });

}


// =====================================================
// PAYMENT FAILURE HANDLER
// =====================================================

function paymentFailureHandler(error) {

    if (error && error.description) {

        paymentMessage.innerText = error.description;

        return;

    }

    paymentMessage.innerText = "Payment failed. Please try again.";

}


// =====================================================
// PLACE ORDER
// =====================================================
//
// Old issue:
//
// Earlier order was saved, but redirect failed because
// data was lost between two .then() blocks.
//
// Current method:
//
// One clean .then() receives data,
// checks data.order._id,
// stores it,
// clears cart,
// redirects user to tracking page.
//

function placeOrder() {

    fetch(`${API_URL}/order`, {

        method: "POST",

        body: JSON.stringify(cart),

        headers: {
            "Content-Type": "application/json"
        }

    })
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {

        if (!data.order || !data.order._id) {

            console.log("Invalid order response:", data);

            paymentMessage.innerText = "Order was not saved properly";

            return;

        }

        localStorage.setItem(
            "currentOrderId",
            data.order._id
        );

        clearCart(data.order._id);

    })
    .catch(function(error) {

        console.log("Place order failed:", error);
        paymentMessage.innerText = "Failed to place order";

    });

}


// =====================================================
// CLEAR CART
// =====================================================
//
// Better flow:
//
// Save order first
// ↓
// Clear cart
// ↓
// Redirect to order-status.html?id=...
//

function clearCart(orderId) {

    fetch(`${API_URL}/cart/clear`, {
        method: "POST"
    })
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {

        cart = data.cart;

        calculateTotal();
        renderOrderSummary();

        paymentMessage.innerText = "Order placed successfully";

        window.location.href =
            `order-status.html?id=${orderId}`;

    })
    .catch(function(error) {

        console.log("Failed to clear cart:", error);

        // Even if cart clear fails, user can still track order.
        window.location.href =
            `order-status.html?id=${data.order._id}`;

    });

}


// =====================================================
// INITIALIZATION
// =====================================================

cartLoader();

console.log("payment.js connected");