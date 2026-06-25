const mongoose=require("mongoose");
const customerSchema = new mongoose.Schema({
    customerId:{
        type:String,
        required:true,
        unique:true,
        trim:true
    },

    name:{
        type:String,
        required:true,
        trim:true
    },

    phoneNo:{
        type:String,
        required:true,
        unique:true,
        trim:true
    },

    email:{
        type:String,
        unique:true,
        sparse:true,
        trim:true,
        lowercase:true
    },

    password:{
        type:String,
        required:true
    },

    totalOrders:{
        type:Number,
        default:0
    },

    totalSpent:{
        type:Number,
        default:0
    },

    rewardPoints:{
        type:Number,
        default:0
    }
});

module.exports=mongoose.model("Customer",customerSchema);