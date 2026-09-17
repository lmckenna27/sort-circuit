# Sort Circuit — Firebase (Firestore) leaderboard

The leaderboard runs on **Firebase Firestore**, **client-only** (free Spark plan —
no Cloud Functions). The browser talks to Firestore directly, and **Firestore
security rules** (`firestore.rules`) are the enforcement. The Supabase backend is
no longer used here.

## Data model

| Collection | Doc id | Fields | Who can touch it |
|---|---|---|---|
| `roster` | `{studentId}` | `{ n: "First L. 'YY" }` | **get** one by ID (public); **no list**, **no writes** |
| `scores` | `sha256("sortcircuit\|"+studentId)` | `{ name, score, mode, timeSeconds, createdAt }` | **read** (public); **create** validated; **update** only to a *higher* score (keep-best); **no delete** |

- Full names are **never stored** — the roster holds only "First L. 'YY" (e.g. `Alijah D. '30`); the class year comes from the first two digits of the Student ID.
- **Raw Student IDs are never stored in `scores`.** Each row is keyed by a one-way
  **hash** of the ID, so every student is unique — two students who share a
  "First L. 'YY" each get their own row — without exposing any ID.
- **Keep-best:** one row per student; a submission creates it or raises it, and a
  lower score is ignored. `timeSeconds` is the active play time (pauses excluded)
  of that best run (0 for entries imported from the old game).
- The app looks up the entered ID in `roster` to reject unknown IDs and get the
  display name. Score is capped 0–1000 by the rules; the board shows the top 25.

## What's protected vs. the trade-offs (client-only, by your choice)

**Enforced by rules (verified):**
- Roster can't be listed/dumped — only single-ID lookups.
- Scores can't be edited or deleted, only added.
- A score must be a well-formed `{name, score 0–1000, mode:'standard', createdAt}`
  — so junk, out-of-range values (e.g. `999999999`), and IDs-as-names are rejected.
- Full names and student IDs never leave the server side of this model.

**Accepted trade-offs of having no server (Cloud Functions):**
- **Valid IDs are brute-forceable** — someone could try IDs and see which resolve
  to a name (only the public "First L" leaks, never full names).
- **The board is grief-able** — anyone could POST extra valid-shaped entries
  (≤1000) with a made-up "First L". Real scores can't be altered or deleted.
- No server-side rate limiting.

**Recommended hardening (free, big win):** turn on **Firebase App Check**
(reCAPTCHA v3) and enable enforcement for Firestore. That blocks reads/writes that
don't come from your real site, which shuts down curl/bot enumeration and griefing.
Setup: Console → App Check → register the web app with reCAPTCHA, add the App Check
SDK snippet to `index.html`/`game.html`, then enable enforcement for Firestore.

**Free-tier reads:** the board no longer polls on a timer (that would burn the
50k reads/day free quota at classroom scale). It refreshes on page load, after a
submission, and when the tab regains focus.

## Production status (already done)

- ✅ `firestore.rules` + `firestore.indexes.json` deployed to project `sort-circuit`.
- ✅ Roster seeded: all **1,359** students in the production `roster` collection.
- ✅ `index.html` / `game.html` point at **production** Firebase by default.

The site itself is not published yet. To publish on Firebase Hosting:

```bash
firebase deploy --only hosting        # serves the folder at https://sort-circuit.web.app
```

(Or keep hosting on Netlify — just deploy this folder there. The game talks to
Firebase either way.)

## Run locally against the emulator

```bash
firebase emulators:start --only firestore,hosting --import=./.emulator-data --export-on-exit=./.emulator-data
# seed the emulator roster once (if not importing):
cd functions && node seed-roster.js
```

Open **http://localhost:5050/index.html?emu=1** — the `?emu=1` flag points the game
at the local Firestore emulator instead of production. (Port 5050 because macOS
Control Center squats on 5000.)

## Re-seeding / editing the roster

The roster is locked to clients, so writes need admin access. Two ways:

- **Service-account key (standard):** Console → Project settings → Service accounts
  → *Generate new private key*, then:
  ```bash
  cd functions
  SEED_TARGET=prod GOOGLE_APPLICATION_CREDENTIALS=/abs/path/key.json node seed-roster.js
  ```
- The roster source is `roster_seed.json` (`{ "studentId": "First L" }`),
  generated from the class CSV.

## Files

| File | Purpose |
|---|---|
| `index.html`, `game.html` | the game; leaderboard reads/writes Firestore directly |
| `firestore.rules` | the security model (the real enforcement) |
| `firestore.indexes.json` | composite index for the leaderboard query |
| `roster_seed.json` | `{ id: "First L" }` for all 1,359 students |
| `functions/seed-roster.js` | Admin-SDK seeder (emulator, or prod via a key) |
| `firebase.json`, `.firebaserc` | Firebase + emulator config |

> `functions/` no longer contains Cloud Functions (removed with the client-only
> switch) — it's kept only for the Admin-SDK seeder and its dependencies.
