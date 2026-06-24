// =====================================================
// IMPORTS
// =====================================================

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const crypto = require("crypto");
const Razorpay = require("razorpay");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const Menu = require("./models/Menu");
const Cart = require("./models/Cart");
const Order = require("./models/Order");


// =====================================================
// APP SETUP
// =====================================================

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));



// =====================================================
// MONGODB CONNECTION
// =====================================================

mongoose.connect(process.env.MONGODB_URI)
.then(function () {
    console.log("MongoDB Connected");
})
.catch(function (error) {
    console.log("MongoDB Error:", error);
});


// =====================================================
// RAZORPAY SETUP
// =====================================================

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});


function verifyAdmin(req, res, next) {

    const authHeader=req.headers.authorization;
    if(!authHeader){
        return res.status(401).send({
   message:"Unauthorized"
});
    }
   const parts=authHeader.split(" ");
   if(parts.length!==2){
       return res.status(401).send({
        message:"Unauthorized"
      });
   }
   if(parts[0]!=="Bearer"){
    return res.status(401).send({
        message:"Unauthorized"
    });
   }

        const token=parts[1];
       let decoded;
       try{
        decoded= jwt.verify(token,process.env.JWT_SECRET);
    }
    catch(error){
     return res.status(401).send({
   message:"Unauthorized"
});
    
}
if(decoded.role==="admin"){
    req.admin=decoded;
    return next();
}
else{
    return  res.status(401).send({
   message:"Unauthorized"
});

    }
  }




// =====================================================
// HEALTH CHECK
// =====================================================

app.get("/", function (req, res) {
    res.send("Cafe backend is running with MongoDB");
});


// =====================================================
// MENU ROUTES
// =====================================================

app.get("/menu", async function (req, res) {
    try {
        const menu = await Menu.find();
        res.send(menu);
    }
    catch (error) {
        res.status(500).send({
            message: error.message
        });
    }
});


app.post("/menu",verifyAdmin, async function (req, res) {
    try {
        if (!req.body.name || !req.body.price || !req.body.category) {
            const menu = await Menu.find();

            res.send({
                message: "Please fill all fields",
                menu: menu
            });

            return;
        }

        const newItem = {
            name: req.body.name.trim(),
            price: Number(req.body.price),
            category: req.body.category.trim(),
            image:req.body.image
        };

        const existingItem = await Menu.findOne({
            name: new RegExp("^" + newItem.name + "$", "i")
        });

        if (existingItem) {
            const menu = await Menu.find();

            res.send({
                message: "Item already exists",
                menu: menu
            });

            return;
        }

        await Menu.create(newItem);

        const menu = await Menu.find();

        res.send({
            message: "Item added",
            menu: menu
        });
    }
    catch (error) {
        res.status(500).send({
            message: error.message
        });
    }
});


app.delete("/menu/:name", verifyAdmin,async function (req, res) {
    try {
        const itemName = decodeURIComponent(req.params.name);

        await Menu.deleteOne({
            name: itemName
        });

        const menu = await Menu.find();

        res.send(menu);
    }
    catch (error) {
        res.status(500).send({
            message: error.message
        });
    }
});


// =====================================================
// CART ROUTES
// =====================================================

app.get("/cart", async function (req, res) {
    try {
        const cart = await Cart.find();
        res.send(
             cart );
    }
    catch (error) {
        res.status(500).send({
            message: error.message
        });
    }
});


app.post("/cart", async function (req, res) {
    try {
        const existingItem = await Cart.findOne({
            name: req.body.name
        });

        if (existingItem) {
            existingItem.quantity++;
            await existingItem.save();

            const cart = await Cart.find();

            res.send({
                message: "quantity updated",
                cart: cart
            });

            return;
        }

        await Cart.create({
            name: req.body.name,
            price: req.body.price,
            quantity: 1
        });

        const cart = await Cart.find();

        res.send({
            message: "cart added",
            cart: cart
        });
    }
    catch (error) {
        res.status(500).send({
            message: error.message
        });
    }
});


app.post("/cart/Increase", async function (req, res) {
    try {
        const existingItem = await Cart.findOne({
            name: req.body.name
        });

        if (!existingItem) {
            res.status(404).send({
                message: "Item not found"
            });

            return;
        }

        existingItem.quantity++;
        await existingItem.save();

        const cart = await Cart.find();

        res.send({
            message: "quantity increased",
            cart: cart
        });
    }
    catch (error) {
        res.status(500).send({
            message: error.message
        });
    }
});


app.post("/cart/decrease", async function (req, res) {
    try {
        const existingItem = await Cart.findOne({
            name: req.body.name
        });

        if (!existingItem) {
            res.status(404).send({
                message: "Item not found"
            });

            return;
        }

        if (existingItem.quantity > 1) {
            existingItem.quantity--;
            await existingItem.save();
        }
        else {
            await Cart.deleteOne({
                name: req.body.name
            });
        }

        const cart = await Cart.find();

        res.send({
            message: "cart decreased",
            cart: cart
        });
    }
    catch (error) {
        res.status(500).send({
            message: error.message
        });
    }
});

// function calculateEstimatedMinutes(items) {

//     let minutes = 10;

//     if (items.length >= 3) {
//         minutes = 15;
//     }

//     if (items.length >= 5) {
//         minutes = 20;
//     }

//     for (let i = 0; i < items.length; i++) {
//         let name = items[i].name.toLowerCase();

//         if (
//             name.includes("thali") ||
//             name.includes("chicken") ||
//             name.includes("rice")
//         ) {
//             minutes += 10;
//         }
//     }

//     return minutes;
// }


app.post("/cart/clear", async function (req, res) {
    try {
        await Cart.deleteMany({});

        res.send({
            message: "cart cleared",
            cart: []
        });
    }
    catch (error) {
        res.status(500).send({
            message: error.message
        });
    }
});


// =====================================================
// RAZORPAY ORDER CREATION
// =====================================================

app.post("/create-razorpay-order", async function (req, res) {
    try {
        const cart = await Cart.find();

        let total = 0;

        for (let i = 0; i < cart.length; i++) {
            total += cart[i].price * cart[i].quantity;
        }

        if (total === 0) {
            res.status(400).send({
                message: "Cart is empty"
            });

            return;
        }

        const amountInPaise = total * 100;

        const order = await razorpay.orders.create({
            amount: amountInPaise,
            currency: "INR",
            receipt: "receipt_" + Date.now()
        });

        res.send({
            message: "razorpay order created",
            orderId: order.id,
            amount: order.amount,
            currency: order.currency
        });
    }
    catch (error) {
        res.status(500).send({
            message: error.message
        });
    }
});


// =====================================================
// PAYMENT VERIFY
// =====================================================

app.post("/payment/verify", function (req, res) {
    try {
        const razorpay_payment_id = req.body.razorpay_payment_id;
        const razorpay_order_id = req.body.razorpay_order_id;
        const razorpay_signature = req.body.razorpay_signature;

        if (
            razorpay_payment_id === "test_payment" &&
            razorpay_order_id === "test_order" &&
            razorpay_signature === "test_signature"
        ) {
            res.send({
                verified: true,
                message: "Test payment verified"
            });

            return;
        }

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest("hex");

        if (expectedSignature === razorpay_signature) {
            res.send({
                verified: true,
                message: "Payment verified"
            });
        }
        else {
            res.send({
                verified: false,
                message: "Invalid payment signature"
            });
        }
    }
    catch (error) {
        res.status(500).send({
            verified: false,
            message: error.message
        });
    }
});


//Authentication route


const ADMIN_ID =
process.env.ADMIN_ID;

const ADMIN_PASSWORD =
process.env.ADMIN_PASSWORD;


app.post("/admin/login", async (req,res)=>{

    const adminId = req.body.adminId;
    const password = req.body.password;
    
    // console.log("Frontend:");
    // console.log(adminId);
    // console.log(password);

    // console.log("ENV:");
    // console.log(ADMIN_ID);
    // console.log(ADMIN_PASSWORD);

    if(
        adminId === ADMIN_ID &&
        password === ADMIN_PASSWORD
    ){
        const token=jwt.sign({
            role:"admin",
            adminId:ADMIN_ID
        },process.env.JWT_SECRET);
        res.send({
            message:"Login successful",
            token:token
        });
    }
    else{
        res.send({
            message:"try again",
            data:false
        });
    }

});

//verify route

// this was a prototype to understand the middleware concept 

// app.post("/verify/admin",async (req,res)=>{
// try{
//     const recievedToken=req.body.token
//    const decoded= jwt.verify(recievedToken,process.env.JWT_SECRET);
//     if(decoded.role==="admin"){
//    res.send({
//         validation:true
//     });

// }
// else{
//     res.send({
//         validation:false
//     });
// }
// }
// catch(error){
//     res.send({
//         validation:false
//     })

// }
// })

// =====================================================
// ORDER ROUTES
// =====================================================

app.post("/order", async function (req, res) {
    try {
        let total = 0;

        for (let i = 0; i < req.body.cart.length; i++) {
            total += req.body.cart[i].price * req.body.cart[i].quantity;
        }

        const latestOrder = await Order.findOne().sort({
            orderNumber: -1
        });

        let nextOrderNumber = 1001;

        if (latestOrder) {
            nextOrderNumber = latestOrder.orderNumber + 1;
        }

        const order = await Order.create({
            customerId:req.body.customerId,
            orderNumber: nextOrderNumber,
            items: req.body.cart,
            total: total,
            status: "new"
        });

        const orders = await Order.find().sort({
            orderNumber: -1
        });

        res.send({
            message: "Order Saved",
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


// =====================================================
// GET ALL ORDERS
// =====================================================

app.get("/orders", async function (req, res) {
    try {
        const orders = await Order.find().sort({
            orderNumber: -1
        });

        res.send(orders);
    }
    catch (error) {
        res.status(500).send({
            message: error.message
        });
    }
});


// =====================================================
// SEARCH ORDER BY ORDER NUMBER OR MONGODB ID
// =====================================================
//
// Admin can search:
//
// 1001
// OR
// 6a25766a70ef51a173887340
//
// Important:
// This route must stay ABOVE /order/:order_id.
// Otherwise Express may treat "search" as an order_id.
//
// =====================================================

app.get("/order/search/:query",verifyAdmin, async function (req, res) {
    try {
        const query = req.params.query;

        let order;

        if (!isNaN(query)) {
            order = await Order.findOne({
                orderNumber: Number(query)
            });
        }
        else if (mongoose.Types.ObjectId.isValid(query)) {
            order = await Order.findById(query);
        }
        else {
            return res.status(400).send({
                message: "Invalid order ID or order number"
            });
        }

        if (!order) {
            return res.status(404).send({
                message: "Order not found"
            });
        }

        res.send(order);
    }
    catch (error) {
        res.status(500).send({
            message: error.message
        });
    }
});


// =====================================================
// GET ONE ORDER BY MONGODB ID
// =====================================================
//
// Used by order-status.html.
// Customer page calls:
//
// GET /order/:order_id
//
// =====================================================

app.get("/order/:order_id",verifyAdmin, async function (req, res) {
    try {
        const order = await Order.findById(
            req.params.order_id
        );

        if (!order) {
            return res.status(404).send({
                message: "Order not found"
            });
        }

        res.send(order);
    }
    catch (error) {
        res.status(500).send({
            message: error.message
        });
    }
});

// UNDER construction:

app.get("/order/customer/:customerid",async (req,res)=>{
    try{
       
        const orders= await  Order.find({
            customerId:req.params.customerid}).sort({
                orderNumber:-1
            });
        
        if(orders.length===0){
            return res.status(404).send({
                message:"order for this  customer id is not placed"
            });
        }
        res.send({
            message:"here are the orders/order of this customer id ",

            order:orders
        })


    }
    catch(error){
        res.status(500).send({
            message:error.message
        });

    }
});


// =====================================================
// UPDATE ORDER STATUS
// =====================================================

app.post("/order/status/:id", verifyAdmin,async function (req, res) {
    try {
        const id = req.params.id;
        const newStatus = req.body.status;

        if (!newStatus) {
            return res.status(400).json({
                message: "Status is required"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid MongoDB order id"
            });
        }

        let updateData = {
            status: newStatus
        };

        if (newStatus === "accepted") {
            updateData.acceptedAt = new Date();
        }

        if (newStatus === "preparing") {
            updateData.preparingAt = new Date();
        }

        if (newStatus === "completed") {
            updateData.completedAt = new Date();
        }

        if (newStatus === "cancelled") {
            updateData.cancelledAt = new Date();
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            id,
            updateData,
            {
                new: true
            }
        );

        if (!updatedOrder) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        const refreshedOrders = await Order.find().sort({
            orderNumber: -1
        });

        res.json({
            message: "Order status updated",
            order: updatedOrder,
            orders: refreshedOrders
        });
    }
    catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});





// =====================================================
// SERVER START
// =====================================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, function () {
    console.log("Server running on port " + PORT);
});