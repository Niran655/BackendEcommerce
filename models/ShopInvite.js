import mongoose from "mongoose";

const shopInviteSchema = new mongoose.Schema({
    shop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop',
        required: true
    },
    inviteBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    email: {
        type: String,
        required: true
    },
    token: { type: String, required: true },
    status: { type: String, enum: ['Pending', 'Accepted', 'Expired'], default: 'Pending' },
    expiresAt: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now
    }

}) 
export default mongoose.model("ShopInvite", shopInviteSchema);