"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Terminal, Plus, X } from "lucide-react";

export function CommandInput({
  commands,
  onChange,
}: {
  commands: string[];
  onChange: (c: string[]) => void;
}) {
  const addCommand = () => onChange([...commands, ""]);
  const updateCommand = (i: number, val: string) => {
    const next = [...commands];
    next[i] = val;
    onChange(next);
  };
  const removeCommand = (i: number) =>
    onChange(commands.filter((_, idx) => idx !== i));

  return (
    <Card className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Terminal className="h-5 w-5 text-primary" />
          <h3 className="font-bold">Execution Queue</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={addCommand}>
          <Plus className="mr-2 h-4 w-4" /> Add Command
        </Button>
      </div>

      <div className="space-y-3">
        {commands.map((cmd, i) => (
          <div key={i} className="flex gap-2 group">
            <div className="flex-none w-8 flex items-center justify-center text-muted-foreground/30 font-mono text-xs">
              {i + 1}
            </div>
            <div className="flex-1 relative">
              <span className="absolute left-3 top-2.5 text-primary/50 text-xs font-mono">
                $
              </span>
              <Input
                className="font-mono text-sm pl-7 h-9 bg-background/50 focus:bg-background transition-colors"
                value={cmd}
                onChange={(e) => updateCommand(i, e.target.value)}
                placeholder="e.g., uptime"
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => removeCommand(i)}
              aria-label={`Remove command ${i + 1}`}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        {commands.length === 0 && (
          <div className="text-center py-8 text-muted-foreground border-2 border-dashed border-border/50 rounded-lg">
            <p className="text-sm">No manual commands added.</p>
          </div>
        )}
      </div>
    </Card>
  );
}
