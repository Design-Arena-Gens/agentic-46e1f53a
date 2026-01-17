import { NextResponse } from "next/server";
import { runPipeline } from "@/lib/pipeline/runPipeline";

export const runtime = "nodejs";

export async function GET() {
  const run = await runPipeline({ trigger: "cron" });
  return NextResponse.json({ ok: true, runId: run?.id });
}
