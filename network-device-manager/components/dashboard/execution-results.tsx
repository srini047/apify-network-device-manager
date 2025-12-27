"use client";

import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";

export function ExecutionResults({ results }: { results: any }) {
  const items: any[] = results?.items ?? [];

  const totals = items.reduce(
    (acc, it) => {
      acc.total_commands += it.total_commands ?? 0;
      acc.successful += it.successful ?? 0;
      acc.failed += it.failed ?? 0;
      return acc;
    },
    { total_commands: 0, successful: 0, failed: 0 }
  );

  const successRate =
    totals.total_commands > 0
      ? Math.round((totals.successful / totals.total_commands) * 10000) / 100
      : 0;

  return (
    <Card className="glass-card p-6 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold">Execution Output</h3>
        <div className="flex items-center gap-4 text-sm font-medium">
          <div className="flex items-center gap-1.5 text-accent">
            <CheckCircle2 className="h-4 w-4" /> {totals.successful} Success
          </div>
          <div className="flex items-center gap-1.5 text-destructive">
            <XCircle className="h-4 w-4" /> {totals.failed} Failed
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="h-4 w-4" /> {results?.duration ?? "-"}
          </div>
        </div>
      </div>

      <Tabs defaultValue="table" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted/50 p-1">
          <TabsTrigger value="table">Dataset Table</TabsTrigger>
          <TabsTrigger value="raw">Key-Value Store</TabsTrigger>
        </TabsList>
        <TabsContent
          value="table"
          className="border border-border/50 rounded-lg overflow-hidden"
        >
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="px-4 py-3">Device</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Cmds</th>
                <th className="px-4 py-3">Success Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">
                    No results yet
                  </td>
                </tr>
              ) : (
                items.map((it, idx) => {
                  const sr =
                    it.success_rate ??
                    (it.total_commands
                      ? Math.round((it.successful / it.total_commands) * 100) + "%"
                      : "-");
                  return (
                    <tr key={idx} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-4 font-mono">{it.device}</td>
                      <td className="px-4 py-4">{it.username}</td>
                      <td className="px-4 py-4">
                        <span
                          className={`flex items-center gap-1.5 ${
                            (it.failed ?? 0) > 0 ? "text-destructive" : "text-accent"
                          }`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full animate-pulse ${
                              (it.failed ?? 0) > 0 ? "bg-destructive" : "bg-accent"
                            }`}
                          />
                          {it.status ?? (it.failed ? "Failed" : "Connected")}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        {it.successful ?? 0}/{it.total_commands ?? "-"}
                      </td>
                      <td className="px-4 py-4 font-bold">{sr}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </TabsContent>
        <TabsContent value="raw">
          <div className="bg-zinc-950 p-4 rounded-lg font-mono text-xs text-zinc-300 min-h-[200px] border border-zinc-800">
            <div className="flex items-center gap-2 mb-2 text-primary opacity-80">
              <AlertCircle className="h-3 w-3" />
              <span>Raw Actor Output</span>
            </div>
            <pre className="whitespace-pre-wrap break-words text-zinc-400 text-xs">
              {JSON.stringify(results ?? { items }, null, 2)}
            </pre>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
