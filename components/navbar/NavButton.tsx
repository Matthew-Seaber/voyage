import { Button } from "@/components/ui/button";
import Link from "next/link";

function NavButton() {
  return (
    <Button asChild size="lg" className="bg-foreground hover:bg-foreground/90">
      <Link
        href="https://github.com/Matthew-Seaber/voyage"
        target="_blank"
        rel="noopener noreferrer"
      >
        View on GitHub
      </Link>
    </Button>
  );
}

export default NavButton;
