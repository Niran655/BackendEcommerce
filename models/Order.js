import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  customer: {
    firstName: { type: String, required: false },
    lastName: { type: String, required: false },
    phone: { type: String, required: false },
    email: { type: String, required: false },
  },
  restaurant: {
    name: { type: String, required: false },
    address: { type: String, required: false },
    phone: { type: String, required: false },
  },
  shop: { type: mongoose.Schema.Types.ObjectId, ref: "Shop" },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      quantity: { type: Number, required: false },
      price: { type: Number, required: true },
      total: { type: Number, required: false },
    },
  ],
  deliveryAddress: {
    formatted: String,
    latitude: { type: Number },
    longitude: { type: Number },
  },
  deliveryFee: { type: Number, required: false },
  discount: { type: Number, required: false },
  tax: { type: Number, required: false },
  totalPrice: Number,
  grandTotal: Number,
  paymentMethod: { type: String, required: false },
  payments: [
    {
      order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
      paidAmount: Number,
      paymentMethod: String,
      status: {
        type: String,
        enum: ["PENDING", "SUCCESS", "FAILED", "REFUNDED"],
        default: "PENDING",
      },
      transactionId: String,
      createdAt: { type: Date, default: Date.now },
    },
  ],
  status: {
    type: String,
    enum: ["PENDING", "SUCCESS", "FAILED", "REFUNDED"],
    default: "PENDING",
  },
  remark: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
export default mongoose.model("Order", orderSchema);
