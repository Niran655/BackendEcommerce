import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    customer: [
        {
            firstName: {type:String, required: true},
            lastName: {type: String, required: false},
            phone: {type: String, required: false},
            email: {type: String, required: false}
        }
    ],
    restaurant: [
        {
            name: {type: String, required: false},
            address: {type: String,required:false},
            phone: {type: String, required: false}, 
        }
    ],
    items: [
        
    ]
})