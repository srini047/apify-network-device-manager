"use client";

import { Card } from "@/components/ui/card";
import { Copy, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function JsonEditor({ data }: { data: any }) {
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));

      toast.success("Copied to clipboard", {
        description: "JSON payload has been copied to your clipboard.",
      });
    } catch {
      toast.error("Copy failed", {
        description: "Clipboard access was denied.",
      });
    }
  };

  return (
    <Card className="bg-zinc-950 border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-900/50">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-primary" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            Payload
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-zinc-500 hover:text-zinc-300"
          onClick={copyToClipboard}
        >
          <Copy className="h-3 w-3" />
        </Button>
      </div>
      <div className="p-4 overflow-x-auto">
        <pre className="text-[12px] font-mono leading-relaxed text-zinc-300">
          <code>{JSON.stringify(data, null, 2)}</code>
        </pre>
      </div>
    </Card>
  );
}
