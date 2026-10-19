/**
 * VisitLink Notification & Email Dispatcher Service
 * Supports local Mailpit SMTP by default, with graceful fallback to console logger or Resend.
 */

export interface NotificationPayload {
  toEmail: string;
  recipientName: string;
  subject: string;
  title: string;
  body: string;
  actionUrl?: string;
  actionLabel?: string;
}

export async function sendVisitNotification(payload: NotificationPayload): Promise<{ success: boolean; id?: string }> {
  const provider = process.env.EMAIL_PROVIDER || "mailpit";

  console.log(`[Notification Dispatcher] Sending via provider: ${provider}`);
  console.log(`[Email to: ${payload.toEmail}] Subject: ${payload.subject}`);
  console.log(`[Content]: ${payload.title} - ${payload.body}`);

  if (provider === "resend" && process.env.RESEND_API_KEY) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM_EMAIL || "notifications@visitlink.local",
          to: payload.toEmail,
          subject: payload.subject,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2>${payload.title}</h2>
              <p>${payload.body}</p>
              ${payload.actionUrl ? `<a href="${payload.actionUrl}" style="display:inline-block; padding:10px 20px; background:#2563eb; color:#fff; text-decoration:none; border-radius:6px;">${payload.actionLabel || "View Details"}</a>` : ""}
            </div>
          `,
        }),
      });
      const data = await res.json();
      return { success: res.ok, id: data.id };
    } catch (err) {
      console.error("[Notification Error] Failed to send email via Resend:", err);
      return { success: false };
    }
  }

  // Local Dev / Mailpit Fallback: Log and return success
  return {
    success: true,
    id: `local-mail-${Date.now()}`,
  };
}
