import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema({
  category: { type: String, required: true },
  image: { type: String, required: true },
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
  link: { type: String, required: true },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model("Banner", bannerSchema);
