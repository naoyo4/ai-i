# CLAUDE.md

This file provides guidance for AI assistants working with the ai-i (AI Interviews) codebase.

## Project Overview

AI-powered interview application (MVP) that conducts structured interviews on configurable topics (event feedback, policy hearing, user interviews) and generates AI-summarized reports with sentiment analysis and key insights.

**Stack:** Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4 + Supabase + Google Gemini AI

## Repository Structure

```
src/
├── app/                        # Next.js App Router
│   ├── layout.tsx              # Root layout with metadata
│   ├── page.tsx                # Home page (topic selection)
│   ├── globals.css             # Global styles + Tailwind imports
│   ├── admin/page.tsx          # Admin dashboard (lists all interviews)
│   ├── interview/[id]/page.tsx # Dynamic interview chat page
│   ├── report/[id]/page.tsx    # Report generation and display
│   └── api/
│       ├── chat/route.ts       # AI chat streaming endpoint (Gemini)
│       ├── interviews/route.ts # Create interview session
│       └── report/route.ts     # Generate AI report from conversation
├── components/
│   └── chat/
│       ├── ChatInterface.tsx   # Main chat UI component
│       └── MessageBubble.tsx   # Message display component
└── lib/
    ├── types.ts                # TypeScript types + INTERVIEW_TOPICS config
    ├── utils.ts                # Utility functions (cn() for class merging)
    └── supabase.ts             # Supabase client initialization
supabase/
└── schema.sql                  # Database schema (interviews table)
```

## Commands

- `npm run dev` — Start development server (localhost:3000)
- `npm run build` — Production build
- `npm run start` — Start production server
- `npm run lint` — Run ESLint (flat config, Next.js core-web-vitals + TypeScript rules)

## Architecture

### Data Flow

1. User selects an interview topic on the home page
2. A new interview session is created in Supabase via `POST /api/interviews`
3. User navigates to `/interview/[id]` where the chat interface loads
4. Messages stream through `POST /api/chat` using Vercel AI SDK + Google Gemini 2.0 Flash
5. AI responses are saved to Supabase on completion (`onFinish` callback)
6. User ends interview and navigates to `/report/[id]` for AI-generated summary
7. Report is generated via `POST /api/report` and stored in the database

### Key Patterns

- **AI streaming:** Uses Vercel AI SDK (`ai` package) with `streamText()` and `useChat()` hook
- **AI model:** Google Gemini 2.0 Flash (`gemini-2.0-flash-exp`) via `@ai-sdk/google`
- **Database:** Single `interviews` table in Supabase with JSONB columns for messages and reports
- **Styling:** Tailwind CSS v4 with utility classes; no component library (custom components)
- **Path alias:** `@/*` maps to `./src/*`
- **Class merging:** Uses `cn()` utility (clsx + tailwind-merge) from `src/lib/utils.ts`
- **Icons:** Lucide React (`lucide-react`)

### API Routes

All API routes are in `src/app/api/` and use Next.js Route Handlers:

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/chat` | POST | Streams AI interview responses (30s max duration) |
| `/api/interviews` | POST | Creates a new interview session in Supabase |
| `/api/report` | POST | Generates AI summary report from interview messages |

## Environment Variables

Required:
```
NEXT_PUBLIC_SUPABASE_URL        # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY   # Supabase anonymous key
GOOGLE_GENERATIVE_AI_API_KEY    # Google AI API key (for Gemini)
```

The Supabase client in `src/lib/supabase.ts` returns `null` if env vars are missing, and API routes gracefully fall back to mock behavior.

## Database

Schema is defined in `supabase/schema.sql`. Single table:

```sql
interviews (
    id          UUID PRIMARY KEY (auto-generated),
    created_at  TIMESTAMPTZ (auto-generated),
    topic_id    TEXT NOT NULL,
    messages    JSONB DEFAULT '[]',
    report      JSONB DEFAULT NULL,
    status      TEXT DEFAULT 'started'  -- 'started' | 'completed'
)
```

RLS is enabled but currently permissive (public read/write) for MVP purposes.

## Code Conventions

- **TypeScript strict mode** is enabled
- **Interview topics** are configured as constants in `src/lib/types.ts` (`INTERVIEW_TOPICS` array)
- **Client components** use `"use client"` directive at the top of the file
- **Error handling:** API routes return JSON error responses with appropriate status codes; frontend falls back to mock data when APIs fail
- **Message persistence:** Messages are saved to both Supabase (server-side on AI response finish) and localStorage (client-side fallback with key `interview-messages`)

## Known Issues

- Several `@ts-ignore` comments exist in the codebase (icon mapping, message types)
- No test suite is configured
- No CI/CD pipeline
- Some dependencies are imported but unused (`framer-motion`, `@ai-sdk/openai`, `zod`)
