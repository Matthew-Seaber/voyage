import Link from "next/link";

function NavbarLinks() {
  return (
    <div className="hidden md:flex">
      <Link href="/guides" className="hover:text-foreground/80">
        Guides
      </Link>
    </div>
  );
}

export default NavbarLinks