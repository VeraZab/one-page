import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/posts";
import { SITE_NAME } from "@/lib/site";

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

export default function BlogIndex() {
  const posts = getAllPosts();

  return (
    <main>
      <div className="blog-wrapper">
        <div className="blog-container">
          <Link href="/" className="back-link">← home</Link>
          <ul className="post-list">
            {posts.map((post) => (
              <li key={post.slug} className="post-item">
                <Link href={`/blog/${post.slug}`} className="post-link">
                  <span className="post-item-title">{post.title}</span>
                  <time className="post-date" dateTime={post.date}>{post.date}</time>
                  <p className="post-excerpt">{post.excerpt}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );

}
