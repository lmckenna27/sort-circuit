/**
 * Seed the private `roster` collection: roster/{studentId} -> { n: "First L" }.
 *
 * Uses the Firebase Admin SDK, which BYPASSES security rules (so it works even
 * though `roster` is locked to clients). Works on the free Spark plan — no
 * Cloud Functions / Blaze needed.
 *
 * LOCAL EMULATOR (default):
 *   # with the Firestore emulator running:
 *   cd functions && node seed-roster.js
 *
 * PRODUCTION:
 *   # 1) Firebase console -> Project settings -> Service accounts ->
 *   #    "Generate new private key"  (saves a JSON key file)
 *   # 2) then:
 *   cd functions
 *   SEED_TARGET=prod GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/key.json node seed-roster.js
 */
const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

const PROJECT_ID = process.env.GCLOUD_PROJECT || "sort-circuit";

if (process.env.SEED_TARGET !== "prod") {
  process.env.FIRESTORE_EMULATOR_HOST =
    process.env.FIRESTORE_EMULATOR_HOST || "127.0.0.1:8080";
  console.log(`Seeding EMULATOR at ${process.env.FIRESTORE_EMULATOR_HOST} (project ${PROJECT_ID})`);
} else {
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.error("SEED_TARGET=prod requires GOOGLE_APPLICATION_CREDENTIALS pointing at a service-account key JSON.");
    process.exit(1);
  }
  console.log(`Seeding PRODUCTION project ${PROJECT_ID}`);
}

admin.initializeApp({ projectId: PROJECT_ID });
const db = admin.firestore();

async function main() {
  const file = path.join(__dirname, "..", "roster_seed.json");
  const roster = JSON.parse(fs.readFileSync(file, "utf8")); // { studentId: "First L" }
  const ids = Object.keys(roster);
  console.log(`Loaded ${ids.length} students from ${file}`);

  let written = 0;
  for (let i = 0; i < ids.length; i += 400) {
    const batch = db.batch();
    for (const id of ids.slice(i, i + 400)) {
      batch.set(db.collection("roster").doc(id), { n: roster[id] });
    }
    await batch.commit();
    written += Math.min(400, ids.length - i);
    console.log(`  committed ${written}/${ids.length}`);
  }
  console.log(`Done. Seeded ${written} roster entries.`);
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
