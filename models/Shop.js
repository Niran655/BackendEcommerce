import mongoose from "mongoose";

const ShopSchema = new mongoose.Schema({
  shopName: { type: String, required: true },
  description: { type: String },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

const Shop = mongoose.model("Shop", ShopSchema);
export default Shop;

