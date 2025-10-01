import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    nameKh:{type: String, require: true},
    slug: { type: String, required: true },
    description: String,
    image: String,
    active: { type: Boolean, default: true },
    owner: { type: mongoose.Schema.ObjectId, ref: "User", default: null },
    shop: { type: mongoose.Schema.ObjectId, ref: "Shop", default: null },
    parent: { type: mongoose.Schema.ObjectId, ref: "Category", default: null },
    children:{type:mongoose.Schema.ObjectId, ref: "Category",default:null}
  },
  { timestamps: true }
);
export default mongoose.model("Category", categorySchema);
