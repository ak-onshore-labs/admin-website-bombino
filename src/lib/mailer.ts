// Node-runtime only. SMTP via nodemailer, with a console fallback when SMTP
// env vars are not set (so the OTP flow works in dev without a mail server).
import nodemailer from "nodemailer";

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  SMTP_FROM,
} = process.env;

export const smtpConfigured = Boolean(SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS);

function getTransport() {
  const port = Number(SMTP_PORT);
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465, // true for 465, false for 587/25 (STARTTLS)
    // Gmail app passwords are displayed with spaces that aren't part of the secret.
    auth: { user: SMTP_USER, pass: (SMTP_PASS ?? "").replace(/\s+/g, "") },
  });
}

export async function sendMail(to: string, subject: string, html: string, text: string) {
  if (!smtpConfigured) {
    // Dev fallback — surface the message in the server console.
    console.log("\n──────── EMAIL (SMTP not configured) ────────");
    console.log("To:     ", to);
    console.log("Subject:", subject);
    console.log("Body:\n", text);
    console.log("─────────────────────────────────────────────\n");
    return;
  }

  const transport = getTransport();
  const from = SMTP_FROM || `Bombino Admin <${SMTP_USER}>`;
  await transport.sendMail({ from, to, subject, html, text });
}

export function otpEmail(otp: string, minutes: number) {
  const subject = "Your Bombino Admin password reset code";
  const text =
    `Your password reset code is ${otp}.\n` +
    `It expires in ${minutes} minutes.\n\n` +
    `If you didn't request this, you can ignore this email.`;
  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:440px;margin:0 auto;padding:24px">
      <div style="text-align:center;margin-bottom:20px">
        <span style="display:inline-block;width:40px;height:40px;line-height:40px;border-radius:10px;background:#076292;color:#fff;font-weight:800;font-size:18px">B</span>
      </div>
      <h2 style="color:#0f172a;font-size:18px;margin:0 0 8px">Password reset code</h2>
      <p style="color:#475569;font-size:14px;line-height:1.6;margin:0 0 20px">
        Use the code below to reset your Bombino Admin password. It expires in ${minutes} minutes.
      </p>
      <div style="background:#f1f5f9;border:1px solid #e2e8f0;border-radius:12px;text-align:center;padding:18px;margin-bottom:20px">
        <span style="font-size:30px;font-weight:800;letter-spacing:8px;color:#076292">${otp}</span>
      </div>
      <p style="color:#94a3b8;font-size:12px;line-height:1.6;margin:0">
        If you didn't request this, you can safely ignore this email.
      </p>
    </div>`;
  return { subject, text, html };
}
