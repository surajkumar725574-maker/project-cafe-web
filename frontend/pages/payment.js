// =====================================================
// PAYMENT PAGE
// =====================================================
//
// This page is only responsible for:
//
// 1. Loading cart from backend
// 2. Showing final order summary
// 3. Calculating total payable amount
// 4. Starting payment
// 5. After successful payment, placing order
// 6. Clearing cart
//
// It should NOT handle:
// - increasing quantity
// - decreasing quantity
// - menu rendering
//
// Those belong to cart.js and food.js.
//
// =====================================================


// =====================================================
// OLD PAYMENT CODE / LEARNING NOTES
// =====================================================
//
// Earlier code:
//
// let cart = [];
//
// let ordersummary = document.getElementsByClassName("payment-summary");
// let totalamount = document.getElementsByClassName("payment-summary");
//
// Problem 1:
//
// getElementsByClassName() returns a collection,
// not one exact element.
//
// So this is unsafe:
//
// ordersummary.innerHTML = "";
//
// Better:
//
// document.getElementById("order-summary")
//
// -----------------------------------------------------
//
// Problem 2:
//
// showOrderSummary();
// cartLoader();
//
// This order is wrong.
//
// Why?
//
// showOrderSummary() runs immediately.
// At that time cart is still:
//
// []
//
// Then cartLoader() fetches cart later.
//
// Correct flow:
//
// cartLoader()
// ↓
// cart = backend data
// ↓
// calculateTotal()
// ↓
// renderOrderSummary()
//
// -----------------------------------------------------
//
// Problem 3:
//
// localStorage.removeItem("cart")
//
// Earlier cart was stored in localStorage.
// Now cart is stored on backend.
//
// So clearing cart should happen through backend:
//
// POST /cart/clear
// or
// DELETE /cart
//
// =====================================================


// =====================================================
// OLD showOrderSummary() IDEA
// =====================================================
//
// function showOrderSummary() {
//
//     ordersummary.innerHTML = "";
//
//     let total = 0;
//
//     for (let i = 0; i < cart.length; i++) {
//
//         total += cart[i].price * cart[i].quantity;
//
//         ordersummary.innerHTML += `
//             <div class="ordered-item">
//                 <p>${cart[i].name} x ${cart[i].quantity}</p>
//                 = ₹${cart[i].price * cart[i].quantity}
//             </div>
//         `;
//     }
//
//     totalamount.innerHTML = `
//         <div>Total : ₹${total}</div>
//     `;
// }
//
// Why we are not directly using this now:
//
// 1. total should be stored globally for payment.
// 2. cart should be loaded before rendering.
// 3. order summary and total should ideally have separate DOM elements.
//
// =====================================================


// =====================================================
// OLD placeOrder() IDEA
// =====================================================
//
// function placeOrder() {
//
//     fetch("http://localhost:3000/order", {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json"
//         },
//         body: JSON.stringify(cart)
//     })
//     .then(function(response) {
//         return response.json();
//     })
//     .then(function(data) {
//         console.log(data);
//         localStorage.removeItem("cart");
//         alert("Order Placed Successfully");
//     });
// }
//
// Why this must change:
//
// Earlier:
//
// Place Order
// ↓
// order saved immediately
//
// But with payment gateway:
//
// Pay Now
// ↓
// payment success
// ↓
// then placeOrder()
//
// Because unpaid orders should not reach admin.
//
// =====================================================


// =====================================================
// DATA STORAGE
// =====================================================

let cart = [];


// =====================================================
// DOM REFERENCES
// =====================================================
//
// Use ids because payment page has one exact:
// - order summary box
// - total amount box
// - message box
//

let orderSummary = document.getElementById("order-summary");
let totalAmount = document.getElementById("total-amount");
let paymentMessage = document.getElementById("payment-message");


// =====================================================
// CART LOADER
// =====================================================
//
// Purpose:
//
// Fetch current cart from backend.
// After cart is received, calculate total and render summary.
//

function cartLoader() {

    fetch("https://project-cafe-web.onrender.com/cart")
    .then(function (response){
        return response.json();
    })
    .then(function(data){
        cart=data;
        console.log(cart);
        calculateTotal();
renderOrderSummary();
    })
}
    // fetch GET /cart
    // cart = data
    // calculateTotal()
    // renderOrderSummary()




// =====================================================
// TOTAL CALCULATOR
// =====================================================
//
// Purpose:
//
// Loop through cart and calculate final payable amount.
//
// total should be reset to 0 each time,
// otherwise repeated calculations will keep increasing total.
//

let total=0;
function calculateTotal() {
     total=0;
    for(let i=0;i<cart.length;i++){
      total+=cart[i].price*cart[i].quantity;
    }
    return total;

    // total = 0
    // loop cart
    // total += price * quantity

}


// =====================================================
// ORDER SUMMARY RENDERER
// =====================================================
//
// Purpose:
//
// Render cart items and final total.
//
// This function should not fetch.
// It only uses existing cart and total.
//

function renderOrderSummary() {

    orderSummary.innerHTML="";
    for(let i=0;i<cart.length;i++){
      orderSummary.innerHTML+=`
      <div id="cart-items">
   <p>${cart[i].name}:   ${cart[i].price} x ${cart[i].quantity}</p><hr>

      `;
    }
    totalAmount.innerHTML=`<div id="total-amount-card">
        <p>Total:${total}</p>
    </div>`;

    // orderSummary.innerHTML = ""
    // loop cart
    // show name, quantity, item total
    // totalAmount.innerHTML = total

}


// =====================================================
// START PAYMENT
// =====================================================
//
// Purpose:
//
// Runs when customer clicks Pay Now.
//
// For now, this can call fake payment success.
// Later, Razorpay popup starts here.
//

function startPayment() {

    if(cart.length === 0){
        paymentMessage.innerText = "Cart is empty";
        return;
    }

    fetch("https://project-cafe-web.onrender.com/create-razorpay-order",{
        method:"POST"
    }
)
.then((response)=>response.json())
.then(function (data)
{
    
let options = {
    key: "rzp_test_SxrR7Km1WeaFiV",
    amount: data.amount,
    currency: data.currency,
    order_id: data.orderId,
    name: "Suraj Cafe",

   handler: function(response){
    console.log("Payment success response:", response);
    paymentSuccessHandler();
}

};
 let paymentObject=new Razorpay(options);
 paymentObject.on("payment.failed", function(response){
    console.log("Payment failed:", response.error);
    paymentFailureHandler(response.error);
});
paymentObject.open();

//  let window_update=paymentObject.open();

// if(window_object){
//     paymentSuccessHandler();
//     return;
// }
// else{
//     paymentFailureHandler();
//     return;


// }
});




    // paymentSuccessHandler();

    // if cart empty:
    //     show message
    //     return

    // fake payment success for now:
    // paymentSuccessHandler()


}

// =====================================================
// PAYMENT SUCCESS HANDLER
// =====================================================
//
// Purpose:
//
// Only runs after payment succeeds.
//
// Real flow:
//
// payment success
// ↓
// placeOrder()
// ↓
// clearCart()
// ↓
// show success message
// ↓
// redirect
//

function paymentSuccessHandler() {

    fetch("https://project-cafe-web.onrender.com/payment/verify",{

        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body: JSON.stringify({
   razorpay_payment_id: "test_payment",
    razorpay_order_id: "test_order",
    razorpay_signature: "test_signature"


        }),

    })
    .then(function(response){
        return response.json();

    })
    .then(function(data){

    if(data.verified){
        placeOrder();
    }
    else{
        paymentFailureHandler();
    }



        
    })


}


// =====================================================
// PAYMENT FAILURE HANDLER
// =====================================================
//
// Purpose:
//
// Runs if payment fails or user cancels.
//

function paymentFailureHandler() {

    // show failure message
    

    
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
// Purpose:
//
// Send paid cart to backend order system.
//
// This should happen only after successful payment.
//

function placeOrder() {

    fetch("https://project-cafe-web.onrender.com/order",{
        method:"POST",
        body:JSON.stringify(cart),
        headers:{
            "Content-Type":"application/json"
        }
    })
    .then(function (response){
        return response.json();
    })
    .then(function(data){
        // orders=data.orders,
        // console.log(orders);
        console.log(data.message);
        clearCart();
    })
    // POST /order
    // body: cart
    // after success:
    // clearCart()

}


// =====================================================
// CLEAR CART
// =====================================================
//
// Purpose:
//
// Clear backend cart after successful order.
//
// Since cart now lives on backend,
// do not use localStorage.removeItem("cart").
//

function clearCart() {

    fetch("https://project-cafe-web.onrender.com/cart/clear",{
        method:"POST"
    })
    .then(function(response){
        return response.json();
    })
    .then(function(data){
        cart=data.cart;
        calculateTotal();
        renderOrderSummary();


paymentMessage.innerText = "Order placed successfully";
    })

    // POST /cart/clear
    // or DELETE /cart

}


// =====================================================
// REDIRECT AFTER SUCCESS
// =====================================================
//
// Purpose:
//
// After successful payment + order,
// move customer to success page or menu page.
//

function redirectAfterSuccess() {
    // window.location.href = "success.html"

}


// =====================================================
// INITIALIZATION
// =====================================================
//
// Payment page starts by loading backend cart.
//

cartLoader();

console.log("payment.js connected");