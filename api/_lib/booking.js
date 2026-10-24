// Shared booking logic for the Vercel function (api/book-call.js) and the local server (server.js).
// Files under api/_lib are not exposed as routes by Vercel.

export const PROFILES = ["Global brand", "Founder / new product", "Investor / partner", "Other"];
export const TIMELINES = ["Within 30 days", "1-3 months", "3-6 months", "Just exploring"];
const MIN_FILL_MS = 3000;

function clean(value, maxLength) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

// Returns { booking } for a valid request, { spam: true } for bot submissions, or { status, message } for invalid input.
export function parseBooking(body = {}) {
  // Honeypot: real visitors never see or fill the "website" field.
  if (clean(body.website, 200)) return { spam: true };
  // Bots submit instantly; people take at least a few seconds to fill the form.
  const startedAt = Number(body.startedAt);
  if (Number.isFinite(startedAt) && startedAt > 0 && Date.now() - startedAt < MIN_FILL_MS) return { spam: true };

  const booking = {
    fullName: clean(body.fullName, 100),
    email: clean(body.email, 160).toLowerCase(),
    company: clean(body.company, 160),
    profile: clean(body.profile, 80),
    timeline: clean(body.timeline, 80),
    message: clean(body.message, 1000),
  };
  if (!booking.fullName || !booking.company || !booking.email || !booking.profile || !booking.timeline) {
    return { status: 400, message: "Please complete all required fields." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(booking.email)) return { status: 400, message: "Please enter a valid business email." };
  if (!PROFILES.includes(booking.profile)) return { status: 400, message: "Please choose a valid profile." };
  if (!TIMELINES.includes(booking.timeline)) return { status: 400, message: "Please choose a valid timeline." };
  return { booking };
}

export function mailConfig(env = process.env) {
  const provider = env.RESEND_API_KEY ? "resend" : env.SENDGRID_API_KEY ? "sendgrid" : null;
  return {
    provider,
    from: env.MAIL_FROM || env.SENDGRID_FROM_EMAIL || "",
    fromName: env.MAIL_FROM_NAME || "Incubr website",
    to: (env.CONTACT_TO_EMAIL || "products@incubr.com").split(",").map((email) => email.trim()).filter(Boolean),
    confirm: env.SEND_CONFIRMATION_EMAIL !== "false",
    keys: { resend: env.RESEND_API_KEY, sendgrid: env.SENDGRID_API_KEY },
  };
}

function row(label, value) {
  return `<tr><td style="padding:10px 14px;border-bottom:1px solid #eee3d8;color:#5c6678;font:600 12px/1.4 Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase;white-space:nowrap;vertical-align:top">${label}</td><td style="padding:10px 14px;border-bottom:1px solid #eee3d8;color:#13243b;font:15px/1.5 Arial,sans-serif">${value}</td></tr>`;
}

function layout(title, inner) {
  return `<!doctype html><html><body style="margin:0;padding:24px;background:#f7f5ef"><div style="max-width:600px;margin:0 auto;background:#fffdfa;border:1px solid #eee3d8;border-radius:12px;overflow:hidden">
<div style="padding:22px 26px;background:#13243b;color:#fff;font:600 18px/1.3 Georgia,serif">${title}</div>
<div style="padding:22px 26px">${inner}</div>
<div style="padding:14px 26px;border-top:1px solid #eee3d8;color:#8c96a5;font:12px/1.5 Arial,sans-serif">Incubr Tech · Sprint incubation and India market entry</div></div></body></html>`;
}

export function teamEmail(booking, meta = {}) {
  const e = Object.fromEntries(Object.entries(booking).map(([key, value]) => [key, escapeHtml(value)]));
  const message = e.message ? e.message.replace(/\n/g, "<br>") : "<span style=\"color:#8c96a5\">Not provided</span>";
  const html = layout("New India Readiness Call request", `<table style="width:100%;border-collapse:collapse">
${row("Name", e.fullName)}${row("Email", `<a href="mailto:${e.email}" style="color:#c55420">${e.email}</a>`)}${row("Company", e.company)}${row("Profile", e.profile)}${row("Timeline", e.timeline)}${row("Message", message)}
</table><p style="margin:18px 0 0;color:#5c6678;font:13px/1.5 Arial,sans-serif">Reply to this email to answer ${e.fullName} directly.${meta.page ? ` Sent from ${escapeHtml(meta.page)}.` : ""}</p>`);
  const text = ["New India Readiness Call request", "", `Name: ${booking.fullName}`, `Email: ${booking.email}`, `Company: ${booking.company}`, `Profile: ${booking.profile}`, `Timeline: ${booking.timeline}`, `Message: ${booking.message || "Not provided"}`].join("\n");
  return { subject: `India Readiness Call: ${booking.company} (${booking.fullName})`.replace(/\s+/g, " "), html, text };
}

export function confirmationEmail(booking) {
  const name = escapeHtml(booking.fullName.split(" ")[0]);
  const html = layout("We've received your request", `<p style="margin:0 0 14px;color:#13243b;font:15px/1.6 Arial,sans-serif">Hi ${name},</p>
<p style="margin:0 0 14px;color:#13243b;font:15px/1.6 Arial,sans-serif">Thanks for booking an India Readiness Call with Incubr. We've received your details and will be in touch shortly to schedule a time.</p>
<p style="margin:0 0 14px;color:#13243b;font:15px/1.6 Arial,sans-serif">If there's anything you'd like us to know before the call, just reply to this email.</p>
<p style="margin:0;color:#13243b;font:15px/1.6 Arial,sans-serif">The Incubr team</p>`);
  const text = `Hi ${booking.fullName.split(" ")[0]},\n\nThanks for booking an India Readiness Call with Incubr. We've received your details and will be in touch shortly to schedule a time.\n\nIf there's anything you'd like us to know before the call, just reply to this email.\n\nThe Incubr team`;
  return { subject: "We've received your India Readiness Call request", html, text };
}

async function send(config, { to, replyTo, subject, html, text }) {
  if (config.provider === "resend") {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${config.keys.resend}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: `${config.fromName} <${config.from}>`, to, reply_to: replyTo, subject, html, text }),
    });
    if (!response.ok) throw new Error(`Resend ${response.status}: ${(await response.text()).slice(0, 400)}`);
    return;
  }
  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: { Authorization: `Bearer ${config.keys.sendgrid}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      personalizations: [{ to: to.map((email) => ({ email })) }],
      from: { email: config.from, name: config.fromName },
      reply_to: replyTo,
      subject,
      content: [{ type: "text/plain", value: text }, { type: "text/html", value: html }],
    }),
  });
  if (!response.ok) throw new Error(`SendGrid ${response.status}: ${(await response.text()).slice(0, 400)}`);
}

// Sends the request to the team, then (optionally) a confirmation to the visitor.
// Only the team email must succeed; a failed confirmation is logged, not shown to the visitor.
export async function deliverBooking(booking, config = mailConfig(), meta = {}) {
  const team = teamEmail(booking, meta);
  const teamReplyTo = config.provider === "resend" ? booking.email : { email: booking.email, name: booking.fullName };
  await send(config, { to: config.to, replyTo: teamReplyTo, ...team });
  if (!config.confirm) return;
  try {
    const visitorReplyTo = config.provider === "resend" ? config.to[0] : { email: config.to[0] };
    await send(config, { to: [booking.email], replyTo: visitorReplyTo, ...confirmationEmail(booking) });
  } catch (error) {
    console.error("Confirmation email failed:", error.message);
  }
}

// One handler for both runtimes. Returns [status, payload].
export async function handleBooking(body, meta = {}, env = process.env) {
  const parsed = parseBooking(body);
  if (parsed.spam) return [201, { ok: true }];
  if (!parsed.booking) return [parsed.status, { message: parsed.message }];
  const config = mailConfig(env);
  if (!config.provider || !config.from) {
    console.error("Email is not configured: set RESEND_API_KEY (or SENDGRID_API_KEY) and MAIL_FROM.");
    return [503, { message: "Our booking form is being set up. Please email products@incubr.com in the meantime." }];
  }
  try {
    await deliverBooking(parsed.booking, config, meta);
    return [201, { ok: true }];
  } catch (error) {
    console.error("Booking email failed:", error.message);
    return [502, { message: "We couldn't send your request just now. Please try again, or email products@incubr.com." }];
  }
}

// Safe status for checking the setup: never reveals keys or addresses.
export function setupStatus(env = process.env) {
  const config = mailConfig(env);
  return { emailProvider: config.provider || "not set", senderSet: Boolean(config.from), recipients: config.to.length, confirmationEmail: config.confirm, ready: Boolean(config.provider && config.from) };
}
