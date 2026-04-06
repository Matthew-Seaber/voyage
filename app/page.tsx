import { Button } from "@/components/ui/button";
import { SmoothCursor } from "@/components/ui/smooth-cursor";
import { PlaneTakeoff } from "lucide-react";
import Link from "next/link";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import Image from "next/image";

function getGuides() {
  const guidesDirectory = path.join(process.cwd(), "content/guides");
  const files = fs.readdirSync(guidesDirectory);

  return files
    .filter((file) => file.endsWith(".md"))
    .map((fileName) => {
      const filePath = path.join(guidesDirectory, fileName);
      const fileContents = fs.readFileSync(filePath, "utf8");
      const { data } = matter(fileContents);

      return {
        slug: fileName.slice(0, -3), // Removes the .md extension from the URL
        title: data.title,
        description: data.description,
        creation_date: data.creation_date,
        last_updated: data.last_updated,
        continent: data.continent,
      };
    })
    .sort(
      (a, b) =>
        new Date(b.last_updated).getTime() - new Date(a.last_updated).getTime(),
    );
}

export default function Home() {
  const guides = getGuides();

  return (
    <div>
      <main className="text-center">
        <h1 className="text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-bold font-jakarta tracking-tighter my-4">
          The ultimate travel planner for
        </h1>
        <h1 className="text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-bold font-jakarta tracking-tighter mb-12">
          your next trip.
        </h1>

        <Button className="text-xl p-6 gap-4" asChild>
          <Link href="/new">
            <PlaneTakeoff />
            Get Started
          </Link>
        </Button>

        <h3 className="mt-20 text-2xl md:text-3xl font-semibold">
          Discover the best travel guides
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left mt-8">
          {guides.map((guide) => (
            <Link
              key={guide.slug}
              href={`/guides/${guide.slug}`}
              className="group block overflow-hidden border rounded-2xl hover:shadow-lg transition-shadow"
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

              <div className="p-6">
                <h2 className="text-xl font-bold mb-2">{guide.title}</h2>
                <p className="text-muted-foreground mb-2">
                  {guide.description}
                </p>
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

        <Button className="text-md p-5 mt-8" asChild>
          <Link href="/guides">See All Guides</Link>
        </Button>
      </main>
      <footer className="text-center text-stone-500 mt-20">
        <p>&copy; 2026 Voyage. All rights reserved.</p>
      </footer>

      <SmoothCursor />
    </div>
  );
}
