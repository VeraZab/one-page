import { getAllPosts } from "@/lib/posts";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/site";

// /llms.txt — a concise, machine-readable map of the site for AI agents.
// See https://llmstxt.org
export const dynamic = "force-static";

export function GET() {
  const posts = getAllPosts();
  const body = [
    `# ${SITE_NAME}`,
    "",
    `> ${SITE_DESCRIPTION}`,
    "",
    "## Writing",
    ...posts.map(
      (p) => `- [${p.title}](${SITE_URL}/blog/${p.slug}): ${p.excerpt}`,
    ),
    "",
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
