import { apiPriceFootnote } from "@/lib/pricing-catalog";

/** UI row for picker — engine plan slugs must match `audit-engine` SUBSCRIPTION_PRICING_PUBLIC keys */
export interface AuditToolChoice {
  slug: string;
  name: string;
  icon: string;
  headline: string;
  options: {
    /** Plan key stored in validators / engine */
    planName: string;
    label: string;
    helper?: string;
    /** Per-seat tools default quantity to engineering team count */
    perSeat?: boolean;
  }[];
  /** Hint text for APIs (USD / 1M tokens) */
  modelRatesNote?: string;
}

export const AUDIT_TOOL_CHOICES: AuditToolChoice[] = [
  {
    slug: "cursor",
    name: "Cursor",
    icon: "💻",
    headline: "Hobby · Pro · Business · Enterprise",
    options: [
      { planName: "hobby", label: "Hobby · $0" },
      { planName: "pro", label: "Pro · $20/mo" },
      {
        planName: "business",
        label: "Business · ~$40 seat/mo",
        perSeat: true,
      },
      {
        planName: "enterprise",
        label: "Enterprise · ~$45 seat/mo",
        perSeat: true,
      },
    ],
  },
  {
    slug: "copilot",
    name: "GitHub Copilot",
    icon: "🐙",
    headline: "Individual · Business · Enterprise",
    options: [
      {
        planName: "individual",
        label: "Individual · ~$10 dev/mo (or ~$100/yr)",
      },
      { planName: "business", label: "Business · ~$19 seat/mo", perSeat: true },
      {
        planName: "enterprise",
        label: "Enterprise · ~$39 seat/mo",
        perSeat: true,
      },
    ],
  },
  {
    slug: "claude",
    name: "Claude (Anthropic)",
    icon: "🤖",
    headline: "Free · Pro · Max · Team · Enterprise",
    options: [
      { planName: "free", label: "Free · $0" },
      { planName: "pro", label: "Pro · ~$20/mo" },
      { planName: "max", label: "Max · ~$100/mo", helper: "Frontier power-user tier" },
      { planName: "team", label: "Team · ~$30 seat/mo", perSeat: true },
      {
        planName: "enterprise",
        label: "Enterprise · ~$45 seat/mo",
        perSeat: true,
      },
    ],
  },
  {
    slug: "chatgpt",
    name: "ChatGPT",
    icon: "💬",
    headline: "Plus · Team · Enterprise",
    options: [
      { planName: "plus", label: "Plus · ~$20/mo" },
      { planName: "team", label: "Team · ~$30 seat/mo", perSeat: true },
      {
        planName: "enterprise",
        label: "Enterprise · ~$60 seat/mo",
        perSeat: true,
      },
    ],
  },
  {
    slug: "api_anthropic_sonnet",
    name: "Anthropic API · direct bill",
    icon: "⚡️",
    headline: "Programmatic Claude (frontier throughput)",
    modelRatesNote:
      apiPriceFootnote("api_anthropic_sonnet") ?? undefined,
    options: [{ planName: "api_usage", label: "Tracked via token meter" }],
  },
  {
    slug: "api_openai_gpt5_4",
    name: "OpenAI API · direct bill",
    icon: "🔌",
    headline: "Programmatic GPT frontier family",
    modelRatesNote: apiPriceFootnote("api_openai_gpt5_4") ?? undefined,
    options: [{ planName: "api_usage", label: "Tracked via token meter" }],
  },
  {
    slug: "gemini",
    name: "Gemini (Google AI)",
    icon: "✨",
    headline: "Pro · Ultra subscriptions",
    options: [
      { planName: "pro", label: "Gemini Advanced / Pro bundle · ~$20/mo" },
      { planName: "ultra", label: "Ultra / pooled AI · ~$20/mo" },
    ],
  },
  {
    slug: "api_gemini_3_pro",
    name: "Gemini API · direct bill",
    icon: "🛰️",
    headline: "Gemini developer API (Pro tier)",
    modelRatesNote: apiPriceFootnote("api_gemini_3_pro") ?? undefined,
    options: [{ planName: "api_usage", label: "Tracked via token meter" }],
  },
  {
    slug: "v0",
    name: "v0 by Vercel",
    icon: "🖌️",
    headline: "UI generation (alternate to Windsurf-class surf tools)",
    options: [
      { planName: "free", label: "Free tier · $0" },
      { planName: "premium", label: "Premium · ~$20/mo", helper: "Higher limits / export" },
    ],
  },
];
