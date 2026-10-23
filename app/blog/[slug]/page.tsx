import type { Metadata } from "next";
import { getAllPosts, getNextPost, getPost } from "@/lib/posts";
import { SITE_URL, AUTHOR } from "@/lib/site";
import Link from "next/link";

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  const url = `/blog/${post.slug}`;
  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    authors: [{ name: AUTHOR }],
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url,
      publishedTime: new Date(post.date).toISOString(),
      authors: [AUTHOR],
      tags: post.keywords,
    },
    twitter: {
      card: "summary",
      title: post.title,
      description: post.description,
    },
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  const nextPost = getNextPost(slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: new Date(post.date).toISOString(),
    dateModified: new Date(post.date).toISOString(),
    author: { "@type": "Person", name: AUTHOR, url: SITE_URL, image: `${SITE_URL}/me.jpeg` },
    publisher: { "@type": "Person", name: AUTHOR },
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
    keywords: post.keywords.join(", "),
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="blog-wrapper">
        <article className="post-container">
          <Link href="/blog" className="back-link">← writing</Link>
          <h1 className="post-title">{post.title}</h1>
          <time className="post-date" dateTime={post.date}>{post.date}</time>
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
