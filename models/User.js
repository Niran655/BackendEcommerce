import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    required: true,
    enum: [
      "Admin",
      "Manager",
      "Cashier",
      "StockKeeper",
      "User",
      "Seller",
      "Staff",
      "Customer",
    ],
    default: "Cashier",
  },
  active: { type: Boolean, default: true },
  lastLogin: { type: Date },
  isSeller:Boolean,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model("User", userSchema);
