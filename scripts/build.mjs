import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const distDir = join(rootDir, "dist");

const filesToCopy = ["index.html", "styles.css", "app.js"];
const directoriesToCopy = ["assets"];

function publicConfig() {
  return [
    `window.LUNA_WEBHOOK_URL = ${JSON.stringify(process.env.LUNA_WEBHOOK_URL || "")};`,
    `window.WHATSAPP_PRIVATE_GROUP_URL = ${JSON.stringify(process.env.WHATSAPP_PRIVATE_GROUP_URL || "https://chat.whatsapp.com/F9la8u70v9CFr4yAGbIXDh")};`,
    "",
  ].join("\n");
}

await rm(distDir, { recursive: true, force: true });
await mkdir(distDir, { recursive: true });

for (const file of filesToCopy) {
  await cp(join(rootDir, file), join(distDir, file));
}

for (const directory of directoriesToCopy) {
  await cp(join(rootDir, directory), join(distDir, directory), { recursive: true });
}

const indexPath = join(distDir, "index.html");
const indexHtml = await readFile(indexPath, "utf8");
if (!indexHtml.includes("./config.js")) {
  throw new Error("index.html must load ./config.js before app.js");
}

await writeFile(join(distDir, "config.js"), publicConfig());

console.log("Build listo en dist/");
