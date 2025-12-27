import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

type Body = { connectionString?: string };

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    const { connectionString } = body;

    if (!connectionString) {
      return NextResponse.json({ error: "connectionString is required" }, { status: 400 });
    }

    // Connect server-side with the MongoDB Node driver
    const { db } = await connectToDatabase(connectionString);

    // Fetch devices and recent runs (adjust collection names to your DB)
    const devicesCursor = db.collection("devices").find({}).limit(200);
    const runsCursor = db.collection("collectionRuns").find({}).sort({ started_at: -1 }).limit(50);

    const devices = await devicesCursor.toArray();
    const recentRuns = await runsCursor.toArray();

    // Sanitize documents for JSON serialization (removes ObjectId/date types)
    const sanitize = (doc: any) => JSON.parse(JSON.stringify(doc));

    const stats = {
      devices: { list: devices.map(sanitize) },
      collections: { recentRuns: recentRuns.map(sanitize) },
    };

    return NextResponse.json({ stats }, { status: 200 });
  } catch (err: any) {
    // Do not leak stack/traces or credentials in responses!
    console.error("MongoDB connect error:", err?.message ?? err);
    return NextResponse.json(
      { error: "Failed to connect to MongoDB. Check URI and network access." },
      { status: 500 }
    );
  }
}
