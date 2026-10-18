import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

const postsDir = path.join(process.cwd(), "content/posts");

export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
}

export interface Post extends PostMeta {
  contentHtml: string;
}

export function getAllPosts(): PostMeta[] {
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
      };
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
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
  const processed = await remark().use(html).process(content);
  return {
    slug,
    title: data.title,
    date: data.date,
    excerpt: data.excerpt ?? "",
    contentHtml: processed.toString(),
  };
}
