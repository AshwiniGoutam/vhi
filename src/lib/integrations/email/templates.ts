/** Minimal, brand-consistent transactional email layout (inline styles for email clients). */
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export function emailLayout(opts: { preheader?: string; heading: string; intro?: string; rows?: [string, string][]; footerNote?: string; cta?: { label: string; href: string } }) {
  const rows = (opts.rows ?? [])
    .map(
      ([k, v]) =>
        `<tr><td style="padding:10px 0;border-bottom:1px solid #eeeeee;color:#737373;font-size:13px;width:40%">${esc(k)}</td><td style="padding:10px 0;border-bottom:1px solid #eeeeee;color:#171717;font-size:14px">${esc(v)}</td></tr>`,
    )
    .join("");
  return `<!doctype html><html><body style="margin:0;background:#f5f5f5;font-family:Helvetica,Arial,sans-serif">
<span style="display:none">${esc(opts.preheader ?? "")}</span>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 12px"><tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;padding:40px;border-radius:16px">
<tr><td style="font-size:28px;font-weight:800;letter-spacing:-1px;color:#0a0a0a">VHI</td></tr>
<tr><td style="font-family:Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:3px;color:#737373;padding-bottom:28px">LUXURY HOMESTAYS · VRINDAVAN</td></tr>
<tr><td style="font-family:Helvetica,Arial,sans-serif;font-weight:600;font-size:26px;color:#0a0a0a;padding-bottom:12px">${esc(opts.heading)}</td></tr>
${opts.intro ? `<tr><td style="font-size:15px;line-height:1.6;color:#171717;padding-bottom:20px">${esc(opts.intro)}</td></tr>` : ""}
${rows ? `<tr><td><table width="100%" cellpadding="0" cellspacing="0">${rows}</table></td></tr>` : ""}
${opts.cta ? `<tr><td style="padding-top:28px"><a href="${esc(opts.cta.href)}" style="background:#0a0a0a;color:#ffffff;text-decoration:none;padding:14px 24px;border-radius:999px;font-size:13px;letter-spacing:1px">${esc(opts.cta.label)}</a></td></tr>` : ""}
${opts.footerNote ? `<tr><td style="font-size:12px;color:#737373;padding-top:28px;line-height:1.6">${esc(opts.footerNote)}</td></tr>` : ""}
</table></td></tr></table></body></html>`;
}
