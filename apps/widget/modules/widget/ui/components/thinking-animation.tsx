"use client";

import { useEffect, useState } from "react";
import { cn } from "@workspace/ui/lib/utils";
import { DicebearAvatar } from "@workspace/ui/components/dicebear-avatar";
import { AIMessage, AIMessageContent } from "@workspace/ui/components/ai/message";

interface ThinkingAnimationProps {
  className?: string;
}

export const ThinkingAnimation = ({ className }: ThinkingAnimationProps) => {
  const [dots, setDots] = useState(".");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === "...") return ".";
        return prev + ".";
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <AIMessage from="assistant" className={cn("animate-pulse", className)}>
      <AIMessageContent>
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="flex items-center gap-1">
            {/* Animated thinking bubbles */}
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
            </div>
            <span className="text-sm">MOM AI is thinking{dots}</span>
          </div>
        </div>
      </AIMessageContent>
      <DicebearAvatar
        imageUrl="/logo.svg"
        seed="MOM AI"
        size={32}
      />
    </AIMessage>
  );
};