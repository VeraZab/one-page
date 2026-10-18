import Link from "next/link";
import { getAllPosts } from "@/lib/posts";

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
                  <span className="post-date">{post.date}</span>
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
