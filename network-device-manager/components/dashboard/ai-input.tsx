"use client";

import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { BrainCircuit, AlertTriangle, Key, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

interface AIUpdate {
  problemDescription?: string;
  includeWarnCommands?: boolean;
  cohereApiKey?: string;
}

export function AIInput({
  value,
  includeWarn,
  apiKey,
  onChange,
}: {
  value: string;
  includeWarn: boolean;
  apiKey: string;
  onChange: (u: AIUpdate) => void;
}) {
  const [showKey, setShowKey] = useState(false);

  return (
    <Card className="glass-card p-6 border-primary/20 bg-primary/5">
      <div className="flex items-center gap-2 mb-4">
        <BrainCircuit className="h-5 w-5 text-primary" />
        <h3 className="font-bold">AI Command Generation</h3>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label className="text-sm font-semibold flex items-center justify-between">
            Problem Description
            <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded uppercase">
              Experimental
            </span>
          </Label>
          <Textarea
            placeholder="Describe the network issue here... (e.g., High CPU usage on eth0, or interface dropping packets)"
            className="min-h-[100px] resize-none bg-background/50"
            value={value}
            onChange={(e) => onChange({ problemDescription: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center space-x-3 bg-background/40 p-3 rounded-lg border border-border/50">
            <Switch
              id="warn-mode"
              checked={includeWarn}
              onCheckedChange={(checked) =>
                onChange({ includeWarnCommands: checked })
              }
            />
            <div className="grid gap-1.5 leading-none">
              <Label
                htmlFor="warn-mode"
                className="text-sm font-medium leading-none flex items-center gap-2"
              >
                Include WARN commands
                <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
              </Label>
              <p className="text-xs text-muted-foreground">
                Allow potentially disruptive diagnostic actions.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Key className="h-3.5 w-3.5 text-muted-foreground" />
              Cohere API Key
            </Label>
            <div className="relative">
              <Input
                type={showKey ? "text" : "password"}
                placeholder="co-..."
                className="h-9 bg-background/50 pr-10"
                value={apiKey}
                onChange={(e) => onChange({ cohereApiKey: e.target.value })}
              />
              {/* added button for password visibility */}
              <button
                className="absolute right-1 top-1 h-7 w-7 text-muted-foreground/50 hover:text-foreground"
                type="button"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? (
                  <EyeOff className="h-3.5 w-3.5" />
                ) : (
                  <Eye className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
