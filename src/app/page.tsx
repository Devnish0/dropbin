"use client";

import { useState } from "react";
import { CloudFog, Sparkles, Loader2, AlertCircle } from "lucide-react";
import { DropTypeToggle, DropType } from "@/components/DropTypeToggle";
import { PasteEditor } from "@/components/PasteEditor";
import { FileDropzone } from "@/components/FileDropzone";
import { DropSettings } from "@/components/DropSettings";
import { DropSuccessModal } from "@/components/DropSuccessModal";
import { ExpiryDuration } from "@/lib/expiry";

export default function Home() {
  const [dropType, setDropType] = useState<DropType>("text");
  const [textContent, setTextContent] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Settings
  const [customCode, setCustomCode] = useState("");
  const [duration, setDuration] = useState<ExpiryDuration>("30m");
  const [maxViews, setMaxViews] = useState(100);

  // Submission State
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdDrop, setCreatedDrop] = useState<{
    code: string;
    type: "text" | "image" | "file";
    maxViews: number;
  } | null>(null);

  const handleReset = () => {
    setTextContent("");
    setSelectedFile(null);
    setCustomCode("");
    setErrorMessage(null);
    setCreatedDrop(null);
  };

  const handleCreateDrop = async () => {
    setErrorMessage(null);

    // Basic frontend checks
    if (dropType === "text" && !textContent.trim()) {
      setErrorMessage("Please enter some text or secret note to create a drop.");
      return;
    }
    if (dropType === "file" && !selectedFile) {
      setErrorMessage("Please select or drop a file to upload.");
      return;
    }

    setIsLoading(true);

    try {
      if (dropType === "text") {
        // -------------------------------------------------------------
        // Text Drop Flow
        // -------------------------------------------------------------
        const res = await fetch("/api/drop", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "text",
            textContent: textContent.trim(),
            code: customCode.trim() || undefined,
            duration,
            maxViews,
          }),
        });

        const data = await res.json();
        if (!data.success) {
          throw new Error(data.error || "Failed to create drop.");
        }

        setCreatedDrop({
          code: data.drop.code,
          type: "text",
          maxViews: data.drop.maxViews,
        });
      } else if (selectedFile) {
        // -------------------------------------------------------------
        // 3-Step Direct-to-R2 File Drop Flow
        // -------------------------------------------------------------
        // Step 1: Request presigned upload URL
        const presignRes = await fetch("/api/upload/presigned-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: selectedFile.name,
            contentType: selectedFile.type || "application/octet-stream",
            fileSize: selectedFile.size,
          }),
        });

        const presignData = await presignRes.json();
        if (!presignData.uploadUrl) {
          throw new Error(presignData.error || "Failed to get upload authorization.");
        }

        // Step 2: Upload raw file bytes directly to Cloudflare R2
        const uploadRes = await fetch(presignData.uploadUrl, {
          method: "PUT",
          headers: {
            "Content-Type": selectedFile.type || "application/octet-stream",
          },
          body: selectedFile,
        });

        if (!uploadRes.ok) {
          throw new Error("Failed to upload file to Cloudflare storage.");
        }

        // Step 3: Register drop in PostgreSQL
        const isImage = selectedFile.type.startsWith("image/");
        const dropRes = await fetch("/api/drop", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: isImage ? "image" : "file",
            fileKey: presignData.fileKey,
            fileName: selectedFile.name,
            fileSize: selectedFile.size,
            mimeType: selectedFile.type || "application/octet-stream",
            code: customCode.trim() || undefined,
            duration,
            maxViews,
          }),
        });

        const finalDropData = await dropRes.json();
        if (!finalDropData.success) {
          throw new Error(finalDropData.error || "Failed to save drop metadata.");
        }

        setCreatedDrop({
          code: finalDropData.drop.code,
          type: finalDropData.drop.type,
          maxViews: finalDropData.drop.maxViews,
        });
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="max-w-4xl mx-auto w-full px-6 py-12 flex-1 flex flex-col">
      {/* 1. Header */}
      <header className="flex items-center justify-between pb-8 border-b border-border/80">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary text-accent shadow-xs">
            <CloudFog className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-primary">Dropbin</h1>
            <p className="text-xs text-secondary font-mono">Secure Ephemeral Storage</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-mono font-medium text-primary">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live
          </span>
        </div>
      </header>

      {/* 2. Headline & Toggle */}
      <div className="mt-8 mb-6">
        <h2 className="text-4xl sm:text-5xl font-serif text-primary leading-tight">
          Drop text, images, or files
        </h2>
        <p className="mt-2 text-sm text-secondary">
          Store with an optional custom code and share with an automatic expiration.
        </p>

        {!createdDrop && (
          <div className="mt-6">
            <DropTypeToggle value={dropType} onChange={setDropType} />
          </div>
        )}
      </div>

      {/* 3. Main Content Area */}
      {createdDrop ? (
        <DropSuccessModal
          code={createdDrop.code}
          type={createdDrop.type}
          maxViews={createdDrop.maxViews}
          onReset={handleReset}
        />
      ) : (
        <div className="flex flex-col gap-6">
          {/* Active Editor */}
          {dropType === "text" ? (
            <PasteEditor value={textContent} onChange={setTextContent} />
          ) : (
            <FileDropzone file={selectedFile} onFileSelect={setSelectedFile} />
          )}

          {/* Settings Bar */}
          <DropSettings
            customCode={customCode}
            onCustomCodeChange={setCustomCode}
            duration={duration}
            onDurationChange={setDuration}
            maxViews={maxViews}
            onMaxViewsChange={setMaxViews}
          />

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="flex items-center gap-2.5 p-4 rounded-xl bg-danger/10 border border-danger/30 text-danger text-sm font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end pt-2">
            <button
              type="button"
              disabled={isLoading}
              onClick={handleCreateDrop}
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-primary hover:bg-surface text-primary-foreground font-semibold text-sm shadow-sm hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer group"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-accent" />
                  <span>Encrypting & Storing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-accent transition-transform group-hover:scale-110" />
                  <span>Create Drop</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
