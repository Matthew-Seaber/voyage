import NavbarLinks from "@/components/navbar/NavbarLinks";
import Logo from "@/components/navbar/Logo";
import AuthButton from "@/components/navbar/NavButton";

function Navbar() {
  return (
    <nav
      data-smooth-cursor="ignore"
      className="border rounded-3xl sticky top-2 mx-2 z-50 bg-background/80 backdrop-blur-sm"
    >
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
