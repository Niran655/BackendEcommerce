import mongoose from "mongoose";

const shopStaffSchema = new mongoose.Schema({
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['Admin', 'Manager', 'Cashier', 'StockKeeper', 'Staff'],
    required: true
  },
  active:{type:Boolean,default:true},
  assignedAt: {
    type: Date,
    default: Date.now
  }
});


shopStaffSchema.index({ shop: 1, user: 1 }, { unique: true });

export default mongoose.model("ShopStaff", shopStaffSchema);