

const API_URL = "https://project-cafe-web.onrender.com";



let orders = [];

function FetchAllOrders(){
    let customerId=localStorage.getItem("customerId");

    fetch(`${API_URL}/order/customer/${customerId}`)
    .then(function(response){
        return response.json();
    }
    )
    .then(function(data){
        orders=data.order;
        RenderAllOrderOFaPage();
    })
}


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
// fetch All orders of a customer with the help of local storage,untill and unless browser is cleaned ,in that case a new id will be assigned to the respective customer


function RenderAllOrderOFaPage(){
    let OrderContainer=document.getElementById("orders-container");

    if(!orders){
        OrderContainer.innerText="No orders found .Place your  first order "
    }

    OrderContainer.innerHTML="";
    for(let i=0;i<orders.length;i++){
        OrderContainer.innerHTML+=`
        <div class=ordered-items>
        <div class="items">${orders[i].orderNumber}
        </div>
        <div class="items">${formatTime(orders[i].createdAt)}</div>
        <a href="order-status.html?id=${orders[i]._id}">
        <button>View Order</button>
        </a>
        </div>
        
        `;
    }
}

FetchAllOrders();

// setInterval(FetchAllOrders,5000);
