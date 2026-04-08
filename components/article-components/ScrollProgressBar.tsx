"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

function ScrollProgressBar() {
  const [scrollPercentage, setScrollPercentage] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const articleHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercentage = scrollTop / articleHeight;
      setScrollPercentage(scrollPercentage);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="fixed left-2 xl:left-8 top-1/2 -translate-y-1/2 h-64 w-1 bg-gray-200 rounded-full overflow-hidden z-2">
      <motion.div
        className="w-full h-full bg-gray-500 rounded-full origin-top"
        style={{ scaleY: scrollPercentage }}
      />
    </div>
  );
}

export default ScrollProgressBar;
