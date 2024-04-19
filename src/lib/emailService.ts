import nodemailer from "nodemailer";
import { config } from "../config";

const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  auth: {
    user: config.SMTP_USER,
    pass: config.SMTP_PASS,
  },
});

export const sendEmailVerificationMail = async (
  email: string,
  token: string
) => {
  try {
    const info = await transporter.sendMail({
      from: config.SMTP_USER,
      to: email,
      subject: "Email Verification",
      text: `Click on the link to verify your email: http://localhost:8080/admin/email/verify?token=${token}`,
    });

    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.error(error);
    throw new Error("Error sending email");
  }
};
