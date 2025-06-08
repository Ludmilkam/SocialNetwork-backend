import { StringValue } from "ms";

export const Config = {
  SMTP_HOST: process.env.SMTP_HOST!,
  SMTP_PORT: Number(process.env.SMTP_PORT)!,
  SMTP_USE_SSL: !!process.env.SMTP_USE_SSL,
  SMTP_USER: process.env.SMTP_USER!,
  SMTP_PASSWORD: process.env.SMTP_PASSWORD!,
  SERVER_HOST: process.env.SERVER_HOST || "0.0.0.0",
  SERVER_PORT: Number(process.env.SERVER_PORT) || 8000,
  OTP_LENGTH: 6,
  OTP_TTL: (process.env.OTP_TTL || "5m") as StringValue,
  JWT_TTL: (process.env.JWT_TTL || "1h") as StringValue,
  JWT_SECRET: process.env.JWT_SECRET!,
  getMediaServeUrl: () => {
    return process.env.MEDIA_SERVE_URL || `http://${Config.SERVER_HOST}:${Config.SERVER_PORT}`
  }
};
