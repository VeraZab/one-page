import Header from "@/components/Header";
import Bio from "@/components/Bio";

export default function Home() {
  return (
    <main>
      <div className="page-container">
        <div className="content-container">
          <Header />
          <Bio />
        </div>
      </div>
    </main>
  );
}
