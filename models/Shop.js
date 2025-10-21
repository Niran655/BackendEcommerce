import mongoose from "mongoose";

const ShopSchema = new mongoose.Schema(
  {
    shopName: { type: String, required: true },
    description: { type: String },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    staff:[{type: mongoose.Schema.Types.ObjectId, ref:"User"}],
    type: { type: mongoose.Schema.Types.ObjectId, ref: "Category",},
    slug: { type: String, require: true },
    image: { type: String, require: true },
    code: { type: String, require: true },
  },
  { timestamps: true }
);
const Shop = mongoose.model("Shop", ShopSchema);
export default Shop;
