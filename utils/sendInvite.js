import nodemailer from "nodemailer";

export const sendInvite = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
  });

  return transporter.sendMail({
    from: `"MyShop" <${process.env.EMAIL_USER}>`,
    to, subject, html
  });
};
