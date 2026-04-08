"use client";

import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

function ScrollTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  async function handleScrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (!visible) {
    return null;
  }

  return (
    <Button
      className="fixed bottom-6 right-6 rounded-full shadow-lg w-15 h-12 z-2"
      size="icon"
      onClick={handleScrollToTop}
    >
      <ArrowUp />
    </Button>
  );
}

export default ScrollTopButton;
