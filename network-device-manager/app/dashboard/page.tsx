"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { DeviceForm } from "@/components/dashboard/device-form";
import { JsonEditor } from "@/components/dashboard/json-editor";
import { CommandInput } from "@/components/dashboard/command-input";
import { AIInput } from "@/components/dashboard/ai-input";
import { ExecutionResults } from "@/components/dashboard/execution-results";
import { Button } from "@/components/ui/button";
import { Play, RotateCcw, Save, Key, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export default function Dashboard() {
  const [apifyKey, setApifyKey] = useState("");
  const [inputData, setInputData] = useState({
    devices: [
      {
        ip: "192.168.107.3",
        username: "root",
        password: "root",
        port: 22,
      },
    ],
    commands: ["cat /etc/os-release"],
    problemDescription: "",
    includeWarnCommands: false,
    cohereApiKey: "",
  });

  const [isExecuting, setIsExecuting] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [showKey, setShowKey] = useState(false);

  const handleRun = async () => {
    // validate devices have at least one valid IP
    const hasValidIp = inputData.devices?.some((d: any) => {
      const ip = String(d?.ip ?? "").trim();
      // simple IPv4 regex
      return /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}$/.test(
        ip
      );
    });

    if (!hasValidIp) {
      toast.error("Invalid device IP", {
        description: "At least one device must have a valid IPv4 address before running the Actor.",
      });
      return;
    }

    setIsExecuting(true);
    try {
      const response = await fetch("/api/apify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...inputData, apifyToken: apifyKey }),
      });
      const data = await response.json();
      setResults(data);
      if (!data?.error) {
        toast.success("Actor Run Successful", {
          description: `Run ID: ${data?.runId ?? "-"}`,
        });
      } else {
        toast.error("Actor Run Failed", { description: data.error });
      }
    } catch (error) {
      console.error("[v0] Execution error:", error);
      toast.error("Execution error", { description: String(error) });
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column: Inputs */}
          <div className="flex-1 space-y-8">
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold tracking-tight">
                  Configuration
                </h2>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setInputData({ ...inputData })}
                  >
                    <RotateCcw className="mr-2 h-4 w-4" /> Reset
                  </Button>
                  <Button size="sm" onClick={handleRun} disabled={isExecuting}>
                    {isExecuting ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Running...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Play className="h-4 w-4" /> Run Actor
                      </span>
                    )}
                  </Button>
                </div>
              </div>

              <Card className="glass-card p-4 border-accent/20 bg-accent/5">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex items-center gap-2 shrink-0">
                    <Key className="h-4 w-4 text-accent" />
                    <Label htmlFor="apify-key" className="text-sm font-bold">
                      Apify API Token
                    </Label>
                  </div>
                  <div className="relative flex-1 md:flex-initial">
                    <Input
                      id="apify-key"
                      type={showKey ? "text" : "password"}
                      placeholder="apify_api_..."
                      className="h-9 bg-background/50"
                      value={apifyKey}
                      onChange={(e) => setApifyKey(e.target.value)}
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
                  <p className="text-[10px] text-muted-foreground italic md:max-w-xs">
                    Required to trigger the Apify Actor from your browser.
                  </p>
                </div>
              </Card>

              <DeviceForm
                devices={inputData.devices}
                onChange={(devices) => setInputData({ ...inputData, devices })}
              />

              <CommandInput
                commands={inputData.commands}
                onChange={(commands) =>
                  setInputData({ ...inputData, commands })
                }
              />

              <AIInput
                value={inputData.problemDescription}
                includeWarn={inputData.includeWarnCommands}
                apiKey={inputData.cohereApiKey}
                onChange={(update) => setInputData({ ...inputData, ...update })}
              />
            </section>

            {results && <ExecutionResults results={results} />}
          </div>

          {/* Right Column: JSON Preview */}
          <div className="lg:w-96 space-y-4">
            <div className="sticky top-24">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Payload Preview
                </h3>
                <Button variant="ghost" size="sm" className="h-8">
                  <Save className="h-4 w-4 mr-2" /> Export
                </Button>
              </div>
              <JsonEditor data={inputData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
