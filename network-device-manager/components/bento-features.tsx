import {
  Shield,
  Zap,
  BrainCircuit,
  Activity,
  Database,
  Server,
  Layers,
} from "lucide-react";

export function BentoFeatures() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-6 auto-rows-[200px]">
      {/* Feature 1: Large AI Card */}
      <div className="md:col-span-2 md:row-span-2 glass-card p-8 flex flex-col justify-between group transition-all hover:border-primary/50">
        <div>
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
            <BrainCircuit className="h-6 w-6" />
          </div>
          <h3 className="text-2xl font-bold mb-2">AI Diagnostic Generation</h3>
          <p className="text-muted-foreground text-balance">
            Describe a network problem in plain English, and our Cohere-powered
            AI will generate a sequence of diagnostic commands tailored to your
            specific infrastructure.
          </p>
        </div>
        <div className="mt-6 flex gap-4">
          <div className="flex items-center gap-2 text-sm font-medium text-accent">
            <Shield className="h-4 w-4" /> SAFE Execution
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-destructive">
            <Activity className="h-4 w-4" /> WARN VibeCheck
          </div>
        </div>
      </div>

      {/* Feature 2: SSH Orchestration */}
      <div className="md:col-span-2 glass-card p-6 flex items-start gap-4 hover:border-primary/50 transition-all">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
          <Server className="h-5 w-5" />
        </div>
        <div>
          <h4 className="text-lg font-bold">Bulk SSH Orchestration</h4>
          <p className="text-sm text-muted-foreground mt-1">
            Execute commands across hundreds of devices simultaneously with
            robust connection management.
          </p>
        </div>
      </div>

      {/* Feature 3: Real-time Monitor */}
      <div className="glass-card p-6 flex flex-col justify-between hover:border-primary/50 transition-all">
        <div className="text-primary">
          <Zap className="h-8 w-8" />
        </div>
        <div>
          <h4 className="font-bold">Low Latency</h4>
          <p className="text-xs text-muted-foreground mt-1">
            Real-time output streaming from remote shells.
          </p>
        </div>
      </div>

      {/* Feature 4: Persistence */}
      <div className="glass-card p-6 flex flex-col justify-between hover:border-primary/50 transition-all">
        <div className="text-primary">
          <Database className="h-8 w-8" />
        </div>
        <div>
          <h4 className="font-bold">Dataset Export</h4>
          <p className="text-xs text-muted-foreground mt-1">
            Export results to CSV, JSON, or tabular view.
          </p>
        </div>
      </div>

      {/* Feature 5: Security */}
      <div className="md:col-span-2 glass-card p-6 flex items-center gap-6 hover:border-primary/50 transition-all">
        <div className="space-y-2 flex-1">
          <h4 className="text-lg font-bold">Enterprise Grade Security</h4>
          <p className="text-sm text-muted-foreground">
            Secret management for SSH keys and API tokens. All connections are
            encrypted and monitored.
          </p>
        </div>
        <div className="h-24 w-24 bg-primary/5 rounded-full border border-primary/20 flex items-center justify-center">
          <Shield className="h-10 w-10 text-primary opacity-50" />
        </div>
      </div>

      {/* Feature 6: Multi-Layer Architecture */}
      <div className="md:col-span-2 glass-card p-6 flex items-start gap-4 hover:border-primary/50 transition-all">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
          <Layers className="h-5 w-5" />
        </div>
        <div>
          <h4 className="text-lg font-bold">Multi-Layer Architecture</h4>
          <p className="text-sm text-muted-foreground mt-1 text-pretty">
            Separated Input Processing, Severity Filtering, and Concurrent
            Execution layers ensure reliable operation at scale.
          </p>
        </div>
      </div>
    </div>
  );
}
