/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");

const base = path.resolve(__dirname, "..");
const checks = [
  { path: "src/app/evidence/page.tsx", phrase: "Evidence Mode" },
  { path: "src/app/evidence/golden-path/page.tsx", phrase: "Golden Path" },
  { path: "src/app/evidence/verify/page.tsx", phrase: "pack_hash" },
  { path: "src/app/evidence/pack/page.tsx", phrase: "View a Pack" },
  { path: "src/app/evidence/pack/[pack_hash]/page.tsx", phrase: "Evidence Pack" },
  { path: "src/app/evidence/source/[slug]/page.tsx", phrase: "Source documents" },
];

let passed = 0;
const errors = [];

for (const check of checks) {
  const absolute = path.join(base, check.path);
  if (!fs.existsSync(absolute)) {
    errors.push(`Missing file: ${check.path}`);
    continue;
  }

  const contents = fs.readFileSync(absolute, "utf-8");
  if (!contents.includes(check.phrase)) {
    errors.push(`"${check.phrase}" not found in ${check.path}`);
    continue;
  }

  passed += 1;
}

if (errors.length) {
  console.error("Evidence route smoke checks failed:");
  for (const error of errors) {
    console.error("  -", error);
  }
  process.exit(1);
}

console.log(`Evidence route smoke checks passed (${passed} files).`);
