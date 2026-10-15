const allowedProfiles = new Set(["Global brand", "Founder / new product", "Investor / partner", "Other"]);
const allowedTimelines = new Set(["Within 30 days", "1-3 months", "3-6 months", "Just exploring"]);

function clean(value, maxLength) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function json(response, status, payload) {
  return response.status(status).json(payload);
}

export default async function handler(request, response) {
  if (request.method !== "POST") return json(response, 405, { message: "Method not allowed." });

  const body = request.body || {};
  const booking = {
    fullName: clean(body.fullName, 100),
    email: clean(body.email, 160).toLowerCase(),
    company: clean(body.company, 160),
    profile: clean(body.profile, 80),
    timeline: clean(body.timeline, 80),
    message: clean(body.message, 300),
  };

  if (!booking.fullName || !booking.company || !booking.email || !booking.profile || !booking.timeline) {
    return json(response, 400, { message: "Please complete all required fields." });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(booking.email)) {
    return json(response, 400, { message: "Please enter a valid business email." });
  }
  if (!allowedProfiles.has(booking.profile)) return json(response, 400, { message: "Please choose a valid profile." });
  if (!allowedTimelines.has(booking.timeline)) return json(response, 400, { message: "Please choose a valid timeline." });
  if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_FROM_EMAIL) {
    return json(response, 500, { message: "Email service is not configured yet." });
  }

  const emailText = [
    "New Incubr India Readiness Call request",
    "",
    `Name: ${booking.fullName}`,
    `Email: ${booking.email}`,
    `Company: ${booking.company}`,
    `Profile: ${booking.profile}`,
    `Timeline: ${booking.timeline}`,
    `Message: ${booking.message || "Not provided"}`,
  ].join("\n");

  const emailResponse = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: "products@incubr.com" }] }],
      from: { email: process.env.SENDGRID_FROM_EMAIL, name: "Incubr website" },
      reply_to: { email: booking.email, name: booking.fullName },
      subject: `India Readiness Call: ${booking.company}`,
      content: [{ type: "text/plain", value: emailText }],
    }),
  });

  if (!emailResponse.ok) return json(response, 502, { message: "We could not send your request. Please try again shortly." });
  return json(response, 201, { ok: true });
}
