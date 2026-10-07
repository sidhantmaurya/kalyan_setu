export interface ContactNotificationPayload {
  id: string | number;
  fullName: string;
  email: string;
  phone: string | null;
  reason: string;
  message: string;
  isSignedIn: boolean;
  profileEmail?: string | null;
  createdAt: Date | string;
}

export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function formatIstTimestamp(dateInput: Date | string): string {
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  return (
    d.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'short',
    }) + ' IST'
  );
}

export function buildContactEmailHtml(payload: ContactNotificationPayload, siteUrl: string): string {
  const safeName = escapeHtml(payload.fullName);
  const safeEmail = escapeHtml(payload.email);
  const safePhone = payload.phone ? escapeHtml(payload.phone) : 'Not provided';
  const safeReason = escapeHtml(payload.reason);
  const safeMessage = escapeHtml(payload.message).replace(/\n/g, '<br/>');
  const signedInStatus = payload.isSignedIn
    ? `Yes (${escapeHtml(payload.profileEmail || payload.email)})`
    : 'No (guest)';
  const receivedIst = escapeHtml(formatIstTimestamp(payload.createdAt));
  const adminUrl = `${siteUrl.replace(/\/$/, '')}/admin/messages?id=${encodeURIComponent(String(payload.id))}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>New ${safeReason} message from ${safeName} — KalyanSetu</title>
</head>
<body style="margin:0;padding:24px;background-color:#F5EFE0;font-family:'Lato',Arial,sans-serif;color:#3D3520;">
  <div style="max-width:620px;margin:0 auto;background-color:#FFFFFF;border:2px solid #C9A227;border-radius:10px;overflow:hidden;">
    <div style="background-color:#1A2A4A;padding:24px 28px;border-bottom:3px solid #C9A227;">
      <p style="margin:0;font-size:11px;letter-spacing:2.5px;text-transform:uppercase;color:#C9A227;">KalyanSetu · Serving Nourishment, Building Connection</p>
      <h1 style="margin:8px 0 0;font-family:Georgia,serif;font-size:24px;color:#FFFFFF;">New message received</h1>
    </div>
    <div style="padding:28px;">
      <table style="width:100%;border-collapse:collapse;font-size:15px;">
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #EDE4CC;font-weight:bold;color:#1A2A4A;width:140px;">Name</td>
          <td style="padding:10px 12px;border-bottom:1px solid #EDE4CC;">${safeName}</td>
        </tr>
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #EDE4CC;font-weight:bold;color:#1A2A4A;">Email</td>
          <td style="padding:10px 12px;border-bottom:1px solid #EDE4CC;"><a href="mailto:${safeEmail}" style="color:#1A2A4A;text-decoration:underline;">${safeEmail}</a></td>
        </tr>
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #EDE4CC;font-weight:bold;color:#1A2A4A;">Phone</td>
          <td style="padding:10px 12px;border-bottom:1px solid #EDE4CC;">${safePhone}</td>
        </tr>
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #EDE4CC;font-weight:bold;color:#1A2A4A;">Reason</td>
          <td style="padding:10px 12px;border-bottom:1px solid #EDE4CC;">${safeReason}</td>
        </tr>
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #EDE4CC;font-weight:bold;color:#1A2A4A;">Signed in?</td>
          <td style="padding:10px 12px;border-bottom:1px solid #EDE4CC;">${signedInStatus}</td>
        </tr>
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #EDE4CC;font-weight:bold;color:#1A2A4A;">Received</td>
          <td style="padding:10px 12px;border-bottom:1px solid #EDE4CC;">${receivedIst}</td>
        </tr>
        <tr>
          <td style="padding:12px;font-weight:bold;color:#1A2A4A;vertical-align:top;">Message</td>
          <td style="padding:12px;line-height:1.7;background-color:#F5EFE0;border-radius:6px;">${safeMessage}</td>
        </tr>
      </table>
      <div style="margin-top:28px;text-align:center;">
        <a href="${adminUrl}" style="display:inline-block;background-color:#C9A227;color:#FFFFFF;font-weight:bold;text-decoration:none;padding:14px 32px;border-radius:4px;font-size:15px;">Open in Admin Panel</a>
      </div>
    </div>
    <div style="background-color:#EDE4CC;padding:16px 28px;text-align:center;font-size:13px;color:#7A6A50;">
      Reply directly to this email to respond to ${safeName} (${safeEmail}).
    </div>
  </div>
</body>
</html>`;
}

export function buildContactEmailText(payload: ContactNotificationPayload, siteUrl: string): string {
  const receivedIst = formatIstTimestamp(payload.createdAt);
  const adminUrl = `${siteUrl.replace(/\/$/, '')}/admin/messages?id=${encodeURIComponent(String(payload.id))}`;
  return [
    `New message received — KalyanSetu`,
    `----------------------------------------`,
    `Name:       ${payload.fullName}`,
    `Email:      ${payload.email}`,
    `Phone:      ${payload.phone || 'Not provided'}`,
    `Reason:     ${payload.reason}`,
    `Signed in?: ${payload.isSignedIn ? `Yes (${payload.profileEmail || payload.email})` : 'No (guest)'}`,
    `Received:   ${receivedIst}`,
    ``,
    `Message:`,
    payload.message,
    ``,
    `Open in Admin Panel: ${adminUrl}`,
  ].join('\n');
}

export async function sendAdminContactNotification(
  payload: ContactNotificationPayload
): Promise<{ success: boolean; error?: string; htmlPreview: string }> {
  const siteUrl = process.env.SITE_URL || process.env.APP_URL || 'https://kalyansetu.in';
  const html = buildContactEmailHtml(payload, siteUrl);
  const text = buildContactEmailText(payload, siteUrl);
  const resendApiKey = process.env.RESEND_API_KEY;
  const notifyEmails = (process.env.ADMIN_NOTIFY_EMAILS || 'divyansh@kalyansetu.in,hello@kalyansetu.in')
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean);
  const fromEmail = process.env.NOTIFY_FROM_EMAIL || 'KalyanSetu Website <notifications@kalyansetu.in>';
  const subject = `New ${payload.reason} message from ${payload.fullName} — KalyanSetu`;

  if (resendApiKey && resendApiKey.trim().length > 0 && resendApiKey !== 'MY_RESEND_API_KEY') {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey.trim()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromEmail.includes('<') ? fromEmail : `KalyanSetu Website <${fromEmail}>`,
          to: notifyEmails,
          reply_to: payload.email,
          subject,
          html,
          text,
        }),
      });

      if (!response.ok) {
        const errBody = await response.text();
        return {
          success: false,
          error: `Resend API error (${response.status}): ${errBody.slice(0, 200)}`,
          htmlPreview: html,
        };
      }

      if (process.env.SEND_AUTOREPLY === 'true') {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendApiKey.trim()}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: fromEmail.includes('<') ? fromEmail : `KalyanSetu <${fromEmail}>`,
            to: [payload.email],
            subject: `Thank you for reaching out to KalyanSetu`,
            text: `Namaste ${payload.fullName},\n\nThank you for contacting KalyanSetu regarding "${payload.reason}". Divyansh Rai reads every message personally and will reply within 48 hours.\n\nWarm regards,\nKalyanSetu — Serving Nourishment, Building Connection`,
          }),
        }).catch(() => {});
      }

      return { success: true, htmlPreview: html };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Failed to dispatch email via Resend',
        htmlPreview: html,
      };
    }
  }

  return {
    success: true,
    htmlPreview: html,
  };
}
