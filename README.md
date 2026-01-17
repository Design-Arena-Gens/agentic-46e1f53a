# Agentic YouTube Automation

Agentic pipeline that scripts, renders, and uploads a fresh YouTube video every day. Built with Next.js (App Router) and orchestrates OpenAI-powered writing, imagery, narration, ffmpeg-based video compositing, and YouTube Data API publishing.

## Stack

- Next.js 14 · React 18
- Tailwind CSS UI
- OpenAI (script, image, TTS)
- fluent-ffmpeg for video assembly
- Google APIs (YouTube Data API v3)
- Vercel Cron for daily automation

## Development

```bash
npm install
cp .env.example .env.local # populate secrets
npm run dev
```

Trigger the pipeline locally via CLI:

```bash
npm run pipeline:run "topic prompt here"
```

## Deployment

A `vercel.json` cron schedules `/api/cron/run` nightly at 09:00 UTC. Deploy with the provided command:

```bash
vercel deploy --prod --yes --token $VERCEL_TOKEN --name agentic-46e1f53a
```

After deployment, verify DNS:

```bash
curl https://agentic-46e1f53a.vercel.app
```

## Environment Variables

See `.env.example` for full list. Required for full autonomy:

- `OPENAI_API_KEY`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REFRESH_TOKEN`

Set `PIPELINE_ENABLE_UPLOAD=true` to allow publishing.
