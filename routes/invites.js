import jwt from "jsonwebtoken";
import express from "express";

import { ShopStaff } from "../models/ShopStaff.js";
// import { sendEmail } from "../utils/sendEmail.js";
import { sendInvite } from "../utils/sendInvite.js";
import { Invite } from "../models/Invite.js";

const router = express.Router();


router.post("/send", async (req, res) => {
  try {
    const { email, shopId, role } = req.body;
  
    const token = jwt.sign({ email, shopId, role }, process.env.JWT_SECRET, { expiresIn: "1d" });
    await Invite.create({ email, shopId, role, token });

    const link = `${process.env.FRONTEND_URL}/invite/accept?token=${token}`;
    const html = `
      <h3>You are invited to join the shop</h3>
      <p>Role: <b>${role}</b></p>
      <a href="${link}">Click to Accept Invitation</a>
      <p>Link expires in 24 hours.</p>
    `;
    await sendInvite({ to: email, subject: "Invitation to join shop", html });
    return res.json({ message: "Invite sent" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error sending invite" });
  }
});


router.post("/accept", async (req, res) => {
  try {
    const { token, userId } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { email, shopId, role } = decoded;

    const invite = await Invite.findOne({ token, status: "Pending" });
    if (!invite) return res.status(400).json({ message: "Invalid or expired invite" });
    if (invite.expiredAt < new Date()) {
      invite.status = "Rejected";
      await invite.save();
      return res.status(400).json({ message: "Invite expired" });
    }

  
    await ShopStaff.create({ shopId, userId, role, status: "Active" });
    invite.status = "Accepted";
    await invite.save();

    return res.json({ message: "Invitation accepted" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error accepting invite" });
  }
});

router.get("/verify", async (req, res) => {
  try {
    const { token } = req.query;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return res.json({ ok: true, data: decoded });
  } catch (err) {
    return res.status(400).json({ ok: false, message: "Invalid token" });
  }
});

export default router;
