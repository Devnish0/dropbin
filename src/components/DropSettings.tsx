"use client";

import { Clock, Eye, Link, Sparkles } from "lucide-react";
import { ExpiryDuration } from "@/lib/expiry";

interface DropSettingsProps {
  customCode: string;
  onCustomCodeChange: (code: string) => void;
  duration: ExpiryDuration;
  onDurationChange: (duration: ExpiryDuration) => void;
  maxViews: number;
  onMaxViewsChange: (views: number) => void;
}

const DURATIONS: { label: string; value: ExpiryDuration }[] = [
  { label: "10 mins", value: "10m" },
  { label: "30 mins", value: "30m" },
  { label: "1 hour", value: "1h" },
  { label: "6 hours", value: "6h" },
  // { label: "1 day", value: "1d" },
  // { label: "7 days", value: "7d" },
];

export function DropSettings({
  customCode,
  onCustomCodeChange,
  duration,
  onDurationChange,
  maxViews,
  onMaxViewsChange,
}: DropSettingsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 rounded-2xl bg-[#f2f4ef] dark:bg-card/70 border border-border/80">
      {/* 1. Custom Code Option */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-primary uppercase tracking-wider flex items-center gap-1.5">
          <Link className="w-3.5 h-3.5" />
          <span>Custom Code (Optional)</span>
        </label>
        <div className="flex items-center rounded-xl bg-white dark:bg-card border border-border/70 px-3 py-2 text-sm shadow-2xs focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 transition-all">
          <span className="text-secondary/50 font-mono text-xs select-none">
            /
          </span>
          <input
            type="text"
            value={customCode}
            onChange={(e) =>
              onCustomCodeChange(
                e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""),
              )
            }
            placeholder="my-custom-slug"
            maxLength={64}
            className="w-full bg-transparent pl-1 text-foreground placeholder:text-secondary/40 font-mono text-xs outline-none"
          />
        </div>
        {/* <span className="text-[11px] text-secondary/60">Leave empty to generate a random 6-character code</span> */}
      </div>

      {/* 2. Expiration Selector */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-primary uppercase tracking-wider flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          <span>Expires After</span>
        </label>
        <select
          value={duration}
          onChange={(e) => onDurationChange(e.target.value as ExpiryDuration)}
          className="rounded-xl bg-white dark:bg-card border border-border/70 px-3 py-2 text-xs font-mono text-foreground shadow-2xs outline-none cursor-pointer focus:border-primary transition-all"
        >
          {DURATIONS.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>
        {/* <span className="text-[11px] text-secondary/60">
          Drop automatically self-destructs after this duration
        </span> */}
      </div>

      {/* 3. Max Views / Burn After Reading */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-primary uppercase tracking-wider flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5" />
          <span>View Limit</span>
        </label>
        <select
          value={maxViews}
          onChange={(e) => onMaxViewsChange(Number(e.target.value))}
          className="rounded-xl bg-white dark:bg-card border border-border/70 px-3 py-2 text-xs font-mono text-foreground shadow-2xs outline-none cursor-pointer focus:border-primary transition-all"
        >
          <option value={1}>🔥 1 view (Burn on read)</option>
          <option value={5}>5 views</option>
          <option value={10}>10 views</option>
          <option value={50}>50 views</option>
          <option value={100}>100 views (Standard)</option>
          <option value={1000}>1,000 views</option>
        </select>
        {/* <span className="text-[11px] text-secondary/60">
          Delete automatically once max view count is reached
        </span> */}
      </div>
    </div>
  );
}
