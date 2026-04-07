"use client";

import { Button } from "@/components/ui/button";
import { Share } from "lucide-react";
import { Toaster, toast } from "sonner";

type ShareButtonProps = {
  title: string;
  description?: string;
};

function ShareButton({ title, description }: ShareButtonProps) {
  async function handleShare() {
    try {
      if (navigator.share) {
        await navigator.share({
          title,
          text: description,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(
          title + ": " + window.location.href,
        );
        toast.success("Link copied to clipboard!");
      }
    } catch (error) {
      console.error("Error sharing:", error);
      toast.error(
        "Sharing failed. Please try again later.",
      );
    }
  }

  return (
    <>
      <Button className="ml-auto" onClick={handleShare}>
        <Share />
        Share
      </Button>

      <Toaster />
    </>
  );
}

export default ShareButton;
