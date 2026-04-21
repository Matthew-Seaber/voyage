import Link from "next/link";
import { PlaneTakeoff } from "lucide-react"

function Logo() {
  return (
    <Link href="/">
      <div className="flex gap-3">
        <PlaneTakeoff />
        <p className="text-xl font-bold font-fraunces">Voyage</p>
      </div>
    </Link>
  );
}

export default Logo;
