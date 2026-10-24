// Local / self-hosted server: serves the built site and the booking API.
// On Vercel the same API runs from api/book-call.js; both share api/_lib/booking.js.
import { createServer } from "node:http";
import { existsSync, mkdirSync, readFile } from "node:fs";
import { appendFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { handleBooking, parseBooking, setupStatus } from "./api/_lib/booking.js";

const root = fileURLToPath(new URL(".", import.meta.url));
const port = Number(process.env.PORT || 8787);
const dataDir = join(root, "data");
const bookingsFile = join(dataDir, "bookings.jsonl");
const distDir = join(root, "dist");
const types = { ".css": "text/css", ".js": "text/javascript", ".jpg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".svg": "image/svg+xml", ".html": "text/html", ".json": "application/json" };

if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });

function sendJson(response, status, payload) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 64 * 1024) {
        reject(new Error("Request is too large."));
        request.destroy();
      }
    });
    request.on("end", () => resolve(body));
    request.on("error", reject);
  });
}

async function bookCall(request, response) {
  let body;
  try { body = JSON.parse(await readBody(request)); } catch { return sendJson(response, 400, { message: "Invalid request." }); }
  // Keep a local copy of every valid request as a backup, whether or not the email goes out.
  const { booking } = parseBooking(body);
  if (booking) await appendFile(bookingsFile, `${JSON.stringify({ ...booking, createdAt: new Date().toISOString() })}\n`, "utf8").catch(() => {});
  const [status, payload] = await handleBooking(body, { page: request.headers.referer });
  return sendJson(response, status, payload);
}

function serveStatic(request, response) {
  if (!existsSync(join(distDir, "index.html"))) return sendJson(response, 503, { message: "Run npm run build before starting the production server." });
  const requestedPath = request.url === "/" ? "/index.html" : decodeURIComponent(request.url.split("?")[0]);
  const safePath = normalize(join(distDir, requestedPath));
  const filePath = safePath.startsWith(distDir) && existsSync(safePath) && extname(safePath) ? safePath : join(distDir, "index.html");
  readFile(filePath, (error, content) => {
    if (error) return sendJson(response, 404, { message: "Not found." });
    const type = types[extname(filePath)] || "application/octet-stream";
    response.writeHead(200, { "Content-Type": type.startsWith("text/") || type === "application/json" ? `${type}; charset=utf-8` : type });
    response.end(content);
  });
}

createServer(async (request, response) => {
  const path = request.url.split("?")[0];
  if (path === "/api/book-call" && request.method === "POST") return bookCall(request, response);
  if (path === "/api/book-call" && request.method === "GET") return sendJson(response, 200, setupStatus());
  if (request.method === "GET") return serveStatic(request, response);
  return sendJson(response, 405, { message: "Method not allowed." });
}).listen(port, () => {
  const status = setupStatus();
  console.log(`Incubr server running at http://localhost:${port}`);
  console.log(status.ready ? `Email ready via ${status.emailProvider}.` : "Email not set up yet: add RESEND_API_KEY (or SENDGRID_API_KEY) and MAIL_FROM to .env");
});
