"use client";

import { Terminal, Paperclip } from "lucide-react";

export type DropType = "text" | "file";

interface DropTypeToggleProps {
  value: DropType;
  onChange: (type: DropType) => void;
}

export function DropTypeToggle({ value, onChange }: DropTypeToggleProps) {
  return (
    <div className="inline-flex items-center p-1 bg-[#e4e7e1] dark:bg-surface/60 border border-border/70 rounded-2xl shadow-xs">
      {/* 1. Text / Secret Note Button */}
      <button
        type="button"
        onClick={() => onChange("text")}
        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 cursor-pointer ${
          value === "text"
            ? "bg-white dark:bg-card text-foreground shadow-xs"
            : "text-secondary hover:text-foreground"
        }`}
      >
        <Terminal className="w-4 h-4 stroke-[2.2]" />
        <span>Text / Secret Note</span>
      </button>

      {/* 2. Files / Media Button */}
      <button
        type="button"
        onClick={() => onChange("file")}
        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 cursor-pointer ${
          value === "file"
            ? "bg-white dark:bg-card text-foreground shadow-xs"
            : "text-secondary hover:text-foreground"
        }`}
      >
        <Paperclip className="w-4 h-4 stroke-[2.2]" />
        <span>Files / Media</span>
        <span className="px-1.5 py-0.5 text-[10px] font-bold tracking-wider rounded bg-primary text-accent">
          5 GB
        </span>
      </button>
    </div>
  );
}
