import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts, getDraftPosts } from "@/lib/posts";
import { SITE_NAME } from "@/lib/site";

// Drafts are only ever surfaced when running locally (`next dev`). In a Vercel
// production build NODE_ENV is "production", so the toggle and every draft read
// below are compiled out of the rendered page — drafts never ship.
const IS_DEV = process.env.NODE_ENV === "development";

export const metadata: Metadata = {
  title: "Writing",
  description: `Essays by ${SITE_NAME} on AI agents, web development, design, and data science.`,
  alternates: { canonical: "/blog" },
  openGraph: {
    type: "website",
    title: `Writing · ${SITE_NAME}`,
    description: `Essays by ${SITE_NAME} on AI agents, web development, design, and data science.`,
    url: "/blog",
  },
};

export default async function BlogIndex({
  searchParams,
}: {
  searchParams: Promise<{ drafts?: string }>;
}) {
  const showDrafts = IS_DEV && "drafts" in (await searchParams);
  const posts = showDrafts ? getDraftPosts() : getAllPosts();

  return (
    <main>
      <div className="blog-wrapper">
        <div className="blog-container">
          <div className="blog-topbar">
            <Link href="/" className="back-link">← home</Link>
            {IS_DEV && (
              <Link
                href={showDrafts ? "/blog" : "/blog?drafts"}
                className="drafts-toggle"
              >
                {showDrafts ? "← published posts" : "View drafts →"}
              </Link>
            )}
            {showDrafts && <span className="drafts-banner">Drafts · local only</span>}
          </div>

          <ul className="post-list">
            {posts.map((post) => (
              <li key={post.slug} className="post-item">
                <Link href={`/blog/${post.slug}`} className="post-link">
                  <span className={`post-item-title${showDrafts ? " draft-title" : ""}`}>
                    {showDrafts && <span className="draft-tag">Draft</span>}
                    {post.title}
                  </span>
                  <p className="post-excerpt">{post.excerpt}</p>
                </Link>
              </li>
            ))}
            {posts.length === 0 && (
              <li className="post-item">
                <p className="post-excerpt">No {showDrafts ? "drafts" : "posts"} yet.</p>
              </li>
            )}
          </ul>
        </div>
      </div>
    </main>
  );
}
