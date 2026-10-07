// scripts/verify-drift.ts
import * as fs2 from "fs";
import * as path2 from "path";
import * as crypto from "crypto";

// src/data/loader.ts
import * as fs from "fs";
import * as path from "path";
import { createRequire } from "module";
import { fileURLToPath } from "url";
var require2 = createRequire(import.meta.url);
function findRepoRoot(startDir) {
  let dir = startDir ?? path.dirname(fileURLToPath(import.meta.url));
  for (let i = 0; i < 8; i++) {
    if (fs.existsSync(path.join(dir, "tokens", "json", "tokens.json"))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  throw new Error(
    `Could not locate repo root (tokens/json/tokens.json) above ${startDir ?? import.meta.url}`
  );
}

// scripts/verify-drift.ts
function parseIndexExports(indexSrc) {
  const symbolToFile = /* @__PURE__ */ new Map();
  const re = /^export \{([^}]+)\} from '\.\/([\w-]+)'/gm;
  let m;
  while ((m = re.exec(indexSrc)) !== null) {
    for (const raw of m[1].split(",")) {
      const entry = raw.trim();
      if (!entry) continue;
      const alias = entry.match(/^(\S+)\s+as\s+(\S+)$/);
      if (alias) {
        symbolToFile.set(alias[1], m[2]);
        symbolToFile.set(alias[2], m[2]);
      } else {
        symbolToFile.set(entry, m[2]);
      }
    }
  }
  return symbolToFile;
}
function parseChartExports(chartSrc) {
  const symbols = /* @__PURE__ */ new Set();
  const re = /^export \{([\s\S]*?)\}\s*$/gm;
  let m;
  while ((m = re.exec(chartSrc)) !== null) {
    for (const raw of m[1].split(",")) {
      const entry = raw.trim();
      if (!entry) continue;
      const alias = entry.match(/^(\S+)\s+as\s+(\S+)$/);
      if (alias) {
        symbols.add(alias[1]);
        symbols.add(alias[2]);
      } else {
        symbols.add(entry);
      }
    }
  }
  return symbols;
}
function extractCvaVariants(source) {
  const results = [];
  const marker = /variants\s*:\s*\{/g;
  let m;
  while ((m = marker.exec(source)) !== null) {
    const before = source.slice(Math.max(0, m.index - 20), m.index);
    if (/(default|compound)\s*$/i.test(before)) continue;
    const variants = {};
    let depth = 0;
    let i = m.index + m[0].length - 1;
    let currentProp = null;
    let inString = null;
    while (i < source.length) {
      const ch = source[i];
      if (inString) {
        if (ch === inString && source[i - 1] !== "\\") inString = null;
        i++;
        continue;
      }
      if (ch === "/" && source[i + 1] === "/") {
        while (i < source.length && source[i] !== "\n") i++;
        continue;
      }
      if (depth === 1 || depth === 2) {
        const keyMatch = source.slice(i, i + 80).match(/^(?:'([^']+)'|"([^"]+)"|([\w$]+))\s*:/);
        if (keyMatch) {
          const key = keyMatch[1] ?? keyMatch[2] ?? keyMatch[3];
          if (depth === 1) {
            currentProp = key;
            variants[key] = /* @__PURE__ */ new Set();
          } else if (currentProp) {
            variants[currentProp].add(key);
          }
          i += keyMatch[0].length;
          continue;
        }
      }
      if (ch === "'" || ch === '"' || ch === "`") {
        inString = ch;
        i++;
        continue;
      }
      if (ch === "{") {
        depth++;
        i++;
        continue;
      }
      if (ch === "}") {
        depth--;
        if (depth === 0) break;
        i++;
        continue;
      }
      i++;
    }
    if (Object.keys(variants).length > 0) results.push(variants);
  }
  return results;
}
function extractUnionTypes(source) {
  const results = [];
  const re = /=\s*('[^']+'(?:\s*\|\s*'[^']+')+)/g;
  let m;
  while ((m = re.exec(source)) !== null) {
    results.push(new Set(m[1].split("|").map((p) => p.trim().slice(1, -1))));
  }
  return results;
}
function kebab(name) {
  return name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}
function main() {
  const root = process.argv[2] ? path2.resolve(process.argv[2]) : findRepoRoot();
  const { sourceHash, components } = JSON.parse(
    fs2.readFileSync(path2.join(root, "mcp", "data", "components.json"), "utf8")
  );
  const errors = [];
  const warnings = [];
  const llmsFull = fs2.readFileSync(path2.join(root, "public", "llms-full.txt"), "utf8");
  const currentHash = crypto.createHash("sha256").update(llmsFull).digest("hex");
  if (currentHash !== sourceHash) {
    errors.push(
      `data/components.json is STALE (recorded ${sourceHash.slice(0, 12)}\u2026, current ${currentHash.slice(0, 12)}\u2026) \u2014 re-run build-data.`
    );
  }
  const uiDir = path2.join(root, "src", "components", "ui");
  const symbolToFile = parseIndexExports(fs2.readFileSync(path2.join(uiDir, "index.ts"), "utf8"));
  const chartExports = parseChartExports(fs2.readFileSync(path2.join(uiDir, "chart.tsx"), "utf8"));
  const documented = /* @__PURE__ */ new Set();
  for (const rec of components) {
    const isChart = rec.importPath.endsWith("/chart");
    const exportSet = isChart ? chartExports : new Set(symbolToFile.keys());
    for (const symbol of [...rec.symbols, ...rec.subComponents]) {
      documented.add(symbol);
      if (!exportSet.has(symbol)) {
        errors.push(`${rec.name}: documented symbol "${symbol}" not exported from ${rec.importPath}`);
      }
    }
  }
  for (const symbol of symbolToFile.keys()) {
    if (/^[A-Z]/.test(symbol) && !documented.has(symbol)) {
      warnings.push(`undocumented export (main): ${symbol} (./${symbolToFile.get(symbol)})`);
    }
  }
  for (const symbol of chartExports) {
    if (/^[A-Z]/.test(symbol) && !documented.has(symbol)) {
      warnings.push(`undocumented export (chart): ${symbol}`);
    }
  }
  const parsedCache = /* @__PURE__ */ new Map();
  const parsedFor = (file) => {
    if (!parsedCache.has(file)) {
      const source = fs2.readFileSync(path2.join(uiDir, `${file}.tsx`), "utf8");
      parsedCache.set(file, { cva: extractCvaVariants(source), unions: extractUnionTypes(source) });
    }
    return parsedCache.get(file);
  };
  let compared = 0;
  let uncompared = 0;
  for (const rec of components) {
    const isChart = rec.importPath.endsWith("/chart");
    const files = isChart ? ["chart"] : [...new Set(rec.symbols.map((s) => symbolToFile.get(s)).filter((f) => Boolean(f)))];
    const cvaList = files.flatMap((f) => parsedFor(f).cva);
    const unionList = files.flatMap((f) => parsedFor(f).unions);
    for (const variant of rec.variants) {
      const docValues = new Set(variant.values);
      const setEquals = (s) => s.size === docValues.size && [...docValues].every((v) => s.has(v));
      const candidates = cvaList.filter((v) => variant.prop in v);
      if (candidates.length === 0) {
        if (unionList.some(setEquals)) compared++;
        else uncompared++;
        continue;
      }
      compared++;
      if (candidates.some((v) => setEquals(v[variant.prop]))) continue;
      if (unionList.some(setEquals)) continue;
      const superset = candidates.find((v) => [...docValues].every((val) => v[variant.prop].has(val)));
      const label = `${rec.name}.${variant.prop}${variant.target ? ` (${variant.target})` : ""}`;
      if (superset) {
        const extra = [...superset[variant.prop]].filter((v) => !docValues.has(v));
        warnings.push(`${label}: src CVA has undocumented values [${extra.join(", ")}]`);
      } else {
        const best = candidates[0];
        const missing = [...docValues].filter((v) => !best[variant.prop].has(v));
        errors.push(
          `${label}: documented values [${missing.join(", ")}] missing in src CVA (src has [${[...best[variant.prop]].join(", ")}])`
        );
      }
    }
  }
  const registrySrc = fs2.readFileSync(path2.join(root, "cli", "src", "registry", "index.ts"), "utf8");
  const registryKeys = new Set(
    [...registrySrc.matchAll(/^  ['"]([\w-]+)['"]: \{\s*\n\s*name:/gm)].map((mm) => mm[1])
  );
  const RECORD_TO_REGISTRY = {
    // Measured against cli/src/registry/index.ts keys (40 entries).
    Chart: ["chart"],
    DropdownMenu: ["dropdown"],
    AlertModal: ["modal"]
    // ships inside the modal entry (modal.tsx)
  };
  const coveredKeys = /* @__PURE__ */ new Set();
  for (const rec of components) {
    const candidates = RECORD_TO_REGISTRY[rec.name] ?? [kebab(rec.name)];
    const hit = candidates.filter((k) => registryKeys.has(k));
    hit.forEach((k) => coveredKeys.add(k));
    if (hit.length === 0) {
      warnings.push(`${rec.name}: no CLI registry entry (tried: ${candidates.join(", ")})`);
    }
  }
  const uncoveredRegistry = [...registryKeys].filter((k) => !coveredKeys.has(k));
  if (uncoveredRegistry.length > 0) {
    warnings.push(`registry keys without a documented record: ${uncoveredRegistry.join(", ")}`);
  }
  console.log(`records: ${components.length} \xB7 documented symbols: ${documented.size}`);
  console.log(`src exports: main ${symbolToFile.size} \xB7 chart ${chartExports.size} \xB7 registry keys ${registryKeys.size}`);
  console.log(`variant props compared: ${compared} \xB7 uncompared (no CVA/union backing): ${uncompared}`);
  if (warnings.length > 0) {
    console.log(`
WARNINGS (${warnings.length}):`);
    for (const w of warnings) console.log(`  \u26A0 ${w}`);
  }
  if (errors.length > 0) {
    console.error(`
ERRORS (${errors.length}):`);
    for (const e of errors) console.error(`  \u2717 ${e}`);
    console.error("\nRESULT: FAIL");
    process.exit(1);
  }
  console.log("\nRESULT: OK");
}
main();
