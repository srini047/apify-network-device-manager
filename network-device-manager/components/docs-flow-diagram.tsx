"use client";

import type React from "react";

import { motion } from "framer-motion";
import {
  Server,
  Cpu,
  Database,
  Brain,
  Activity,
  ShieldCheck,
  Terminal,
} from "lucide-react";

interface FlowNodeProps {
  icon: React.ElementType;
  label: string;
  description?: string;
  active?: boolean;
}

const FlowNode = ({
  icon: Icon,
  label,
  description,
  active,
}: FlowNodeProps) => (
  <div
    className={`flex flex-col items-center p-4 rounded-xl border transition-all duration-300 ${active ? "bg-primary/10 border-primary shadow-[0_0_15px_rgba(var(--primary),0.2)]" : "bg-muted/50 border-border opacity-70"}`}
  >
    <div
      className={`p-3 rounded-lg mb-2 ${active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
    >
      <Icon className="w-6 h-6" />
    </div>
    <span className="font-semibold text-sm">{label}</span>
    {description && (
      <span className="text-xs text-muted-foreground text-center mt-1">
        {description}
      </span>
    )}
  </div>
);

const Connector = ({ active }: { active?: boolean }) => (
  <div className="flex-1 h-[2px] min-w-[20px] mx-2 relative overflow-hidden bg-border">
    {active && (
      <motion.div
        className="absolute inset-0 bg-primary"
        initial={{ x: "-100%" }}
        animate={{ x: "100%" }}
        transition={{
          duration: 1.5,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      />
    )}
  </div>
);

export function ManualFlow() {
  return (
    <div className="flex items-center justify-between w-full py-8">
      <FlowNode
        icon={Terminal}
        label="User Input"
        description="Define Commands"
        active
      />
      <Connector active />
      <FlowNode
        icon={Server}
        label="SSH Client"
        description="Orchestration"
        active
      />
      <Connector active />
      <FlowNode
        icon={Cpu}
        label="Target Device"
        description="Execution"
        active
      />
      <Connector active />
      <FlowNode
        icon={Database}
        label="Apify Dataset"
        description="Results"
        active
      />
    </div>
  );
}

export function AIFlow() {
  return (
    <div className="flex items-center justify-between w-full py-8">
      <FlowNode
        icon={Brain}
        label="Cohere AI"
        description="Analyze Problem"
        active
      />
      <Connector active />
      <FlowNode
        icon={ShieldCheck}
        label="Safety Filter"
        description="SAFE vs WARN"
        active
      />
      <Connector active />
      <FlowNode
        icon={Server}
        label="SSH Client"
        description="Auto-Exec"
        active
      />
      <Connector active />
      <FlowNode
        icon={Activity}
        label="Monitoring"
        description="Telemetry"
        active
      />
    </div>
  );
}

export function MonitoringFlow() {
  return (
    <div className="flex items-center justify-between w-full py-8">
      <FlowNode
        icon={Activity}
        label="25+ Metrics"
        description="Health Check"
        active
      />
      <Connector active />
      <FlowNode
        icon={Server}
        label="SSH Manager"
        description="Concurrent"
        active
      />
      <Connector active />
      <FlowNode
        icon={Database}
        label="MongoDB"
        description="Persistence"
        active
      />
      <Connector active />
      <FlowNode
        icon={Activity}
        label="Analytics"
        description="Trend Analysis"
        active
      />
    </div>
  );
}
