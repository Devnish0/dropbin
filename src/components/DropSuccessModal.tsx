"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink, ArrowRight, ShieldCheck, Flame } from "lucide-react";
import Link from "next/link";

interface DropSuccessModalProps {
  code: string;
  type: "text" | "image" | "file";
  maxViews: number;
  onReset: () => void;
}

export function DropSuccessModal({
  code,
  type,
  maxViews,
  onReset,
}: DropSuccessModalProps) {
  const [copied, setCopied] = useState(false);
  const dropUrl = typeof window !== "undefined" ? `${window.location.origin}/${code}` : `/${code}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(dropUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-card border-2 border-primary/20 p-6 md:p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-primary text-accent">
          <ShieldCheck className="w-6 h-6 stroke-[2]" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-primary font-serif">Drop Created Successfully!</h3>
          <p className="text-xs text-secondary mt-0.5">
            Your {type} drop is encrypted and ready to share.
          </p>
        </div>
      </div>

      {/* Share Link Box */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2 rounded-xl bg-[#f2f4ef] dark:bg-surface/50 border border-border">
        <div className="flex-1 px-3 py-1 font-mono text-xs sm:text-sm text-foreground truncate select-all">
          {dropUrl}
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary hover:bg-surface text-primary-foreground text-xs font-semibold tracking-wide transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-accent" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Link</span>
            </>
          )}
        </button>
      </div>

      {/* Security Notes */}
      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-secondary font-mono">
        {maxViews === 1 ? (
          <span className="flex items-center gap-1.5 text-danger font-medium">
            <Flame className="w-3.5 h-3.5" />
            Burn on Read: will self-destruct after 1 view
          </span>
        ) : (
          <span>Max views: {maxViews}</span>
        )}
      </div>

      {/* Actions */}
      <div className="mt-8 pt-6 border-t border-border flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onReset}
          className="text-xs font-medium text-secondary hover:text-foreground transition-colors cursor-pointer"
        >
          ← Create Another Drop
        </button>

        <Link
          href={`/${code}`}
          target="_blank"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
        >
          <span>Open Drop</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
