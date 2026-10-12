import { createServer } from "node:http";
import { existsSync, mkdirSync, readFile } from "node:fs";
import { appendFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));
const port = Number(process.env.PORT || 8787);
const dataDir = join(root, "data");
const bookingsFile = join(dataDir, "bookings.jsonl");
const distDir = join(root, "dist");
const allowedProfiles = new Set(["Global brand", "Founder / new product", "Investor / partner", "Other"]);

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
      if (body.length > 1024 * 1024) {
        reject(new Error("Request is too large."));
        request.destroy();
      }
    });
    request.on("end", () => resolve(body));
    request.on("error", reject);
  });
}

function clean(value, maxLength) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

async function handleBooking(request, response) {
  try {
    const body = JSON.parse(await readBody(request));
    const booking = {
      fullName: clean(body.fullName, 100),
      email: clean(body.email, 160).toLowerCase(),
      company: clean(body.company, 160),
      profile: clean(body.profile, 80),
      message: clean(body.message, 300),
    };
    if (!booking.fullName || !booking.company || !booking.email || !booking.profile) {
      return sendJson(response, 400, { message: "Please complete all required fields." });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(booking.email)) {
      return sendJson(response, 400, { message: "Please enter a valid business email." });
    }
    if (!allowedProfiles.has(booking.profile)) {
      return sendJson(response, 400, { message: "Please choose a valid profile." });
    }
    await appendFile(bookingsFile, `${JSON.stringify({ ...booking, createdAt: new Date().toISOString() })}\n`, "utf8");
    return sendJson(response, 201, { ok: true });
  } catch (error) {
    return sendJson(response, 400, { message: error.message === "Unexpected end of JSON input" ? "Invalid request." : "We could not save your request." });
  }
}

function serveStatic(request, response) {
  if (!existsSync(join(distDir, "index.html"))) return sendJson(response, 503, { message: "Run npm run build before starting the production server." });
  const requestedPath = request.url === "/" ? "/index.html" : request.url.split("?")[0];
  const safePath = normalize(join(distDir, requestedPath));
  const filePath = safePath.startsWith(distDir) && existsSync(safePath) ? safePath : join(distDir, "index.html");
  const types = { ".css": "text/css", ".js": "text/javascript", ".jpg": "image/jpeg", ".png": "image/png", ".svg": "image/svg+xml", ".html": "text/html" };
  readFile(filePath, (error, content) => {
    if (error) return sendJson(response, 404, { message: "Not found." });
    response.writeHead(200, { "Content-Type": `${types[extname(filePath)] || "application/octet-stream"}; charset=utf-8` });
    response.end(content);
  });
}

createServer(async (request, response) => {
  if (request.method === "POST" && request.url === "/api/book-call") return handleBooking(request, response);
  if (request.method === "GET") return serveStatic(request, response);
  return sendJson(response, 405, { message: "Method not allowed." });
}).listen(port, () => console.log(`Incubr server running at http://localhost:${port}`));
