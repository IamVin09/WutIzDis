# Wut Iz Dis? 🤔

A multiplayer Taboo-style browser game built with Next.js, Pusher, and Upstash Redis — deployable to Vercel in minutes.

## Setup

### 1. Pusher

1. Create a free account at [pusher.com](https://pusher.com)
2. Create a new **Channels** app
3. Copy the credentials from **App Keys**

### 2. Upstash Redis

1. Go to [Vercel Marketplace → Upstash Redis](https://vercel.com/marketplace?category=storage&search=redis) and add the integration, **or**
2. Create a free database at [upstash.com](https://upstash.com) and copy the REST URL + token

### 3. Environment Variables

Fill in `.env.local`:

```
PUSHER_APP_ID=...
PUSHER_KEY=...
PUSHER_SECRET=...
PUSHER_CLUSTER=...
NEXT_PUBLIC_PUSHER_KEY=...
NEXT_PUBLIC_PUSHER_CLUSTER=...

UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
```

### 4. Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Deploy to Vercel

```bash
npx vercel --prod
```

Add the same environment variables in the Vercel dashboard under **Settings → Environment Variables**.

## How it works

- Host creates a lobby → shares the 6-character code
- Players join with a name and emoji avatar
- Host starts the game → players take turns as the Clue-Giver (3 min/turn)
- Clue-Giver describes the target word without saying the 5 taboo words
- Guessers type answers; first correct answer earns a point
- Leaderboard shown after each turn; winner announced at the end

## Tech Stack

- **Next.js 15** (App Router) + TypeScript + Tailwind CSS
- **Pusher Channels** — real-time WebSocket broadcast
- **Upstash Redis** — server-authoritative game state
- **Vercel** — deployment
