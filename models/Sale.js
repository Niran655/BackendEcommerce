import mongoose from 'mongoose';

const saleSchema = new mongoose.Schema({
  saleNumber: { type: String, required: true, unique: true },
  cashier: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    total: { type: Number, required: true }
  }],
  shop:{type: mongoose.Schema.Types.ObjectId, ref:"Shop", required: true},
  subtotal: { type: Number, required: true },
  tax: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  paymentMethod: { 
    type: String, 
    required: true, 
    enum: ['cash', 'card', 'qr'] 
  },
  amountPaid: { type: Number, required: true },
  change: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['completed', 'refunded'], 
    default: 'completed' 
  },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Sale', saleSchema);