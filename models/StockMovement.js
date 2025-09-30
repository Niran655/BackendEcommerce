import mongoose from "mongoose";

const stockMovementSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ["in", "out", "adjustment"],
  },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", require: true },
  shop: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", require: true },
  quantity: { type: Number, required: true },
  reason: { type: String, required: true },
  reference: { type: String }, // PO number, sale number, etc.
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  previousStock: { type: Number, required: true },
  newStock: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("StockMovement", stockMovementSchema);
