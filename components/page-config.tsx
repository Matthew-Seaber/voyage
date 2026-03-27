import Navbar from "./navbar/Navbar";

export default function PageConfig({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="max-w-400 mx-auto px-6 py-10">{children}</main>
    </>
  );
}
