import Link from "next/link";

function NavbarLinks() {
  return (
    <div>
        <Link href="/guides" className="hover:text-primary">
          Guides
        </Link>
    </div>
  )
}

export default NavbarLinks