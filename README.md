# IBZY

Finance interview-prep study app: modules → lesson bubbles → 10 cards + a lesson quiz, plus Accounting 101, Browse, Drill, Quiz, Labs, Map, Stories and Progress.

- Static site — no build step. Vercel serves the repo root as-is.
- Accounts and progress sync use Supabase (`js/config.js`, table `public.user_state` with row-level security).
- Content lives in `data/`: `tracks.js` (module list), one file per module (e.g. `accounting.js`), `mcqs.js` (quiz bank tagged by lesson), `primers.js`.

Card questions follow the order of the Wall Street Prep *Red Book* (1st ed.) and show the page number; answers are study notes written for this app.

## Adding a module
1. Add `data/<module>.js` setting `window.IBZY_CONTENT.<module id> = {units:{<unit id>:[lessons]}}`.
2. Add its `<script>` tag to `index.html` before `js/build-data.js`.
3. Tag its quiz questions in `data/mcqs.js` with the lesson id (`l`) and unit label (`u`).
