import fs from "fs";
import path from "path";
import matter from "gray-matter";
import GuidesSearchBar from "@/components/article-components/GuidesSearchBar";

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
      <h4 className="text-muted-foreground mb-4">
        Use the human-generated guides below to help shape your next trip.
      </h4>

      <GuidesSearchBar guides={guides} />

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
