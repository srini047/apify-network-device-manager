"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Database,
  Loader2,
  Link2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export function MongoDBConnector({
  onConnect,
}: {
  onConnect: (data: any, uri: string) => void;
}) {
  const [uri, setUri] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  const handleConnect = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/mongodb/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectionString: uri }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to connect");

      const statsResponse = await fetch("/api/mongodb/stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectionString: uri }),
      });
      const statsData = await statsResponse.json();

      setConnected(true);
      onConnect(statsData, uri);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="glass-card p-6 border-primary/20 bg-primary/5">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Database className="h-6 w-6 text-primary" />
          <div>
            <h3 className="text-lg font-bold">Connect MongoDB</h3>
            <p className="text-sm text-muted-foreground">
              Enter your connection string to analyze network telemetry.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="relative flex-1">
            <Link2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/50" />
            <Input
              type="password"
              placeholder="mongodb+srv://user:pass@cluster.mongodb.net/dbname"
              className="pl-9 bg-background/50 border-border/50 focus:border-primary/50"
              value={uri}
              onChange={(e) => setUri(e.target.value)}
              disabled={loading || connected}
            />
          </div>
          <Button
            onClick={handleConnect}
            disabled={loading || !uri || connected}
            className="min-w-[120px]"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : connected ? (
              <CheckCircle2 className="h-4 w-4 mr-2" />
            ) : (
              "Connect"
            )}
            {connected ? "Connected" : "Initialize"}
          </Button>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-destructive text-xs font-medium animate-in fade-in slide-in-from-top-1">
            <AlertCircle className="h-3.5 w-3.5" />
            {error}
          </div>
        )}

        {connected && (
          <p className="text-[10px] text-accent font-mono uppercase tracking-widest text-center animate-pulse">
            Database Pipeline Synchronized
          </p>
        )}
      </div>
    </Card>
  );
}
