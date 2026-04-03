import NavbarLinks from "@/components/navbar/NavbarLinks";
import Logo from "@/components/navbar/Logo";
import AuthButton from "@/components/navbar/NavButton";

function Navbar() {
  return (
    <nav className="border-b">
      <div className="max-w-400 mx-auto px-6 flex justify-between items-center py-6 gap-4">
        <Logo />
        <NavbarLinks />

        <div className="flex items-center gap-4 shrink-0">
          <AuthButton />
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
