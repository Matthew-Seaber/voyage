import { Button } from "@/components/ui/button";
import Link from "next/link";

function AuthButton() {
  return (
    <Button asChild size="lg">
      <Link href="/signup">Sign up</Link>
    </Button>
  );
}

export default AuthButton;
