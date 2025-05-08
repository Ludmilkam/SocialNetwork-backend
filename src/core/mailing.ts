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
  console.log("Start sending mail")
  await transporter.sendMail({
    from: "maildjango12@gmail.com",
    to,
    subject,
    text: body
  })
  console.log("Mail succesfully sent to", to)
}
