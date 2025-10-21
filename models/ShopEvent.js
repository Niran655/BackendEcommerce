import mongoose from "mongoose";

const ShopEventSchema = new mongoose.Schema({
  shop: { type: mongoose.Schema.Types.ObjectId, ref: "Shop" },
  titleKh: { type: String, required: true },
  titleEn: { type: String, required: true },
  description: { type: String, required: true },
  condition: { type: String, required: true },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("ShopEvent", ShopEventSchema);
