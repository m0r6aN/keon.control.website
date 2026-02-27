"use client";

import { Check, Copy } from "lucide-react";
import * as React from "react";

interface CommandSnippetProps {
  command: string;
}

export function CommandSnippet({ command }: CommandSnippetProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy command:", error);
    }
  };

  return (
    <div className="relative rounded border border-[#384656] bg-[#0B0C10] p-3 text-[13px] leading-snug text-[--steel]">
      <pre className="m-0 overflow-x-auto font-mono text-sm leading-snug whitespace-pre-wrap">
        <code>{command}</code>
      </pre>
      <button
        type="button"
        onClick={handleCopy}
        className="absolute right-3 top-3 flex items-center gap-1 rounded border border-transparent px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-[--steel] transition-colors hover:border-[--reactor-blue] hover:text-[--reactor-glow]"
      >
        {copied ? <Check className="h-3 w-3 text-[--reactor-glow]" /> : <Copy className="h-3 w-3 text-[--steel]" />}
        <span>{copied ? "Copied" : "Copy"}</span>
      </button>
    </div>
  );
}
