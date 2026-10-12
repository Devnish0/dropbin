import { getDropByCode } from "@/lib/drops";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  CloudFog,
  Copy,
  Download,
  Eye,
  Clock,
  Flame,
  FileText,
  FileIcon,
  ImageIcon,
  ArrowLeft,
  Check,
} from "lucide-react";
import { CopyButton } from "@/components/CopyButton";

interface PageProps {
  params: Promise<{ code: string }>;
}

export default async function DropViewerPage({ params }: PageProps) {
  const { code } = await params;
  const drop = await getDropByCode(code);
  console.log(drop);
  if (!drop) {
    return (
      <main className="max-w-2xl mx-auto w-full px-6 py-20 flex flex-col items-center justify-center text-center">
        <div className="p-4 rounded-2xl bg-danger/10 text-danger mb-4">
          <Flame className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-serif font-bold text-primary">
          Drop Not Found or Expired
        </h1>
        <p className="mt-2 text-sm text-secondary max-w-md">
          This drop may have reached its view limit, passed its expiration time,
          or the code is incorrect.
        </p>

        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs tracking-wider uppercase hover:bg-surface transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Create New Drop</span>
        </Link>
      </main>
    );
  }

  const formatFileSize = (bytes: number | null): string => {
    if (!bytes) return "Unknown size";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const lineCount = drop.textContent ? drop.textContent.split("\n").length : 0;

  return (
    <main className="max-w-4xl mx-auto w-full px-6 py-12 flex-1 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between pb-6 border-b border-border/80">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="p-2 rounded-xl bg-primary text-accent shadow-xs group-hover:scale-105 transition-transform">
            <CloudFog className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-primary">
              Dropbin
            </h1>
            <p className="text-[11px] text-secondary font-mono">
              ← Back to Dropbin
            </p>
          </div>
        </Link>

        {/* Status badges */}
        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e4e7e1] dark:bg-card border border-border text-secondary">
            <Eye className="w-3.5 h-3.5" />
            <span>
              {drop.views} / {drop.maxViews} views
            </span>
          </div>

          {drop.maxViews === 1 && (
            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-danger/10 border border-danger/30 text-danger font-medium">
              <Flame className="w-3.5 h-3.5" />
              <span>Burn on read</span>
            </div>
          )}
        </div>
      </header>

      {/* Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mt-8 mb-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-secondary font-semibold">
            {drop.type === "image"
              ? "Image Drop"
              : drop.type === "file"
                ? "File Drop"
                : "Text Drop"}
          </span>
          <h2 className="text-3xl font-serif font-bold text-primary mt-0.5">
            /{drop.code}
          </h2>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {drop.type === "text" && drop.textContent && (
            <CopyButton text={drop.textContent} />
          )}

          {drop.downloadUrl && (
            <a
              href={drop.downloadUrl}
              download={drop.fileName || "download"}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-surface text-primary-foreground text-xs font-semibold tracking-wide transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-accent" />
              <span>Download {drop.fileName ? drop.fileName : "File"}</span>
            </a>
          )}
        </div>
      </div>

      {/* Main Content Viewer */}
      {drop.type === "text" && drop.textContent && (
        <div className="rounded-2xl bg-[#f2f4ef] dark:bg-card/70 border border-border/80 overflow-hidden shadow-xs">
          <div className="flex items-center justify-between px-5 py-3 border-b border-border/60 bg-white/40 dark:bg-black/20 font-mono text-xs text-secondary">
            <span>
              {drop.textContent.length} characters • {lineCount}{" "}
              {lineCount === 1 ? "line" : "lines"}
            </span>
            <span>UTF-8 Encoded</span>
          </div>
          <pre className="p-5 overflow-x-auto font-mono text-sm leading-relaxed text-foreground select-text whitespace-pre-wrap break-all">
            {drop.textContent}
          </pre>
        </div>
      )}

      {drop.type === "image" && (
        <div className="rounded-2xl bg-[#f2f4ef] dark:bg-card/70 border border-border/80 p-6 flex flex-col items-center">
          {drop.downloadUrl ? (
            <div className="max-h-[600px] overflow-hidden rounded-xl border border-border/60 bg-white dark:bg-black/20 p-2">
              <img
                src={drop.downloadUrl}
                alt={drop.fileName || "Uploaded Image"}
                className="max-h-[560px] object-contain rounded-lg"
              />
            </div>
          ) : (
            <p className="text-sm text-secondary">Image preview unavailable.</p>
          )}

          <div className="mt-4 flex items-center gap-4 text-xs font-mono text-secondary">
            <span>{drop.fileName}</span>
            <span>•</span>
            <span>{formatFileSize(drop.fileSize)}</span>
          </div>
        </div>
      )}

      {drop.type === "file" && (
        <div className="rounded-2xl bg-[#f2f4ef] dark:bg-card/70 border border-border/80 p-8 flex flex-col items-center text-center">
          <div className="p-4 rounded-2xl bg-white dark:bg-card shadow-xs text-primary mb-4">
            <FileIcon className="w-10 h-10 stroke-[1.8]" />
          </div>

          <h3 className="text-xl font-bold text-foreground font-mono">
            {drop.fileName || "Attached File"}
          </h3>
          <p className="mt-1 text-sm font-mono text-secondary">
            {formatFileSize(drop.fileSize)} •{" "}
            {drop.mimeType || "application/octet-stream"}
          </p>

          {drop.downloadUrl && (
            <a
              href={drop.downloadUrl}
              download={drop.fileName || "download"}
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-surface text-primary-foreground text-sm font-semibold tracking-wide transition-all shadow-xs"
            >
              <Download className="w-4 h-4 text-accent" />
              <span>Download File</span>
            </a>
          )}
        </div>
      )}
    </main>
  );
}
