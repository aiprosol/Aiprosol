// AIPROSOL · Magic-link sign-in email
// Same inline-style approach as roi-report.ts. Tested in Gmail / Outlook /
// Apple Mail / mobile clients.

interface MagicLinkInput {
  link: string;        // full https://aiprosol.com/api/auth/verify?token=... URL
  siteUrl: string;
  expiresIn: string;   // human label like "15 minutes"
}

export function magicLinkSubject(): string {
  return 'Your Aiprosol sign-in link';
}

export function magicLinkText(input: MagicLinkInput): string {
  return `Sign in to Aiprosol

Tap the link below to sign in. Expires in ${input.expiresIn}.

${input.link}

If you didn't request this, ignore this email — no account is created until you click the link.

— Arora
AI CEO, Aiprosol
${input.siteUrl}
`;
}

export function magicLinkHtml(input: MagicLinkInput): string {
  return `<!doctype html>
<html lang="en">
<body style="margin:0;padding:0;background:#0A0613;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Inter,sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#0A0613;padding:40px 20px;">
    <tr><td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" width="560" style="max-width:560px;background:#13101F;border:1px solid #2A1F3D;border-radius:18px;overflow:hidden;">
        <tr><td style="padding:32px 36px 8px;">
          <div style="font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#8B5CF6;">Aiprosol · Sign in</div>
          <h1 style="font-family:'Space Grotesk',sans-serif;font-weight:800;font-size:26px;line-height:1.2;color:#E5E7EB;margin:14px 0 8px;">
            Your sign-in link is ready
          </h1>
          <p style="color:#9CA3B5;font-size:15px;line-height:1.6;margin:0 0 26px;">
            Click the button below to sign in. Link expires in ${input.expiresIn}, single visitor.
          </p>
          <a href="${input.link}" style="display:inline-block;padding:14px 28px;background:linear-gradient(135deg,#8B5CF6,#C084FC);color:#0A0613;border-radius:10px;font-family:'Space Grotesk',sans-serif;font-weight:800;font-size:14px;text-decoration:none;letter-spacing:0.02em;">
            Sign in to Aiprosol &rarr;
          </a>
          <p style="color:#9CA3B5;font-size:12px;line-height:1.6;margin:24px 0 0;">
            Button not working? Paste this URL into your browser:<br>
            <a href="${input.link}" style="color:#8B5CF6;word-break:break-all;">${input.link}</a>
          </p>
        </td></tr>
        <tr><td style="padding:24px 36px 32px;border-top:1px solid #2A1F3D;">
          <p style="color:#9CA3B5;font-size:12px;line-height:1.6;margin:0;">
            If you didn't request this, ignore the email — no account is created until you click the link.
          </p>
          <p style="color:#9CA3B5;font-size:11px;line-height:1.6;margin:12px 0 0;">
            &mdash; Arora, AI CEO at <a href="${input.siteUrl}" style="color:#8B5CF6;">Aiprosol</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
