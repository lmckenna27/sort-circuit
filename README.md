# Sort Circuit

A physics-based recycling sorting game, made by **Ecological Justice**. Drag each item to its bin before the line gets away from you — one mistake ends the run.

## How to play

- Items drop onto a conveyor line — drag each one into the correct bin:
  - **Compost**
  - **Landfill**
  - **Aluminum**
- Sort as many as you can, keep your streak alive, and push for the high score.
- One mistake and the run is over.

## The game

- `index.html` / `game.html` — the entire game in a single self-contained file: physics, art, fonts, and synthesized audio are all embedded, so it runs anywhere with no build step.
- Physics constants are carried over from the original Unity prototype.

## Leaderboard

- The shared leaderboard runs on **Firebase Firestore** (client-only — no backend server). After a run, players enter their **Student ID** to save a score.
- The board shows the **top 25** and updates each student's **best** score.
- **Privacy by design:** the app looks up the Student ID in a private `roster` collection and only ever shows the display name **"First L. 'YY"** (first name, last initial, class year — the year comes from the first two digits of the ID). Full names and raw Student IDs are **never** stored in the public leaderboard; each row is keyed by a one-way hash of the ID. Unknown IDs get a friendly error pointing to `ecojustice@brophybroncos.org`.
- Security is enforced entirely by Firestore rules (`firestore.rules`). See **[FIREBASE.md](FIREBASE.md)** for the full data model, the local-emulator workflow, roster seeding, and the App Check hardening.

## Admin

- There is no separate admin app — view and moderate scores directly in the [Firebase Console](https://console.firebase.google.com/project/sort-circuit/firestore/data) (Firestore → Data).

## Configuration & secrets

- The Firebase web config in the HTML is public by design (safe to commit).
- **Never commit** `roster_seed.json`, `scores_rows.csv`, service-account keys (`*-firebase-adminsdk-*.json`), or `.emulator-data/` — they contain the student roster or admin credentials. They're already listed in `.gitignore`.
