import mongoose from 'mongoose';

const supplierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contactPerson: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  active: { type: Boolean, default: true },
  owner: { type: mongoose.Schema.ObjectId, ref: "User", default: null },
  shop: { type: mongoose.Schema.ObjectId, ref: "Shop", default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Supplier', supplierSchema);