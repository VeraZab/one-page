#!/usr/bin/env node
// Rewrite + correct a post's SEO for search engines and AI agents, with an LLM.
//
// For each post passed in, Claude writes an optimized `description` (meta
// description) and `keywords` into the frontmatter — the authored `excerpt`
// (shown on the site) is left untouched. Runs from the pre-commit hook and
// re-stages the file. Fails open: no ANTHROPIC_API_KEY, or any error, and it
// skips silently rather than blocking your commit.

import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import matter from "gray-matter";

const files = process.argv.slice(2).filter((f) => f.endsWith(".mdx"));
if (files.length === 0) process.exit(0);

if (!process.env.ANTHROPIC_API_KEY) {
  console.error("  SEO: ANTHROPIC_API_KEY not set — skipping LLM rewrite.");
  process.exit(0);
}

const { default: Anthropic } = await import("@anthropic-ai/sdk");
const client = new Anthropic();

const SYSTEM = `You optimize blog-post SEO for both search engines and AI agents.
Given a post's title and body, return STRICT JSON with two keys:
- "description": one meta description, 120-160 characters, natural and specific,
  front-loading the concrete topic and terms someone (or an AI) would search for.
  No clickbait, no "in this post", no trailing ellipsis.
- "keywords": 6-10 specific terms or phrases (strings) a person or an AI agent
  would actually search to find this post. Concrete over generic.
Return ONLY the JSON object, nothing else.`;

for (const file of files) {
  try {
    const raw = readFileSync(file, "utf8");
    const { data, content } = matter(raw);

    const res = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 400,
      system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
      messages: [
        {
          role: "user",
          content: `TITLE: ${data.title ?? ""}\n\nBODY:\n${content.slice(0, 6000)}`,
        },
      ],
    });

    const text = res.content.find((b) => b.type === "text")?.text ?? "";
    const json = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1));
    if (!json.description || !Array.isArray(json.keywords)) throw new Error("bad shape");

    data.description = json.description.trim();
    data.keywords = json.keywords;
    writeFileSync(file, matter.stringify(content, data));
    execFileSync("git", ["add", file]);
    console.log(`  SEO: rewrote description + keywords for ${file}`);
  } catch (err) {
    console.error(`  SEO: skipped ${file} (${err.message})`);
  }
}
