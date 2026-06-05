// =====================================================
// ADMIN PANEL
// =====================================================
//
// Responsibilities:
//
// 1. Fetch customer orders from backend
// 2. Render all customer orders
// 3. Render items inside each order
// 4. Update order status
// 5. Fetch menu from backend
// 6. Show / hide menu management panel
// 7. Add new menu items
// 8. Remove menu items
// 9. Control sidebar navigation
//
// Backend is the source of truth.
// Frontend only fetches, renders, and sends requests.
//
// =====================================================


// =====================================================
// DATA STORAGE
// =====================================================

let orders = [];
let menu = [];


// =====================================================
// DOM REFERENCES
// =====================================================

let orderContainer = document.getElementById("ordered-items");
let menucontainer = document.getElementById("admin-menu-items");

let sidebar = document.getElementById("sidebar");

let ordersSection = document.getElementById("orders-section");
let menuSection = document.getElementById("menu-section");
let addItemSection = document.getElementById("add-item-section");


// =====================================================
// FETCH ORDERS FROM BACKEND
// =====================================================

fetch("https://project-cafe-web.onrender.com/orders")
.then(function(response) {
    return response.json();
})
.then(function(data) {

    orders = data;

    console.log("Orders received from backend:");
    console.log(orders);

    renderOrders();

});


// =====================================================
// RENDER ALL ORDERS
// =====================================================
//
// Supports both structures:
//
// Old structure:
//
// orders[i] = [
//     { name:"Burger", price:100, quantity:2 }
// ]
//
// New structure:
//
// orders[i] = {
//     items:[
//         { name:"Burger", price:100, quantity:2 }
//     ],
//     status:"new"
// }
//
// This fallback prevents old orders from crashing renderItems().
//

function renderOrders() {

    orderContainer.innerHTML = "";

    for (let i = 0; i < orders.length; i++) {

        let orderItems = orders[i].items || orders[i];

        let orderStatus = orders[i].status || "new";

        orderContainer.innerHTML += `
            <div class="cart-items">

                <h3>Order No: ${i + 1}</h3>

                <p>Status: ${orderStatus}</p>

                <div class="render-items">
                    ${renderItems(orderItems)}
                </div>

                <button onclick="updateOrderStatus(${i}, 'accepted')">Accept</button>
<button onclick="updateOrderStatus(${i}, 'preparing')">Prepare</button>
<button onclick="updateOrderStatus(${i}, 'completed')">Complete</button>
<button onclick="updateOrderStatus(${i}, 'cancelled')">Cancel</button>

            </div>
        `;
    }
}


// =====================================================
// RENDER ITEMS INSIDE ONE ORDER
// =====================================================
//
// Receives one order's item array.
// Returns HTML string.
// renderOrders() inserts that string into the page.
//

function renderItems(order) {

    let html = "";

    for (let i = 0; i < order.length; i++) {

        html += `
            <div class="items">
                <p>${order[i].name}</p>
                <p>₹${order[i].price}</p>
                <p>Quantity: ${order[i].quantity}</p>
            </div>
        `;
    }

    return html;
}


// =====================================================
// ORDER STATUS FUNCTIONS
// =====================================================
//
// Frontend sends:
//
// POST /order/status/:index
//
// Backend updates:
//
// orders[index].status
//
// Then backend returns updated orders.
//

// function acceptOrder(index) {

//     fetch(`http://localhost:3000/order/status/${index}`, {
//         method: "POST"
//     })
//     .then(function(response) {
//         return response.json();
//     })
//     .then(function(data) {

//         orders = data.orders;

//         console.log(data.message);
//         console.log("Updated orders:", orders);

//         renderOrders();

//     });
// }


// // Placeholder functions for later.
// // Backend routes can be added after Accept works properly.

// function prepareOrder(index) {
//     console.log("Prepare order:", index);


//     fetch(`http://localhost:3000/order/status/${index}`, {
//         method: "POST"
//     })
//     .then(function(response){
//         return response.json();
//     })
//     .then(function(data){
//          orders=data.orders;
//         renderOrders();

//     })
// }

// function completeOrder(index) {
//     console.log("Complete order:", index);

//     fetch(`http://localhost:3000/order/status/${index}`, {
//         method: "POST"
//     })
//     .then(function(response){
//         return response.json();
//     })
//     .then(function(data){
//         orders=data.orders;
//         renderOrders();
//     })
// }

// function cancelOrder(index) {
//     fetch(`http://localhost:3000/order/status/${index}`, {
//         method: "POST"
//     })
//     .then(function(response){
//         return response.json();
//     })
//     .then(function(data){
//          orders=data.orders;
//         renderOrders();
//     })
//     console.log("Cancel order:", index);
// }
// separate function , now all in one below
function updateOrderStatus(index, status) {
    fetch(`https://project-cafe-web.onrender.com/order/status/${index}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            status: status
        })
    })
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        orders = data.orders;
        renderOrders();
        console.log(data.message);
    });
}

// =====================================================
// MENU VISIBILITY STATE
// =====================================================

let menuVisible = false;


// =====================================================
// SHOW / HIDE MENU MANAGER
// =====================================================

function showMenuManager() {

    if (menuVisible === true) {

        menucontainer.innerHTML = "";
        menuVisible = false;

        return;
    }

    fetch("https://project-cafe-web.onrender.com/menu")
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {

        menu = data;

        renderMenu();

        menuVisible = true;

    });
}


// =====================================================
// RENDER MENU ITEMS
// =====================================================

function renderMenu() {

    menucontainer.innerHTML = "";

    for (let i = 0; i < menu.length; i++) {

        menucontainer.innerHTML += `
            <div class="menu-items">

                <div class="items">${menu[i].name}</div>

                <div class="items">₹${menu[i].price}</div>

                <div class="items">${menu[i].category}</div>

                <button onclick="removeItems('${menu[i].name}')">
                    Remove Item
                </button>

            </div>
        `;
    }
}


// =====================================================
// REMOVE MENU ITEM
// =====================================================

function removeItems(name) {

    fetch(`https://project-cafe-web.onrender.com/menu/${name}`, {
        method: "DELETE"
    })
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {

        menu = data;

        renderMenu();

    });
}


// =====================================================
// ADD MENU ITEM
// =====================================================

function addItems() {

    let name = document.getElementById("item-name").value;
    let price = document.getElementById("item-price").value;
    let category = document.getElementById("item-category").value;

    fetch("https://project-cafe-web.onrender.com/menu", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            name: name,
            price: Number(price),
            category: category
        })

    })
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {

        menu = data.menu;

        console.log(data.message);

        renderMenu();

        document.getElementById("item-name").value = "";
        document.getElementById("item-price").value = "";
        document.getElementById("item-category").value = "";

    });
}


// =====================================================
// SIDEBAR TOGGLE
// =====================================================

// =====================================================
// SIDEBAR TOGGLE
// =====================================================
//
// Old method:
//
// sidebar.style.left = "0";
// sidebar.style.left = "-260px";
//
// Problem:
//
// left changes layout position.
// It can feel slightly laggy.
//
// New method:
//
// sidebar.classList.toggle("open");
//
// Why better:
//
// CSS handles movement using transform.
// transform is smoother and more performance-friendly.
//

function toggleSidebar() {
    sidebar.classList.toggle("open");
}

// =====================================================
// ADMIN SECTION NAVIGATION
// =====================================================

function showOrdersSection() {

    ordersSection.style.display = "block";
    menuSection.style.display = "none";
    addItemSection.style.display = "none";
}

function showMenuSection() {

    ordersSection.style.display = "none";
    menuSection.style.display = "block";
    addItemSection.style.display = "none";
}

function showAddItemSection() {

    ordersSection.style.display = "none";
    menuSection.style.display = "none";
    addItemSection.style.display = "block";
}


// =====================================================
// INITIAL PAGE STATE
// =====================================================

showOrdersSection();
// =====================================================
// ADMIN LOGIN
// =====================================================
//
// Temporary frontend-only login.
// This is only for learning basic login flow.
// Real security later should happen on backend.
//

let loginSection = document.getElementById("login-section");
let adminPanel = document.getElementById("admin-panel");
let message = document.getElementById("message");

let origId = "chacha123";
let origPass = "420chacha";

function loadLoginPage() {
    loginSection.style.display = "block";
    adminPanel.style.display = "none";
    message.style.display = "none";
}

function pageLoader() {
    let adminId = document.getElementById("admin-id").value;
    let password = document.getElementById("password").value;

    if (adminId === origId && password === origPass) {
        loginSection.style.display = "none";
        adminPanel.style.display = "block";
        message.style.display = "none";
        return;
    }

    message.innerText = "Wrong ID or password";
    message.style.display = "block";
}

loadLoginPage();

console.log("admin.js connected");