import { getAllPosts, getNextPost, getPost } from "@/lib/posts";
import Link from "next/link";

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  return { title: post.title };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  const nextPost = getNextPost(slug);

  return (
    <main>
      <div className="blog-wrapper">
        <article className="post-container">
          <Link href="/blog" className="back-link">← writing</Link>
          <h1 className="post-title">{post.title}</h1>
          <time className="post-date">{post.date}</time>
          <div
            className="post-body"
            dangerouslySetInnerHTML={{ __html: post.contentHtml }}
          />
          <nav className="post-nav">
            <Link href="/blog" className="post-nav-back">← back to writing</Link>
            {nextPost && (
              <Link href={`/blog/${nextPost.slug}`} className="post-nav-next">
                <span className="post-nav-label">next post</span>
                <span className="post-nav-title">{nextPost.title} →</span>
              </Link>
            )}
          </nav>
        </article>
      </div>
    </main>
  );
}
