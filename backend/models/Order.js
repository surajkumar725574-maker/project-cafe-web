const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    orderNumber:{
        type:Number,
        required:true,
        unique:true,


    },

    items: {
        type: Array,
        required: true
    },

    total: {
        type: Number,
        required: true
    },

    status: {
        type: String,
        default: "new"
    },

    createdAt: {
        type: Date,
        default: Date.now
    },

    acceptedAt: {
        type: Date,
        default: null
    },

    preparingAt: {
        type: Date,
        default: null
    },

    completedAt: {
        type: Date,
        default: null
    },

    cancelledAt: {
        type: Date,
        default: null
    }

});

module.exports = mongoose.model("Order", orderSchema);