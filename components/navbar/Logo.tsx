import Link from "next/link";
import { PlaneTakeoff } from "lucide-react"

function Logo() {
  return (
    <Link href="/">
      <span>
        <PlaneTakeoff />
      </span>
    </Link>
  );
}

export default Logo;
