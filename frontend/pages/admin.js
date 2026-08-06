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

// const ms = require("ms");


// =====================================================
// API BASE URL
// =====================================================



// =====================================================
// DATA STORAGE
// =====================================================

let orders = [];
let menu = [];


//
// =====================================================
// DOM REFERENCES
// =====================================================

const orderContainer = document.getElementById("admin-ordered-items");
const menuContainer = document.getElementById("admin-menu-items");

const adminHeader=document.getElementById("admin-header");
const sidebarPanel=document.getElementById("sidebar-panel");

const sidebar = document.getElementById("sidebar");

const ordersSection = document.getElementById("orders-section");
const menuSection = document.getElementById("menu-section");
const addItemSection = document.getElementById("add-item-section");

const loginSection = document.getElementById("login-section");

const message = document.getElementById("message");


// =====================================================
// ADMIN LOGIN DATA
// =====================================================
//
// Temporary frontend-only login.
// Good enough for learning UI flow.
// Real production login should happen on backend.
//

// let originalAdminId = "chacha123";
// let originalPassword = "420chacha";


// =====================================================
// INITIAL LOGIN PAGE STATE
// =====================================================


function loadLoginPage() {
    loginSection.classList.remove("hidden");
    adminHeader.classList.add("hidden");
    sidebarPanel.classList.add("hidden");
    ordersSection.classList.add("hidden");
     menuSection.classList.add("hidden");
     addItemSection.classList.add("hidden");
    

}


// =====================================================
// LOGIN CHECK
// =====================================================

// function pageLoader() {

//     let adminId = document.getElementById("admin-id").value.trim();
//     let password = document.getElementById("password").value.trim();

//     if (adminId === originalAdminId && password === originalPassword) {

//         loginSection.style.display = "none";
//         adminPanel.style.display = "block";
//         message.style.display = "none";

//         loadAdminData();

//         return;
//     }

//     message.innerText = "Wrong ID or password";
//     message.style.display = "block";

// }

function LoadAdminPage(){
    adminHeader.classList.remove("hidden");
    sidebarPanel.classList.remove("hidden");
    ordersSection.classList.remove("hidden");
     loginSection.classList.add("hidden");
       menuSection.classList.add("hidden");
     addItemSection.classList.add("hidden");
       
        message.classList.add("hidden");

        loadAdminData();

}


//Backend authentication

    


function PageLoader(){
    let adminId = document.getElementById("admin-id").value.trim();
    let password = document.getElementById("password").value.trim();

    fetch(`${API_URL}/admin/login`,{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({
              adminId,
              password
        })
    })
    .then(function(response){
        return response.json();
    })
    .then(function(data){
      if(data.token){
        localStorage.setItem(
     "token",data.token
    );
    LoadAdminPage();
      }
      else{
        loadLoginPage();
         message.style.display="block";
            message.innerText="try again";
      }



  }
    )

}
// function LocalStorageRedirectingAdminPanels(){
//     if(
//     localStorage.getItem("isAdmin")
//     === "true"
// ){
//     LoadAdminPage();
// }
// else{
//     loadLoginPage();
// }
// }

function verifyAdminTokenAfterRefreshingPage(){
    const token= localStorage.getItem("token");
     if(token){
        LoadAdminPage();
     }
     else{
        loadLoginPage();
     }
    
        }
    




//logout button for localstorage clearance

function logOutofAdminPanel()
{
    localStorage.removeItem("token");
    loadLoginPage();
    message.innerHTML="Session Expired. Please login again.";
    message.style.display="block";
    closeSidebar();
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

    fetch(`${API_URL}/orders`,{
        headers: {
    "Authorization":
        `Bearer ${localStorage.getItem("token")}`,
    "Content-Type":"application/json"
}
    })
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
function searchOrderByIdOrNumber() {

    let orderId = document
        .getElementById("search-order-id")
        .value
        .trim();

    if (orderId === "") {
        document.getElementById("searched-order").innerHTML = `
            <div class="cart-items">
                <p>Please enter an Order ID or Number.</p>
            </div>
        `;
        return;
    }

    fetch(`${API_URL}/order/search/${orderId}`,{
        headers: {

    "Authorization": `Bearer ${localStorage.getItem("token")}`,
    
    "Content-Type":"application/json"
}
    })
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
                <p>Order not found. Please enter a valid Order ID or Order No.</p>
            </div>
        `;
        return;
    }

    let orderItems = order.items || [];
    let orderStatus = order.status || "new";
    let orderId = order._id;

    searchedOrderContainer.innerHTML += `
        <div class="cart-items">

            <h3>Search Result</h3>

            <p>Order No: ${order.orderNumber || "Not Assigned"}</p>

            <p class="order-id-text">
                Order Id: ${orderId}
            </p>

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
            <div class="admin-cart-items">

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
            <div class="admin-items">
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

    fetch(`${API_URL}/order/status/${id}/${status}`, {
        method: "POST",
        headers: {
            "Authorization":`Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json"
        },
       
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
        console.log(menu);

        renderMenu(menu);

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

function renderMenu(menu) {


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
            <div class="Og-menu-items">

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
        method: "DELETE",
        headers: {
    "Authorization":
        `Bearer ${localStorage.getItem("token")}`,
    "Content-Type":"application/json"
}
    })
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {

        menu = data;

        renderMenu(menu);

    })
    .catch(function(error) {

        console.log("Failed to remove item:", error);

    });

}




// =====================================================
// ADD MENU ITEM
// =====================================================

function addItems() {

    const name = document.getElementById("item-name").value.trim();
    const price = document.getElementById("item-price").value;
    const category = document.getElementById("item-category").value.trim();
    const img=document.getElementById("item-img").files[0];
console.log(img);

    if (name === "" || price === "" || category === "") {

        alert("Please fill all fields");

        return;

    }

    const formData=new FormData();
    formData.append("name",name);
    formData.append("price",price);
    formData.append("category",category);
    formData.append("image",img);

    fetch(`${API_URL}/menu`, {

        method: "POST",

      headers: {
    "Authorization":
        `Bearer ${localStorage.getItem("token")}`
         },

     body:formData

    })
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {

        console.log(data);

        menu = data.menu;

        console.log(data.message);

        renderMenu(menu);

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

// function toggleSidebar() {

//     sidebar.classList.toggle("open");

// }


// =====================================================
// ADMIN SECTION NAVIGATION
// =====================================================

function showOrdersSection() {
    ordersSection.classList.remove('hidden');
    menuSection.classList.add("hidden");
    addItemSection.classList.add("hidden");

    closeSidebar();
}

function showMenuSection() {
    ordersSection.classList.add('hidden');
    menuSection.classList.remove('hidden');
    addItemSection.classList.add('hidden');

    closeSidebar();
}

function showAddItemSection() {
    ordersSection.classList.add('hidden');
    menuSection.classList.add('hidden');
    addItemSection.classList.remove('hidden');

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
verifyAdminTokenAfterRefreshingPage();
setInterval(fetchOrders,500000);

console.log("admin.js connected");