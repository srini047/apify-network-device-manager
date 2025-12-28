"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { MongoDBConnector } from "@/components/dashboard/mongodb-connector";
import { NetworkStats } from "@/components/dashboard/network-stats";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Server, Activity, Shield } from "lucide-react";
import { TerminalChat } from "@/components/dashboard/terminal-chat";

export default function AnalyticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [uri, setUri] = useState<string>("");

  return (
    <main className="min-h-screen bg-background relative overflow-hidden selection:bg-primary/30">
      <div className="absolute inset-0 tech-grid pointer-events-none" />

      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col md:flex-row items-start justify-between gap-6 mb-12">
          <div className="flex-1">
            <h1 className="text-4xl font-black tracking-tight mb-2 uppercase italic text-balance">
              Network <span className="text-primary">Intelligence</span>{" "}
              Dashboard
            </h1>
            <p className="text-muted-foreground max-w-xl text-pretty leading-relaxed">
              Real-time monitoring and analysis of your infrastructure. Connect
              your MongoDB cluster to unlock AI-driven diagnostics.
            </p>
          </div>
          <div className="w-full md:w-[450px]">
            <MongoDBConnector
              onConnect={(data, connectionUri) => {
                setStats(data);
                setUri(connectionUri);
              }}
            />
          </div>
        </div>

        {stats && (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
            <NetworkStats stats={stats} />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7">
                <Card className="glass-card overflow-hidden">
                  <Tabs defaultValue="devices" className="w-full">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-border/40">
                      <h3 className="font-bold uppercase tracking-widest text-xs opacity-70">
                        Infrastructure Registry
                      </h3>
                      <TabsList className="bg-muted/50">
                        <TabsTrigger value="devices" className="gap-2">
                          <Server className="h-3.5 w-3.5" /> Devices
                        </TabsTrigger>
                        <TabsTrigger value="runs" className="gap-2">
                          <Activity className="h-3.5 w-3.5" /> Runs
                        </TabsTrigger>
                      </TabsList>
                    </div>

                    <TabsContent value="devices" className="p-0 m-0">
                      <div className="overflow-x-auto">
                        {stats.devices.list.length > 0 ? (
                          <table className="w-full text-sm text-left">
                            <thead className="bg-muted/30 text-muted-foreground uppercase text-[10px] font-bold tracking-widest border-b border-border/40">
                              <tr>
                                <th className="px-6 py-4">Hostname</th>
                                <th className="px-6 py-4">IP Address</th>
                                <th className="px-6 py-4">Label</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Health</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border/30">
                              {stats.devices.list.map((device: any) => (
                                <tr
                                  key={device._id}
                                  className="hover:bg-primary/5 transition-colors group"
                                >
                                  <td className="px-6 py-4 font-mono text-primary group-hover:underline">
                                    {device.hostname || "N/A"}
                                  </td>
                                  <td className="px-6 py-4 text-muted-foreground">
                                    {device.ip_address || "N/A"}
                                  </td>
                                  <td className="px-6 py-4 font-medium">
                                    {device.label || "N/A"}
                                  </td>
                                  <td className="px-6 py-4">
                                    <span
                                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                        device.status === "active"
                                          ? "bg-accent/10 text-accent border border-accent/20"
                                          : "bg-muted text-muted-foreground"
                                      }`}
                                    >
                                      {device.status || "unknown"}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                      <div
                                        className={`h-1.5 w-1.5 rounded-full ${
                                          device.last_health_status ===
                                          "healthy"
                                            ? "bg-accent"
                                            : "bg-destructive"
                                        }`}
                                      />
                                      <span className="text-[10px] uppercase font-bold tracking-widest">
                                        {device.last_health_status || "unknown"}
                                      </span>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <div className="p-8 text-center text-muted-foreground text-sm">
                            No devices found in database
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="runs" className="p-0 m-0">
                      <div className="overflow-x-auto">
                        {stats.collections.recentRuns.length > 0 ? (
                          <table className="w-full text-sm text-left">
                            <thead className="bg-muted/30 text-muted-foreground uppercase text-[10px] font-bold tracking-widest border-b border-border/40">
                              <tr>
                                <th className="px-6 py-4">Run ID</th>
                                <th className="px-6 py-4">Processed</th>
                                <th className="px-6 py-4">Success</th>
                                <th className="px-6 py-4">Alerts</th>
                                <th className="px-6 py-4">Duration</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border/30">
                              {stats.collections.recentRuns.map((run: any) => (
                                <tr
                                  key={run._id}
                                  className="hover:bg-primary/5 transition-colors"
                                >
                                  <td className="px-6 py-4 font-mono text-xs">
                                    {run.run_id || "N/A"}
                                  </td>
                                  <td className="px-6 py-4 font-bold">
                                    {run.devices_processed || 0}
                                  </td>
                                  <td className="px-6 py-4 text-accent">
                                    {run.devices_successful || 0}
                                  </td>
                                  <td className="px-6 py-4 text-destructive font-bold">
                                    {run.total_alerts || 0}
                                  </td>
                                  <td className="px-6 py-4 text-muted-foreground">
                                    {run.duration_seconds || 0}s
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <div className="p-8 text-center text-muted-foreground text-sm">
                            No collection runs found in database
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </Card>
              </div>

              <div className="lg:col-span-5 space-y-6">
                <TerminalChat uri={uri} context={stats} />

                <Card className="glass-card p-6 border-accent/20 bg-accent/5">
                  <div className="flex items-center gap-2 mb-4">
                    <Shield className="h-5 w-5 text-accent" />
                    <h3 className="font-bold uppercase tracking-wider text-sm">
                      Security Overview
                    </h3>
                  </div>
                  <div className="space-y-4">
                    <div className="p-3 bg-background/50 rounded-lg border border-border/50">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">
                        Critical Vulnerabilities
                      </p>
                      <p className="text-xl font-black text-destructive">
                        {stats.devices?.critical || 0}
                      </p>
                    </div>
                    <div className="p-3 bg-background/50 rounded-lg border border-border/50">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">
                        Failed Login Attempts
                      </p>
                      <p className="text-xl font-black text-accent">
                        {stats.devices.list.reduce(
                          (sum: number, d: any) => sum + (d.failed_logins || 0),
                          0
                        )}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
