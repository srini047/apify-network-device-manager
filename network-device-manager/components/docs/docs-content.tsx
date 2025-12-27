"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ModeFlowDiagram } from "@/components/docs/mode-flow-diagram"
import { Terminal, ShieldCheck, Activity, Database, BookOpen, Settings } from "lucide-react"

export function DocsContent() {
  return (
    <div className="container max-w-7xl py-12 px-4 md:px-6">
      <div className="flex flex-col gap-10">
        {/* Header Section */}
        <div className="space-y-4">
          <Badge
            variant="outline"
            className="px-3 py-1 text-primary border-primary/30 bg-primary/5 uppercase tracking-widest text-[10px] font-bold"
          >
            Documentation v1.0
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">Network Device Manager</h1>
          <p className="text-lg text-muted-foreground max-w-3xl leading-relaxed">
            A comprehensive solution for managing and monitoring network devices with AI-powered diagnostics and
            high-fidelity MongoDB historical collection.
          </p>
        </div>

        {/* Operating Modes Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <BookOpen className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-bold">Operating Modes</h2>
          </div>

          <Tabs defaultValue="ai" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1 rounded-xl h-12">
              <TabsTrigger
                value="manual"
                className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Manual Mode
              </TabsTrigger>
              <TabsTrigger
                value="ai"
                className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                AI Problem Solving
              </TabsTrigger>
              <TabsTrigger
                value="techsupport"
                className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Tech Support
              </TabsTrigger>
            </TabsList>

            <div className="mt-8">
              <TabsContent value="manual">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold">Plain Command Execution</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Execute predefined commands across multiple devices simultaneously. Ideal for routine checks or
                      batch configurations where you know exactly what needs to be run.
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex gap-2">
                        <Terminal className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span>Support for standard Linux/Unix commands via SSH.</span>
                      </li>
                      <li className="flex gap-2">
                        <Terminal className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span>Concurrent execution reduces collection time.</span>
                      </li>
                    </ul>
                  </div>
                  <ModeFlowDiagram mode="manual" />
                </div>
              </TabsContent>

              <TabsContent value="ai">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold">AI-Powered Diagnostics</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Describe your problem in natural language, and our Cohere-powered AI generates a sequence of
                      diagnostic commands specifically targeted at the issue.
                    </p>
                    <div className="flex gap-4 p-4 rounded-xl border border-border/50 bg-muted/30">
                      <div className="flex-1 space-y-2">
                        <div className="text-[10px] font-bold uppercase text-muted-foreground">Example Prompt</div>
                        <div className="text-sm italic">
                          "Server responding slowly, possible memory leak in the web service"
                        </div>
                      </div>
                    </div>
                  </div>
                  <ModeFlowDiagram mode="ai" />
                </div>
              </TabsContent>

              <TabsContent value="techsupport">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold">Comprehensive Monitoring</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Collects 25+ diagnostic metrics across system, hardware, network, and security domains. Data is
                      parsed and persisted to MongoDB for long-term trend analysis.
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <Card className="bg-muted/50 border-none">
                        <CardContent className="p-3 text-center">
                          <Activity className="h-5 w-5 mx-auto mb-1 text-primary" />
                          <div className="text-[10px] font-bold uppercase">Real-time Health</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-muted/50 border-none">
                        <CardContent className="p-3 text-center">
                          <Database className="h-5 w-5 mx-auto mb-1 text-accent" />
                          <div className="text-[10px] font-bold uppercase">MongoDB Export</div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                  <ModeFlowDiagram mode="techsupport" />
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </section>

        {/* Technical Details Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="border-border/40 bg-background/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <CardTitle className="text-xl">Safety Architecture</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Commands are classified into two severity levels to protect your infrastructure:
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-green-500/5 border border-green-500/20">
                  <Badge className="bg-green-500 hover:bg-green-600">SAFE</Badge>
                  <div className="text-xs">
                    Read-only operations like <code className="bg-muted px-1">df</code>,{" "}
                    <code className="bg-muted px-1">ps</code>, and <code className="bg-muted px-1">netstat</code>.
                    Always included.
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                  <Badge className="bg-amber-500 hover:bg-amber-600">WARN</Badge>
                  <div className="text-xs">
                    Potentially disruptive commands like <code className="bg-muted px-1">systemctl restart</code>.
                    Requires explicit opt-in.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/40 bg-background/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center gap-3">
              <Settings className="h-5 w-5 text-accent" />
              <CardTitle className="text-xl">MongoDB Schema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Historical data is organized into optimized collections for reporting and trend analysis:
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                  <span className="font-mono text-xs">tech_support_data</span>
                  <Badge variant="outline">Telemetry</Badge>
                </li>
                <li className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                  <span className="font-mono text-xs">devices</span>
                  <Badge variant="outline">Registry</Badge>
                </li>
                <li className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                  <span className="font-mono text-xs">collection_runs</span>
                  <Badge variant="outline">Summaries</Badge>
                </li>
              </ul>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
