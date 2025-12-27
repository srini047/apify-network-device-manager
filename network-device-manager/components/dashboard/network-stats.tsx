"use client";

import { Card } from "@/components/ui/card";
import {
  Globe,
  ShieldAlert,
  Activity,
  Server,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

export function NetworkStats({ stats }: { stats: any }) {
  if (!stats) return null;

  const items = [
    {
      label: "Total Devices",
      value: stats.devices.total,
      sub: `${stats.devices.active} Active`,
      icon: Server,
      color: "text-primary",
      trend: "up",
    },
    {
      label: "Health Status",
      value: `${Math.round(
        (stats.devices.healthy / stats.devices.total) * 100
      )}%`,
      sub: `${stats.devices.critical} Critical`,
      icon: ShieldAlert,
      color: stats.devices.critical > 0 ? "text-destructive" : "text-accent",
      trend: stats.devices.critical > 0 ? "down" : "up",
    },
    {
      label: "Network Load",
      value: `${stats.collections.totalProcessed}`,
      sub: "Total Collections",
      icon: Activity,
      color: "text-accent",
      trend: "up",
    },
    {
      label: "System Latency",
      value: `${stats.collections.avgDuration}s`,
      sub: "Avg. Duration",
      icon: Globe,
      color: "text-primary",
      trend: "down",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {items.map((item, i) => (
        <Card
          key={i}
          className="glass-card p-5 border-border/40 hover:border-primary/30 transition-all group"
        >
          <div className="flex items-start justify-between">
            <div
              className={`p-2 rounded-lg bg-background/50 border border-border/50 ${item.color}`}
            >
              <item.icon className="h-5 w-5" />
            </div>
            {item.trend === "up" ? (
              <ArrowUpRight className="h-4 w-4 text-accent opacity-0 group-hover:opacity-100 transition-opacity" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-destructive opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-muted-foreground">
              {item.label}
            </p>
            <h4 className="text-2xl font-bold tracking-tight">{item.value}</h4>
            <p
              className={`text-[10px] font-bold uppercase mt-1 tracking-wider ${item.color}`}
            >
              {item.sub}
            </p>
          </div>
        </Card>
      ))}
    </div>
  );
}
