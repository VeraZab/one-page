import Link from "next/link";

export default function SocialLink({
  href,
  label,
  children,
  newTab = true,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
  newTab?: boolean;
}) {
  const inner = (
    <>
      {children}
      <span className="tooltip">{label}</span>
    </>
  );

  return (
    <div className="content-bubble">
      {newTab ? (
        // External links / files — open in a new tab via a plain anchor.
        <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>
          {inner}
        </a>
      ) : (
        // Internal navigation — client-side so the Header never remounts
        // and the fade-in animation doesn't replay on in-site navigation.
        <Link href={href} aria-label={label}>
          {inner}
        </Link>
      )}
    </div>
  );
}
