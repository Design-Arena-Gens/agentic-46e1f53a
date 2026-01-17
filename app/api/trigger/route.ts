import { NextResponse } from "next/server";
import { z } from "zod";
import { runPipeline } from "@/lib/pipeline/runPipeline";

const bodySchema = z.object({
  topic: z.string().min(3).max(160).optional()
});

export async function POST(request: Request) {
  const json = await request.json().catch(() => ({}));
  const { topic } = bodySchema.parse(json);
  const run = await runPipeline({ trigger: "manual", topic });
  return NextResponse.json({ ok: true, runId: run?.id, run });
}
