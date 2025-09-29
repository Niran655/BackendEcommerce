import mongoose from "mongoose";

const purchaseOrderSchema = new mongoose.Schema({
  poNumber: { type: String, required: true, unique: true },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Supplier",
    required: true,
  },
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      unitCost: { type: Number, required: true },
      total: { type: Number, required: true },
    },
  ],
  subtotal: { type: Number, required: true },
  tax: { type: Number, required: true },
  total: { type: Number, required: true },
  status: {
    type: String,
    enum: ["pending", "ordered", "received", "cancelled"],
    default: "pending",
  },
  owner: { type: mongoose.Schema.ObjectId, ref: "User", default: null },
  shop: { type: mongoose.Schema.ObjectId, ref: "Shop", default: null },
  orderedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  orderDate: { type: Date, default: Date.now },
  receivedDate: { type: Date },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model("PurchaseOrder", purchaseOrderSchema);
