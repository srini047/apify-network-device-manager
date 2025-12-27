import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import type { Device, CollectionRun } from "@/lib/mongodb";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const { connectionString } = await req.json();

    if (!connectionString) {
      return NextResponse.json(
        { error: "MongoDB connection string is required" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase(connectionString);

    // Fetch devices stats
    const devicesCollection = db.collection<Device>("devices");
    const collectionRunsCollection =
      db.collection<CollectionRun>("collection_runs");

    const [
      totalDevices,
      activeDevices,
      healthyDevices,
      criticalDevices,
      recentRuns,
      devicesList,
    ] = await Promise.all([
      devicesCollection.countDocuments(),
      devicesCollection.countDocuments({ status: "active" }),
      devicesCollection.countDocuments({ last_health_status: "healthy" }),
      devicesCollection.countDocuments({
        last_health_status: { $in: ["critical", "warning"] },
      }),
      collectionRunsCollection
        .find()
        .sort({ started_at: -1 })
        .limit(10)
        .toArray(),
      devicesCollection.find().sort({ last_seen: -1 }).limit(20).toArray(),
    ]);

    // Calculate aggregated stats from recent runs
    const totalCollections = recentRuns.reduce(
      (sum, run) => sum + run.devices_processed,
      0
    );
    const totalAlerts = recentRuns.reduce(
      (sum, run) => sum + run.total_alerts,
      0
    );
    const avgDuration =
      recentRuns.length > 0
        ? recentRuns.reduce((sum, run) => sum + run.duration_seconds, 0) /
          recentRuns.length
        : 0;

    return NextResponse.json({
      success: true,
      devices: {
        total: totalDevices,
        active: activeDevices,
        healthy: healthyDevices,
        critical: criticalDevices,
        list: devicesList,
      },
      collections: {
        totalRuns: recentRuns.length,
        totalProcessed: totalCollections,
        totalAlerts,
        avgDuration: Math.round(avgDuration * 10) / 10,
        recentRuns,
      },
    });
  } catch (error: any) {
    console.error("[v0] MongoDB stats error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch MongoDB stats",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
