// =====================================================
// ADMIN PANEL
// =====================================================
//
// Responsibilities:
//
// 1. Login admin
// 2. Fetch customer orders
// 3. Render orders
// 4. Update order status
// 5. Fetch menu
// 6. Render menu manager
// 7. Add menu items
// 8. Remove menu items
// 9. Control sidebar and admin sections
//
// Backend is the source of truth.
// Frontend only fetches, renders, and sends requests.
//
// =====================================================


// =====================================================
// API BASE URL
// =====================================================

const API_URL = "https://project-cafe-web.onrender.com";


// =====================================================
// DATA STORAGE
// =====================================================

let orders = [];
let menu = [];


// =====================================================
// DOM REFERENCES
// =====================================================

let orderContainer = document.getElementById("ordered-items");
let menuContainer = document.getElementById("admin-menu-items");

let sidebar = document.getElementById("sidebar");

let ordersSection = document.getElementById("orders-section");
let menuSection = document.getElementById("menu-section");
let addItemSection = document.getElementById("add-item-section");

let loginSection = document.getElementById("login-section");
let adminPanel = document.getElementById("admin-panel");
let message = document.getElementById("message");


// =====================================================
// ADMIN LOGIN DATA
// =====================================================
//
// Temporary frontend-only login.
// Good enough for learning UI flow.
// Real production login should happen on backend.
//

let originalAdminId = "chacha123";
let originalPassword = "420chacha";


// =====================================================
// INITIAL LOGIN PAGE STATE
// =====================================================

function loadLoginPage() {

    loginSection.style.display = "block";
    adminPanel.style.display = "none";
    message.style.display = "none";

}


// =====================================================
// LOGIN CHECK
// =====================================================

function pageLoader() {

    let adminId = document.getElementById("admin-id").value.trim();
    let password = document.getElementById("password").value.trim();

    if (adminId === originalAdminId && password === originalPassword) {

        loginSection.style.display = "none";
        adminPanel.style.display = "block";
        message.style.display = "none";

        loadAdminData();

        return;
    }

    message.innerText = "Wrong ID or password";
    message.style.display = "block";

}


// =====================================================
// LOAD ADMIN DATA AFTER LOGIN
// =====================================================
//
// Earlier, orders were fetched before login.
// Now orders are fetched after successful login.
// This avoids unnecessary backend request before authentication.
//

function loadAdminData() {

    fetchOrders();

    showOrdersSection();

}


// =====================================================
// FETCH ORDERS FROM BACKEND
// =====================================================

function fetchOrders() {

    fetch(`${API_URL}/orders`)
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {

        orders = data;

        console.log("Orders received from backend:");
        console.log(orders);

        renderOrders();

    })
    .catch(function(error) {

        console.log("Failed to fetch orders:", error);

        orderContainer.innerHTML = `
            <div class="cart-items">
                <p>Unable to load orders. Please try again.</p>
            </div>
        `;

    });

}

//search orders by id
function searchOrderById() {

    let orderId = document
        .getElementById("search-order-id")
        .value
        .trim();

    if (orderId === "") {
        document.getElementById("searched-order").innerHTML = `
            <div class="cart-items">
                <p>Please enter an Order ID.</p>
            </div>
        `;
        return;
    }

    fetch(`${API_URL}/order/${orderId}`)
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {

        console.log(data);

        renderSearchedOrder(data);

    })
    .catch(function(error) {

        console.log("Search failed:", error);

        document.getElementById("searched-order").innerHTML = `
            <div class="cart-items">
                <p>Unable to search order.</p>
            </div>
        `;

    });

}

function renderSearchedOrder(order) {

    let searchedOrderContainer =
        document.getElementById("searched-order");

    searchedOrderContainer.innerHTML = "";

    if (!order || !order._id) {
        searchedOrderContainer.innerHTML = `
            <div class="cart-items">
                <p>Order not found. Please enter a valid Order ID.</p>
            </div>
        `;
        return;
    }

    let orderItems = order.items || [];
    let orderStatus = order.status || "new";
    let orderId = order._id;

    searchedOrderContainer.innerHTML = `
        <div class="cart-items">

            <h3>Search Result</h3>

            <p>Order Id : ${orderId}</p>
            <p>Order NO: ${orders[i].orderNumber}
            <p>Status: ${orderStatus}</p>

            <div class="render-items">
                ${renderItems(orderItems)}
            </div>

            <p>Total: ₹${order.total}</p>

            <div class="order-actions">

                <button onclick="updateOrderStatus('${orderId}', 'accepted')">
                    Accept
                </button>

                <button onclick="updateOrderStatus('${orderId}', 'preparing')">
                    Preparing
                </button>

                <button onclick="updateOrderStatus('${orderId}', 'completed')">
                    Completed
                </button>

                <button onclick="updateOrderStatus('${orderId}', 'cancelled')">
                    Cancelled
                </button>

            </div>

        </div>
    `;
}
















// =====================================================
// RENDER ALL ORDERS
// =====================================================
//
// Supports both structures:
//
// Old structure:
// orders[i] = [
//     { name:"Burger", price:100, quantity:2 }
// ]
//
// New structure:
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

    if (orders.length === 0) {

        orderContainer.innerHTML = `
            <div class="cart-items">
                <p>No orders found.</p>
            </div>
        `;

        return;
    }

    for (let i = 0; i < orders.length; i++) {

        let orderItems = orders[i].items || orders[i];

        let orderStatus = orders[i].status || "new";

        orderContainer.innerHTML += `
            <div class="cart-items">

    <h3>Order No: ${orders[i].orderNumber||"Not  Assigned"}</h3>

    <p class="order-id-text">
        Order ID: ${orders[i]._id}
    </p>

    <p>Status: ${orderStatus}</p>

    <div class="render-items">
        ${renderItems(orderItems)}
    </div>

    <div class="order-actions">

        <button onclick="updateOrderStatus('${orders[i]._id}', 'accepted')">
            Accept
        </button>

        <button onclick="updateOrderStatus('${orders[i]._id}', 'preparing')">
            Preparing
        </button>

        <button onclick="updateOrderStatus('${orders[i]._id}', 'completed')">
            Completed
        </button>

        <button onclick="updateOrderStatus('${orders[i]._id}', 'cancelled')">
            Cancelled
        </button>

    </div>

</div>`;

    }

}


// =====================================================
// RENDER ITEMS INSIDE ONE ORDER
// =====================================================

function renderItems(order) {

    let html = "";

    if (!Array.isArray(order)) {

        return `
            <div class="items">
                Invalid order format
            </div>
        `;

    }

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
// UPDATE ORDER STATUS
// =====================================================
//
// One reusable function for:
// - accepted
// - preparing
// - completed
// - cancelled
//
function updateOrderStatus(id, status) {

    fetch(`${API_URL}/order/status/${id}`, {
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

        if (!data.orders) {
            alert(data.message || "Status update failed");
            return;
        }

        orders = data.orders;
        renderOrders();

    })
    .catch(function(error) {
        console.log("Failed to update order status:", error);
        alert("Unable to update order status");
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

        menuContainer.innerHTML = "";
        menuVisible = false;

        return;

    }

    fetchMenu();

}


// =====================================================
// FETCH MENU FROM BACKEND
// =====================================================

function fetchMenu() {

    fetch(`${API_URL}/menu`)
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {

        menu = data;

        renderMenu();

        menuVisible = true;

    })
    .catch(function(error) {

        console.log("Failed to fetch menu:", error);

        menuContainer.innerHTML = `
            <div class="cart-items">
                <p>Unable to load menu.</p>
            </div>
        `;

    });

}


// =====================================================
// RENDER MENU ITEMS
// =====================================================

function renderMenu() {

    menuContainer.innerHTML = "";

    if (menu.length === 0) {

        menuContainer.innerHTML = `
            <div class="cart-items">
                <p>No menu items found.</p>
            </div>
        `;

        return;

    }

    for (let i = 0; i < menu.length; i++) {

        menuContainer.innerHTML += `
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
//
// encodeURIComponent protects names with spaces.
// Example:
// "Bread Omelette" becomes safe for URL.
//

function removeItems(name) {

    let safeName = encodeURIComponent(name);

    fetch(`${API_URL}/menu/${safeName}`, {
        method: "DELETE"
    })
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {

        menu = data;

        renderMenu();

    })
    .catch(function(error) {

        console.log("Failed to remove item:", error);

    });

}


// =====================================================
// ADD MENU ITEM
// =====================================================

function addItems() {

    let name = document.getElementById("item-name").value.trim();
    let price = document.getElementById("item-price").value;
    let category = document.getElementById("item-category").value.trim();

    if (name === "" || price === "" || category === "") {

        alert("Please fill all fields");

        return;

    }

    fetch(`${API_URL}/menu`, {

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

        menuVisible = true;

    })
    .catch(function(error) {

        console.log("Failed to add item:", error);

    });

}


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

    closeSidebar();
}

function showMenuSection() {
    ordersSection.style.display = "none";
    menuSection.style.display = "block";
    addItemSection.style.display = "none";

    closeSidebar();
}

function showAddItemSection() {
    ordersSection.style.display = "none";
    menuSection.style.display = "none";
    addItemSection.style.display = "block";

    closeSidebar();
}
let sidebarOverlay = document.getElementById("sidebar-overlay");

function toggleSidebar() {
    sidebar.classList.toggle("open");
    sidebarOverlay.classList.toggle("show");
}

function closeSidebar() {
    sidebar.classList.remove("open");
    sidebarOverlay.classList.remove("show");
}


// =====================================================
// INITIAL PAGE STATE
// =====================================================

loadLoginPage();

console.log("admin.js connected");