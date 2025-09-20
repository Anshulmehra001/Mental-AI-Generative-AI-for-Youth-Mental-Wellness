# 🧠 Mental AI — Youth Mental Wellness, Powered by Gemini

An AI companion that helps Indian youth build healthy mental wellness habits: chat with an empathetic plant friend, track moods, and see insights—privately and stigma-free.

<img src="public/plant-favicon.svg" height="56" alt="Mental AI" />

## Features
- Chat with an empathetic AI (Gemini 1.5) with crisis-language detection
- Mood tracking, achievements, and a plant that levels up with you
- Insights dashboard with weekly trends and distributions
- Optional weather integration for context-aware tips

## Tech Stack
- React 18 + TypeScript, Vite
- Tailwind CSS + Radix UI (shadcn/ui)
- Google Gemini API
- Supabase (Postgres) or localStorage fallback

## Quick Start
1) Install
   - Node 18+ required
   - `npm install`
2) Configure env
   - Copy `.env.example` to `.env`
   - Fill at least: `VITE_GEMINI_API_KEY`
   - Optional: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_WEATHER_API_KEY`
   - Optional demo seed: `VITE_ENABLE_SAMPLE_DATA=false` (set to true to prefill demo data)
3) Database (optional but recommended)
   - Create a Supabase project
   - Run SQL in `database/setup.sql`
   - Put URL and anon key into `.env`
4) Run
   - `npm run dev` and open the printed localhost URL

## Environment Variables
- VITE_GEMINI_API_KEY: Gemini API key (Required)
- VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY: Supabase (Optional; if missing, app uses localStorage)
- VITE_WEATHER_API_KEY: OpenWeather (Optional)
- VITE_ENABLE_SAMPLE_DATA: `true|false` to seed demo data on first run (Default: false)

## Troubleshooting
- White screen on load: the startup overlay in `index.html` shows any error—check it and your browser console.
- “AI error …”: validate `VITE_GEMINI_API_KEY` and network access to `generativelanguage.googleapis.com`.
- Supabase errors: verify URL/key and that `database/setup.sql` was applied.

## License & Crisis Support
- MIT License
- If you’re in crisis, please reach out to professional help immediately (India: AASRA 91-9820466726, iCALL 022-25521111). This app is not a substitute for professional care.
