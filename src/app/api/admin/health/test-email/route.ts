import { z } from "zod";
import { withAdmin, ok } from "@/server/auth/with-admin";
import { emailProvider } from "@/lib/integrations/email";
import { emailLayout } from "@/lib/integrations/email/templates";
import { AppError } from "@/server/errors";
import { audit } from "@/server/audit";

const schema = z.object({ to: z.string().trim().email() });

/** Admin → Settings → Integrations → "Send test email": sends immediately (not via the outbox) and reports the real result. */
export const POST = withAdmin("settings.manage", async (req, { admin }) => {
  const { to } = schema.parse(await req.json());
  const provider = emailProvider();
  try {
    const res = await provider.send({
      to,
      subject: "Radhe Radhe — VHI test email ✓",
      text: "If you can read this, VHI booking emails are working.",
      html: emailLayout({
        preheader: "VHI email is working",
        heading: "Your booking emails are working",
        intro: `Radhe Radhe! This test was sent by ${admin.name} from the VHI admin panel using the “${provider.name}” email provider. Guests will receive booking confirmations, payment receipts and cancellation emails like this one.`,
        footerNote: "You can ignore this message.",
      }),
    });
    await audit(admin, "test-email", "Settings", "email", { summary: `${provider.name} → ${to}` });
    return ok({ provider: provider.name, id: res.id, console: provider.name === "console" });
  } catch (e) {
    throw new AppError("EMAIL_FAILED", `Email could not be sent (${provider.name}): ${(e as Error).message}`, 502);
  }
});
