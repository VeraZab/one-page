export default function SocialLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <div className="content-bubble">
      <a href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    </div>
  );
}
