/**
 * CopyLinkButton — Client Component
 *
 * Copies the current page URL (or a provided URL) to the clipboard
 * and shows a brief "Copied!" confirmation.
 */

"use client";

import { useState } from "react";

interface CopyLinkButtonProps {
  url?: string;
  label?: string;
}

export default function CopyLinkButton({
  url,
  label = "Copy Link",
}: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);

  const handleCopy = async () => {
    const textToCopy = url
      ? new URL(url, window.location.origin).href
      : window.location.href;
    setFailed(false);

    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("Clipboard API unavailable");
      }
      await navigator.clipboard.writeText(textToCopy);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = textToCopy;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      const copiedWithFallback = document.execCommand("copy");
      document.body.removeChild(textarea);
      if (!copiedWithFallback) {
        setFailed(true);
        setTimeout(() => setFailed(false), 2500);
        return;
      }
    }

    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 border ${
        copied
          ? "bg-success/20 border-success/40 text-success"
          : "bg-surface-elevated border-border text-foreground/70 hover:bg-accent-primary/20 hover:text-accent-primary hover:border-accent-primary/30"
      }`}
      aria-label={copied ? "Link copied to clipboard" : label}
    >
      {failed ? (
        <span className="flex items-center gap-1.5">Copy failed</span>
      ) : copied ? (
        <span className="flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          Copied!
        </span>
      ) : (
        <span className="flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9.75a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
          </svg>
          {label}
        </span>
      )}
    </button>
  );
}
