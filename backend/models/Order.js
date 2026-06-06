const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({

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
    }

});

module.exports = mongoose.model("Order", orderSchema);