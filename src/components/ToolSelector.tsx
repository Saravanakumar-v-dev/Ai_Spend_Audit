/**
 * ToolSelector — Client Component (Placeholder)
 *
 * Interactive tool/plan picker that shows pricing previews as
 * users select their AI tools. Will be populated from the
 * pricing_data table.
 *
 * NOTE: Placeholder — full implementation after pricing verification.
 */

"use client";

interface ToolSelectorProps {
  onSelectionChange?: (selections: ToolSelection[]) => void;
}

interface ToolSelection {
  toolSlug: string;
  planName: string;
  quantity: number;
}

const TOOL_CATEGORIES = [
  {
    id: "ide",
    label: "IDE / Coding Assistants",
    icon: "💻",
    tools: ["Cursor", "GitHub Copilot", "Windsurf"],
  },
  {
    id: "chatbot",
    label: "AI Chatbots",
    icon: "💬",
    tools: ["ChatGPT", "Claude", "Google Gemini"],
  },
  {
    id: "api",
    label: "API / Developer Platforms",
    icon: "⚡",
    tools: ["OpenAI API", "Anthropic API", "Gemini API"],
  },
  {
    id: "ui_gen",
    label: "UI / Code Generation",
    icon: "🎨",
    tools: ["v0 by Vercel"],
  },
];

export default function ToolSelector({ onSelectionChange }: ToolSelectorProps) {
  void onSelectionChange;

  return (
    <div className="space-y-6">
      {TOOL_CATEGORIES.map((category) => (
        <div key={category.id}>
          <h4 className="text-sm font-semibold text-foreground/50 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span>{category.icon}</span>
            {category.label}
          </h4>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {category.tools.map((tool) => (
              <button
                key={tool}
                type="button"
                className="flex items-center gap-3 rounded-lg border border-border bg-surface p-3 text-left text-sm text-foreground transition-all hover:border-accent-primary hover:bg-surface-elevated group"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-surface-elevated text-foreground/40 group-hover:bg-accent-glow group-hover:text-accent-primary transition-colors">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4.5v15m7.5-7.5h-15"
                    />
                  </svg>
                </div>
                <span className="font-medium">{tool}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
