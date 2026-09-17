#!/usr/bin/env node
// Downloads each episode's coverImage to src/img/episodes/ and rewrites
// the front matter to point at the local copy instead of the remote URL.
//
// Usage:
//   node scripts/migrate-images.mjs          (does the migration)
//   node scripts/migrate-images.mjs --dry-run (shows what it would do, no writes)

import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

const EPISODES_DIR = path.join(process.cwd(), "src/episodes");
const IMAGES_DIR = path.join(process.cwd(), "src/img/episodes");
const DRY_RUN = process.argv.includes("--dry-run");

function extensionFromUrl(url) {
  const pathname = new URL(url).pathname;
  const ext = path.extname(pathname).toLowerCase();
  // Blogger URLs sometimes end in a size segment with no extension;
  // default to .jpg (true for the vast majority of these covers).
  return [".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext) ? ext : ".jpg";
}

async function downloadImage(url, destPath) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} fetching ${url}`);
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  await fs.writeFile(destPath, buffer);
  return buffer.length;
}

async function main() {
  await fs.mkdir(IMAGES_DIR, { recursive: true });

  const files = (await fs.readdir(EPISODES_DIR)).filter((f) => f.endsWith(".md"));
  let migrated = 0;
  let skipped = 0;
  let failed = 0;

  for (const file of files) {
    const filePath = path.join(EPISODES_DIR, file);
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = matter(raw);
    const cover = parsed.data.coverImage;
    const slug = path.basename(file, ".md");

    if (!cover || !cover.startsWith("http")) {
      console.log(`skip  ${slug} (no remote coverImage)`);
      skipped++;
      continue;
    }

    const ext = extensionFromUrl(cover);
    const localFile = `${slug}${ext}`;
    const localPath = path.join(IMAGES_DIR, localFile);
    const localRef = `/img/episodes/${localFile}`;

    if (DRY_RUN) {
      console.log(`would download ${slug}: ${cover} -> ${localRef}`);
      continue;
    }

    try {
      const bytes = await downloadImage(cover, localPath);
      parsed.data.coverImage = localRef;
      // Keep dates as plain YYYY-MM-DD instead of gray-matter's default
      // full ISO timestamp, to match the rest of the front matter style.
      if (parsed.data.date instanceof Date) {
        parsed.data.date = parsed.data.date.toISOString().slice(0, 10);
      }
      const rebuilt = matter.stringify(parsed.content, parsed.data);
      await fs.writeFile(filePath, rebuilt, "utf8");
      console.log(`done  ${slug} (${(bytes / 1024).toFixed(0)} KB) -> ${localRef}`);
      migrated++;
    } catch (err) {
      console.error(`FAIL  ${slug}: ${err.message}`);
      failed++;
    }
  }

  console.log(
    `\n${migrated} migrated, ${skipped} skipped, ${failed} failed` +
      (DRY_RUN ? " (dry run, nothing written)" : "")
  );
}

main();
