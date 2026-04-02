import Navbar from "./navbar/Navbar";

export default function PageConfig({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="w-full max-w-6xl mx-auto px-6 py-10 flex-1">{children}</main>
    </>
  );
}
