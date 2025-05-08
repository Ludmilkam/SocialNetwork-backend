import nodemailer from "nodemailer"
import { Config } from "./config";

const transporter = nodemailer.createTransport({
  host: Config.SMTP_HOST,
  port: Config.SMTP_PORT,
  secure: Config.SMTP_USE_SSL,
  auth: {
    user: Config.SMTP_USER,
    pass: Config.SMTP_PASSWORD,
  },
});

export async function sendMail(to: string, subject: string, body: string) {
  await transporter.sendMail({
    to,
    subject,
    text: body
  })
}
