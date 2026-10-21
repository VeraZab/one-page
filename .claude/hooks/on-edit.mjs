#!/usr/bin/env node
// Claude Code PostToolUse hook. Fires after Claude writes/edits a file.
// No API key, no SDK — Claude (already running) does the SEO rewrite itself when
// nudged; the CV regen is a plain deterministic build.
//
//   • Edited a blog post  -> if its SEO is stale/missing, ask Claude (via stderr
//     + exit 2) to refresh the frontmatter `description` + `keywords`.
//   • Edited cv/content.json -> regenerate the CV PDF.
//
// Fails open: any error exits 0 so it never disrupts the session.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { relative, join } from "node:path";
import matter from "gray-matter";

const ROOT = process.cwd();

async function readStdin() {
  let data = "";
  for await (const chunk of process.stdin) data += chunk;
  return data || "{}";
}

try {
  const input = JSON.parse(await readStdin());
  const abs = input?.tool_input?.file_path;
  if (!abs) process.exit(0);
  const rel = relative(ROOT, abs);

  // --- CV source changed: rebuild the PDF ---
  if (rel === "cv/content.json") {
    execFileSync("node", [".claude/hooks/build-cv.mjs"], { stdio: "inherit" });
    process.exit(0);
  }

  // --- Blog post changed: nudge Claude to refresh its SEO ---
  if (/^content\/posts\/.+\.mdx$/.test(rel)) {
    const { data, content } = matter(readFileSync(abs, "utf8"));
    const hash = createHash("sha256").update(content).digest("hex");

    const cacheDir = join(ROOT, ".claude", ".seo-cache");
    const cacheFile = join(cacheDir, rel.replace(/[/\\]/g, "__") + ".sha");
    const stored = existsSync(cacheFile) ? readFileSync(cacheFile, "utf8").trim() : "";

    const hasSeo =
      typeof data.description === "string" &&
      data.description.length > 0 &&
      Array.isArray(data.keywords) &&
      data.keywords.length > 0;

    // Up to date and present → nothing to do (prevents loops).
    if (hash === stored && hasSeo) process.exit(0);

    // Record the body hash now so re-running after the frontmatter edit is quiet.
    mkdirSync(cacheDir, { recursive: true });
    writeFileSync(cacheFile, hash);

    process.stderr.write(
      `SEO: ${rel} changed — refresh its frontmatter for search engines and AI agents.\n` +
        `Set two fields (edit frontmatter only; leave "excerpt" untouched):\n` +
        `  description: an optimized meta description, 120–160 chars, specific and ` +
        `front-loaded with the real topic/terms. No clickbait, no "in this post".\n` +
        `  keywords: 6–10 concrete terms or phrases a person or an AI agent would ` +
        `search to find this post.\n`,
    );
    process.exit(2);
  }

  process.exit(0);
} catch {
  process.exit(0);
}
