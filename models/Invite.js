import mongoose from "mongoose";

const inviteSchema = new mongoose.Schema({
  email: { type: String, required: true },
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true },
  role: { type: String, required: true },
  token: { type: String, required: true },
  status: { type: String, enum: ["Pending","Accepted","Rejected"], default: "Pending" },
  expiredAt: { type: Date, default: () => new Date(Date.now() + 24*60*60*1000) } // 24h
});

export const Invite = mongoose.model("Invite", inviteSchema);
