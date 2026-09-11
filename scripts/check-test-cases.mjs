#!/usr/bin/env node
// Cross-checks PRD Appendix B test case IDs against Playwright test titles.
// Every TC ID in the appendix must be the start of at least one test title
// under tests/browser or tests/logic, or this script fails and lists the gaps.
//
// Usage:
//   npm run tc:check              # check every TC ID in the appendix
//   npm run tc:check -- 1 2       # only check TC-1.* and TC-2.* (features built so far)
//   npm run tc:check -- 1 2 J     # also include the TC-J journey cases

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const repoRoot = process.cwd();
const prdPath = join(repoRoot, "docs/prd/customer-ordering.md");
const testDirs = ["tests/browser", "tests/logic"];

function parseAppendixB(markdown) {
  const sectionRe = /^### TC-(\w+):.*$/gm;
  const headers = [...markdown.matchAll(sectionRe)];
  const cases = [];

  headers.forEach((header, i) => {
    const feature = header[1]; // "1".."6" or "J"
    const start = header.index;
    const end = i + 1 < headers.length ? headers[i + 1].index : markdown.length;
    const body = markdown.slice(start, end);

    const idRe = /\|\s*(TC-[\w.]+)\s*\|/g;
    let idMatch;
    while ((idMatch = idRe.exec(body))) {
      cases.push({ id: idMatch[1], feature });
    }
  });

  return cases;
}

function walk(dir) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return [];
  }
  return entries.flatMap((entry) => {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) return walk(full);
    if (entry.endsWith(".spec.ts")) return [full];
    return [];
  });
}

function loadTestSource() {
  const files = testDirs.flatMap((dir) => walk(join(repoRoot, dir)));
  return files.map((file) => readFileSync(file, "utf8")).join("\n");
}

function hasTestFor(id, testSource) {
  const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // Match the ID as a whole token: not immediately followed by another digit,
  // so TC-1.1 doesn't count as covering TC-1.10 or TC-1.12.
  const re = new RegExp(escaped + "(?!\\d)");
  return re.test(testSource);
}

function main() {
  const markdown = readFileSync(prdPath, "utf8");
  const allCases = parseAppendixB(markdown);

  const requestedFeatures = process.argv.slice(2);
  const cases =
    requestedFeatures.length === 0
      ? allCases
      : allCases.filter((c) => requestedFeatures.includes(c.feature));

  if (cases.length === 0) {
    console.error("No test cases matched. Check the feature numbers passed to tc:check.");
    process.exit(1);
  }

  const testSource = loadTestSource();
  const missing = cases.filter((c) => !hasTestFor(c.id, testSource));

  if (missing.length > 0) {
    console.error(`Missing Playwright tests for ${missing.length} test case(s):`);
    for (const c of missing) {
      console.error(`  ${c.id} (P0-${c.feature})`);
    }
    process.exit(1);
  }

  console.log(`All ${cases.length} checked test case(s) have a matching Playwright test.`);
}

main();
