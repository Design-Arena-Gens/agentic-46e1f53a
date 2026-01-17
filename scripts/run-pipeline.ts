import "dotenv/config";
import { runPipeline } from "@/lib/pipeline/runPipeline";

async function main() {
  const topicArg = process.argv.slice(2).join(" ") || undefined;
  try {
    const run = await runPipeline({ trigger: "cli", topic: topicArg });
    console.log("Pipeline finished", { runId: run?.id, status: run?.status });
    process.exit(0);
  } catch (error) {
    console.error("Pipeline failed", error);
    process.exit(1);
  }
}

main();
