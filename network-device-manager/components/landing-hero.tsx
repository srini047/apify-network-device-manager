import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, TerminalIcon, ShieldCheck, Zap } from "lucide-react";

export function LandingHero() {
  return (
    <div className="relative overflow-hidden pt-24 pb-16 sm:pt-32 lg:pb-32">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -z-10 h-[1000px] w-[1000px] -translate-x-1/2 [mask-image:radial-gradient(closest-side,white,transparent)] sm:-top-12 md:-top-20 lg:-top-32">
        <svg
          viewBox="0 0 1024 1024"
          className="h-full w-full"
          aria-hidden="true"
        >
          <circle
            cx="512"
            cy="512"
            r="512"
            fill="url(#gradient)"
            fillOpacity="0.15"
          />
          <defs>
            <radialGradient id="gradient">
              <stop stopColor="oklch(0.55 0.18 250)" />
              <stop offset="1" stopColor="oklch(0.75 0.2 160)" />
            </radialGradient>
          </defs>
        </svg>
      </div>

      <div className="container mx-auto px-4 text-center">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 flex justify-center">
            <div className="rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold leading-6 text-primary ring-1 ring-inset ring-primary/20 animate-pulse">
              🔺 AI Command Generation is now live
            </div>
          </div>
          <h1 className="text-balance text-5xl font-bold tracking-tight text-foreground sm:text-7xl">
            Orchestrate your network with{" "}
            <span className="text-primary">AI intelligence.</span>
          </h1>
          <div className="mt-8 flex flex-col items-center gap-4">
            <p className="max-w-2xl text-pretty text-lg font-medium text-muted-foreground sm:text-xl/8">
              A high-performance Apify Actor built for modern DevOps. Seamlessly
              execute diagnostic workflows across hundreds of devices with
              Python-powered SSH orchestration.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <span className="px-3 py-1 rounded-full bg-muted text-[10px] font-mono border border-border/50">
                Apify
              </span>
              <span className="px-3 py-1 rounded-full bg-muted text-[10px] font-mono border border-border/50">
                Cohere
              </span>
              <span className="px-3 py-1 rounded-full bg-muted text-[10px] font-mono border border-border/50">
                AsyncSSH
              </span>
              <span className="px-3 py-1 rounded-full bg-muted text-[10px] font-mono border border-border/50">
                Docker
              </span>
              <span className="px-3 py-1 rounded-full bg-muted text-[10px] font-mono border border-border/50">
                NextJS
              </span>
            </div>
          </div>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button size="lg" asChild className="h-12 px-8 text-base">
              <Link href="/dashboard">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="lg"
              className="h-12 px-8 text-base bg-transparent"
            >
              Learn More
            </Button>
          </div>
        </div>

        <div className="mt-20 flex flex-wrap justify-center gap-12 text-muted-foreground opacity-60">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            <span className="font-semibold">Secure SSH</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            <span className="font-semibold">Real-time Analysis</span>
          </div>
          <div className="flex items-center gap-2">
            <TerminalIcon className="h-5 w-5" />
            <span className="font-semibold">Automated Workflow</span>
          </div>
        </div>

        <div className="mt-16 mx-auto max-w-5xl rounded-xl border border-border/50 bg-zinc-950 p-2 shadow-2xl relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl blur opacity-25 group-hover:opacity-40 transition-opacity" />
          <div className="relative rounded-lg bg-zinc-900 overflow-hidden border border-white/5">
            <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900/50 border-b border-white/5">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
              </div>
              <span className="text-[10px] font-mono text-zinc-500 ml-2">
                NetManager@ssh-orchestrator — 80×24
              </span>
            </div>
            <div className="p-6 font-mono text-sm text-zinc-400 text-left space-y-2">
              <div className="flex gap-2">
                <span className="text-primary">➜</span>
                <span>Initializing Cohere AI diagnostic module...</span>
              </div>
              <div className="flex gap-2 text-zinc-500 italic">
                <span>
                  [INFO] Analyzing problem: "Latency spikes on core switch"
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-accent">✓</span>
                <span className="text-zinc-300">
                  Generated 12 diagnostic commands (SAFE: 10, WARN: 2)
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">➜</span>
                <span>Deploying to 48 target devices via SSH...</span>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4 py-3 border-y border-white/5">
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] uppercase tracking-wider text-zinc-500">
                    <span>IP Address</span>
                    <span>Status</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>10.0.4.1</span>
                    <span className="text-accent">CONNECTED</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>10.0.4.2</span>
                    <span className="text-accent">CONNECTED</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] uppercase tracking-wider text-zinc-500">
                    <span>Commands</span>
                    <span>Success</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>top -bn1</span>
                    <span className="text-accent">100%</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>ip addr</span>
                    <span className="text-accent">100%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
