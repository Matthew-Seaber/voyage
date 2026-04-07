import fs from "fs";
import path from "path";
import matter from "gray-matter";
import Link from "next/link";
import Image from "next/image";

function getGuides() {
  const guidesDirectory = path.join(process.cwd(), "content/guides");
  const files = fs.readdirSync(guidesDirectory);

  return files
    .filter((file) => file.endsWith(".md"))
    .map((fileName) => {
      const filePath = path.join(guidesDirectory, fileName);
      const fileContents = fs.readFileSync(filePath, "utf8");
      const { data, content } = matter(fileContents);

      const wordCount = content.split(/\s+/g).length;
      const readingTime = Math.ceil(wordCount / 200);

      return {
        slug: fileName.slice(0, -3), // Removes the .md extension from the URL
        title: data.title,
        description: data.description,
        creation_date: data.creation_date,
        last_updated: data.last_updated,
        continent: data.continent,
        readingTime,
      };
    })
    .sort(
      (a, b) =>
        new Date(b.last_updated).getTime() - new Date(a.last_updated).getTime(),
    );
}

function GuidesPage() {
  const guides = getGuides();

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-2">Guides</h1>
      <h4 className="text-muted-foreground mb-8">
        Use the human-generated guides below to help shape your next trip.
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {guides.map((guide) => (
          <Link
            key={guide.slug}
            href={`/guides/${guide.slug}`}
            className="group relative block border overflow-hidden rounded-2xl hover:shadow-md transition-shadow"
          >
            <div className="relative h-48 w-full overflow-hidden">
              <Image
                src={`/guide-images/${guide.slug}.jpg`}
                alt={guide.title}
                loading="eager"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md z-2">
              <p>
                {guide.readingTime} min{guide.readingTime !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="p-6">
              <h2 className="text-xl font-bold mb-2">{guide.title}</h2>
              <p className="text-muted-foreground mb-2">{guide.description}</p>
              <span className="text-xs px-2 py-1 bg-secondary rounded-md">
                {guide.continent}
              </span>

              <p className="mt-4 text-xs text-gray-500">
                {new Date(guide.creation_date).toLocaleDateString()}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <p className="mt-8 text-xs text-gray-500">
        To submit a guide, please{" "}
        <a
          href="mailto:matthewseaber@outlook.com ?subject=Voyage Guide Submission"
          className="font-medium text-foreground cursor-pointer hover:underline"
        >
          click here{" "}
        </a>
        and attach the article&apos;s markdown file.
      </p>

      <footer className="text-center text-stone-500 mt-20">
        <p>&copy; 2026 Voyage. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default GuidesPage;
