// =====================================================
// LEARNING SECTION : MANUAL ROUTER IMPLEMENTATION
// =====================================================

// Before Express, I built my own router to understand
// what Express does internally.
//
// Routes are stored inside an array.
//
// Each route contains:
//
// {
//      method : GET/POST
//      path   : "/menu"
//      callback : function(req,res){...}
// }
//
// Later Express does the same thing internally when we write:
//
// app.get("/menu",callback)
// app.post("/order",callback)
//
// =====================================================

// let routes = [];

// function get(path,callback){
//
//     routes.push({
//         method:"GET",
//         path:path,
//         callback:callback
//     });
//
// }
//
// function post(path,callback){
//
//     routes.push({
//         method:"POST",
//         path:path,
//         callback:callback
//     });
//
// }
//
// get("/menu",function(req,res){
//
//     res.send(menu);
//
// });
//
// post("/order",function(req,res){
//
//     orders.push(req.body);
//
//     res.send(orders);
//
// });
//
// =====================================================
// REQUEST HANDLER
// =====================================================
//
// Express has its own internal request handler.
//
// This function was my attempt to understand
// route matching manually.
//
// Browser Request
// ↓
// Check all routes
// ↓
// Match path + method
// ↓
// Execute callback
//
// =====================================================

// function handleRequest(req,res){
//
//     for(let i=0;i<routes.length;i++){
//
//         if(
//             routes[i].path === req.url &&
//             routes[i].method === req.method
//         ){
//
//             routes[i].callback(req,res);
//
//             return;
//         }
//
//     }
//
//     res.send("404 not found");
//
// }



// ===============================
// IMPORTS
// ===============================
const mongoose = require("mongoose");
require("dotenv").config();

const express = require("express");
const cors=require("cors");
const crypto = require("crypto");

const Razorpay = require("razorpay");

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});
mongoose.connect(process.env.MONGODB_URI)
.then(() => {
    console.log("MongoDB Connected");
})
.catch((error) => {
    console.log(error);
});
console.log(process.env.RAZORPAY_KEY_ID);
const Menu = require("./models/menu");
const Cart = require("./models/cart");
const Order = require("./models/Order");
// ===============================
// APP SETUP
// ===============================

const app = express();


app.use(cors());

app.use(express.json());


//cart declaration



// ===============================
// DATA STORAGE
// ===============================

let cart=[];
let menu = [

    // ===============================
    // BREAKFAST
    // ===============================

    {
        name: "Bread Omelette",
        price: 60,
        category: "Breakfast"
    },
    {
        name: "Half Fry",
        price: 50,
        category: "Breakfast"
    },
    {
        name: "Veg Sandwich",
        price: 75,
        category: "Breakfast"
    },
    {
        name: "Cheese Sandwich",
        price: 95,
        category: "Breakfast"
    },

    // ===============================
    // LUNCH
    // ===============================

    {
        name: "Veg Thali",
        price: 110,
        category: "Lunch"
    },
    {
        name: "Chicken Thali",
        price: 180,
        category: "Lunch"
    },
    {
        name: "Chicken Chawal",
        price: 150,
        category: "Lunch"
    },
    {
        name: "Roti Sabji",
        price: 120,
        category: "Lunch"
    },

    // ===============================
    // BURGERS
    // ===============================

    {
        name: "Veg Burger",
        price: 60,
        category: "Burgers"
    },
    {
        name: "Cheese Burger",
        price: 90,
        category: "Burgers"
    },
    {
        name: "Chicken Burger",
        price: 130,
        category: "Burgers"
    },

    // ===============================
    // CHINESE
    // ===============================

    {
        name: "Veg Momos",
        price: 80,
        category: "Chinese"
    },
    {
        name: "Chicken Momos",
        price: 110,
        category: "Chinese"
    },
    {
        name: "Veg Noodles",
        price: 100,
        category: "Chinese"
    },
    {
        name: "Chicken Noodles",
        price: 140,
        category: "Chinese"
    },

    // ===============================
    // ROLLS
    // ===============================

    {
        name: "Veg Roll",
        price: 70,
        category: "Rolls"
    },
    {
        name: "Paneer Roll",
        price: 90,
        category: "Rolls"
    },
    {
        name: "Chicken Roll",
        price: 120,
        category: "Rolls"
    },

    // ===============================
    // BEVERAGES
    // ===============================

    {
        name: "Tea",
        price: 20,
        category: "Beverages"
    },
    {
        name: "Coffee",
        price: 30,
        category: "Beverages"
    },
    {
        name: "Cold Coffee",
        price: 90,
        category: "Beverages"
    },
    {
        name: "Coke",
        price: 40,
        category: "Beverages"
    },
    {
        name: "Sprite",
        price: 40,
        category: "Beverages"
    },

    // ===============================
    // JUICES
    // ===============================

    {
        name: "Orange Juice",
        price: 70,
        category: "Juices"
    },
    {
        name: "Mango Juice",
        price: 80,
        category: "Juices"
    },

    // ===============================
    // SHAKES
    // ===============================

    {
        name: "Chocolate Shake",
        price: 120,
        category: "Shakes"
    },
    {
        name: "Oreo Shake",
        price: 140,
        category: "Shakes"
    }

];

let orders = [];


// ===============================
// ROUTES
// ===============================

app.get("/", (req, res) => {
    res.send("Cafe backend is running");
});

app.get("/menu", (req, res) => {
    res.send(menu);
});

// app.post("/order", (req, res) => {
//     orders.push(req.body);

//     res.send({
//         message: "Order saved",
//         order: req.body,
//         allOrders: orders
//     });
// });


// app.post("/order",(req,res)=>{

//     console.log("New Order Received:");
//     console.log(req.body);

//     orders.push({
//     items: req.body,
//     status: "new"
// });

//     res.send({
//         message:"Order Saved",

//         orders:orders
//     });

// });

// app.post("/order/status/:index",(req,res)=>{
//     console.log("status fetched from beckend");
//     let index=Number(req.params.index);
//     orders[index].status="accepted";
//     res.send({
//         message:"order accepted",
//         orders:orders


//     });
        
        
//     });

//     app.post("/order/status/:index",(req,res)=>{
//         let index=Number(req.params.index);
//         orders[index].status="prepairing";
//         res.send({
//             message:"prepairing order",
//             orders:orders
            
//         })
//     });

// app.post("/order/status/:index",(req,res)=>{
//         let index=Number(req.params.index);
//         orders[index].status="completed";
//         res.send({
//             message:" order completed",
//             orders:orders
            
//         })
//     });

//     app.post("/order/status/:index",(req,res)=>{
//         let index=Number(req.params.index);
//         orders[index].status="Cancelled";
//         res.send({
//             message:"order  cancelled",
//             orders:orders
            
//         })
//     });


app.post("/order/status/:id", async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true }
        );

        const orders = await Order.find().sort({ createdAt: -1 });

        res.send({
            message: "Order status updated",
            order: order,
            orders: orders
        });
    }
    catch (error) {
        res.status(500).send({
            message: error.message
        });
    }
});

app.post("/cart/clear",(req,res)=>{
    cart=[];
    res.send({
        message:"cart cleared",
        cart:cart,
    })
})


// app.post("/menu", (req, res) => {
//     let newItem = {
//     name: req.body.name.trim(),
//     price: Number(req.body.price),
//     category: req.body.category.trim()
// };
    
//     if (
//     !req.body.name ||
//     !req.body.price ||
//     !req.body.category
// ) {
//     res.send({
//         message: "Please fill all fields",
//         menu: menu
//     });
//     return;
// }
   
// let typedName=newItem.name.toLowerCase();

//     for (let i = 0; i < menu.length; i++) {
//         let existingName=menu[i].name.toLowerCase();
//         if (typedName===existingName) {
//             res.send({
//                 message: "Item already exists",
//                 menu: menu
//             });
//             return;
//         }
//     }

//     menu.push(newItem);
//     res.send(menu);
// });

app.post("/menu",(req,res)=>{
if(!req.body.name||!req.body.price||!req.body.category){
    
    res.send({message:
        "please fill all fields",
        menu:menu}
    );
    return;

}
let NewItem={
     name:req.body.name.trim(),
     price:Number(req.body.price),
     category:req.body.category.trim()
};

let typedName=NewItem.name.toLowerCase();

for(let i=0;i<menu.length;i++){   
     let existingName=menu[i].name.trim().toLowerCase();
     if(typedName===existingName){
       
        res.send({message:"Item already exists",
            menu:menu
        }
        );
        return;
     }
}

menu.push(NewItem);
 res.send({
    message:"Item added",
    menu:menu
 });

})

app.get("/orders", async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.send(orders);
    }
    catch (error) {
        res.status(500).send({
            message: error.message
        });
    }
});

app.delete("/menu/:name",(req,res)=>{
    for(let i=0;i<menu.length;i++){
        if(req.params.name===menu[i].name){
            menu.splice(i,1);
            res.send(menu);
            return;
        }

        
    }

});

// creating backend cart generation 
app.post("/cart",(req,res)=>{
for(let i=0;i<cart.length;i++){
    if(req.body.name===cart[i].name){
        cart[i].quantity++;
    
     
    res.send({
        message:"quantity updated",
        cart:cart
    });
   return;
}
}
cart.push({
    name:req.body.name,
      price:req.body.price,
      quantity:1

});
res.send({
    message:"cart added",
    cart:cart
});







});


app.get("/cart",(req,res)=>{
  res.send(cart);
})

app.post("/cart/name",(req,res)=>{
    for(let i=0;i<cart.length;i++){
        if(req.body.name===cart[i].name){
            cart[i].quantity++;
            res.send({
                message:"quantity increased",
                cart:cart
            })
            return;
        }

    }
    res.status(404).send({
    message:"Item not found"
});
    
})


// app.delete("/cart/decrease",(req,res)=>{
//     for(let i=0;i<cart.length;i++){

//         if(req.body.quantity<1){
//             cart.splice(i,1);
//             res.send({
//                 message:"cart deleted as quantity is less than 0",
//                 cart:cart
//             })
//             return;
//         }
//         req.body.quantity++;
//         res.send({
//             message:"decremented the quantity",
//             cart:cart
//         })
//     }
// })

app.post("/cart/decrease", (req, res) => {
    for (let i = 0; i < cart.length; i++) {
        if (req.body.name === cart[i].name) {

            if (cart[i].quantity > 1) {
                cart[i].quantity--;
            } else {
                cart.splice(i, 1);
            }

            res.send({
                message: "cart decreased",
                cart: cart
            });

            return;
        }
    }
});

app.post("/create-razorpay-order", async(req, res) => {
let total=0;
for(let i=0;i<cart.length;i++){
    total+=cart[i].price*cart[i].quantity;
}
let amountInPaise = total * 100;


  let order =  await razorpay.orders.create({
    amount: amountInPaise,
    currency: "INR",
    receipt: "receipt_" + Date.now()

    
})
res.send({
    message:"razorpay order created",

    orderId: order.id,
    amount: order.amount,
    currency: order.currency
    
});


});


app.post("/payment/verify",(req,res)=>{
console.log(req.body);
res.send({
    verified:true
});
});




app.post("/order", async (req, res) => {

    try {

        let total = 0;

        for (let i = 0; i < req.body.length; i++) {
            total += req.body[i].price * req.body[i].quantity;
        }

        const order = await Order.create({
            items: req.body,
            total: total
        });

        res.send({
            message: "Order Saved",
            order: order
        });

    }
    catch(error){

        res.status(500).send({
            message: error.message
        });

    }

});

// ===============================
// SERVER START
// ===============================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});
