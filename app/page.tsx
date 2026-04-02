import { Button } from "@/components/ui/button";
import { PlaneTakeoff } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div>
      <main className="text-center">
        <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-bold font-jakarta tracking-tighter mb-4">
          The ultimate travel
        </h1>
        <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-bold font-jakarta tracking-tighter mb-4">
          planner for your
        </h1>
        <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-bold font-jakarta tracking-tighter mb-16">
          next trip.
        </h1>
        <Button className="text-xl p-6 gap-4" asChild>
          <Link href="/new">
            <PlaneTakeoff />
            Get Started
          </Link>
        </Button>
      </main>
      <footer className="text-center text-stone-500 mt-80">
        <p>&copy; 2026 Voyage. All rights reserved.</p>
      </footer>
    </div>
  );
}
