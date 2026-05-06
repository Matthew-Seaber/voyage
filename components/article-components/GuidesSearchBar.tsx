"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Button } from "../ui/button";

interface Guide {
  slug: string;
  title: string;
  description: string;
  creation_date: string;
  last_updated: string;
  continent: string;
  readingTime: number;
}

function GuidesSearchBar({ guides }: { guides: Guide[] }) {
  const [continentTag, setContinentTag] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const searchAndFilterGuides = (guides: Guide[], searchQuery: string) => {
    const searchedGuides = [];
    const guidesToReturn = [];
    const tempSearchQuery = searchQuery.toLowerCase();

    for (const guide of guides) {
      const titleMatch = guide.title.toLowerCase().includes(tempSearchQuery);
      const descriptionMatch = guide.description
        .toLowerCase()
        .includes(tempSearchQuery);
      const continentMatch = guide.continent
        .toLowerCase()
        .includes(tempSearchQuery);

      if (titleMatch || descriptionMatch || continentMatch) {
        searchedGuides.push(guide);
      }
    }

    for (const guide of searchedGuides) {
      if (guide.continent === continentTag || continentTag === "All") {
        guidesToReturn.push(guide);
      }
    }

    return guidesToReturn;
  };

  const filteredGuides = searchAndFilterGuides(guides, searchQuery);

  return (
    <>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search guides..."
        className="mb-3 w-full px-2 py-1 text-muted-foreground text-md border-2 rounded-md font-medium focus:ring-2 focus:ring-foreground/50 focus:outline-none transition"
      />

      <div className="mb-8 gap-2 flex flex-wrap">
        <Button
          variant={continentTag === "All" ? "default" : "outline"}
          onClick={() => setContinentTag("All")}
        >
          All
        </Button>
        <Button
          variant={continentTag === "Africa" ? "default" : "outline"}
          onClick={() => setContinentTag("Africa")}
        >
          Africa
        </Button>
        <Button
          variant={continentTag === "Asia" ? "default" : "outline"}
          onClick={() => setContinentTag("Asia")}
        >
          Asia
        </Button>
        <Button
          variant={continentTag === "Europe" ? "default" : "outline"}
          onClick={() => setContinentTag("Europe")}
        >
          Europe
        </Button>
        <Button
          variant={continentTag === "North America" ? "default" : "outline"}
          onClick={() => setContinentTag("North America")}
        >
          North America
        </Button>
        <Button
          variant={continentTag === "South America" ? "default" : "outline"}
          onClick={() => setContinentTag("South America")}
        >
          South America
        </Button>
        <Button
          variant={continentTag === "Oceania" ? "default" : "outline"}
          onClick={() => setContinentTag("Oceania")}
        >
          Oceania
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredGuides.map((guide) => (
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
              <p className="text-muted-foreground mb-2 text-sm">
                {guide.description}
              </p>
              <span className="text-xs px-2 py-1 bg-foreground/10 rounded-md text-foreground">
                {guide.continent}
              </span>

              <p className="mt-4 text-xs text-gray-500">
                {new Date(guide.creation_date).toLocaleDateString()}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {filteredGuides.length === 0 && (
        <p className="w-full pb-12 text-muted-foreground text-sm text-center">
          No guides found with the current search term and/or filter.
        </p>
      )}
    </>
  );
}

export default GuidesSearchBar;
