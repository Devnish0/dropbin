"use client";

import { Lock, ClipboardPaste } from "lucide-react";

interface PasteEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function PasteEditor({ value, onChange }: PasteEditorProps) {
  const charCount = value.length;
  const lineCount = value ? value.split("\n").length : 1;

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) onChange(text);
    } catch {
      // Clipboard permissions denied or unavailable
    }
  };

  return (
    <div className="flex flex-col justify-between min-h-[340px] rounded-2xl bg-[#f2f4ef] dark:bg-card/70 border border-border/80 p-5 shadow-xs transition-colors">
      {/* 1. Monospace Textarea */}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`// Paste confidential API keys, SSH certs, cryptographic credentials, or temporary notes here...\n// Client will compute zero-knowledge ciphertext immediately upon typing.`}
        className="w-full flex-1 bg-transparent font-mono text-sm leading-relaxed text-foreground placeholder:text-secondary/60 resize-none outline-none focus:ring-0 selection:bg-accent/40 min-h-[220px]"
        rows={10}
        spellCheck={false}
      />

      {/* 2. Bottom Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 mt-2 font-mono text-xs text-secondary/80 border-t border-border/40 select-none">
        {/* Left: Dynamic Counts */}
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
          <span>{charCount} characters</span>
          <span>
            {lineCount} {lineCount === 1 ? "line" : "lines"}
          </span>
          <span className="text-secondary/40">•</span>
          <span className="text-secondary/70">UTF-8 Encoded</span>

          {value.length === 0 && (
            <button
              type="button"
              onClick={handlePasteClipboard}
              className="inline-flex items-center gap-1 text-primary hover:underline cursor-pointer ml-1"
            >
              <ClipboardPaste className="w-3.5 h-3.5" />
              <span>Paste Clipboard</span>
            </button>
          )}
        </div>

        {/* Right: Security Badge */}
        <div className="flex items-center gap-1.5 text-secondary/80">
          <Lock className="w-3.5 h-3.5 stroke-[2]" />
          <span>Client-side Buffer Only</span>
        </div>
      </div>
    </div>
  );
}
