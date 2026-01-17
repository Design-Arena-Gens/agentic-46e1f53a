import { NextResponse } from "next/server";
import { listRuns } from "@/lib/utils/statusStore";

export async function GET() {
  return NextResponse.json({ runs: listRuns() });
}
