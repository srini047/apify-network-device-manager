import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { de } from "zod/v4/locales";

type Body = { connectionString?: string, dbName?: string };

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    const { connectionString } = body;

    if (!connectionString) {
      return NextResponse.json({ error: "connectionString is required" }, { status: 400 });
    }

    // Connect server-side with the MongoDB Node driver
    const { db } = await connectToDatabase(connectionString);

    // Fetch devices and recent runs
    const devicesCursor = db.collection("devices").find({});
    const runsCursor = db.collection("collection_runs").find({}).sort({ started_at: -1 }).limit(50);

    const devices = await devicesCursor.toArray();
    const recentRuns = await runsCursor.toArray();

    // Sanitize documents for JSON serialization
    const sanitize = (doc: any) => JSON.parse(JSON.stringify(doc));

    // Calculate aggregated stats
    const totalDevices = devices.length;
    const activeDevices = devices.filter((d) => d.status === "active").length;
    const healthyDevices = devices.filter((d) => d.last_health_status === "healthy").length;
    const criticalDevices = devices.filter((d) => d.last_health_status === "critical").length;

    const totalProcessed = recentRuns.reduce((sum, run) => sum + (run.devices_processed || 0), 0);
    const avgDuration = recentRuns.length > 0
      ? Math.round(recentRuns.reduce((sum, run) => sum + (run.duration_seconds || 0), 0) / recentRuns.length)
      : 0;

    const stats = {
      devices: {
        list: devices.map(sanitize),
        total: totalDevices,
        active: activeDevices,
        healthy: healthyDevices,
        critical: criticalDevices,
      },
      collections: {
        recentRuns: recentRuns.map(sanitize),
        totalProcessed,
        avgDuration,
      },
    };

    return NextResponse.json({ stats }, { status: 200 });
  } catch (err: any) {
    console.error("MongoDB connect error:", err?.message ?? err);
    return NextResponse.json(
      { error: "Failed to connect to MongoDB. Check URI and network access." },
      { status: 500 }
    );
  }
}
