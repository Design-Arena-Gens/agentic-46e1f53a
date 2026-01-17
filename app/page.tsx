"use client";

import { useCallback, useMemo, useState } from "react";
import useSWR from "swr";
import dayjs from "dayjs";
import { ArrowPathIcon, CloudArrowUpIcon, PlayCircleIcon } from "@heroicons/react/24/outline";

interface PipelineStepLog {
  name: string;
  status: "pending" | "running" | "success" | "error";
  startedAt: string;
  completedAt?: string;
  error?: string;
  meta?: Record<string, unknown>;
}

interface PipelineRunLog {
  id: string;
  trigger: string;
  topic?: string;
  status: string;
  startedAt: string;
  completedAt?: string;
  videoTitle?: string;
  youtubeUrl?: string;
  steps: PipelineStepLog[];
}

interface StatusResponse {
  runs: PipelineRunLog[];
}

async function fetcher(url: string) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Failed to load status");
  }
  return (await response.json()) as StatusResponse;
}

const statusBadgeClasses: Record<string, string> = {
  running: "bg-amber-500/20 text-amber-300 border border-amber-500/40",
  success: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40",
  error: "bg-rose-500/20 text-rose-300 border border-rose-500/40",
  pending: "bg-slate-500/20 text-slate-300 border border-slate-500/40"
};

function StatusBadge({ status }: { status: string }) {
  const classes = statusBadgeClasses[status] ?? statusBadgeClasses.pending;
  return <span className={`rounded-full px-3 py-1 text-xs font-medium ${classes}`}>{status.toUpperCase()}</span>;
}

export default function HomePage() {
  const { data, isLoading, mutate, error } = useSWR("/api/status", fetcher, {
    refreshInterval: 5000
  });
  const [topic, setTopic] = useState("");
  const [isTriggering, setIsTriggering] = useState(false);
  const runs = useMemo(() => data?.runs ?? [], [data]);

  const triggerRun = useCallback(async () => {
    setIsTriggering(true);
    try {
      const response = await fetch("/api/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic || undefined })
      });
      if (!response.ok) {
        throw new Error("Trigger failed");
      }
      await mutate();
      setTopic("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsTriggering(false);
    }
  }, [mutate, topic]);

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 py-12">
      <header className="flex flex-col gap-3">
        <div className="flex items-center gap-3 text-primary-300">
          <CloudArrowUpIcon className="size-8" />
          <h1 className="text-3xl font-semibold text-white">Agentic YouTube Automation</h1>
        </div>
        <p className="max-w-2xl text-sm text-slate-300">
          Autonomous pipeline that scripts, renders, and uploads a fresh video to your YouTube channel every day.
          Configure credentials via environment variables and monitor job telemetry below.
        </p>
      </header>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 shadow-lg shadow-slate-950/60">
        <h2 className="text-lg font-semibold text-white">Run a video now</h2>
        <p className="mt-1 text-sm text-slate-400">
          Provide an optional topic to steer the narrative. Leave blank to let the agent pick a trending angle.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            placeholder="AI productivity systems for solopreneurs"
            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/40"
          />
          <button
            type="button"
            onClick={triggerRun}
            disabled={isTriggering}
            className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-900/30 transition hover:bg-primary-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isTriggering ? (
              <>
                <ArrowPathIcon className="size-5 animate-spin" />
                Running
              </>
            ) : (
              <>
                <PlayCircleIcon className="size-5" />
                Trigger Pipeline
              </>
            )}
          </button>
        </div>
      </section>

      <section className="flex-1">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Recent executions</h2>
          <button
            type="button"
            onClick={() => mutate()}
            className="text-xs font-semibold text-primary-300 hover:text-primary-200"
          >
            Refresh
          </button>
        </div>

        {isLoading && <p className="text-sm text-slate-400">Loading pipeline status...</p>}
        {error && <p className="text-sm text-rose-400">Failed to load status: {error.message}</p>}

        <div className="space-y-4">
          {runs.map((run) => (
            <article
              key={run.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 transition hover:border-primary-500/60"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Triggered via {run.trigger} • {dayjs(run.startedAt).format("MMM D, HH:mm")}
                  </p>
                  <h3 className="text-xl font-semibold text-white">{run.videoTitle ?? "Title pending"}</h3>
                  {run.topic && <p className="text-xs text-slate-400">Topic hint: {run.topic}</p>}
                </div>
                <StatusBadge status={run.status} />
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-slate-800/60 bg-slate-900/60 p-4 text-xs text-slate-300">
                  <p>
                    Started: {dayjs(run.startedAt).format("MMM D, HH:mm:ss")} • Duration:
                    {run.completedAt
                      ? ` ${dayjs(run.completedAt).diff(dayjs(run.startedAt), "second")}s`
                      : " running..."}
                  </p>
                  {run.youtubeUrl && (
                    <p className="mt-2">
                      Published at: <a href={run.youtubeUrl}>{run.youtubeUrl}</a>
                    </p>
                  )}
                </div>
                <div className="rounded-xl border border-slate-800/60 bg-slate-900/60 p-4">
                  <ol className="space-y-2 text-xs text-slate-200">
                    {run.steps.map((step) => (
                      <li key={step.name} className="flex items-start gap-2">
                        <div className="mt-0.5 h-2.5 w-2.5 rounded-full bg-current text-transparent">
                          {step.status === "success" && <span className="sr-only">success</span>}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-100">
                            {step.name}
                            <span className="ml-2 rounded-full bg-slate-800 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-400">
                              {step.status}
                            </span>
                          </p>
                          {step.error && <p className="text-rose-400">{step.error}</p>}
                          {step.meta && (
                            <p className="text-slate-400">
                              {Object.entries(step.meta)
                                .map(([key, value]) => `${key}: ${String(value)}`)
                                .join(" • ")}
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </article>
          ))}

          {runs.length === 0 && !isLoading && (
            <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-10 text-center text-sm text-slate-400">
              No runs yet. Trigger your first video above to populate the timeline.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
