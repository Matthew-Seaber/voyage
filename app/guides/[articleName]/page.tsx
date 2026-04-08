import fs from "fs";
import path from "path";
import matter from "gray-matter";
import ReactMarkdown from "react-markdown";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import ShareButton from "@/components/button-components/ShareButton";
import ScrollTopButton from "@/components/article-components/ScrollTopButton";
import ScrollProgressBar from "@/components/article-components/ScrollProgressBar";

async function getGuideInfo(articleName: string) {
  const guidesDirectory = path.join(process.cwd(), "content/guides");
  const files = fs.readdirSync(guidesDirectory);

  for (const file of files) {
    if (path.parse(file).name === articleName) {
      const filePath = path.join(guidesDirectory, file);
      const fileContents = fs.readFileSync(filePath, "utf8");
      const { data, content } = matter(fileContents);

      return {
        title: data.title,
        description: data.description,
        creation_date: data.creation_date,
        last_updated: data.last_updated,
        author: data.author,
        author_link: data.author_link,
        continent: data.continent,
        content: content,
        image_caption: data.image_caption || "",
      };
    }
  }

  return null;
}

function getOtherGuides(currentArticle: string) {
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
    .filter((guide) => guide.slug !== currentArticle)
    .sort(() => 0.5 - Math.random())
    .slice(0, 4); // Limits to 4 other guides
}

async function ArticlePage({
  params,
}: {
  params: Promise<{ articleName: string }>;
}) {
  const { articleName } = await params;

  const guideData = await getGuideInfo(articleName);
  const otherGuides = getOtherGuides(articleName);

  if (!guideData) {
    return (
      <div>
        <Link href="/guides">
          <Button variant="outline" className="cursor-pointer">
            <ArrowLeft />
            Back
          </Button>
        </Link>
        <p className="pt-4 text-red-600">
          Error fetching guide data. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div>
      <ScrollProgressBar />

      <div className="flex items-center gap-2 justify-between">
        <Link href="/guides">
          <Button variant="outline" className="cursor-pointer">
            <ArrowLeft />
            Back
          </Button>
        </Link>
        <ShareButton
          title={guideData.title}
          description={guideData.description}
        />
      </div>

      <article>
        <h1 className="text-3xl font-bold my-4">{guideData.title}</h1>
        <p className="text-muted-foreground mb-2">{guideData.description}</p>
        <p className="my-2 text-xs text-gray-500">
          Last updated: {new Date(guideData.last_updated).toLocaleDateString()}
        </p>
        <span className="text-xs px-2 py-1 bg-secondary rounded-md">
          {guideData.continent}
        </span>

        <Image
          src={`/guide-images/${articleName}.jpg`}
          alt={guideData.title}
          loading="eager"
          sizes="(max-width: 768px) 100vw, 540px"
          className="my-4 h-auto w-full max-w-xl rounded-xl"
          width={540}
          height={400}
        />
        <p className="text-xs text-gray-500 mb-8">{guideData.image_caption}</p>

        <div className="mt-8 prose prose-slate dark:prose-invert max-w-none">
          {" "}
          {/* Tailwind prose used to style all MD elements */}
          <ReactMarkdown>{guideData.content}</ReactMarkdown>
        </div>

        <p className="mt-8 text-xs text-gray-500">
          Written by:{" "}
          <a
            href={guideData.author_link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            {guideData.author}
          </a>{" "}
          on {new Date(guideData.creation_date).toLocaleDateString()}
        </p>
      </article>

      <h3 className="mt-20 mb-8 text-2xl md:text-3xl font-semibold">Up Next</h3>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {otherGuides.map((guide) => (
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

      <ScrollTopButton />

      <footer className="text-center text-stone-500 mt-20">
        <p>&copy; 2026 Voyage. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default ArticlePage;
