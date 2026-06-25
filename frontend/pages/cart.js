// // // let cart = JSON.parse(localStorage.getItem("cart")) || [];



// let cart=[];
// // // console.log("Cart page loaded:", cart);
// // // let total=0;
// // // let cartHis=document.getElementById("cartSummary");
// // // // for(let i=0;i<cart.length;i++){

// // // //     // print({console.log(cart[i].name),
// // // //         // console.log(cart[i].price),
// // // //         // console.log(cart[i].quantity),
// // // //         console.log(cart[i]),
// // // //          total+=cart[i].price*cart[i].quantity,
// // // //         console.log(cart[i].name,
// // // //             cart[i].price,
// // // //             cart[i].quantity
// // // //         )

// // // //         console.log(total)
// // // // }

// // //  let cartdiv=document.getElementById("cartItems");
// // // for(let i=0;i<cart.length;i++){
    
// // // //  cartdiv.innerHTML+=cart[i].name+"<br>"+cart[i].price+"<br>"+cart[i].quantity+"<br>"

// // //     cartdiv.innerHTML+=`<div class="cart-items">
// // //         <div class="items">${cart[i].name}</div>
// // //         <div class="items">Price:₹${cart[i].price}</div>
// // //         <div class="items">Qty:${cart[i].quantity}</div>
// // //         <div>
// // //         <button onclick="additems('${cart[i].name}')">+</button>
// // //         <button onclick="deleteitems('${cart[i].name}')">-</button>
// // //       </div>
// // //     </div>
    
// // //     `;
// // //      total+=cart[i].price*cart[i].quantity

// // // }

// // //  cartHis.innerHTML=`<div class="cart-summary">
// // // <div class="items">Total: ${total}</div>
// // // </div>`;


// // //  function additems(name){
// // // for(let i=0;i<cart.length;i++){
// // //         if(cart[i].name===name){
// // //             cart[i].quantity++;
// // //             localStorage.setItem("cart",JSON.stringify(cart));
            
// // //             return;
// // //     }
// // // }
// // //  }
// // //  function deleteitems(name){
// // //     for(let i=0;i<cart.length;i++){
// // //         if(cart[i].name===name){
// // //             if(cart[i].quantity>1){
// // //             cart[i].quantity--;
// // //             localStorage.setItem("cart",JSON.stringify(cart));
// // //             location.reload();
// // //             return;
// // //             }
// // //             else{
// // //                 cart.splice(i,1);
// // //                 localStorage.setItem("cart",JSON.stringify(cart));
// // //                 location.reload();
// // //                 return;
// // //             }
        
// // //     }
// // // }
// // // //  


// // // // {/* <div>
// // // // <div>name</div>
// // // // <div>price</div>
// // // // <div>quantity</div>
// // // // </div> */}
// // // //for transitioning to individual level css i upgraded to div //

// // let cart = JSON.parse(localStorage.getItem("cart")) || [];

// let cartdiv = document.getElementById("cartItems");
// let cartHis = document.getElementById("cartSummary");

// function renderCart(){
//     cartdiv.innerHTML = "";
//     cartHis.innerHTML = "";

//     let total = 0;

//     for(let i = 0; i < cart.length; i++){
//         // render item card
//         // add to total
//         cartdiv.innerHTML+=`<div class="cart-items">
//         <div class="items">${cart[i].name}</div>
//         <div class="items">Price:₹${cart[i].price}</div>
//         <div class="items">Qty:${cart[i].quantity}</div>
//         <div>
//         <button onclick="additems('${cart[i].name}')">+</button>
//         <button onclick="deleteitems('${cart[i].name}')">-</button>
//       </div>
//     </div>
    
//     `;
//      total+=cart[i].price*cart[i].quantity

//     }

//     // render total
//     cartHis.innerHTML=`<div class="cart-summary">
// <div class="items">Total:₹ ${total}</div>
// </div>`;

// }




// // function additems(name){
// //     // update cart
// //     // save localStorage
// //     // renderCart()
// //      for(let i=0;i<cart.length;i++){
// //         if(cart[i].name===name){
// //             cart[i].quantity++;
// //             localStorage.setItem("cart",JSON.stringify(cart));
// //             renderCart();
// //             return;
// //     }
// // }
// // }

// // function deleteitems(name){
// //     // update cart
// //     // save localStorage
// //     // renderCart()
// //      for(let i=0;i<cart.length;i++){
// //         if(cart[i].name===name){
// //             if(cart[i].quantity>1){
// //             cart[i].quantity--;
// //             localStorage.setItem("cart",JSON.stringify(cart));
// //             renderCart();
// //             return;
// //             }
// //             else{
// //                 cart.splice(i,1);
// //                 localStorage.setItem("cart",JSON.stringify(cart));
// //                 renderCart();
// //                 return;
// //             }
        
// //     }
// // }
    
// // }

// // renderCart();

// // 
// function cartLoader(){
//     fetch("https://project-cafe-web.onrender.com/cart")
//     .then(function (response){
//         return response.json();
//     })
//     .then(function(data){
//         cart=data;
//         renderCart();
//         console.log(cart);
//     })
// }

// function additems(name){
//     fetch("https://project-cafe-web.onrender.com/cart/name",{
//         method:"POST",

//         headers:{
//            "Content-Type":"application/json"
//         },
//         body:JSON.stringify({
//             name:name,
            
//         })
//     })
//     .then(function(response){
//         return response.json();
//     })
//     .then(function (data){
//         cart=data.cart;
//         renderCart();
//     })
// }

//  function deleteitems(name){
//     fetch("https://project-cafe-web.onrender.com/cart/decrease", {
//     method: "POST",
//     headers: {
//         "Content-Type": "application/json"
//     },
//     body: JSON.stringify({
//         name: name
//     })
//  })

//     .then(function (response){
//        return response.json();
//     })
//     .then(function(data){
//         cart=data.cart;
//         renderCart();
//         console.log(cart);
//     })
//  }

// cartLoader();

// =====================================================
// CART PAGE
// =====================================================
//
// Responsibilities:
//
// 1. Fetch cart from backend
// 2. Render cart items
// 3. Increase item quantity
// 4. Decrease item quantity
// 5. Show total
//
// Old localStorage cart is removed because
// backend MongoDB cart is now the source of truth.
//
// =====================================================

const API_URL = "https://project-cafe-web.onrender.com";

let cart = [];

let cartdiv = document.getElementById("cartItems");
let cartHis = document.getElementById("cartSummary");


// =====================================================
// LOAD CART
// =====================================================

function cartLoader() {

    fetch(`${API_URL}/cart`)
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {

        cart = data;
        renderCart();

    })
    .catch(function(error) {

        console.log("Failed to load cart:", error);

        cartdiv.innerHTML = `
            <div class="cart-items">
                <p>Unable to load cart.</p>
            </div>
        `;

    });

}


// =====================================================
// RENDER CART
// =====================================================

function renderCart() {

    cartdiv.innerHTML = "";
    cartHis.innerHTML = "";

    if (cart.length === 0) {

        cartdiv.innerHTML = `
            <div class="cart-items">
                <p>Your cart is empty.</p>
            </div>
        `;

        cartHis.innerHTML = `
            <div class="cart-summary">
                <div class="items">Total: ₹0</div>
            </div>
        `;

        return;

    }

    let total = 0;

    for (let i = 0; i < cart.length; i++) {

        cartdiv.innerHTML += `
            <div class="cart-items">

                <div class="items">
                    ${cart[i].name}
                </div>

                <div class="items">
                    Price: ₹${cart[i].price}
                </div>

                <div class="items">
                    Qty: ${cart[i].quantity}
                </div>

                <div class="cart-actions">
                    <button onclick="additems('${cart[i].name}')">+</button>
                    <button onclick="deleteitems('${cart[i].name}')">-</button>
                </div>

            </div>
        `;

        total += cart[i].price * cart[i].quantity;

    }

    cartHis.innerHTML = `
        <div class="cart-summary">
            <div class="items">Total: ₹${total}</div>
        </div>
    `;

}


// =====================================================
// INCREASE QUANTITY
// =====================================================

function additems(name) {

    fetch(`${API_URL}/cart/Increase`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: name
        })
    })
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {

        cart = data.cart;
        renderCart();

    })
    .catch(function(error) {
        console.log("Failed to increase quantity:", error);
    });

}


// =====================================================
// DECREASE QUANTITY
// =====================================================

function deleteitems(name) {

    fetch(`${API_URL}/cart/decrease`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: name
        })
    })
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {

        cart = data.cart;
        renderCart();

    })
    .catch(function(error) {
        console.log("Failed to decrease quantity:", error);
    });

}


// =====================================================
// INITIALIZATION
// =====================================================

cartLoader();

console.log("cart.js connected");