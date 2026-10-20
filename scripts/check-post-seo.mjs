#!/usr/bin/env node
// Pre-commit SEO gate for blog posts.
//
// Every post's <meta> tags, JSON-LD, sitemap entry, and /llms.txt line are
// generated from its frontmatter (see app/ and lib/). So the SEO is only as
// complete as the frontmatter — this checks the frontmatter before a post ships.
// Fast and mechanical: no network, no build.

import { readFileSync } from "node:fs";
import matter from "gray-matter";

const files = process.argv.slice(2);
let failed = false;

for (const file of files) {
  let data;
  try {
    data = matter(readFileSync(file, "utf8")).data;
  } catch (err) {
    console.error(`  ${file}: could not parse frontmatter (${err.message})`);
    failed = true;
    continue;
  }

  const problems = [];
  if (!data.title) problems.push("missing `title`");
  if (!data.date) problems.push("missing `date`");

  const excerpt = data.excerpt ?? "";
  if (!excerpt) problems.push("missing `excerpt` (used as the meta description + llms.txt line)");
  else if (excerpt.length < 50) problems.push(`excerpt is short (${excerpt.length} chars; aim for 50–160)`);
  else if (excerpt.length > 160) problems.push(`excerpt is long (${excerpt.length} chars; engines truncate ~160)`);

  if (!Array.isArray(data.keywords) || data.keywords.length === 0)
    problems.push("missing `keywords` (help AI + search match the post)");

  if (problems.length) {
    failed = true;
    console.error(`  ${file}:`);
    for (const p of problems) console.error(`    - ${p}`);
  }
}

if (failed) {
  console.error(
    "\nSEO check failed — fix the frontmatter above so the generated meta/JSON-LD/" +
      "sitemap/llms.txt are complete.\n(Use `git commit --no-verify` to skip in a pinch.)",
  );
  process.exit(1);
}
