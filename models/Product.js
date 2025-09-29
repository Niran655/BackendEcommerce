import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: false },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  description: { type: String },
  category: { type: String, required: false },
  // shopCategoryId:{type: String,require:false},
  shopCategory: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  price: { type: Number, required: false },
  cost: { type: Number, required: false },
  sku: { type: String, required: false, unique: false },
  stock: { type: Number, required: false, default: 0 },
  minStock: { type: Number, required: false, default: 10 },
  isCombo: { type: Boolean, default: false },
  comboItems: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      quantity: { type: Number, default: 1 },
    },
  ],
  addSlide: [
    {
      title: { type: String, require: false },
      header: { type: String, require: false },
      description: { type: String, require: false },
      image: { type: String, require: false },
    },
  ],
  slug: String,
  subImage: [
    {
      url: { type: String, required: false },
      altText: String,
      caption: String,
    },
  ],
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Shop",
    required: function () {
      return this.createdBy && this.createdBy.role === "Seller";
    },
  },

  shops: [
    {
      shop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shop",
        required: true,
      },
      isVisible: { type: Boolean, default: true },
      customPrice: { type: Number },
      createdAt: { type: Date, default: Date.now },
    },
  ],
  mainStock: [
    {
      quantity: { type: Number, default: 0 },
      minStock: { type: Number, default: 0 },
      lowStock: { type: Boolean, default: true },
    },
  ],

  discount: [
    {
      defaultPrice: { type: Number, require: false },
      description: { type: String, require: false },
      discountPrice: { type: Number, require: false },
    },
  ],
  image: { type: String },

  active: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

productSchema.virtual("lowStock").get(function () {
  return this.stock <= this.minStock;
});

export default mongoose.model("Product", productSchema);
