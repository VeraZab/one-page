import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import gfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";

const postsDir = path.join(process.cwd(), "content/posts");

export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  // SEO meta description (LLM-optimized by the pre-commit hook); falls back to
  // excerpt when absent. Kept separate so the authored excerpt stays untouched.
  description: string;
  keywords: string[];
  // `draft: true` in frontmatter hides a post everywhere in production. Drafts
  // are only surfaced locally, via the dev-only toggle on the blog index.
  draft: boolean;
}

export interface Post extends PostMeta {
  contentHtml: string;
}

// Every post on disk, newest-first, including drafts. Internal — callers pick
// published vs. draft so drafts can never leak into production listings.
function readAllMetas(): PostMeta[] {
  const files = fs.readdirSync(postsDir);
  return files
    .filter((f) => f.endsWith(".mdx"))
    .map((filename) => {
      const slug = filename.replace(/\.mdx$/, "");
      const raw = fs.readFileSync(path.join(postsDir, filename), "utf8");
      const { data } = matter(raw);
      return {
        slug,
        title: data.title,
        date: data.date,
        excerpt: data.excerpt ?? "",
        description: data.description ?? data.excerpt ?? "",
        keywords: data.keywords ?? [],
        draft: data.draft === true,
      };
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

// Published posts only — the default everywhere (blog index, llms.txt,
// sitemap, next-post nav). Drafts are excluded.
export function getAllPosts(): PostMeta[] {
  return readAllMetas().filter((p) => !p.draft);
}

// Draft posts only, newest-first. Used by the dev-only drafts view; guard call
// sites with NODE_ENV so this never runs in production.
export function getDraftPosts(): PostMeta[] {
  return readAllMetas().filter((p) => p.draft);
}

// The post published right after `slug` (chronologically newer). Posts are
// sorted newest-first, so the next-in-time post sits one index earlier.
export function getNextPost(slug: string): PostMeta | null {
  const posts = getAllPosts();
  const i = posts.findIndex((p) => p.slug === slug);
  if (i <= 0) return null;
  return posts[i - 1];
}

export async function getPost(slug: string): Promise<Post> {
  const raw = fs.readFileSync(path.join(postsDir, `${slug}.mdx`), "utf8");
  const { data, content } = matter(raw);
  const processed = await remark()
    .use(gfm)
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypeStringify)
    .process(content);
  return {
    slug,
    title: data.title,
    date: data.date,
    excerpt: data.excerpt ?? "",
    description: data.description ?? data.excerpt ?? "",
    keywords: data.keywords ?? [],
    draft: data.draft === true,
    contentHtml: processed.toString(),
  };
}
