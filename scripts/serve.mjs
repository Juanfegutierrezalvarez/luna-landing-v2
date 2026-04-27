import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { access } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = dirnameSafe(fileURLToPath(import.meta.url), 2);
const requestedDir = process.argv[2] || ".";
const publicDir = resolve(rootDir, requestedDir);
const port = Number(process.env.PORT || 4173);
const host = process.env.HOST || "127.0.0.1";

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
};

function dirnameSafe(filePath, levels) {
  let current = filePath;
  for (let index = 0; index < levels; index += 1) {
    current = dirnameOf(current);
  }
  return current;
}

function dirnameOf(filePath) {
  const parts = filePath.split("/");
  parts.pop();
  return parts.join("/") || "/";
}

async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

createServer(async (request, response) => {
  const url = new URL(request.url || "/", `http://localhost:${port}`);
  const safePath = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, "");
  let filePath = join(publicDir, safePath);

  if (url.pathname.endsWith("/")) {
    filePath = join(filePath, "index.html");
  }

  if (!(await fileExists(filePath))) {
    filePath = join(publicDir, "index.html");
  }

  const type = types[extname(filePath)] || "application/octet-stream";
  response.writeHead(200, { "Content-Type": type });
  createReadStream(filePath).pipe(response);
}).listen(port, host, () => {
  console.log(`Local: http://${host}:${port}`);
});
