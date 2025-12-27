import { type NextRequest, NextResponse } from "next/server";
import { ApifyClient } from "apify-client";

export async function POST(req: NextRequest) {
  try {
    const input = await req.json();

    if (!process.env.APIFY_TOKEN) {
      return NextResponse.json(
        { error: "Server error configuration" },
        { status: 500 }
      );
    }

    const client = new ApifyClient({ token: process.env.APIFY_TOKEN });
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
    console.error("API Route Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
