/**
 * One-off production setup via the Admin SDK (bypasses rules; never weakens them):
 *   1) reseed the roster with the new "First L. 'YY" names
 *   2) delete all existing score rows (the leftover tests)
 *   3) import the old leaderboard (scores_rows.csv), resolving Student ID -> name
 *      via the roster, keyed by display name, keep-best. Historical rows have no
 *      recorded play time, so timeSeconds is 0.
 *
 * Run:
 *   cd functions
 *   GOOGLE_APPLICATION_CREDENTIALS=/abs/path/key.json CSV=/abs/path/scores_rows.csv node prod-import.js
 */
const admin = require("firebase-admin");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// Must match the browser's scoreKey(): SHA-256 hex of "sortcircuit|" + studentId.
function scoreKey(sid) {
  return crypto.createHash("sha256").update("sortcircuit|" + sid, "utf8").digest("hex");
}

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error("Set GOOGLE_APPLICATION_CREDENTIALS to the service-account key path.");
  process.exit(1);
}
const CSV = process.env.CSV || "/Users/lmckenna27/Downloads/scores_rows.csv";

admin.initializeApp({ projectId: "sort-circuit" });
const db = getFirestore();

const roster = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "roster_seed.json"), "utf8"));

function toTs(s) {
  let iso = s.trim().replace(" ", "T").replace(/([+-]\d\d)$/, "$1:00").replace(/(\.\d{3})\d+/, "$1");
  const d = new Date(iso);
  return isNaN(d) ? Timestamp.now() : Timestamp.fromDate(d);
}

async function commitInChunks(makeRef, items, buildData) {
  let n = 0;
  for (let i = 0; i < items.length; i += 400) {
    const batch = db.batch();
    for (const it of items.slice(i, i + 400)) batch.set(makeRef(it), buildData(it));
    await batch.commit();
    n += Math.min(400, items.length - i);
    console.log(`   committed ${n}/${items.length}`);
  }
}

async function main() {
  // 1) reseed roster
  console.log("1) Reseeding roster with year names…");
  const rosterIds = Object.keys(roster);
  await commitInChunks(id => db.collection("roster").doc(id), rosterIds, id => ({ n: roster[id] }));
  console.log(`   roster: ${rosterIds.length} entries.`);

  // 2) clear scores
  console.log("2) Clearing existing scores…");
  const existing = await db.collection("scores").get();
  for (let i = 0; i < existing.docs.length; i += 400) {
    const batch = db.batch();
    existing.docs.slice(i, i + 400).forEach(d => batch.delete(d.ref));
    await batch.commit();
  }
  console.log(`   deleted ${existing.size} old score docs.`);

  // 3) import historical scores — ONE row per Student ID, keyed by hash(id), so
  //    two students sharing a "First L. 'YY" each get their own row.
  console.log("3) Importing old leaderboard…");
  const lines = fs.readFileSync(CSV, "utf8").trim().split(/\r?\n/);
  lines.shift(); // header
  const byId = new Map();           // sid -> {score, createdAt}  (best per id; CSV has no dupes anyway)
  const unrostered = [];
  for (const line of lines) {
    const p = line.split(",");
    const sid = (p[1] || "").trim(), score = parseInt(p[2], 10), created = p[4];
    if (!roster[sid]) { unrostered.push(sid); continue; }
    if (!byId.has(sid) || score > byId.get(sid).score) byId.set(sid, { score, createdAt: toTs(created) });
  }
  const imports = [...byId.entries()].map(([sid, v]) => ({ key: scoreKey(sid), name: roster[sid], ...v }));
  await commitInChunks(
    it => db.collection("scores").doc(it.key),
    imports,
    it => ({ name: it.name, score: it.score, mode: "standard", timeSeconds: 0, createdAt: it.createdAt })
  );

  // report same-name students (both are kept now, as separate rows)
  const nameIds = new Map();
  for (const sid of byId.keys()) { const n = roster[sid]; (nameIds.get(n) || nameIds.set(n, []).get(n)).push(sid); }
  const sameName = [...nameIds.entries()].filter(([, ids]) => ids.length > 1).map(([n, ids]) => `${n} <- ${ids.join(", ")}`);
  console.log(`   imported ${imports.length} students (one row per Student ID).`);
  console.log(`   SKIPPED (not in roster): ${unrostered.length ? unrostered.join(", ") : "none"}`);
  console.log(`   same-name students (now separate rows): ${sameName.length ? sameName.join(" | ") : "none"}`);
  console.log("Done.");
  process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });
