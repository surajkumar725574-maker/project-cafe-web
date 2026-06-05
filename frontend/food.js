// // =====================================================
// // CART LOADING
// // =====================================================

// let cart =[];
    




// // =====================================================
// // MENU DATA
// // =====================================================
// //
// // Active menu starts empty.
// // Backend will fill it using fetch("/menu").
// //
// // The old menu array is kept below as a reference/backup.
// //

// let menu = [];


// // =====================================================
// // OLD FRONTEND MENU BACKUP
// // =====================================================
// //
// // Earlier, menu data was stored directly inside food.js.
// // Now menu data comes from backend server.js.
// // Keep this commented section for learning/reference.
// //
// // let menu = [
// //     { name: "Bread Omelette", price: 60, category: "Breakfast" },
// //     { name: "Half Fry", price: 50, category: "Breakfast" },
// //     { name: "Veg Sandwich", price: 75, category: "Breakfast" },
// //     { name: "Cheese Sandwich", price: 95, category: "Breakfast" },
// //
// //     { name: "Veg Thali", price: 110, category: "Lunch" },
// //     { name: "Chicken Thali", price: 180, category: "Lunch" },
// //     { name: "Chicken Chawal", price: 150, category: "Lunch" },
// //     { name: "Roti Sabji", price: 120, category: "Lunch" },
// //
// //     { name: "Veg Burger", price: 60, category: "Burgers" },
// //     { name: "Cheese Burger", price: 90, category: "Burgers" },
// //     { name: "Chicken Burger", price: 130, category: "Burgers" },
// //
// //     { name: "Veg Momos", price: 80, category: "Chinese" },
// //     { name: "Chicken Momos", price: 110, category: "Chinese" },
// //     { name: "Veg Noodles", price: 100, category: "Chinese" },
// //     { name: "Chicken Noodles", price: 140, category: "Chinese" },
// //
// //     { name: "Veg Roll", price: 70, category: "Rolls" },
// //     { name: "Paneer Roll", price: 90, category: "Rolls" },
// //     { name: "Chicken Roll", price: 120, category: "Rolls" },
// //
// //     { name: "Tea", price: 20, category: "Beverages" },
// //     { name: "Coffee", price: 30, category: "Beverages" },
// //     { name: "Cold Coffee", price: 90, category: "Beverages" },
// //     { name: "Coke", price: 40, category: "Beverages" },
// //     { name: "Sprite", price: 40, category: "Beverages" },
// //
// //     { name: "Orange Juice", price: 70, category: "Juices" },
// //     { name: "Mango Juice", price: 80, category: "Juices" },
// //
// //     { name: "Chocolate Shake", price: 120, category: "Shakes" },
// //     { name: "Oreo Shake", price: 140, category: "Shakes" }
// // ];


// // =====================================================
// // DOM REFERENCES
// // =====================================================

// let menuContainer = document.getElementById("menu-items");


// // =====================================================
// // API : GET MENU FROM BACKEND
// // =====================================================

// function menuGenerator() {
//     fetch("https://project-cafe-web.onrender.com/menu")
//     .then(function(response) {
//         return response.json();
//     })
//     .then(function(data) {
//         menu = data;
//         console.log("Menu received from backend:", menu);
//         renderMenu("All");
//     });
// }


// // =====================================================
// // MENU RENDERING
// // =====================================================

// function renderMenu(category) {
//     menuContainer.innerHTML = "";

//     for (let i = 0; i < menu.length; i++) {
//         if (category !== "All" && menu[i].category !== category) {
//             continue;
//         }

//         menuContainer.innerHTML += `
//             <div class="food-card">
//                 <h3>${menu[i].name}</h3>
//                 <p>₹${menu[i].price}</p>
//                 <p>${menu[i].category}</p>

//                 <button onclick="addToCart('${menu[i].name}', ${menu[i].price})">
//                     Add to Cart
//                 </button>
//             </div>
//         `;
//     }
// }


// // =====================================================
// // CART FUNCTION
// // =====================================================

// // function addToCart(name, price) {
// //     for (let i = 0; i < cart.length; i++) {
// //         if (cart[i].name === name) {
// //             cart[i].quantity++;


// //             localStorage.setItem("cart", JSON.stringify(cart));

// //             console.log("Cart Updated:", cart);
// //             return;
// //         }
// //     }

// //     cart.push({
// //         name: name,
// //         price: price,
// //         quantity: 1
// //     });

// //     localStorage.setItem("cart", JSON.stringify(cart));

// //     console.log("Cart Updated:", cart);
// // }

//  function addToCart(name,price){
// fetch("https://project-cafe-web.onrender.com/cart", {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json"
//         },
//         body: JSON.stringify({
//             name: name,
//             price: price,
//             quantity: 1
//         })
//     })
// .then(function(response){
//      return response.json();

// })
// .then(function(data){
//   cart=data.cart;
//   console.log(data.message);
// });

// }


// // =====================================================
// // INITIALIZATION
// // =====================================================

// menuGenerator();

// //searchbar function

// function searchMenu(){
//     let searchtext=document.getElementById("search-bar").value;

//     let typedText=searchtext.trim().toLowerCase();
//     menuContainer.innerHTML="";

//     for(let i=0;i<menu.length;i++){
//          let existingtext=menu[i].name.toLowerCase().includes(typedText);
        
//          if(existingtext){
           
//              menuContainer.innerHTML+=`<div class="menu-item">
//              <div class="item">${menu[i].name}</div>
//              <div class="item">${menu[i].price}</div>
//              <div class="item">${menu[i].category}</div>
// <button onclick="addToCart('${menu[i].name}', ${menu[i].price})">
//     Add
// </button>
             
//              </div>`
             
//          }

//     }







// }
// const categoryBar = document.querySelector(".category-bar");

// if (categoryBar) {
//   let lastScroll = window.scrollY;

//   window.addEventListener("scroll", () => {
//     const currentScroll = window.scrollY;

//     if (currentScroll > lastScroll + 5) {
//       categoryBar.classList.add("hide-category");
//     }
//     else if (currentScroll < lastScroll - 5) {
//       categoryBar.classList.remove("hide-category");
//     }

//     lastScroll = currentScroll;
//   });
// }

// console.log("food.js connected");
// =====================================================
// CART LOADING
// =====================================================
//
// Cart starts empty on this page.
// Backend updates it when Add to Cart is clicked.
//

let cart = [];


// =====================================================
// MENU DATA
// =====================================================
//
// Menu starts empty.
// Backend fills it through GET /menu.
//

let menu = [];


// =====================================================
// DOM REFERENCES
// =====================================================

let menuContainer = document.getElementById("menu-items");

let categoryBar = document.querySelector(".category-bar");


// =====================================================
// API : GET MENU FROM BACKEND
// =====================================================
//
// Purpose:
//
// 1. Fetch menu from backend
// 2. Store it in menu array
// 3. Render all items initially
//

function menuGenerator() {

    fetch("https://project-cafe-web.onrender.com/menu")
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {

        menu = data;

        console.log("Menu received from backend:", menu);

        renderMenu("All");

    });

}


// =====================================================
// MENU RENDERING
// =====================================================
//
// Purpose:
//
// Render cards according to selected category.
//
// category = "All"
// means show every item.
//
// Otherwise:
// only show items matching selected category.
//

function renderMenu(category) {

    menuContainer.innerHTML = "";

    for (let i = 0; i < menu.length; i++) {

        if (category !== "All" && menu[i].category !== category) {
            continue;
        }

        menuContainer.innerHTML += `
            <div class="food-card">

                <h3>${menu[i].name}</h3>

                <p class="price">₹${menu[i].price}</p>

                <p class="category-name">${menu[i].category}</p>

                <button onclick="addToCart('${menu[i].name}', ${menu[i].price})">
                    Add to Cart
                </button>

            </div>
        `;
    }

}


// =====================================================
// ADD TO CART
// =====================================================
//
// Purpose:
//
// Send selected item to backend cart.
// Backend decides whether to:
// - add new item
// - increase quantity
//

function addToCart(name, price) {

    fetch("https://project-cafe-web.onrender.com/cart", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            name: name,
            price: price,
            quantity: 1
        })

    })
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {

        cart = data.cart;

        console.log(data.message);
        console.log("Updated cart:", cart);

    });

}


// =====================================================
// SEARCH MENU
// =====================================================
//
// Purpose:
//
// Search by item name.
// Example:
// typing "chicken" shows all chicken items.
//

function searchMenu() {

    let searchText = document.getElementById("search-bar").value;

    let typedText = searchText.trim().toLowerCase();

    menuContainer.innerHTML = "";

    for (let i = 0; i < menu.length; i++) {

        let itemName = menu[i].name.toLowerCase();

        let isMatch = itemName.includes(typedText);

        if (isMatch) {

            menuContainer.innerHTML += `
                <div class="food-card">

                    <h3>${menu[i].name}</h3>

                    <p class="price">₹${menu[i].price}</p>

                    <p class="category-name">${menu[i].category}</p>

                    <button onclick="addToCart('${menu[i].name}', ${menu[i].price})">
                        Add to Cart
                    </button>

                </div>
            `;

        }

    }

}


// =====================================================
// YOUTUBE-STYLE CATEGORY BAR
// =====================================================
//
// Behaviour:
//
// Scroll down:
// category bar hides.
//
// Scroll up even slightly:
// category bar appears.
//
// This is better than normal sticky because it gives
// more screen space while browsing food cards.
//

if (categoryBar) {

    let lastScroll = window.scrollY;

    window.addEventListener("scroll", function() {

        let currentScroll = window.scrollY;

        if (currentScroll > lastScroll + 5) {

            categoryBar.classList.add("hide-category");

        } else if (currentScroll < lastScroll - 5) {

            categoryBar.classList.remove("hide-category");

        }

        lastScroll = currentScroll;

    });

}


// =====================================================
// INITIALIZATION
// =====================================================

menuGenerator();

console.log("food.js connected");