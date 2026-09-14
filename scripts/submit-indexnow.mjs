import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sitemapPath = path.resolve(__dirname, "../public/sitemap.xml");

const HOST = process.env.INDEXNOW_HOST || "ip.ygjc.cc";
const KEY = process.env.INDEXNOW_KEY || "4a563d1939640309ca93d410ca082d71";

async function main() {
  if (!fs.existsSync(sitemapPath)) {
    console.error("sitemap.xml not found at:", sitemapPath);
    process.exit(1);
  }

  const content = fs.readFileSync(sitemapPath, "utf-8");
  const urls = [...content.matchAll(/<loc>(https?:\/\/[^<]+)<\/loc>/g)].map(
    (m) => m[1],
  );

  if (urls.length === 0) {
    console.log("No URLs found in sitemap.");
    return;
  }

  console.log(`Submitting ${urls.length} URLs to IndexNow for ${HOST}...`);

  const payload = {
    host: HOST,
    key: KEY,
    keyLocation: `https://${HOST}/${KEY}.txt`,
    urlList: urls,
  };

  try {
    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify(payload),
    });

    console.log(`IndexNow response status: ${res.status} ${res.statusText}`);
    if (res.ok || res.status === 200 || res.status === 202) {
      console.log("Successfully submitted to IndexNow!");
    } else {
      const text = await res.text();
      console.warn("IndexNow response body:", text);
    }
  } catch (err) {
    console.error("Failed to submit to IndexNow:", err);
  }
}

main();
