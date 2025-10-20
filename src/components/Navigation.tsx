import { Button } from "@/components/ui/button";
import { useState } from "react";

export const Navigation = () => {
  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/logos.png" alt="AetherBot Logo" className="w-8 h-8 object-contain" />
          <span className="text-2xl font-bold gradient-text">AetherBot</span>
        </div>
      </div>
    </nav>
  );
};
