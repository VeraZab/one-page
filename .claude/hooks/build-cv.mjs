#!/usr/bin/env node
// Generate the CV PDF from its editable source (cv/content.json).
//   node .claude/hooks/build-cv.mjs
// Renders a styled HTML (cv/cv.html) and prints it to PDF with your installed
// Chrome — no extra dependencies, no gstack. Edit cv/content.json and rerun.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const SRC = join(ROOT, "cv", "content.json");
const HTML = join(ROOT, "cv", "cv.html");
const PDF = join(ROOT, "public", "VERA_ZABEIDA_Senior_Full_Stack_Engineer.pdf");

const cv = JSON.parse(readFileSync(SRC, "utf8"));
const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const experience = cv.experience
  .map(
    (job) => `
    <div class="entry">
      <div class="entry-head">
        <span class="company">${esc(job.company)}</span>${
          job.site ? ` <span class="sep">•</span> <span class="site">${esc(job.site)}</span>` : ""
        }
      </div>
      <div class="entry-sub">
        <span class="role">${esc(job.role)}</span>
        <span class="dates">${esc(job.dates)}</span>
      </div>
      <ul>${job.bullets.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>
    </div>`,
  )
  .join("");

const skills = cv.skills
  .map(
    (s) => `<div class="skill"><div class="skill-group">${esc(s.group)}</div><div class="skill-items">${esc(s.items)}</div></div>`,
  )
  .join("");

const education = cv.education
  .map(
    (e) => `<div class="edu"><div class="degree">${esc(e.degree)}</div><div class="school">${esc(e.school)}</div></div>`,
  )
  .join("");

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>${esc(cv.name)} — CV</title>
<style>
  :root { --ink: #1f3a5c; --muted: #5b6b7f; --rule: #1f3a5c; --text: #222; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  @page { size: letter; margin: 0; }
  html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body {
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    color: var(--text); font-size: 10.5px; line-height: 1.5;
    padding: 0.5in 0.55in;
  }
  .name { font-size: 27px; font-weight: 800; letter-spacing: 0.5px; color: var(--ink); text-transform: uppercase; }
  .headline { font-style: italic; color: var(--muted); font-size: 12px; margin-top: 2px; }
  .contact { font-size: 9.5px; color: var(--text); margin-top: 7px; }
  .contact .sep { color: #9aa7b5; margin: 0 6px; }
  .rule { border-bottom: 1.5px solid var(--rule); margin: 8px 0 12px; }
  .summary { font-size: 10.5px; margin-bottom: 14px; }
  .cols { display: grid; grid-template-columns: 1.9fr 1fr; gap: 26px; }
  h2 { font-size: 11px; font-weight: 700; letter-spacing: 1.5px; color: var(--ink);
       text-transform: uppercase; border-bottom: 1px solid var(--rule); padding-bottom: 3px; margin-bottom: 10px; }
  .right h2:not(:first-child) { margin-top: 18px; }
  .entry { margin-bottom: 13px; }
  .entry-head { color: var(--ink); }
  .company { font-weight: 700; }
  .entry-head .sep { color: #9aa7b5; }
  .site { color: var(--muted); font-style: italic; font-size: 9.5px; }
  .entry-sub { display: flex; justify-content: space-between; align-items: baseline; margin: 1px 0 5px; }
  .role { font-style: italic; }
  .dates { color: var(--muted); font-size: 9.5px; white-space: nowrap; padding-left: 10px; }
  ul { list-style: disc; padding-left: 15px; }
  li { margin-bottom: 3px; }
  .skill { margin-bottom: 9px; }
  .skill-group { font-weight: 700; color: var(--ink); }
  .edu { margin-bottom: 9px; }
  .degree { font-weight: 700; color: var(--ink); }
  .school { font-style: italic; color: var(--muted); }
</style></head>
<body>
  <div class="name">${esc(cv.name)}</div>
  <div class="headline">${esc(cv.title)}</div>
  <div class="contact">${cv.contact.map(esc).join(' <span class="sep">•</span> ')}</div>
  <div class="rule"></div>
  <p class="summary">${esc(cv.summary)}</p>
  <div class="cols">
    <div class="left">
      <h2>Experience</h2>
      ${experience}
    </div>
    <div class="right">
      <h2>Skills</h2>
      ${skills}
      <h2>Education</h2>
      ${education}
    </div>
  </div>
</body></html>`;

writeFileSync(HTML, html);
console.log("Wrote cv/cv.html");

// Print to PDF with the system Chrome (no extra deps).
const chromes = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "google-chrome",
  "chromium",
];
const chrome = chromes.find((c) => c.includes("/") && existsSync(c)) || "google-chrome";

try {
  execFileSync(
    chrome,
    [
      "--headless=new",
      "--disable-gpu",
      "--no-pdf-header-footer",
      `--print-to-pdf=${PDF}`,
      `file://${HTML}`,
    ],
    { stdio: "ignore" },
  );
  console.log(`Wrote ${PDF.replace(ROOT + "/", "")}`);
} catch (err) {
  console.error(
    `\nCould not run Chrome to make the PDF (${err.message}).\n` +
      `cv/cv.html is ready — open it and print to PDF, or install Chrome.`,
  );
  process.exit(0);
}
