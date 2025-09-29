// models/Store.js
import mongoose from "mongoose";

const storeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: String,
  phone: String,
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model("Store", storeSchema);