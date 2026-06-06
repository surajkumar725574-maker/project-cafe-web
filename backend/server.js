// =====================================================
// LEARNING SECTION : MANUAL ROUTER IMPLEMENTATION
// =====================================================
//
// Kept for learning/reference.
// This helped understand how Express internally stores routes.
// Actual backend below uses Express + MongoDB.
//

/*
let routes = [];

function get(path, callback) {
    routes.push({
        method: "GET",
        path: path,
        callback: callback
    });
}

function post(path, callback) {
    routes.push({
        method: "POST",
        path: path,
        callback: callback
    });
}

function handleRequest(req, res) {
    for (let i = 0; i < routes.length; i++) {
        if (
            routes[i].path === req.url &&
            routes[i].method === req.method
        ) {
            routes[i].callback(req, res);
            return;
        }
    }

    res.send("404 not found");
}
*/


// =====================================================
// IMPORTS
// =====================================================

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const crypto = require("crypto");
const Razorpay = require("razorpay");

require("dotenv").config();

const Menu = require("./models/menu");
const Cart = require("./models/cart");
const Order = require("./models/Order");


// =====================================================
// APP SETUP
// =====================================================

const app = express();

app.use(cors());
app.use(express.json());


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


// =====================================================
// OLD ARRAY STORAGE - COMMENTED FOR LEARNING
// =====================================================
//
// Earlier we used:
//
// let cart = [];
// let orders = [];
// let menu = [ ... ];
//
// Problem:
// Render/server restart deletes memory data.
//
// New system:
// MongoDB stores menu, cart, and orders permanently.
//

/*
let cart = [];

let menu = [
    { name: "Bread Omelette", price: 60, category: "Breakfast" },
    { name: "Half Fry", price: 50, category: "Breakfast" },
    { name: "Veg Sandwich", price: 75, category: "Breakfast" },
    { name: "Cheese Sandwich", price: 95, category: "Breakfast" },

    { name: "Veg Thali", price: 110, category: "Lunch" },
    { name: "Chicken Thali", price: 180, category: "Lunch" },
    { name: "Chicken Chawal", price: 150, category: "Lunch" },
    { name: "Roti Sabji", price: 120, category: "Lunch" },

    { name: "Veg Burger", price: 60, category: "Burgers" },
    { name: "Cheese Burger", price: 90, category: "Burgers" },
    { name: "Chicken Burger", price: 130, category: "Burgers" },

    { name: "Veg Momos", price: 80, category: "Chinese" },
    { name: "Chicken Momos", price: 110, category: "Chinese" },
    { name: "Veg Noodles", price: 100, category: "Chinese" },
    { name: "Chicken Noodles", price: 140, category: "Chinese" },

    { name: "Veg Roll", price: 70, category: "Rolls" },
    { name: "Paneer Roll", price: 90, category: "Rolls" },
    { name: "Chicken Roll", price: 120, category: "Rolls" },

    { name: "Tea", price: 20, category: "Beverages" },
    { name: "Coffee", price: 30, category: "Beverages" },
    { name: "Cold Coffee", price: 90, category: "Beverages" },
    { name: "Coke", price: 40, category: "Beverages" },
    { name: "Sprite", price: 40, category: "Beverages" },

    { name: "Orange Juice", price: 70, category: "Juices" },
    { name: "Mango Juice", price: 80, category: "Juices" },

    { name: "Chocolate Shake", price: 120, category: "Shakes" },
    { name: "Oreo Shake", price: 140, category: "Shakes" }
];

let orders = [];
*/


// =====================================================
// HEALTH CHECK
// =====================================================

app.get("/", function (req, res) {
    res.send("Cafe backend is running with MongoDB");
});


// =====================================================
// MENU ROUTES
// =====================================================

// OLD:
// app.get("/menu", (req, res) => {
//     res.send(menu);
// });
//
// NEW:
// Fetch menu from MongoDB.

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


// OLD:
// menu.push(NewItem)
//
// NEW:
// Menu.create() saves permanently in MongoDB.

app.post("/menu", async function (req, res) {
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
            category: req.body.category.trim()
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


// OLD:
// menu.splice(i,1)
//
// NEW:
// Menu.deleteOne() deletes from MongoDB.

app.delete("/menu/:name", async function (req, res) {
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

// OLD:
// res.send(cart)
//
// NEW:
// Cart.find() reads cart collection.

app.get("/cart", async function (req, res) {
    try {
        const cart = await Cart.find();

        res.send(cart);
    }
    catch (error) {
        res.status(500).send({
            message: error.message
        });
    }
});


// OLD:
// cart.push(...)
// cart[i].quantity++
//
// NEW:
// Cart.findOne()
// existingItem.save()
// Cart.create()

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


// Increase item quantity from cart page.

app.post("/cart/name", async function (req, res) {
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


// Decrease item quantity.
// If quantity becomes 0, remove item.

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


// OLD:
// cart = []
//
// NEW:
// Cart.deleteMany() clears MongoDB cart collection.

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
//
// OLD:
// total calculated from cart array.
//
// NEW:
// total calculated from MongoDB cart.
//

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
//
// Current learning mode:
// Allows test_payment values.
//
// Real mode:
// Uses Razorpay signature verification.
//

app.post("/payment/verify", function (req, res) {
    try {
        console.log(req.body);

        const razorpay_payment_id = req.body.razorpay_payment_id;
        const razorpay_order_id = req.body.razorpay_order_id;
        const razorpay_signature = req.body.razorpay_signature;

        // Temporary test success path.
        // Keep this while Razorpay is in test-only workflow.
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


// =====================================================
// ORDER ROUTES
// =====================================================

// OLD:
// orders.push({
//     items: req.body,
//     status: "new"
// });
//
// NEW:
// Order.create() saves order in MongoDB.

app.post("/order", async function (req, res) {
    try {
        let total = 0;

        for (let i = 0; i < req.body.length; i++) {
            total += req.body[i].price * req.body[i].quantity;
        }

        const order = await Order.create({
            items: req.body,
            total: total,
            status: "new"
        });

        const orders = await Order.find().sort({
            createdAt: -1
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


// Admin panel gets all orders.

app.get("/orders", async function (req, res) {
    try {
        const orders = await Order.find().sort({
            createdAt: -1
        });

        res.send(orders);
    }
    catch (error) {
        res.status(500).send({
            message: error.message
        });
    }
});


// ORDER STATUS
//
// Your older admin frontend used index:
// /order/status/0
//
// MongoDB prefers _id:
// /order/status/686....
//
// This route supports both.

app.post("/order/status/:id", async function (req, res) {
    try {
        const id = req.params.id;
        const newStatus = req.body.status;

        let updatedOrder;

        if (mongoose.Types.ObjectId.isValid(id)) {
            updatedOrder = await Order.findByIdAndUpdate(
                id,
                {
                    status: newStatus
                },
                {
                    new: true
                }
            );
        }
        else {
            const orders = await Order.find().sort({
                createdAt: -1
            });

            const index = Number(id);

            if (Number.isNaN(index) || !orders[index]) {
                res.status(404).send({
                    message: "Order not found"
                });

                return;
            }

            orders[index].status = newStatus;
            updatedOrder = await orders[index].save();
        }

        const refreshedOrders = await Order.find().sort({
            createdAt: -1
        });

        res.send({
            message: "Order status updated",
            order: updatedOrder,
            orders: refreshedOrders
        });
    }
    catch (error) {
        res.status(500).send({
            message: error.message
        });
    }
});


// =====================================================
// OLD ROUTES REFERENCE - COMMENTED
// =====================================================

/*
app.get("/menu", (req, res) => {
    res.send(menu);
});

app.post("/cart", (req, res) => {
    cart.push(req.body);

    res.send({
        message: "cart added",
        cart: cart
    });
});

app.get("/cart", (req, res) => {
    res.send(cart);
});

app.post("/cart/clear", (req, res) => {
    cart = [];

    res.send({
        message: "cart cleared",
        cart: cart
    });
});

app.post("/order", (req, res) => {
    orders.push({
        items: req.body,
        status: "new"
    });

    res.send({
        message: "Order Saved",
        orders: orders
    });
});
*/


// =====================================================
// SERVER START
// =====================================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, function () {
    console.log("Server running on port " + PORT);
});