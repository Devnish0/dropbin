"use client";

import { useState, useRef } from "react";
import { UploadCloud, FileIcon, ImageIcon, X, CheckCircle2 } from "lucide-react";

interface FileDropzoneProps {
  file: File | null;
  onFileSelect: (file: File | null) => void;
}

export function FileDropzone({ file, onFileSelect }: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const isImage = file?.type.startsWith("image/");

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            onFileSelect(e.target.files[0]);
          }
        }}
      />

      {!file ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex flex-col items-center justify-center min-h-[340px] rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? "border-primary bg-primary/5 scale-[0.99]"
              : "border-border/80 bg-[#f2f4ef] dark:bg-card/70 hover:border-primary/50 hover:bg-[#eef1ea] dark:hover:bg-card/90"
          }`}
        >
          <div className="p-4 rounded-2xl bg-white dark:bg-card shadow-xs text-primary mb-4">
            <UploadCloud className="w-8 h-8 stroke-[1.8]" />
          </div>

          <h3 className="text-base font-semibold text-primary">
            Click to upload or drag and drop
          </h3>
          <p className="mt-1 text-sm text-secondary">
            Images (PNG, JPG, WebP), PDFs, ZIPs, or documents
          </p>

          <div className="mt-5 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-border/60 text-xs font-mono text-secondary">
            <span>Direct to R2</span>
            <span>•</span>
            <span>Up to 100 MB</span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col justify-between min-h-[340px] rounded-2xl bg-[#f2f4ef] dark:bg-card/70 border border-border/80 p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3.5 rounded-xl bg-white dark:bg-card shadow-xs text-primary">
                {isImage ? (
                  <ImageIcon className="w-6 h-6" />
                ) : (
                  <FileIcon className="w-6 h-6" />
                )}
              </div>

              <div>
                <p className="text-sm font-semibold text-foreground truncate max-w-[280px] sm:max-w-[420px]">
                  {file.name}
                </p>
                <div className="flex items-center gap-2 mt-0.5 text-xs font-mono text-secondary">
                  <span>{formatFileSize(file.size)}</span>
                  <span>•</span>
                  <span>{file.type || "binary"}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onFileSelect(null)}
              className="p-1.5 rounded-lg text-secondary hover:text-foreground hover:bg-border/50 transition-colors cursor-pointer"
              title="Remove file"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Image preview thumbnail if applicable */}
          {isImage && (
            <div className="my-4 flex items-center justify-center p-3 rounded-xl bg-white/60 dark:bg-black/20 border border-border/40 max-h-[160px] overflow-hidden">
              <img
                src={URL.createObjectURL(file)}
                alt="Upload preview"
                className="max-h-[140px] object-contain rounded-lg"
              />
            </div>
          )}

          <div className="flex items-center justify-between pt-4 mt-auto border-t border-border/40 text-xs font-mono text-secondary">
            <div className="flex items-center gap-1.5 text-[#004838] dark:text-[#e2fb6c] font-medium">
              <CheckCircle2 className="w-4 h-4" />
              <span>Ready for upload</span>
            </div>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="hover:underline text-secondary cursor-pointer"
            >
              Change file
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
