// =====================================================
// IMPORTS

// =====================================================
const path = require("path");


const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const crypto = require("crypto");
const Razorpay = require("razorpay");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const multer = require("multer");
const cloudinary=require('cloudinary').v2;
require("dotenv").config();


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

console.log("Cloud name:", cloudinary.config().cloud_name);
console.log(
    "API key loaded:",
    cloudinary.config().api_key ? "YES" : "NO"
);
console.log(
    "API secret loaded:",
    cloudinary.config().api_secret ? "YES" : "NO"
);



const Menu = require("./models/Menu");
const Cart = require("./models/Cart");
const Order = require("./models/Order");
const Customer = require("./models/Customer");
const { error } = require("console");

// =====================================================
// APP SETUP
// =====================================================

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const upload= multer({
    dest:"uploads/"
});




// app.use(express.static(path.join(__dirname, "frontend")));
// // =====================================================
// MONGODB CONNECTION
// =====================================================

mongoose.connect(process.env.MONGODB_URI)
    .then(function () {
        console.log("MongoDB Connected");
        console.log("connected DB:", mongoose.connection.name);
    })
    .catch(function (error) {
        console.log(error);
        console.log(error.message);
        console.log(error.stack);
    });


// =====================================================
// RAZORPAY SETUP
// =====================================================

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// class AppErr extends error{

//     constructor(message,statuscode){
//         super(message);
//         this.statuscode=statuscode;
//     }

// }

// function resolveCustomer(req,res,next){
//     console.log("resolveCustomer called");
//     const authHeader=req.headers.authorization;
//     if(!authHeader){
//        req.customerId=req.query.customerId;
//        console.log("Resolved customer:", req.customerId);
//           next();


//     }
//     else{

//     verifyUser(req,res,next);
// }





//}
function resolveCustomer(req, res, next) {
    // console.log("Entered resolveCustomer");

    const authHeader = req.headers.authorization;

    // console.log("Header:", authHeader);

    if (!authHeader) {
        // console.log("Guest user");

        req.customerId = req.query.customerId;

        // console.log("CustomerId:", req.customerId);

        return next();
    }

    // console.log("Logged in user");

    return verifyUser(req, res, next);
}

function verifyUser(req, res, next) {
    const header = req.headers.authorization;
    if (!header) {
        return res.status(401).send({
            message: "unauthorized"
        })
    }

    const parts = header.split(" ");


    if (parts.length != 2 || parts[0] !== "Bearer") {
        return res.status(401).send({
            message: "unauthorized"
        })
    }

    // if(parts[0]!=="Bearer"){
    //  return res.status(401).send({
    //     message:"unauthorized"})
    // }

    const extractedToken = parts[1];
    let userdecoded;

    try {

        userdecoded = jwt.verify(extractedToken, process.env.JWT_SECRET)
    }
    catch (err) {
        return res.status(401).send({
            message: "unauthorized"

        })

    }

    if (userdecoded.role === "user") {
        if (userdecoded.customerId) {
            req.customerId = userdecoded.customerId;
            next();

        }
        else {
            return res.status(401).send({
                message: "Invalid user"
            })

        }
    }
    else {
        return res.status(401).send({
            message: "unauthorized"
        })
    }
}


function verifyAdmin(req, res, next) {


    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).send({
            message: "Unauthorized"
        });
    }
    const parts = authHeader.split(" ");
    if (parts.length !== 2) {
        return res.status(401).send({
            message: "Unauthorized"
        });
    }
    if (parts[0] !== "Bearer") {
        return res.status(401).send({
            message: "Unauthorized"
        });
    }

    const token = parts[1];
    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    }
    catch (error) {
        return res.status(401).send({
            message: "Unauthorized"
        });

    }
    if (decoded.role === "admin") {
        req.admin = decoded;
        return next();
    }


    // }
    else {
        return res.status(401).send({
            message: "Unauthorized"
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
        return res.send(menu);
    }
    catch (error) {
        res.status(500).send({
            message: error.message
        });
    }
});


app.post("/menu", verifyAdmin,

    upload.single("image"),

    
    
    async function (req, res) {

        console.log(req.body);
    console.log(req.file);

   

        
    try {
        
        if (!req.body.name || !req.body.price || !req.body.category||!req.file) {
            const menu = await Menu.find();

            res.send({
                message: "Please fill all fields",
                menu: menu
            });

            return;
        }

             const result=await cloudinary.uploader.upload(
                req.file.path
            );
            console.log("Cloudinary upload successful");

            console.log("Image URL:", result.secure_url);


        const newItem = {
            name: req.body.name.trim(),
            price: Number(req.body.price),
            category: req.body.category.trim(),
            image: result.secure_url
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


app.delete("/menu/:name", verifyAdmin, async function (req, res) {
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
            cart);
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


//user-authentication


//Authentication route


const ADMIN_ID =
    process.env.ADMIN_ID;

const ADMIN_PASSWORD =
    process.env.ADMIN_PASSWORD;


app.post("/admin/login", async (req, res) => {

    const adminId = req.body.adminId;
    const password = req.body.password;

    // console.log("Frontend:");
    // console.log(adminId);
    // console.log(password);

    // console.log("ENV:");
    // console.log(ADMIN_ID);
    // console.log(ADMIN_PASSWORD);

    if (
        adminId === ADMIN_ID &&
        password === ADMIN_PASSWORD
    ) {
        const token = jwt.sign({
            role: "admin",
            adminId: ADMIN_ID
        }, process.env.JWT_SECRET);
        res.send({
            message: "Login successful",
            token: token
        });
    }
    else {
        res.send({
            message: "try again",
            data: false
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
            customerId: req.body.customerId,
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

app.get("/orders", verifyAdmin, async function (req, res) {
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

app.get("/order/search/:query", verifyAdmin, async function (req, res) {
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





app.get("/order/by-customer", resolveCustomer, async (req, res) => {
    //     console.log("Route reached");
    // console.log(req.query.customerId);


    try {
        // console.log("1");
        let customerId = req.customerId;
        //  console.log("2");
        //  console.log("Route customer:", req.customerId);

        const orders = await Order.find({

            customerId
        }).sort({
            orderNumber: -1
        });
        // console.log("3",orders);

        if (orders.length === 0) {
            return res.status(404).send({
                message: "order for this  customer id is not placed"
            });
        }
        res.send({
            message: "here are the orders/order of this customer id ",

            order: orders
        })


    }
    catch (error) {
        console.log(error);
        console.log(error.message);
        console.log(error.stack);
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

app.get("/order/:order_id", async function (req, res) {
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



// =====================================================
// UPDATE ORDER STATUS
// =====================================================




app.post("/order/status/:id/:status", verifyAdmin, async function (req, res) {
        //     console.log("Route hit");
        // console.log(req.params);
    try {
        const id = req.params.id;
        const newStatus = req.params.status;

        

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




        const currentStatus = await Order.findById(id);
        // console.log(currentStatus.status);

        
        if (!currentStatus) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

         

        const now = new Date();

        let updateData = {
            status: newStatus
        };

        if (newStatus === "accepted") {

            if (!currentStatus.acceptedAt) {
                updateData.acceptedAt = now;
            }

        }

        if (newStatus === "preparing") {
            if (!currentStatus.acceptedAt) {
                updateData.acceptedAt = now;
            }

            updateData.preparingAt = now;
        }

        if (newStatus === "completed") {
            if (!currentStatus.acceptedAt) {
                updateData.acceptedAt = now;
            }

            if (!currentStatus.preparingAt) {
                updateData.preparingAt = now;
            }
            updateData.completedAt = now;
        }

        if (newStatus === "cancelled") {
            updateData.cancelledAt = now;
        }
           
        //     console.log("Update Data:", {
        // ...updateData,
        // acceptedAt: updateData.acceptedAt?.toLocaleString(),
        // preparingAt: updateData.preparingAt?.toLocaleString(),
        // completedAt: updateData.completedAt?.toLocaleString()
    // });

        const updatedOrder = await Order.findByIdAndUpdate(
            id,
            updateData,
            {
                returnDocument: "after"
            }
        );

        console.log(updatedOrder);
         
      

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

app.post("/user/signup", async (req, res) => {
    try {

        const userName = req.body.name;
        const userPhone = req.body.phoneNo;
        const userPassword = req.body.password;
        const customerId = req.body.customerId;
        const hashedPassword = await bcrypt.hash(userPassword, 10);

        // console.log("userName:",userName);
        // console.log("userPhone:",userPhone);
        // console.log("customerId:",customerId);

        // return res.json({msg:"got the request"});
        // console.log("Recieved customerId:");
        console.log("checking customerId...");
        const existingCustomer = await Customer.findOne({
            customerId
        });
        // console.log("existingCustomer:", existingCustomer);

        if (existingCustomer) {
            return res.status(409).send({
                message: "Account already exists. Please login."

            });
        }

        console.log("checking customerId...");

        const existingPhone = await Customer.findOne({
            phoneNo: userPhone
        });

        console.log("existingPhone:", existingPhone);

        if (existingPhone) {
            return res.status(409).send({
                message: "phone no is already registered"
            });
        }

        console.log("checking customerId...");
        const customer = await Customer.create({
            name: userName,
            phoneNo: userPhone,
            password: hashedPassword,
            customerId: customerId
        });

        const token = jwt.sign(
            {
                role: "user",
                customerId: customer.customerId
            },
            process.env.JWT_SECRET, {
            expiresIn: "30d"
        }
        );

        return res.send({
            message: "Sign up successful",
            token,
            customerId: customer.customerId
        });

    }
    catch (error) {
        console.log(error);
        if (error.code === 11000) {
            let errorType = Object.keys(error.keyValue)[0];
            return res.status(409).send({
                message: `${errorType} is already present`
            })
        }
        return res.status(500).send({
            message: error.message
        });
    }
});

app.post("/user/login", async (req, res) => {

    let phoneNo = req.body.phoneNo;

    let password = req.body.password;

    const existingCustomer = await Customer.findOne({

        phoneNo

    })
    if (!existingCustomer) {
        console.log(1);

        return res.status(401).send({

            message: "Invalid number or password "
        });
    }

    try {

        const matchedPass = await bcrypt.compare(password, existingCustomer.password);

        if (matchedPass) {
            const usertoken = jwt.sign({
                role: "user",
                customerId: existingCustomer.customerId

            }, process.env.JWT_SECRET, { expiresIn: "30d" })


            return res.send({
                usertoken,
                customerId: existingCustomer.customerId,
                message: "login successful"
            })
        }
        else {
            // console.log(2);
            return res.status(401).send({
                message: "Invalid phone or password"
            })
        }

    }
    catch (error) {
        return res.status(500).send({
            message: error.message
        })
    }



})




// =====================================================
// SERVER START
// =====================================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, function () {
    console.log("Server running on port " + PORT);
});