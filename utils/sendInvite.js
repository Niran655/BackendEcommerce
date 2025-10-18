import nodemailer from "nodemailer";

export const sendInvite = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "niron.camdoc@gmail.com", 
      pass: "czgl zxta muff qyoo", 
    },
  });
  return transporter.sendMail({
    from: `"MyShop" <${process.env.EMAIL_USER}>`,
    to, 
    subject, 
    html
  });
};
