/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
let code = fs.readFileSync('src/lib/audit-engine.ts', 'utf8');
code = code.replace(/Inr/g, 'Usd');
code = code.replace(/formatInr/g, 'formatUsd');
code = code.replace(/Rs /g, '$');
code = code.replace(/INR/g, 'USD');

const startToolNames = code.indexOf('const TOOL_NAMES: Record<string, string> = {');
const endToolNames = code.indexOf('};', startToolNames) + 2;

const newToolNames = `const TOOL_NAMES: Record<string, string> = {
  cursor: "Cursor",
  copilot: "GitHub Copilot",
  claude: "Claude",
  chatgpt: "ChatGPT",
  gemini: "Gemini",
  v0: "v0",
  windsurf: "Windsurf",
  api_anthropic_sonnet: "Anthropic API (Claude Sonnet 4)",
  api_anthropic_haiku: "Anthropic API (Claude Haiku 3.5)",
  api_openai_gpt5_4: "OpenAI API (GPT-5.4)",
  api_openai_4o_mini: "OpenAI API (GPT-4o-mini)",
  api_gemini_3_pro: "Gemini API (Gemini 2.5 Pro)",
  api_gemini_flash: "Gemini API (Gemini 2.5 Flash)",
};`;
code = code.substring(0, startToolNames) + newToolNames + code.substring(endToolNames);

const startSubPricing = code.indexOf('const SUBSCRIPTION_PRICING: Record<string, Record<string, SubscriptionPlanPrice>> = {');
const endSubPricing = code.indexOf('};', startSubPricing) + 2;

const newSubPricing = `const SUBSCRIPTION_PRICING: Record<string, Record<string, SubscriptionPlanPrice>> = {
  cursor: {
    hobby: { priceInUsd: 0, billing: "flat" },
    pro: { priceInUsd: 20, billing: "flat" },
    business: { priceInUsd: 40, billing: "per_seat" },
    enterprise: { priceInUsd: 40, billing: "per_seat" },
  },
  copilot: {
    individual: { priceInUsd: 10, annualMonthlyPriceInUsd: 8.33, billing: "flat" },
    business: { priceInUsd: 19, billing: "per_seat" },
    enterprise: { priceInUsd: 39, billing: "per_seat" },
  },
  claude: {
    free: { priceInUsd: 0, billing: "flat" },
    pro: { priceInUsd: 20, billing: "flat" },
    max: { priceInUsd: 40, billing: "flat" },
    team: { priceInUsd: 30, annualMonthlyPriceInUsd: 25, billing: "per_seat" },
    enterprise: { priceInUsd: 40, billing: "per_seat" },
  },
  chatgpt: {
    plus: { priceInUsd: 20, billing: "flat" },
    team: { priceInUsd: 30, annualMonthlyPriceInUsd: 25, billing: "per_seat" },
    enterprise: { priceInUsd: 40, billing: "per_seat" },
  },
  gemini: {
    pro: { priceInUsd: 0, billing: "flat" },
    ultra: { priceInUsd: 20, billing: "flat" },
  },
  windsurf: {
    free: { priceInUsd: 0, billing: "flat" },
    pro: { priceInUsd: 15, billing: "flat" },
  },
  v0: {
    free: { priceInUsd: 0, billing: "flat" },
    premium: { priceInUsd: 20, billing: "flat" },
  }
};`;
code = code.substring(0, startSubPricing) + newSubPricing + code.substring(endSubPricing);

const startApiPricing = code.indexOf('const API_PRICING: Record<string, ApiModelPrice> = {');
const endApiPricing = code.indexOf('};', startApiPricing) + 2;

const newApiPricing = `const API_PRICING: Record<string, ApiModelPrice> = {
  api_anthropic_sonnet: { inputPerMillionUsd: 3, outputPerMillionUsd: 15 },
  api_openai_gpt5_4: { inputPerMillionUsd: 2.5, outputPerMillionUsd: 15 },
  api_gemini_3_pro: { inputPerMillionUsd: 1.25, outputPerMillionUsd: 10 },
  api_anthropic_haiku: { inputPerMillionUsd: 0.8, outputPerMillionUsd: 4 },
  api_openai_4o_mini: { inputPerMillionUsd: 0.15, outputPerMillionUsd: 0.6 },
  api_gemini_flash: { inputPerMillionUsd: 0.075, outputPerMillionUsd: 0.3 },
};`;
code = code.substring(0, startApiPricing) + newApiPricing + code.substring(endApiPricing);

fs.writeFileSync('src/lib/audit-engine.ts', code);
console.log('updated audit-engine.ts');
