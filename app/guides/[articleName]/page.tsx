import fs from "fs";
import path from "path";
import matter from "gray-matter";
import ReactMarkdown from "react-markdown";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

async function getGuideInfo(articleName: string) {
  const guidesDirectory = path.join(process.cwd(), "content/guides");
  const files = fs.readdirSync(guidesDirectory);

  for (const file of files) {
    if (path.parse(file).name === articleName) {
      const filePath = path.join(guidesDirectory, file);
      const fileContents = fs.readFileSync(filePath, "utf8");
      const { data, content } = matter(fileContents);

      return {
        slug: data.slug,
        title: data.title,
        description: data.description,
        creation_date: data.creation_date,
        last_updated: data.last_updated,
        author: data.author,
        author_link: data.author_link,
        continent: data.continent,
        content: content,
      };
    }
  }

  return null;
}

async function ArticlePage({
  params,
}: {
  params: Promise<{ articleName: string }>;
}) {
  const { articleName } = await params;

  const guideData = await getGuideInfo(articleName);

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
      <Link href="/guides">
        <Button variant="outline" className="cursor-pointer">
          <ArrowLeft />
          Back
        </Button>
      </Link>

      <article>
        <h1 className="text-3xl font-bold my-4">{guideData.title}</h1>
        <p className="text-muted-foreground mb-2">{guideData.description}</p>
        <p className="my-2 text-xs text-gray-500">
          Last updated: {new Date(guideData.last_updated).toLocaleDateString()}
        </p>
        <span className="text-xs px-2 py-1 bg-secondary rounded-md">
          {guideData.continent}
        </span>

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

      <footer className="text-center text-stone-500 mt-20">
        <p>&copy; 2026 Voyage. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default ArticlePage;
