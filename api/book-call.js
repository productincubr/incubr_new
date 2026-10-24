import { handleBooking, setupStatus } from "./_lib/booking.js";

// Vercel serverless function: POST sends a booking, GET reports whether email is set up.
export default async function handler(request, response) {
  if (request.method === "GET") return response.status(200).json(setupStatus());
  if (request.method !== "POST") {
    response.setHeader("Allow", "GET, POST");
    return response.status(405).json({ message: "Method not allowed." });
  }
  let body = request.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = {}; } }
  const [status, payload] = await handleBooking(body || {}, { page: request.headers.referer });
  return response.status(status).json(payload);
}
