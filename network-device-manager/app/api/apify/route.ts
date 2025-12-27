import { type NextRequest, NextResponse } from "next/server";
import { ApifyClient } from "apify-client";

export async function POST(req: NextRequest) {
  try {
    const { apifyToken, ...input } = await req.json();

    if (!apifyToken) {
      return NextResponse.json(
        { error: "Apify Token is required" },
        { status: 400 }
      );
    }

    const client = new ApifyClient({ token: apifyToken });

    // Start the Actor
    const run = await client.actor("vMJSTjEps2zDrzsA5").call(input);

    // Fetch results from dataset
    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    return NextResponse.json({
      status: "success",
      runId: run.id,
      datasetId: run.defaultDatasetId,
      items,
    });
  } catch (error: any) {
    console.error("[v0] API Route Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
