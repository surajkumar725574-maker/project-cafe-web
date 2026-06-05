// // let cart = JSON.parse(localStorage.getItem("cart")) || [];



let cart=[];
// // console.log("Cart page loaded:", cart);
// // let total=0;
// // let cartHis=document.getElementById("cartSummary");
// // // for(let i=0;i<cart.length;i++){

// // //     // print({console.log(cart[i].name),
// // //         // console.log(cart[i].price),
// // //         // console.log(cart[i].quantity),
// // //         console.log(cart[i]),
// // //          total+=cart[i].price*cart[i].quantity,
// // //         console.log(cart[i].name,
// // //             cart[i].price,
// // //             cart[i].quantity
// // //         )

// // //         console.log(total)
// // // }

// //  let cartdiv=document.getElementById("cartItems");
// // for(let i=0;i<cart.length;i++){
    
// // //  cartdiv.innerHTML+=cart[i].name+"<br>"+cart[i].price+"<br>"+cart[i].quantity+"<br>"

// //     cartdiv.innerHTML+=`<div class="cart-items">
// //         <div class="items">${cart[i].name}</div>
// //         <div class="items">Price:₹${cart[i].price}</div>
// //         <div class="items">Qty:${cart[i].quantity}</div>
// //         <div>
// //         <button onclick="additems('${cart[i].name}')">+</button>
// //         <button onclick="deleteitems('${cart[i].name}')">-</button>
// //       </div>
// //     </div>
    
// //     `;
// //      total+=cart[i].price*cart[i].quantity

// // }

// //  cartHis.innerHTML=`<div class="cart-summary">
// // <div class="items">Total: ${total}</div>
// // </div>`;


// //  function additems(name){
// // for(let i=0;i<cart.length;i++){
// //         if(cart[i].name===name){
// //             cart[i].quantity++;
// //             localStorage.setItem("cart",JSON.stringify(cart));
            
// //             return;
// //     }
// // }
// //  }
// //  function deleteitems(name){
// //     for(let i=0;i<cart.length;i++){
// //         if(cart[i].name===name){
// //             if(cart[i].quantity>1){
// //             cart[i].quantity--;
// //             localStorage.setItem("cart",JSON.stringify(cart));
// //             location.reload();
// //             return;
// //             }
// //             else{
// //                 cart.splice(i,1);
// //                 localStorage.setItem("cart",JSON.stringify(cart));
// //                 location.reload();
// //                 return;
// //             }
        
// //     }
// // }
// // //  


// // // {/* <div>
// // // <div>name</div>
// // // <div>price</div>
// // // <div>quantity</div>
// // // </div> */}
// // //for transitioning to individual level css i upgraded to div //

// let cart = JSON.parse(localStorage.getItem("cart")) || [];

let cartdiv = document.getElementById("cartItems");
let cartHis = document.getElementById("cartSummary");

function renderCart(){
    cartdiv.innerHTML = "";
    cartHis.innerHTML = "";

    let total = 0;

    for(let i = 0; i < cart.length; i++){
        // render item card
        // add to total
        cartdiv.innerHTML+=`<div class="cart-items">
        <div class="items">${cart[i].name}</div>
        <div class="items">Price:₹${cart[i].price}</div>
        <div class="items">Qty:${cart[i].quantity}</div>
        <div>
        <button onclick="additems('${cart[i].name}')">+</button>
        <button onclick="deleteitems('${cart[i].name}')">-</button>
      </div>
    </div>
    
    `;
     total+=cart[i].price*cart[i].quantity

    }

    // render total
    cartHis.innerHTML=`<div class="cart-summary">
<div class="items">Total:₹ ${total}</div>
</div>`;

}




// function additems(name){
//     // update cart
//     // save localStorage
//     // renderCart()
//      for(let i=0;i<cart.length;i++){
//         if(cart[i].name===name){
//             cart[i].quantity++;
//             localStorage.setItem("cart",JSON.stringify(cart));
//             renderCart();
//             return;
//     }
// }
// }

// function deleteitems(name){
//     // update cart
//     // save localStorage
//     // renderCart()
//      for(let i=0;i<cart.length;i++){
//         if(cart[i].name===name){
//             if(cart[i].quantity>1){
//             cart[i].quantity--;
//             localStorage.setItem("cart",JSON.stringify(cart));
//             renderCart();
//             return;
//             }
//             else{
//                 cart.splice(i,1);
//                 localStorage.setItem("cart",JSON.stringify(cart));
//                 renderCart();
//                 return;
//             }
        
//     }
// }
    
// }

// renderCart();

// 
function cartLoader(){
    fetch("http://localhost:3000/cart")
    .then(function (response){
        return response.json();
    })
    .then(function(data){
        cart=data;
        renderCart();
        console.log(cart);
    })
}

function additems(name){
    fetch("http://localhost:3000/cart/name",{
        method:"POST",

        headers:{
           "Content-Type":"application/json"
        },
        body:JSON.stringify({
            name:name,
            
        })
    })
    .then(function(response){
        return response.json();
    })
    .then(function (data){
        cart=data.cart;
        renderCart();
    })
}

 function deleteitems(name){
    fetch("http://localhost:3000/cart/decrease", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        name: name
    })
 })

    .then(function (response){
       return response.json();
    })
    .then(function(data){
        cart=data.cart;
        renderCart();
        console.log(cart);
    })
 }

cartLoader();