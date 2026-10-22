// scripts/build-data.ts
import * as fs2 from "fs";
import * as path2 from "path";
import * as crypto from "crypto";

// scripts/llms-parser.ts
var DOCS_PAGE_OVERRIDES = {
  RadioGroup: ["radio"],
  DropdownMenu: ["dropdown"],
  AlertModal: ["modal"],
  // documented on the Modal page
  Chart: ["line-chart", "bar-chart", "area-chart", "pie-chart"],
  Field: []
  // no dedicated page (S5 note: form utility sub-component)
};
function kebab(name) {
  return name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}
function docsPagesFor(name) {
  const pages = DOCS_PAGE_OVERRIDES[name] ?? [kebab(name)];
  return pages.map((p) => `/components/${p}`);
}
function sectionSlice(lines, sectionNo) {
  const start = lines.findIndex((l) => l.startsWith(`# \u2550\u2550\u2550 SECTION ${sectionNo}:`));
  if (start === -1) throw new Error(`SECTION ${sectionNo} header not found`);
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    if (lines[i].startsWith("# \u2550\u2550\u2550 SECTION ")) {
      end = i;
      break;
    }
  }
  return lines.slice(start + 1, end);
}
var ENUM_LITERAL = /^'[^']*'$/;
function parseEnumValues(typeCell) {
  const cleaned = typeCell.replace(/`/g, "").replace(/\\\|/g, "|").trim();
  const parts = cleaned.split("|").map((p) => p.trim());
  if (parts.length < 2) return null;
  if (!parts.every((p) => ENUM_LITERAL.test(p))) return null;
  return parts.map((p) => p.slice(1, -1));
}
var ESCAPED_PIPE_PLACEHOLDER = "";
function splitTableRow(line) {
  return line.replace(/\\\|/g, ESCAPED_PIPE_PLACEHOLDER).split("|").slice(1, -1).map((c) => c.split(ESCAPED_PIPE_PLACEHOLDER).join("\\|").trim());
}
function splitSubComponents(text) {
  const parts = [];
  let depth = 0;
  let cur = "";
  for (const ch of text) {
    if (ch === "(") depth++;
    else if (ch === ")") depth = Math.max(0, depth - 1);
    if (ch === "," && depth === 0) {
      parts.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  parts.push(cur);
  return parts.map((p) => p.replace(/\(.*?\)/g, "").trim()).map((p) => p.replace(/\./g, "")).filter(Boolean);
}
function parseComponents(llmsFull) {
  const lines = sectionSlice(llmsFull.split("\n"), 3);
  const records = [];
  let category = "";
  let header = null;
  let block = [];
  const flush = () => {
    if (header !== null) records.push(parseBlock(header, category, block));
    block = [];
  };
  for (const line of lines) {
    if (line.startsWith("## ")) {
      flush();
      header = null;
      category = line.slice(3).trim();
    } else if (line.startsWith("### ")) {
      flush();
      header = line.slice(4).trim();
    } else if (header !== null) {
      block.push(line);
    }
  }
  flush();
  for (const rec of records) {
    rec.related = records.filter((r) => r.category === rec.category && r.name !== rec.name).map((r) => r.name);
  }
  return records;
}
function parseBlock(header, category, blockLines) {
  const m = header.match(/^(.+?)\s*\((.+)\)\s*$/);
  const name = (m ? m[1] : header).trim();
  const annotation = m ? m[2].trim() : null;
  const examples = [];
  const props = [];
  const notes = [];
  const descriptionLines = [];
  let subComponents = [];
  let sawContent = false;
  let i = 0;
  while (i < blockLines.length) {
    const line = blockLines[i];
    if (line.trim().startsWith("```")) {
      const fence = [];
      i++;
      while (i < blockLines.length && !blockLines[i].trim().startsWith("```")) {
        fence.push(blockLines[i]);
        i++;
      }
      i++;
      examples.push(fence.join("\n"));
      sawContent = true;
      continue;
    }
    if (/^\|\s*Prop/.test(line)) {
      const headerCells = splitTableRow(line);
      const targetMatch = headerCells[0]?.match(/^Prop\s*\((.+)\)$/);
      const target = targetMatch ? targetMatch[1].trim() : null;
      i += 2;
      while (i < blockLines.length && blockLines[i].startsWith("|")) {
        const cells = splitTableRow(blockLines[i]);
        if (cells.length >= 4) {
          props.push({
            target,
            name: cells[0],
            type: cells[1],
            default: cells[2],
            description: cells[3],
            enumValues: parseEnumValues(cells[1])
          });
        }
        i++;
      }
      sawContent = true;
      continue;
    }
    const trimmed = line.trim();
    if (trimmed.startsWith("**Sub-components:**")) {
      subComponents = splitSubComponents(trimmed.slice("**Sub-components:**".length));
    } else if (trimmed.startsWith("**")) {
      notes.push(trimmed);
    } else if (trimmed && trimmed !== "---" && !sawContent) {
      descriptionLines.push(trimmed);
    } else if (trimmed && trimmed !== "---") {
      notes.push(trimmed);
    }
    i++;
  }
  const symbols = [];
  const peerDeps = /* @__PURE__ */ new Set();
  let importPath = "";
  const importRe = /import\s*\{([\s\S]*?)\}\s*from\s*'([^']+)'/g;
  for (const example of examples) {
    let im;
    while ((im = importRe.exec(example)) !== null) {
      const module = im[2];
      const names = im[1].split(",").map((s) => s.trim()).filter(Boolean);
      if (module.startsWith("@7onic-ui/")) {
        if (!importPath) importPath = module;
        for (const n of names) {
          if (n.startsWith("type ")) continue;
          if (!symbols.includes(n)) symbols.push(n);
        }
      } else if (module !== "react") {
        peerDeps.add(module);
      }
    }
  }
  const variants = props.filter((p) => p.enumValues !== null).map((p) => ({ target: p.target, prop: p.name, values: p.enumValues }));
  const sizeSpec = props.filter((p) => p.name === "size").map((p) => ({ target: p.target, values: p.enumValues ?? [], description: p.description }));
  const a11y = notes.filter(
    (n) => /aria|a11y|accessib|keyboard|screen reader|role=|focus trap/i.test(n)
  );
  return {
    name,
    annotation,
    category,
    description: descriptionLines.join(" "),
    importPath,
    peerDeps: [...peerDeps].sort(),
    symbols,
    compound: subComponents.length > 0,
    subComponents,
    props,
    variants,
    sizeSpec,
    notes,
    a11y,
    related: [],
    docsUrls: docsPagesFor(name),
    examples
  };
}
function splitSubsections(lines) {
  const subs = [];
  let current = null;
  for (const line of lines) {
    const h = line.match(/^(##|###)\s+(.+)$/);
    if (h) {
      if (current) subs.push(current);
      current = { title: h[2].trim(), body: [] };
    } else if (current) {
      current.body.push(line);
    }
  }
  if (current) subs.push(current);
  return subs;
}
function bodyText(sub) {
  return (sub?.body ?? []).join("\n").trim();
}
function parseRules(llmsFull) {
  const lines = sectionSlice(llmsFull.split("\n"), 1);
  const subs = splitSubsections(lines);
  const find = (prefix) => subs.find((s) => s.title.includes(prefix));
  const whitelistBody = find("Whitelist \u2014 ONLY")?.body ?? [];
  const whitelist = [];
  let current = null;
  for (const line of whitelistBody) {
    const m = line.match(/^(\d+)\.\s+\*\*(.+?)\*\*\s*(.*)$/);
    if (m) {
      if (current) whitelist.push({ ...current, body: current.body.join("\n").trim() });
      current = { num: Number(m[1]), title: m[2].trim(), body: m[3] ? [m[3]] : [] };
    } else if (current && line.trim()) {
      current.body.push(line);
    } else if (current && !line.trim()) {
      whitelist.push({ ...current, body: current.body.join("\n").trim() });
      current = null;
    }
  }
  if (current) whitelist.push({ ...current, body: current.body.join("\n").trim() });
  const forbiddenBody = find("\u274C Forbidden Patterns")?.body ?? [];
  const forbiddenPatterns = [];
  let inFence = false;
  let group = null;
  for (const line of forbiddenBody) {
    if (line.trim().startsWith("```")) {
      inFence = !inFence;
      continue;
    }
    if (!inFence) continue;
    const lm = line.match(/^\/\/\s*❌\s*(.+)$/);
    if (lm) {
      if (group) forbiddenPatterns.push(group);
      group = { label: lm[1].trim(), examples: [] };
    } else if (group && line.trim()) {
      group.examples.push(line);
    }
  }
  if (group) forbiddenPatterns.push(group);
  const selfCheckBody = find("Self-Check")?.body ?? [];
  const selfCheck = selfCheckBody.map((l) => l.match(/^-\s*\[\s*\]\s*(.+)$/)?.[1]?.trim()).filter((x) => Boolean(x));
  const doubtIdx = selfCheckBody.findIndex((l) => l.includes("When in doubt"));
  const docsReference = doubtIdx === -1 ? "" : selfCheckBody.slice(doubtIdx).filter((l) => l.trim() !== "---").join("\n").trim();
  const custBody = bodyText(find("Token Customization"));
  const tokenFilesReadonly = [
    ...new Set(
      [...custBody.matchAll(/`([\w.-]+\.(?:css|js|mjs|ts|json|d\.ts))`/g)].map((mm) => mm[1])
    )
  ];
  const consumed = /* @__PURE__ */ new Set([
    "Core Principle",
    "Whitelist \u2014 ONLY These Are Allowed",
    "Decision Tree \u2014 For Every UI Element",
    "\u274C Forbidden Patterns",
    "When User Requests Custom Values",
    "Third-Party Libraries",
    "Token Customization Is the User's Responsibility",
    "Self-Check (after writing ANY code)",
    "How to Start",
    "\u26D4 AI Rules \u2014 Whitelist System"
  ]);
  const sections = subs.filter((s) => !consumed.has(s.title)).map((s) => ({ title: s.title, body: s.body.join("\n").trim() }));
  return {
    corePrinciple: bodyText(find("Core Principle")),
    whitelist,
    decisionTree: bodyText(find("Decision Tree")),
    forbiddenPatterns,
    customValueProtocol: bodyText(find("When User Requests Custom Values")),
    thirdPartyProtocol: bodyText(find("Third-Party Libraries")),
    tokenFilesReadonly,
    selfCheck,
    docsReference,
    sections
  };
}

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

// scripts/build-data.ts
var EXPECTED_COMPONENT_COUNT = 41;
function main() {
  const root = process.argv[2] ? path2.resolve(process.argv[2]) : findRepoRoot();
  const llmsPath = path2.join(root, "public", "llms-full.txt");
  const llmsFull = fs2.readFileSync(llmsPath, "utf8");
  const sourceHash = crypto.createHash("sha256").update(llmsFull).digest("hex");
  const components = parseComponents(llmsFull);
  const rules = parseRules(llmsFull);
  for (const c of components) {
    if (c.importPath.endsWith("/chart") && !c.peerDeps.includes("recharts")) {
      c.peerDeps.push("recharts");
    }
  }
  if (components.length !== EXPECTED_COMPONENT_COUNT) {
    console.error(
      `FAIL: parsed ${components.length} components, expected ${EXPECTED_COMPONENT_COUNT}`
    );
    console.error(components.map((c) => c.name).join(", "));
    process.exit(1);
  }
  const problems = [];
  for (const c of components) {
    if (!c.importPath) problems.push(`${c.name}: no 7onic import found in examples`);
    if (c.examples.length === 0) problems.push(`${c.name}: no examples`);
    if (c.props.length === 0) problems.push(`${c.name}: no props table`);
  }
  if (rules.whitelist.length !== 9) problems.push(`whitelist items: ${rules.whitelist.length} (expected 9 \u2014 #9 is the 7onic-specific token-first/leading-* rule)`);
  if (rules.selfCheck.length !== 10) problems.push(`selfCheck items: ${rules.selfCheck.length} (expected 10)`);
  if (rules.forbiddenPatterns.length === 0) problems.push("no forbidden patterns parsed");
  if (problems.length > 0) {
    console.error("FAIL: parser sanity checks:");
    for (const p of problems) console.error(`  - ${p}`);
    process.exit(1);
  }
  const dataDir = path2.join(root, "mcp", "data");
  fs2.mkdirSync(dataDir, { recursive: true });
  const meta = { generatedFrom: "public/llms-full.txt", sourceHash };
  fs2.writeFileSync(
    path2.join(dataDir, "components.json"),
    JSON.stringify({ ...meta, count: components.length, components }, null, 2) + "\n"
  );
  fs2.writeFileSync(
    path2.join(dataDir, "rules.json"),
    JSON.stringify({ ...meta, rules }, null, 2) + "\n"
  );
  const compound = components.filter((c) => c.compound).length;
  console.log(
    `components.json: ${components.length} records (compound ${compound} / standalone ${components.length - compound})`
  );
  console.log(
    `rules.json: whitelist ${rules.whitelist.length} \xB7 forbidden ${rules.forbiddenPatterns.length} \xB7 selfCheck ${rules.selfCheck.length} \xB7 extra sections ${rules.sections.length}`
  );
  console.log(`sourceHash: ${sourceHash.slice(0, 16)}\u2026`);
  console.log("OK");
}
main();
