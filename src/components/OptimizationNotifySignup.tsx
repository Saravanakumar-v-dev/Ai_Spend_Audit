"use client";

import { useState } from "react";

interface OptimizationNotifySignupProps {
  defaultEmail?: string;
  muted?: boolean;
}

export default function OptimizationNotifySignup({
  defaultEmail = "",
  muted = false,
}: OptimizationNotifySignupProps) {
  const [email, setEmail] = useState(defaultEmail);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle"
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("request failed");
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  const cardTone = muted
    ? "border-border/70 bg-background/70"
    : "border-success/30 bg-success/5";

  return (
    <div className={`rounded-2xl border p-8 text-center backdrop-blur ${cardTone}`}>
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/15 text-success mb-5 mx-auto">
        <span className="text-3xl leading-none">✉️</span>
      </div>
      <h2 className="text-2xl font-bold mb-3 text-foreground">
        You&apos;re spending well — stay ahead anyway
      </h2>
      <p className="text-foreground/70 max-w-2xl mx-auto mb-6 leading-relaxed">
        We refuse to hallucinate vendor savings below{" "}
        <span className="font-semibold text-foreground">
          realistic USD benchmarks
        </span>
        . Drop your email and we&apos;ll ping you whenever new optimizations
        match your footprint.
      </p>
      {status === "done" ? (
        <p className="font-semibold text-success">
          Noted — we&apos;ll reach out when fresh levers land.
        </p>
      ) : (
        <form
          onSubmit={submit}
          className="max-w-xl mx-auto flex flex-col sm:flex-row gap-3"
        >
          <input
            type="email"
            required
            id="notify-email"
            aria-label="Email address for notifications"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="flex-1 rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:ring-2 focus:ring-accent-primary outline-none shadow-inner shadow-black/5"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="rounded-xl bg-foreground text-background px-6 py-3 text-sm font-bold transition hover:bg-foreground/90 disabled:opacity-40"
          >
            {status === "loading" ? "Saving…" : "Notify me"}
          </button>
        </form>
      )}
      {status === "error" && (
        <p className="mt-4 text-danger text-sm">
          Something went wrong — retry in a minute.
        </p>
      )}
    </div>
  );
}
