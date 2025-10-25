import nodemailer from "nodemailer";

export const sendInvite = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.NEXT_PUBLIC_EMAIL_USERNAME, 
      pass: process.env.NEXT_PUBLIC_EMAIL_PASSWORD, 
    },
  });
  return transporter.sendMail({
    from: `"MyShop" <${process.env.EMAIL_USER}>`,
    to, 
    subject, 
    html
  });
};
