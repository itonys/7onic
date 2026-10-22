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
function sourceFiles(root) {
  return [
    path.join(root, "tokens", "json", "tokens.json"),
    path.join(root, "tokens", "css", "themes", "light.css"),
    path.join(root, "tokens", "css", "themes", "dark.css"),
    path.join(root, "tokens", "tailwind", "v3-preset.js")
  ];
}
function parseCssVars(css) {
  const out = /* @__PURE__ */ new Map();
  const re = /--([\w-]+)\s*:\s*([^;]+);/g;
  let m;
  while ((m = re.exec(css)) !== null) out.set(m[1], m[2].trim());
  return out;
}
function resolveValue(value, themeVars, primitiveColors, depth = 0) {
  if (depth > 5 || !value.includes("var(")) return value;
  const next = value.replace(/var\(--([\w-]+)\)/g, (whole, name) => {
    const own = themeVars.get(name);
    if (own !== void 0) return own;
    if (name.startsWith("color-")) {
      const primitive = primitiveColors[name.slice("color-".length)];
      if (primitive !== void 0) return primitive;
    }
    return whole;
  });
  return next === value ? value : resolveValue(next, themeVars, primitiveColors, depth + 1);
}
function buildTheme(css, primitiveColors) {
  const parsed = parseCssVars(css);
  const theme = {};
  for (const [name, raw] of parsed) {
    theme[name] = { name, raw, resolved: resolveValue(raw, parsed, primitiveColors) };
  }
  return theme;
}
function loadPreset(presetPath) {
  const resolved = require2.resolve(presetPath);
  if (require2.cache && require2.cache[resolved]) delete require2.cache[resolved];
  return require2(presetPath);
}
function collectPluginClasses(preset) {
  const classes = [];
  for (const plugin of preset.plugins ?? []) {
    plugin({
      addUtilities(utilities) {
        for (const selector of Object.keys(utilities)) {
          if (selector.startsWith(".")) classes.push(selector.slice(1));
        }
      }
    });
  }
  return classes;
}
function flattenColors(obj, prefix = "") {
  const out = {};
  for (const [key, value] of Object.entries(obj)) {
    const name = key === "DEFAULT" ? prefix : prefix ? `${prefix}-${key}` : key;
    if (typeof value === "string") {
      if (name) out[name] = value;
    } else if (value && typeof value === "object") {
      Object.assign(out, flattenColors(value, name));
    }
  }
  return out;
}
var COLOR_UTILS = [
  "bg",
  "text",
  "border",
  "border-t",
  "border-r",
  "border-b",
  "border-l",
  "divide",
  "ring",
  "ring-offset",
  "outline",
  "fill",
  "stroke",
  "accent",
  "caret",
  "decoration",
  "placeholder",
  "shadow",
  "from",
  "via",
  "to"
];
var SPACING_UTILS = [
  "p",
  "px",
  "py",
  "pt",
  "pr",
  "pb",
  "pl",
  "ps",
  "pe",
  "m",
  "mx",
  "my",
  "mt",
  "mr",
  "mb",
  "ml",
  "ms",
  "me",
  "gap",
  "gap-x",
  "gap-y",
  "space-x",
  "space-y",
  "inset",
  "inset-x",
  "inset-y",
  "top",
  "right",
  "bottom",
  "left",
  "start",
  "end",
  "w",
  "h",
  "size",
  "basis",
  "translate-x",
  "translate-y"
];
var NEGATIVE_SPACING_UTILS = /* @__PURE__ */ new Set([
  "m",
  "mx",
  "my",
  "mt",
  "mr",
  "mb",
  "ml",
  "ms",
  "me",
  "inset",
  "inset-x",
  "inset-y",
  "top",
  "right",
  "bottom",
  "left",
  "start",
  "end",
  "translate-x",
  "translate-y"
]);
var ROUNDED_SIDES = ["", "-t", "-r", "-b", "-l", "-tl", "-tr", "-br", "-bl", "-s", "-e"];
var BORDER_SIDES = ["border", "border-t", "border-r", "border-b", "border-l", "border-x", "border-y"];
var STATE_PREFIXES = [
  "hover",
  "focus",
  "focus-visible",
  "focus-within",
  "active",
  "disabled",
  "visited",
  "first",
  "last",
  "odd",
  "even",
  "group-hover",
  "group-focus",
  "peer-checked",
  "peer-focus",
  "aria-selected",
  "aria-expanded",
  "aria-checked",
  "aria-disabled",
  "data-[state=open]",
  "data-[state=closed]",
  "data-[state=checked]",
  "data-[state=active]",
  "data-[disabled]"
];
function generateWhitelist(tokens, preset) {
  const extend = preset.theme?.extend ?? {};
  const classes = /* @__PURE__ */ new Set();
  const add = (family, key) => {
    classes.add(key === "DEFAULT" ? family : `${family}-${key}`);
  };
  const colorScale = flattenColors(extend.colors ?? {});
  for (const name of Object.keys(colorScale)) {
    for (const util of COLOR_UTILS) classes.add(`${util}-${name}`);
  }
  for (const key of Object.keys(extend.fontSize ?? {})) add("text", key);
  for (const key of Object.keys(extend.fontFamily ?? {})) add("font", key);
  for (const key of Object.keys(tokens.fontWeight ?? {})) add("font", key);
  for (const key of Object.keys(extend.spacing ?? {})) {
    for (const util of SPACING_UTILS) {
      classes.add(`${util}-${key}`);
      if (NEGATIVE_SPACING_UTILS.has(util) && key !== "0") classes.add(`-${util}-${key}`);
    }
  }
  for (const key of Object.keys(extend.borderRadius ?? {})) {
    for (const side of ROUNDED_SIDES) {
      classes.add(key === "DEFAULT" ? `rounded${side}` : `rounded${side}-${key}`);
    }
  }
  for (const key of Object.keys(tokens.borderWidth ?? {})) {
    for (const side of BORDER_SIDES) classes.add(key === "1" ? side : `${side}-${key}`);
    classes.add(key === "1" ? "divide-x" : `divide-x-${key}`);
    classes.add(key === "1" ? "divide-y" : `divide-y-${key}`);
  }
  for (const key of Object.keys(extend.boxShadow ?? {})) add("shadow", key);
  for (const key of Object.keys(extend.zIndex ?? {})) add("z", key);
  for (const key of Object.keys(extend.opacity ?? {})) add("opacity", key);
  for (const key of Object.keys(extend.transitionDuration ?? {})) add("duration", key);
  for (const key of Object.keys(extend.transitionTimingFunction ?? {})) add("ease", key);
  for (const key of Object.keys(extend.scale ?? {})) {
    add("scale", key);
    add("scale-x", key);
    add("scale-y", key);
  }
  for (const key of Object.keys(extend.animation ?? {})) add("animate", key);
  for (const cls of collectPluginClasses(preset)) classes.add(cls);
  const variantPrefixes = [...Object.keys(tokens.breakpoint ?? {}), ...STATE_PREFIXES];
  return {
    whitelist: { classes: [...classes].sort(), variantPrefixes },
    colorScale
  };
}
var DOC_CATEGORIES = [
  { category: "colors", tokenKeys: ["color"] },
  { category: "typography", tokenKeys: ["fontSize", "lineHeight", "fontWeight", "fontFamily"] },
  { category: "spacing", tokenKeys: ["spacing"] },
  { category: "shadows", tokenKeys: ["shadow"] },
  { category: "opacity", tokenKeys: ["opacity"] },
  { category: "radius", tokenKeys: ["borderRadius"] },
  { category: "border-width", tokenKeys: ["borderWidth"] },
  { category: "icon-sizes", tokenKeys: ["iconSize"] },
  { category: "breakpoints", tokenKeys: ["breakpoint"] },
  { category: "z-index", tokenKeys: ["zIndex"] },
  { category: "duration", tokenKeys: ["duration"] },
  { category: "easing", tokenKeys: ["easing"] },
  { category: "scale", tokenKeys: ["scale"] },
  { category: "animation", tokenKeys: ["animation"] }
];
function buildCoverage(tokens) {
  return DOC_CATEGORIES.map(({ category, tokenKeys }) => {
    const count = tokenKeys.reduce(
      (sum, key) => sum + Object.keys(tokens[key] ?? {}).length,
      0
    );
    return { category, tokenKeys, count, present: count > 0 };
  });
}
var cache = /* @__PURE__ */ new Map();
function mtimeSignature(files) {
  return files.map((f) => `${f}:${fs.statSync(f).mtimeMs}`).join("|");
}
function loadDesignData(rootDir) {
  const root = rootDir ?? findRepoRoot();
  const files = sourceFiles(root);
  const signature = mtimeSignature(files);
  const hit = cache.get(root);
  if (hit && hit.signature === signature) return hit.data;
  const [tokensPath, lightPath, darkPath, presetPath] = files;
  const tokens = JSON.parse(fs.readFileSync(tokensPath, "utf8"));
  const primitiveColors = tokens.color ?? {};
  const themes = {
    light: buildTheme(fs.readFileSync(lightPath, "utf8"), primitiveColors),
    dark: buildTheme(fs.readFileSync(darkPath, "utf8"), primitiveColors)
  };
  const preset = loadPreset(presetPath);
  const { whitelist, colorScale } = generateWhitelist(tokens, preset);
  const coverage = buildCoverage(tokens);
  const data = { tokens, themes, whitelist, colorScale, coverage, sources: files };
  cache.set(root, { signature, data });
  return data;
}

// src/data/selfcheck.ts
import { fileURLToPath as fileURLToPath2 } from "url";
import * as path2 from "path";
function main() {
  const root = process.argv[2] ? path2.resolve(process.argv[2]) : findRepoRoot();
  const data = loadDesignData(root);
  console.log(`root: ${root}`);
  console.log("sources:");
  for (const s of data.sources) console.log(`  - ${path2.relative(root, s)}`);
  console.log("\ncategory coverage (doc-site 14):");
  let missing = 0;
  for (const c of data.coverage) {
    if (!c.present) missing++;
    console.log(
      `  ${c.present ? "OK " : "MISSING"} ${c.category.padEnd(14)} ${String(c.count).padStart(4)} tokens  (${c.tokenKeys.join(", ")})`
    );
  }
  const light = Object.keys(data.themes.light).length;
  const dark = Object.keys(data.themes.dark).length;
  console.log(`
theme vars: light=${light} dark=${dark}`);
  console.log(
    `whitelist: ${data.whitelist.classes.length} classes, ${data.whitelist.variantPrefixes.length} variant prefixes`
  );
  const textLight = data.themes.light["color-text"];
  const textDark = data.themes.dark["color-text"];
  console.log("\nsamples:");
  console.log(`  light --color-text: raw=${textLight?.raw} resolved=${textLight?.resolved}`);
  console.log(`  dark  --color-text: raw=${textDark?.raw} resolved=${textDark?.resolved}`);
  const wl = new Set(data.whitelist.classes);
  console.log(
    `  classes include: bg-primary=${wl.has("bg-primary")} text-sm=${wl.has("text-sm")} border=${wl.has("border")} font-semibold=${wl.has("font-semibold")} icon-sm=${wl.has("icon-sm")} animate-fade-in=${wl.has("animate-fade-in")}`
  );
  if (missing > 0) {
    console.error(`
RESULT: FAIL \u2014 ${missing} categories missing`);
    process.exit(1);
  }
  console.log("\nRESULT: OK \u2014 all 14 categories covered");
}
if (process.argv[1] && path2.resolve(process.argv[1]) === fileURLToPath2(import.meta.url)) {
  main();
}
export {
  findRepoRoot,
  loadDesignData
};
