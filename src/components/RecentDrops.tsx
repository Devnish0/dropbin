"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  History,
  Terminal,
  ImageIcon,
  FileIcon,
  ExternalLink,
  Copy,
  Check,
  Trash2,
  Clock,
  Flame,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export interface StoredDropItem {
  code: string;
  type: "text" | "image" | "file";
  fileName?: string;
  createdAt: string;
  expiresAt: string;
  maxViews: number;
}

const STORAGE_KEY = "dropbin_recent_drops";

export function getStoredDrops(): StoredDropItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveDropToStorage(drop: StoredDropItem) {
  if (typeof window === "undefined") return;
  try {
    const existing = getStoredDrops();
    // Filter out if duplicate code already exists, keep newest
    const filtered = existing.filter((item) => item.code !== drop.code);
    const updated = [drop, ...filtered].slice(0, 30); // keep up to 30 recent drops
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage quota or disabled errors
  }
}

interface RecentDropsProps {
  // Trigger re-render whenever a new drop is saved
  refreshKey?: number;
  onCountChange?: (count: number) => void;
}

export function RecentDrops({
  refreshKey = 0,
  onCountChange,
}: RecentDropsProps) {
  const [drops, setDrops] = useState<StoredDropItem[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const stored = getStoredDrops();
    setDrops(stored);
    onCountChange?.(stored.length);
  }, [refreshKey, onCountChange]);

  if (!isMounted) {
    return (
      <section className="mt-16 pt-10 border-t border-border/80">
        <div className="flex items-center gap-2.5 mb-6">
          <div className="p-2 rounded-xl bg-primary/10 text-primary dark:bg-card">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xl font-serif font-bold text-primary">
              Recent Drops
            </h3>
            <p className="text-xs text-secondary font-mono">
              Saved in this browser&apos;s local storage
            </p>
          </div>
        </div>
        <div className="rounded-2xl border border-dashed border-border/80 p-8 text-center bg-[#f2f4ef]/40 dark:bg-card/40">
          <p className="text-xs text-secondary font-mono">Loading history...</p>
        </div>
      </section>
    );
  }

  const handleCopyLink = async (code: string) => {
    try {
      const url = `${window.location.origin}/${code}`;
      await navigator.clipboard.writeText(url);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch {
      // ignore clipboard error
    }
  };

  const handleRemove = (code: string) => {
    const filtered = drops.filter((d) => d.code !== code);
    setDrops(filtered);
    onCountChange?.(filtered.length);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch {
      // ignore
    }
  };

  const handleClearAll = () => {
    if (
      confirm(
        "Clear your local drop history? (This only removes the links from this browser)",
      )
    ) {
      setDrops([]);
      onCountChange?.(0);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }
    }
  };

  const formatRemainingTime = (expiresAtStr: string) => {
    const diff = new Date(expiresAtStr).getTime() - Date.now();
    if (diff <= 0) return { label: "Expired", isExpired: true };

    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return { label: `${days}d remaining`, isExpired: false };
    if (hours > 0) return { label: `${hours}h remaining`, isExpired: false };
    return { label: `${Math.max(1, mins)}m remaining`, isExpired: false };
  };

  return (
    <section className="mt-16 pt-10 border-t border-border/80">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-primary/10 text-primary dark:bg-card">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xl font-serif font-bold text-primary">
              Recent Drops
            </h3>
            <p className="text-xs text-secondary font-mono">
              Saved in this browser&apos;s local storage
            </p>
          </div>
        </div>

        {drops.length > 0 && (
          <button
            type="button"
            onClick={handleClearAll}
            className="text-xs text-secondary hover:text-danger transition-colors cursor-pointer"
          >
            Clear History
          </button>
        )}
      </div>

      {drops.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/80 p-8 text-center bg-[#f2f4ef]/40 dark:bg-card/40">
          <p className="text-xs text-secondary font-mono">
            No drops created yet. Drops created in this session will be
            preserved here.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {drops.map((drop) => {
            const { label: timeLabel, isExpired } = formatRemainingTime(
              drop.expiresAt,
            );

            return (
              <div
                key={drop.code}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border transition-all ${
                  isExpired
                    ? "bg-[#eaecea]/60 dark:bg-card/30 border-border/50 opacity-70"
                    : "bg-[#f2f4ef] dark:bg-card/70 border-border/80 hover:border-primary/40"
                }`}
              >
                {/* Left: Icon & Code info */}
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-card shadow-2xs text-primary shrink-0">
                    {drop.type === "image" ? (
                      <ImageIcon className="w-4 h-4" />
                    ) : drop.type === "file" ? (
                      <FileIcon className="w-4 h-4" />
                    ) : (
                      <Terminal className="w-4 h-4" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/${drop.code}`}
                        target="_blank"
                        className="font-mono font-bold text-sm text-primary hover:underline"
                      >
                        /{drop.code}
                      </Link>
                      <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-full bg-border/60 text-secondary">
                        {drop.type}
                      </span>
                      {drop.maxViews === 1 && (
                        <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-danger/10 text-danger font-medium">
                          <Flame className="w-2.5 h-2.5" />
                          burn
                        </span>
                      )}
                    </div>

                    {drop.fileName && (
                      <p className="text-xs text-secondary truncate max-w-[200px] sm:max-w-[320px] font-mono mt-0.5">
                        {drop.fileName}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Status badge & Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40 font-mono text-xs">
                  {/* Status Indicator */}
                  <div
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${
                      isExpired
                        ? "bg-danger/10 text-danger border border-danger/20"
                        : "bg-[#e4e7e1] dark:bg-surface text-secondary border border-border"
                    }`}
                  >
                    <Clock className="w-3 h-3" />
                    <span>{timeLabel}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleCopyLink(drop.code)}
                      title="Copy share link"
                      className="p-1.5 rounded-lg text-secondary hover:text-primary hover:bg-border/60 transition-colors cursor-pointer"
                    >
                      {copiedCode === drop.code ? (
                        <Check className="w-3.5 h-3.5 text-accent" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <Link
                      href={`/${drop.code}`}
                      target="_blank"
                      title="Open drop in new tab"
                      className="p-1.5 rounded-lg text-secondary hover:text-primary hover:bg-border/60 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>

                    {/* <button
                      type="button"
                      onClick={() => handleRemove(drop.code)}
                      title="Remove from history"
                      className="p-1.5 rounded-lg text-secondary hover:text-danger hover:bg-danger/10 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button> */}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
