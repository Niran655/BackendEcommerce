import nodemailer from "nodemailer";

export async function sendEmail(to, otp) {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com", 
    port: 587,
    secure: false,
    auth: {
      user: "niron.camdoc@gmail.com", 
      pass: "czgl zxta muff qyoo", 
    },
  });

  await transporter.sendMail({
    from: `"My App" <${"niron.camdoc@gmail.com"}>`,
    to,
    subject: "Verify your account",
    text: `Your OTP code is: ${otp}. It will expire in 10 minutes.`,
    html: `<h3>Your OTP code is: <b>${otp}</b></h3><p>This code will expire in 10 minutes.</p>`,
  });
}
