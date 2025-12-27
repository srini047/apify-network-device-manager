"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Terminal, Sparkles, Database, ArrowDown, CheckCircle2, Code2, Network, HardDrive } from "lucide-react"

interface ModeFlowDiagramProps {
  mode: "manual" | "ai" | "techsupport"
}

export function ModeFlowDiagram({ mode }: ModeFlowDiagramProps) {
  if (mode === "manual") {
    return (
      <div className="space-y-6">
        <Card className="border-primary/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Terminal className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>Manual Command Execution Flow</CardTitle>
                <CardDescription>User provides specific commands to execute</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center space-y-4">
              {/* Step 1 */}
              <div className="w-full max-w-md p-4 rounded-lg border border-primary/30 bg-primary/5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                    1
                  </div>
                  <h3 className="font-semibold">Input Configuration</h3>
                </div>
                <p className="text-sm text-muted-foreground ml-11">
                  User provides device list and specific commands to execute
                </p>
                <div className="mt-3 ml-11">
                  <Badge variant="secondary" className="text-xs font-mono">
                    commands: ["df -h", "uptime"]
                  </Badge>
                </div>
              </div>

              <ArrowDown className="h-8 w-8 text-muted-foreground" />

              {/* Step 2 */}
              <div className="w-full max-w-md p-4 rounded-lg border border-primary/30 bg-primary/5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                    2
                  </div>
                  <h3 className="font-semibold">SSH Connection</h3>
                </div>
                <p className="text-sm text-muted-foreground ml-11">
                  Establish SSH connections to all target devices concurrently
                </p>
              </div>

              <ArrowDown className="h-8 w-8 text-muted-foreground" />

              {/* Step 3 */}
              <div className="w-full max-w-md p-4 rounded-lg border border-primary/30 bg-primary/5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                    3
                  </div>
                  <h3 className="font-semibold">Command Execution</h3>
                </div>
                <p className="text-sm text-muted-foreground ml-11">
                  Execute commands sequentially on each device, capture stdout/stderr
                </p>
              </div>

              <ArrowDown className="h-8 w-8 text-muted-foreground" />

              {/* Step 4 */}
              <div className="w-full max-w-md p-4 rounded-lg border border-primary/30 bg-primary/5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                    4
                  </div>
                  <h3 className="font-semibold">Result Storage</h3>
                </div>
                <p className="text-sm text-muted-foreground ml-11">
                  Store in Apify Dataset (table view) and Key-Value Store (detailed outputs)
                </p>
                <div className="flex gap-2 mt-3 ml-11">
                  <Badge variant="outline" className="text-xs">
                    Dataset
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    KV Store
                  </Badge>
                </div>
              </div>

              <ArrowDown className="h-8 w-8 text-muted-foreground" />

              {/* Step 5 */}
              <div className="w-full max-w-md p-4 rounded-lg border border-primary/30 bg-primary/5">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle2 className="h-8 w-8 text-primary" />
                  <h3 className="font-semibold">Complete</h3>
                </div>
                <p className="text-sm text-muted-foreground ml-11">Results available in Apify platform for analysis</p>
              </div>

              {/* Live Monitoring */}
              <ArrowDown className="h-8 w-8 text-muted-foreground" />

              {/* Step 6 */}
              <div className="w-full max-w-md p-4 rounded-lg border border-primary/30 bg-primary/5">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle2 className="h-8 w-8 text-primary" />
                  <h3 className="font-semibold">Live Monitoring</h3>
                </div>
                <p className="text-sm text-muted-foreground ml-11">
                  Access real-time telemetry through the NetGuard AI Dashboard
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (mode === "ai") {
    return (
      <div className="space-y-6">
        <Card className="border-accent/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-accent" />
              <div>
                <CardTitle>AI-Powered Problem Solving Flow</CardTitle>
                <CardDescription>AI analyzes problem and generates diagnostic commands</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center space-y-4">
              {/* Step 1 */}
              <div className="w-full max-w-md p-4 rounded-lg border border-accent/30 bg-accent/5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent text-accent-foreground text-sm font-bold">
                    1
                  </div>
                  <h3 className="font-semibold">Problem Description</h3>
                </div>
                <p className="text-sm text-muted-foreground ml-11">User describes the issue in natural language</p>
                <div className="mt-3 ml-11 p-2 bg-muted rounded text-xs italic">
                  "Server experiencing high CPU and slow response times"
                </div>
              </div>

              <ArrowDown className="h-8 w-8 text-muted-foreground" />

              {/* Step 2 */}
              <div className="w-full max-w-md p-4 rounded-lg border border-accent/30 bg-accent/5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent text-accent-foreground text-sm font-bold">
                    2
                  </div>
                  <h3 className="font-semibold">AI Command Generation</h3>
                </div>
                <p className="text-sm text-muted-foreground ml-11">
                  Cohere AI analyzes problem and generates 5-15 diagnostic commands
                </p>
                <div className="flex gap-2 mt-3 ml-11">
                  <Badge variant="secondary" className="text-xs">
                    Cohere API
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    SAFE/WARN
                  </Badge>
                </div>
              </div>

              <ArrowDown className="h-8 w-8 text-muted-foreground" />

              {/* Step 3 */}
              <div className="w-full max-w-md p-4 rounded-lg border border-accent/30 bg-accent/5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent text-accent-foreground text-sm font-bold">
                    3
                  </div>
                  <h3 className="font-semibold">Severity Filtering</h3>
                </div>
                <p className="text-sm text-muted-foreground ml-11">
                  Filter commands based on includeWarnCommands setting
                </p>
                <div className="space-y-2 mt-3 ml-11">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span className="text-xs">SAFE: Read-only commands</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Code2 className="h-4 w-4 text-amber-500" />
                    <span className="text-xs">WARN: Potentially disruptive</span>
                  </div>
                </div>
              </div>

              <ArrowDown className="h-8 w-8 text-muted-foreground" />

              {/* Step 4 */}
              <div className="w-full max-w-md p-4 rounded-lg border border-accent/30 bg-accent/5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent text-accent-foreground text-sm font-bold">
                    4
                  </div>
                  <h3 className="font-semibold">SSH Execution</h3>
                </div>
                <p className="text-sm text-muted-foreground ml-11">Execute filtered commands on all target devices</p>
              </div>

              <ArrowDown className="h-8 w-8 text-muted-foreground" />

              {/* Step 5 */}
              <div className="w-full max-w-md p-4 rounded-lg border border-accent/30 bg-accent/5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent text-accent-foreground text-sm font-bold">
                    5
                  </div>
                  <h3 className="font-semibold">Store Results & AI Metadata</h3>
                </div>
                <p className="text-sm text-muted-foreground ml-11">Save command outputs and AI generation metadata</p>
                <div className="flex gap-2 mt-3 ml-11">
                  <Badge variant="outline" className="text-xs">
                    Dataset
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    KV Store
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    AI Metadata
                  </Badge>
                </div>
              </div>

              <ArrowDown className="h-8 w-8 text-muted-foreground" />

              {/* Step 6 */}
              <div className="w-full max-w-md p-4 rounded-lg border border-accent/30 bg-accent/5">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle2 className="h-8 w-8 text-accent" />
                  <h3 className="font-semibold">Complete</h3>
                </div>
                <p className="text-sm text-muted-foreground ml-11">
                  AI-generated diagnostics available with command reasoning
                </p>
              </div>

              {/* Live Monitoring */}
              <ArrowDown className="h-8 w-8 text-muted-foreground" />

              {/* Step 7 */}
              <div className="w-full max-w-md p-4 rounded-lg border border-accent/30 bg-accent/5">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle2 className="h-8 w-8 text-accent" />
                  <h3 className="font-semibold">Live Monitoring</h3>
                </div>
                <p className="text-sm text-muted-foreground ml-11">
                  Access real-time telemetry through the NetGuard AI Dashboard
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Tech Support Mode
  return (
    <div className="space-y-6">
      <Card className="border-chart-2/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Database className="h-6 w-6 text-chart-2" />
            <div>
              <CardTitle>Tech Support Collection Flow</CardTitle>
              <CardDescription>Comprehensive monitoring with MongoDB persistence</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-4">
            {/* Step 1 */}
            <div className="w-full max-w-md p-4 rounded-lg border border-chart-2/30 bg-chart-2/5">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-chart-2 text-white text-sm font-bold">
                  1
                </div>
                <h3 className="font-semibold">Initialize MongoDB</h3>
              </div>
              <p className="text-sm text-muted-foreground ml-11">
                Connect to MongoDB and create collections with indexes
              </p>
              <div className="space-y-1 mt-3 ml-11 text-xs font-mono">
                <div>• tech_support_data</div>
                <div>• devices (registry)</div>
                <div>• collection_runs</div>
              </div>
            </div>

            <ArrowDown className="h-8 w-8 text-muted-foreground" />

            {/* Step 2 */}
            <div className="w-full max-w-md p-4 rounded-lg border border-chart-2/30 bg-chart-2/5">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-chart-2 text-white text-sm font-bold">
                  2
                </div>
                <h3 className="font-semibold">Execute Diagnostics</h3>
              </div>
              <p className="text-sm text-muted-foreground ml-11">
                Run 25+ predefined diagnostic commands on all devices
              </p>
              <div className="mt-3 ml-11">
                <Badge variant="secondary" className="text-xs">
                  25+ Commands
                </Badge>
              </div>
            </div>

            <ArrowDown className="h-8 w-8 text-muted-foreground" />

            {/* Step 3 */}
            <div className="w-full max-w-md p-4 rounded-lg border border-chart-2/30 bg-chart-2/5">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-chart-2 text-white text-sm font-bold">
                  3
                </div>
                <h3 className="font-semibold">Parse & Structure Data</h3>
              </div>
              <p className="text-sm text-muted-foreground ml-11">Parse raw outputs into structured data models</p>
              <div className="grid grid-cols-2 gap-2 mt-3 ml-11">
                <div className="flex items-center gap-1">
                  <Network className="h-3 w-3 text-chart-1" />
                  <span className="text-xs">System</span>
                </div>
                <div className="flex items-center gap-1">
                  <HardDrive className="h-3 w-3 text-chart-2" />
                  <span className="text-xs">Hardware</span>
                </div>
                <div className="flex items-center gap-1">
                  <Network className="h-3 w-3 text-chart-3" />
                  <span className="text-xs">Network</span>
                </div>
                <div className="flex items-center gap-1">
                  <Terminal className="h-3 w-3 text-chart-4" />
                  <span className="text-xs">Processes</span>
                </div>
              </div>
            </div>

            <ArrowDown className="h-8 w-8 text-muted-foreground" />

            {/* Step 4 */}
            <div className="w-full max-w-md p-4 rounded-lg border border-chart-2/30 bg-chart-2/5">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-chart-2 text-white text-sm font-bold">
                  4
                </div>
                <h3 className="font-semibold">Health Assessment</h3>
              </div>
              <p className="text-sm text-muted-foreground ml-11">
                Analyze metrics against thresholds and generate alerts
              </p>
              <div className="flex gap-2 mt-3 ml-11">
                <Badge variant="default" className="text-xs">
                  Healthy
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Warning
                </Badge>
                <Badge variant="destructive" className="text-xs">
                  Critical
                </Badge>
              </div>
            </div>

            <ArrowDown className="h-8 w-8 text-muted-foreground" />

            {/* Step 5 */}
            <div className="w-full max-w-md p-4 rounded-lg border border-chart-2/30 bg-chart-2/5">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-chart-2 text-white text-sm font-bold">
                  5
                </div>
                <h3 className="font-semibold">Store in MongoDB</h3>
              </div>
              <p className="text-sm text-muted-foreground ml-11">
                Persist complete diagnostic data for historical analysis
              </p>
              <div className="space-y-2 mt-3 ml-11 text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>Tech support data documents</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>Device registry updates</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>Collection run summary</span>
                </div>
              </div>
            </div>

            <ArrowDown className="h-8 w-8 text-muted-foreground" />

            {/* Step 6 */}
            <div className="w-full max-w-md p-4 rounded-lg border border-chart-2/30 bg-chart-2/5">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle2 className="h-8 w-8 text-chart-2" />
                <h3 className="font-semibold">Complete</h3>
              </div>
              <p className="text-sm text-muted-foreground ml-11">
                Data available for trend analysis, alerting, and compliance
              </p>
            </div>

            {/* Live Monitoring */}
            <ArrowDown className="h-8 w-8 text-muted-foreground" />

            {/* Step 7 */}
            <div className="w-full max-w-md p-4 rounded-lg border border-chart-2/30 bg-chart-2/5">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle2 className="h-8 w-8 text-chart-2" />
                <h3 className="font-semibold">Live Monitoring</h3>
              </div>
              <p className="text-sm text-muted-foreground ml-11">
                Access real-time telemetry through the NetGuard AI Dashboard
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
