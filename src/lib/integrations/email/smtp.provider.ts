import nodemailer, { type Transporter } from "nodemailer";
import type { EmailMessage, EmailProvider } from "./types";

/**
 * SMTP — works with any mailbox: Google Workspace / Gmail (app password), Zoho Mail,
 * Hostinger, GoDaddy, Outlook 365, Amazon SES SMTP, etc.
 */
export class SmtpEmail implements EmailProvider {
  readonly name = "smtp" as const;
  private transporter: Transporter;

  constructor(private cfg: { host: string; port: number; secure: boolean; user: string; pass: string; from: string; replyTo?: string }) {
    this.transporter = nodemailer.createTransport({
      host: cfg.host,
      port: cfg.port,
      secure: cfg.secure,
      auth: { user: cfg.user, pass: cfg.pass },
      pool: true,
      maxConnections: 3,
      connectionTimeout: 10_000,
    });
  }

  async send(m: EmailMessage) {
    const info = await this.transporter.sendMail({
      from: this.cfg.from,
      to: [m.to].flat().join(", "),
      replyTo: m.replyTo ?? this.cfg.replyTo,
      subject: m.subject,
      html: m.html,
      text: m.text,
    });
    if (info.rejected?.length) throw new Error(`SMTP rejected: ${info.rejected.join(", ")}`);
    return { id: info.messageId };
  }

  /** Used by Admin → Settings → Integrations to check the login works. */
  verify() {
    return this.transporter.verify();
  }
}
