import "server-only";
import { env } from "@/lib/env";
import { ConsoleEmail } from "./console.provider";
import { ResendEmail } from "./resend.provider";
import { SmtpEmail } from "./smtp.provider";
import type { EmailProvider } from "./types";

let instance: EmailProvider | undefined;

/** EMAIL_PROVIDER=resend | smtp | console (default). */
export function emailProvider(): EmailProvider {
  if (instance) return instance;
  const e = env();
  if (e.EMAIL_PROVIDER === "resend") {
    if (!e.EMAIL_API_KEY) throw new Error("EMAIL_PROVIDER=resend but EMAIL_API_KEY is missing.");
    instance = new ResendEmail({ apiKey: e.EMAIL_API_KEY, from: e.EMAIL_FROM, replyTo: e.EMAIL_REPLY_TO });
  } else if (e.EMAIL_PROVIDER === "smtp") {
    if (!e.SMTP_HOST || !e.SMTP_USER || !e.SMTP_PASS) throw new Error("EMAIL_PROVIDER=smtp needs SMTP_HOST, SMTP_USER and SMTP_PASS.");
    instance = new SmtpEmail({
      host: e.SMTP_HOST,
      port: e.SMTP_PORT,
      secure: e.SMTP_SECURE ? e.SMTP_SECURE === "true" : e.SMTP_PORT === 465,
      user: e.SMTP_USER,
      pass: e.SMTP_PASS,
      from: e.EMAIL_FROM,
      replyTo: e.EMAIL_REPLY_TO,
    });
  } else instance = new ConsoleEmail();
  return instance;
}

export function isEmailLive() {
  return env().EMAIL_PROVIDER !== "console";
}
export * from "./types";
