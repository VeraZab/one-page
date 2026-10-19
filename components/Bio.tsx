import Link from "next/link";

export default function Bio() {
  return (
    <div className="text-container">
      <span className="salutation">
        hi there <span className="hand">👋</span>
      </span>

      <br />
      <br />

      Glad you made it here! My name is Vera Zabeida, and I&apos;m a senior
      full-stack engineer with a passion for design, data science, and all
      things startup. I enjoy
      working with creative teams, ideating and iterating. On this page you&apos;ll
      find a little bit of{" "}
      <a target="_blank" href="/Vera_Zabeida_Senior_Full_Stack_Engineer.pdf">
        what I&apos;ve been up to
      </a>
      , as well as some links to{" "}
      <Link href="/blog">my writings</Link>{" "}
      and{" "}
      <a href="https://github.com/VeraZab" target="_blank" rel="noopener noreferrer">
        tinkerings
      </a>
      .

      <br />
      <br />

      When I&apos;m not writing code, you can find me{" "}
      <a target="_blank" href="https://www.instagram.com/zabzablab" rel="noopener noreferrer">
        doodling
      </a>
      , chasing the perfect New York cheesecake (hands down{" "}
      <a target="_blank" href="https://venieros.com/" rel="noopener noreferrer">
        <i>Veniero&apos;s</i>
      </a>
      ) and enjoying the many{" "}
      <a target="_blank" href="https://www.artechouse.com/" rel="noopener noreferrer">
        exhibits
      </a>{" "}
      the city has to offer.
    </div>
  );
}
