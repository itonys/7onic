#!/usr/bin/env node
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// scripts/cli-sync.ts
var fs2 = __toESM(require("node:fs"));
var path2 = __toESM(require("node:path"));

// scripts/sync-tokens.ts
var fs = __toESM(require("node:fs"));
var path = __toESM(require("node:path"));
var readline = __toESM(require("node:readline"));
var ROOT = path.resolve(__dirname, "..");
var TOKENS_PATH = path.join(ROOT, "tokens/figma-tokens.json");
var VARIABLES_CSS_PATH = path.join(ROOT, "tokens/css/variables.css");
var V3_PRESET_PATH = path.join(ROOT, "tokens/tailwind/v3-preset.js");
var V4_THEME_PATH = path.join(ROOT, "tokens/tailwind/v4-theme.css");
var GLOBALS_CSS_PATH = path.join(ROOT, "src/styles/globals.css");
var THEME_LIGHT_PATH = path.join(ROOT, "tokens/css/themes/light.css");
var THEME_DARK_PATH = path.join(ROOT, "tokens/css/themes/dark.css");
var JS_CJS_PATH = path.join(ROOT, "tokens/js/index.js");
var JS_ESM_PATH = path.join(ROOT, "tokens/js/index.mjs");
var TYPES_PATH = path.join(ROOT, "tokens/types/index.d.ts");
var JSON_PATH = path.join(ROOT, "tokens/json/tokens.json");
var CSS_ALL_PATH = path.join(ROOT, "tokens/css/all.css");
var V4_ALL_PATH = path.join(ROOT, "tokens/tailwind/v4.css");
var BRANDS_DIR = path.join(ROOT, "tokens/brands");
var DOCS_SITE_CSS_PATH = path.join(ROOT, "src/styles/docs-site.css");
function validateTokens(tokens) {
  const warnings = [];
  const p = tokens.primitive;
  const colorData = p.color;
  const validPrimitivePaths = /* @__PURE__ */ new Set();
  if (colorData) {
    for (const [palette, paletteData] of Object.entries(colorData)) {
      if (palette.startsWith("$")) continue;
      if (paletteData && typeof paletteData === "object" && "value" in paletteData) {
        validPrimitivePaths.add(`primitive.color.${palette}`);
      } else if (paletteData && typeof paletteData === "object") {
        for (const shade of Object.keys(paletteData)) {
          if (shade.startsWith("$")) continue;
          validPrimitivePaths.add(`primitive.color.${palette}.${shade}`);
        }
      }
    }
  }
  for (const theme of ["light", "dark"]) {
    const themeData = tokens[theme];
    if (!themeData?.color) continue;
    for (const [category, catData] of Object.entries(themeData.color)) {
      if (category.startsWith("$") || !catData) continue;
      for (const [variant, token] of Object.entries(catData)) {
        if (variant.startsWith("$")) continue;
        const val = String(token.value);
        if (val.startsWith("#") || val.match(/^[0-9a-fA-F]{3,8}$/) && !val.startsWith("{")) {
          warnings.push({
            level: "warn",
            theme,
            category,
            variant,
            value: val,
            message: `Hardcoded hex value. Should reference {primitive.color.*}`
          });
          continue;
        }
        if (val.startsWith("{") && val.endsWith("}")) {
          const refPath = val.slice(1, -1);
          if (refPath.startsWith("primitive.color.") && !validPrimitivePaths.has(refPath)) {
            warnings.push({
              level: "error",
              theme,
              category,
              variant,
              value: val,
              message: `References non-existent primitive: ${refPath}`
            });
          }
        }
      }
    }
  }
  return warnings;
}
function printTokenWarnings(warnings) {
  if (warnings.length === 0) return;
  const errors = warnings.filter((w) => w.level === "error");
  const warns = warnings.filter((w) => w.level === "warn");
  if (warns.length > 0) {
    console.log("");
    console.log(`\u26A0\uFE0F  Hardcoded hex in semantic colors (${warns.length} found):`);
    console.log("   These tokens reference raw hex instead of primitive color variables.");
    console.log("   Fix in figma-tokens.json by using {primitive.color.*} references.\n");
    for (const w of warns) {
      console.log(`   ${w.theme}.color.${w.category}.${w.variant}: ${w.value}`);
    }
  }
  if (errors.length > 0) {
    console.log("");
    console.log(`\u274C  Invalid references (${errors.length} found):
`);
    for (const w of errors) {
      console.log(`   ${w.theme}.color.${w.category}.${w.variant}: ${w.message}`);
    }
  }
}
function readJsonFile(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}
function camelToKebab(str) {
  return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}
function pxToRem(px) {
  const n = typeof px === "string" ? parseFloat(px) : px;
  if (n === 0) return "0";
  const rem = n / 16;
  return `${parseFloat(rem.toFixed(4))}rem`;
}
function pxComment(px) {
  const n = typeof px === "string" ? parseFloat(px) : px;
  if (n === 0) return "";
  return `/* ${n}px */`;
}
function resolveReference(ref, allTokens, depth = 0) {
  if (depth > 10) throw new Error(`Circular reference detected: ${ref}`);
  if (!ref.startsWith("{") || !ref.endsWith("}")) return ref;
  const tokenPath = ref.slice(1, -1).split(".");
  let current = allTokens;
  for (const key of tokenPath) {
    if (current && typeof current === "object" && key in current) {
      current = current[key];
    } else {
      return ref;
    }
  }
  if (current && typeof current === "object" && "value" in current) {
    const val = current.value;
    if (typeof val === "string" && val.startsWith("{")) {
      return resolveReference(val, allTokens, depth + 1);
    }
    return String(val);
  }
  return ref;
}
function semanticColorVar(category, variant) {
  return variant === "default" ? `--color-${category}` : `--color-${category}-${variant}`;
}
function stripDefaultFromPath(dotPath) {
  return dotPath.replace(/\.default$/, "").replace(/\./g, "-");
}
function referenceToVar(ref) {
  if (!ref.startsWith("{") || !ref.endsWith("}")) return null;
  const tokenPath = ref.slice(1, -1);
  if (tokenPath.startsWith("primitive.color.")) {
    const colorPath = tokenPath.replace("primitive.color.", "");
    const varName = colorPath.replace(/\./g, "-");
    return `var(--color-${varName})`;
  }
  return null;
}
function resolveCompositionToColorMix(value) {
  const colorPath = value.color.slice(1, -1);
  const colorMatch = colorPath.match(/^(?:light|dark)\.color\.(.+)$/);
  const colorVar = colorMatch ? `var(--color-${stripDefaultFromPath(colorMatch[1])})` : value.color;
  const opacityMatch = value.opacity.match(/\{primitive\.opacity\.(\d+)\}/);
  const pct = opacityMatch ? opacityMatch[1] : "0";
  return `color-mix(in srgb, ${colorVar} ${pct}%, transparent)`;
}
function resolveToVar(value, tokens) {
  if (!value.startsWith("{") || !value.endsWith("}")) return value;
  const varRef = referenceToVar(value);
  if (varRef) return varRef;
  const tokenPath = value.slice(1, -1).split(".");
  let current = tokens;
  for (const key of tokenPath) {
    if (current && typeof current === "object" && key in current) {
      current = current[key];
    } else {
      return resolveReference(value, tokens);
    }
  }
  if (current && typeof current === "object" && "value" in current) {
    const innerVal = current.value;
    if (typeof innerVal === "string" && innerVal.startsWith("{")) {
      const innerVar = referenceToVar(innerVal);
      if (innerVar) return innerVar;
      return resolveToVar(innerVal, tokens);
    }
    return String(innerVal);
  }
  return resolveReference(value, tokens);
}
function parseOpacityFromRgba(color) {
  const match = color.match(/rgba?\([^)]*,\s*([\d.]+)\s*\)/);
  return match ? parseFloat(match[1]) : 1;
}
function formatShadowLayer(s, ext) {
  const x = s.x === "0" ? "0" : `${s.x}px`;
  const y = s.y === "0" ? "0" : `${s.y}px`;
  const blur = s.blur === "0" ? "0" : `${s.blur}px`;
  const spread = s.spread === "0" ? "0" : `${s.spread}px`;
  if (ext?.colorReference) {
    const varName = `var(--color-${stripDefaultFromPath(ext.colorReference)})`;
    const opacity = ext.colorOpacity ?? parseOpacityFromRgba(s.color);
    return `${x} ${y} ${blur} ${spread} color-mix(in srgb, ${varName} ${Math.round(opacity * 100)}%, transparent)`;
  }
  return `${x} ${y} ${blur} ${spread} ${s.color}`;
}
function formatShadowLayerDark(s, ext) {
  const x = s.x === "0" ? "0" : `${s.x}px`;
  const y = s.y === "0" ? "0" : `${s.y}px`;
  const blur = s.blur === "0" ? "0" : `${s.blur}px`;
  const spread = s.spread === "0" ? "0" : `${s.spread}px`;
  if (ext?.colorReference) {
    const varName = `var(--color-${stripDefaultFromPath(ext.colorReference)})`;
    const opacity = ext.darkColorOpacity ?? ext.colorOpacity ?? parseOpacityFromRgba(s.color);
    return `${x} ${y} ${blur} ${spread} color-mix(in srgb, ${varName} ${Math.round(opacity * 100)}%, transparent)`;
  }
  return `${x} ${y} ${blur} ${spread} ${s.color}`;
}
function formatShadow(shadow, ext) {
  if (Array.isArray(shadow)) {
    return shadow.map((s) => formatShadowLayer(s, ext)).join(", ");
  }
  return formatShadowLayer(shadow, ext);
}
function formatShadowDark(shadow, ext) {
  if (ext?.darkValue) {
    const dv = ext.darkValue;
    if (Array.isArray(dv)) {
      return dv.map((s) => formatShadowLayerDark(s, ext)).join(", ");
    }
    return formatShadowLayerDark(dv, ext);
  }
  if (Array.isArray(shadow)) {
    return shadow.map((s) => formatShadowLayerDark(s, ext)).join(", ");
  }
  return formatShadowLayerDark(shadow, ext);
}
function formatValue(value, type) {
  if (type === "color") return value;
  if (type === "fontSizes" || type === "spacing") {
    return pxToRem(value);
  }
  if (type === "borderRadius" || type === "borderWidth" || type === "dimension" || type === "sizing") {
    return `${value}px`;
  }
  return value;
}
function spacingKeyToCssKey(key) {
  return key.replace(/\./g, "-");
}
function orderedKeys(data, strategy, sectionLabel) {
  const allKeys = Object.keys(data).filter((k) => !k.startsWith("$"));
  switch (strategy.type) {
    case "known": {
      const known = strategy.order.filter((k) => allKeys.includes(k));
      const unknown = allKeys.filter((k) => !strategy.order.includes(k));
      if (unknown.length > 0 && sectionLabel) {
        console.warn(`\u26A0\uFE0F  [${sectionLabel}] New keys detected: ${unknown.join(", ")}`);
      }
      return [...known, ...unknown];
    }
    case "numeric":
      return allKeys.sort((a, b) => parseFloat(a) - parseFloat(b));
    case "json":
      return allKeys;
  }
}
function sortByKnownOrder(entries, order) {
  return [...entries].sort((a, b) => {
    const ai = order.indexOf(a[0]);
    const bi = order.indexOf(b[0]);
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
  });
}
function resolveLineHeight(v, fontSizeData) {
  if (!v.lineHeight) return null;
  if (v.fontSize && v.fontSize.startsWith("{") && v.fontSize.endsWith("}")) {
    const sizeRef = v.fontSize.slice(1, -1).split(".").pop();
    const primToken = fontSizeData[sizeRef];
    if (primToken) {
      const primLh = primToken.$extensions?.lineHeight;
      if (primLh && String(primLh) === String(v.lineHeight)) {
        return { value: `var(--line-height-${sizeRef})`, comment: `${primLh}px` };
      }
      if (primLh) {
        return { value: pxToRem(v.lineHeight), comment: `override: ${sizeRef} default = ${primLh}px` };
      }
    }
  }
  return { value: pxToRem(v.lineHeight) };
}
function inlineComment(comment) {
  return comment ? ` /* ${comment} */` : "";
}
var KNOWN_ORDERS = {
  colorPalettes: ["white", "black", "gray", "primary", "secondary", "blue", "green", "yellow", "red", "chart"],
  fontSize: ["2xs", "xs", "sm", "md", "base", "lg", "xl", "2xl", "3xl", "4xl", "5xl"],
  borderRadius: ["none", "sm", "base", "md", "lg", "xl", "2xl", "3xl", "full"],
  shadow: ["xs", "sm", "md", "lg", "xl", "primary-glow"],
  iconSize: ["2xs", "xs", "sm", "md", "lg", "xl"],
  zIndex: ["0", "10", "20", "30", "40", "50", "sticky", "dropdown", "overlay", "modal", "popover", "tooltip", "toast"],
  duration: ["instant", "fast", "micro", "normal", "slow", "slower", "slowest"],
  easing: ["linear", "ease", "easeIn", "easeOut", "easeInOut"],
  breakpoint: ["sm", "md", "lg", "xl", "2xl"],
  shadeOrder: ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900"],
  semanticColorCategories: [
    "background",
    "text",
    "primary",
    "secondary",
    "success",
    "warning",
    "error",
    "info",
    "border",
    "disabled",
    "focus",
    "chart"
  ],
  semanticColorVariants: [
    "default",
    "paper",
    "elevated",
    "muted",
    "hover",
    "active",
    "tint",
    "text",
    "subtle",
    "link",
    "primary",
    "info",
    "success",
    "error",
    "warning",
    "strong",
    "ring",
    "ring-error",
    "bg",
    "1",
    "2",
    "3",
    "4",
    "5"
  ],
  typographyCategories: ["heading", "body", "label"],
  typographyOrders: { heading: ["1", "2", "3", "4", "5", "6"], body: ["lg", "default", "md", "sm", "xs", "2xs"], label: ["lg", "md", "default", "sm", "xs"] }
};
function readAnimationTokens(tokens) {
  const sem = tokens.semantic;
  const animation = sem?.animation;
  if (!animation) return null;
  const p = tokens.primitive;
  const result = [];
  for (const [name, entry] of Object.entries(animation)) {
    if (name.startsWith("$")) continue;
    const token = entry;
    if (token.type !== "composition") continue;
    const val = token.value;
    const ext = token.$extensions;
    const durationKey = extractRefKey(val.duration);
    const easingKey = extractRefKey(val.easing);
    const durationVar = `var(--duration-${durationKey})`;
    const easingVar = `var(--easing-${camelToKebab(easingKey)})`;
    const animationType = ext?.animationType;
    if (animationType === "spin" || animationType === "progress-stripe" || animationType === "spinner-orbit" || animationType === "spinner-dot" || animationType === "spinner-bar" || animationType === "spinner-morph" || animationType === "skeleton-pulse" || animationType === "skeleton-wave" || animationType === "typing-cursor") {
      result.push({ name, type: animationType, opacity: "", scale: "", translateX: "", translateXNegative: false, translateY: "", translateYNegative: false, heightVar: "", durationVar, easingVar });
      continue;
    }
    if (animationType === "height-expand" || animationType === "height-collapse") {
      result.push({ name, type: animationType, opacity: "", scale: "", translateX: "", translateXNegative: false, translateY: "", translateYNegative: false, heightVar: val.heightVar, durationVar, easingVar });
      continue;
    }
    const direction = ext?.direction;
    const type = direction === "exit" ? "exit" : "enter";
    const opacityRaw = val.opacity ? resolveRef(val.opacity, p) : "";
    const scaleRaw = val.scale ? resolveRef(val.scale, p) : "";
    const translateXRaw = val.translateX ? val.translateX.startsWith("{") ? resolveRef(val.translateX, p) : val.translateX : "";
    const translateXNegative = ext?.translateXNegative === true;
    const translateYRaw = val.translateY ? resolveRef(val.translateY, p) : "";
    const translateYNegative = ext?.translateYNegative === true;
    result.push({ name, type, opacity: opacityRaw, scale: scaleRaw, translateX: translateXRaw, translateXNegative, translateY: translateYRaw, translateYNegative, heightVar: "", durationVar, easingVar });
  }
  return result.length > 0 ? result : null;
}
function resolveRef(ref, primitive) {
  const match = ref.match(/^\{primitive\.(\w+)\.([\w.]+)\}$/);
  if (!match) return ref;
  const [, section, key] = match;
  const sectionData = primitive[section];
  return sectionData?.[key]?.value != null ? String(sectionData[key].value) : ref;
}
function extractRefKey(ref) {
  const match = ref.match(/^\{primitive\.\w+\.(\w+)\}$/);
  return match ? match[1] : ref;
}
function formatTranslateVal(raw, negative) {
  const sign = negative ? "-" : "";
  if (/[%a-z]/i.test(raw)) return `${sign}${raw}`;
  return `${sign}${raw}px`;
}
function generateAnimationCss(a, format) {
  const lines = [];
  if (a.type === "spin") {
    lines.push(`@keyframes ${a.name} {`);
    lines.push(`  from { transform: rotate(0deg); }`);
    lines.push(`  to { transform: rotate(360deg); }`);
    lines.push(`}`);
    if (format === "v4") {
      lines.push(`@utility animate-${a.name} {`);
    } else {
      lines.push(`.animate-${a.name} {`);
    }
    lines.push(`  animation: ${a.name} ${a.durationVar} ${a.easingVar} infinite;`);
    lines.push(`}`);
    return lines.join("\n");
  }
  if (a.type === "spinner-orbit") {
    lines.push(`@keyframes ${a.name} {`);
    lines.push(`  from { transform: rotateY(0deg); }`);
    lines.push(`  to { transform: rotateY(360deg); }`);
    lines.push(`}`);
    if (format === "v4") {
      lines.push(`@utility animate-${a.name} {`);
    } else {
      lines.push(`.animate-${a.name} {`);
    }
    lines.push(`  animation: ${a.name} ${a.durationVar} ${a.easingVar} infinite;`);
    lines.push(`}`);
    return lines.join("\n");
  }
  if (a.type === "spinner-dot") {
    lines.push(`@keyframes ${a.name} {`);
    lines.push(`  0%, 100% { opacity: 0.2; }`);
    lines.push(`  50% { opacity: 1; }`);
    lines.push(`}`);
    if (format === "v4") {
      lines.push(`@utility animate-${a.name} {`);
    } else {
      lines.push(`.animate-${a.name} {`);
    }
    lines.push(`  animation: ${a.name} ${a.durationVar} ${a.easingVar} infinite;`);
    lines.push(`}`);
    return lines.join("\n");
  }
  if (a.type === "spinner-bar") {
    lines.push(`@keyframes ${a.name} {`);
    lines.push(`  0%, 100% { transform: scaleY(0.4); }`);
    lines.push(`  50% { transform: scaleY(1); }`);
    lines.push(`}`);
    if (format === "v4") {
      lines.push(`@utility animate-${a.name} {`);
    } else {
      lines.push(`.animate-${a.name} {`);
    }
    lines.push(`  animation: ${a.name} ${a.durationVar} ${a.easingVar} infinite;`);
    lines.push(`}`);
    return lines.join("\n");
  }
  if (a.type === "spinner-morph") {
    lines.push(`@keyframes ${a.name} {`);
    lines.push(`  0%, 100% { border-radius: 50%; transform: rotateY(0deg) rotate(0deg); }`);
    lines.push(`  25% { border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%; transform: rotateY(90deg) rotate(90deg); }`);
    lines.push(`  50% { border-radius: 50%; transform: rotateY(180deg) rotate(180deg); }`);
    lines.push(`  75% { border-radius: 70% 30% 30% 70% / 70% 70% 30% 30%; transform: rotateY(270deg) rotate(270deg); }`);
    lines.push(`}`);
    if (format === "v4") {
      lines.push(`@utility animate-${a.name} {`);
    } else {
      lines.push(`.animate-${a.name} {`);
    }
    lines.push(`  animation: ${a.name} ${a.durationVar} ${a.easingVar} infinite;`);
    lines.push(`}`);
    return lines.join("\n");
  }
  if (a.type === "skeleton-pulse") {
    lines.push(`@keyframes ${a.name} {`);
    lines.push(`  0%, 100% { opacity: 1; }`);
    lines.push(`  50% { opacity: 0.4; }`);
    lines.push(`}`);
    if (format === "v4") {
      lines.push(`@utility animate-${a.name} {`);
    } else {
      lines.push(`.animate-${a.name} {`);
    }
    lines.push(`  animation: ${a.name} ${a.durationVar} ${a.easingVar} infinite;`);
    lines.push(`}`);
    return lines.join("\n");
  }
  if (a.type === "skeleton-wave") {
    lines.push(`@keyframes ${a.name} {`);
    lines.push(`  0% { transform: translateX(-100%); }`);
    lines.push(`  100% { transform: translateX(100%); }`);
    lines.push(`}`);
    if (format === "v4") {
      lines.push(`@utility animate-${a.name} {`);
    } else {
      lines.push(`.animate-${a.name} {`);
    }
    lines.push(`  animation: ${a.name} ${a.durationVar} ${a.easingVar} infinite;`);
    lines.push(`}`);
    return lines.join("\n");
  }
  if (a.type === "typing-cursor") {
    lines.push(`@keyframes ${a.name} {`);
    lines.push(`  0%, 100% { opacity: 1; }`);
    lines.push(`  50% { opacity: 0.4; }`);
    lines.push(`}`);
    if (format === "v4") {
      lines.push(`@utility animate-${a.name} {`);
    } else {
      lines.push(`.animate-${a.name} {`);
    }
    lines.push(`  animation: ${a.name} ${a.durationVar} ${a.easingVar} infinite;`);
    lines.push(`}`);
    return lines.join("\n");
  }
  if (a.type === "progress-stripe") {
    lines.push(`@keyframes ${a.name} {`);
    lines.push(`  from { background-position: 1rem 0; }`);
    lines.push(`  to { background-position: 0 0; }`);
    lines.push(`}`);
    if (format === "v4") {
      lines.push(`@utility animate-${a.name} {`);
    } else {
      lines.push(`.animate-${a.name} {`);
    }
    lines.push(`  animation: ${a.name} ${a.durationVar} ${a.easingVar} infinite;`);
    lines.push(`}`);
    return lines.join("\n");
  }
  if (a.type === "height-expand" || a.type === "height-collapse") {
    const isExpand = a.type === "height-expand";
    lines.push(`@keyframes ${a.name} {`);
    lines.push(`  from { height: ${isExpand ? "0" : `var(${a.heightVar})`}; }`);
    lines.push(`  to { height: ${isExpand ? `var(${a.heightVar})` : "0"}; }`);
    lines.push(`}`);
  } else {
    const isEnter = a.type === "enter";
    const fromProps = [];
    const toProps = [];
    if (a.opacity) {
      fromProps.push(`opacity: ${isEnter ? a.opacity : "1"}`);
      toProps.push(`opacity: ${isEnter ? "1" : a.opacity}`);
    }
    const fromT = [], toT = [];
    if (a.scale) {
      fromT.push(isEnter ? `scale(${a.scale})` : "scale(1)");
      toT.push(isEnter ? "scale(1)" : `scale(${a.scale})`);
    }
    if (a.translateX) {
      const v = formatTranslateVal(a.translateX, a.translateXNegative);
      fromT.push(isEnter ? `translateX(${v})` : "translateX(0)");
      toT.push(isEnter ? "translateX(0)" : `translateX(${v})`);
    }
    if (a.translateY) {
      const v = formatTranslateVal(a.translateY, a.translateYNegative);
      fromT.push(isEnter ? `translateY(${v})` : "translateY(0)");
      toT.push(isEnter ? "translateY(0)" : `translateY(${v})`);
    }
    if (fromT.length) {
      fromProps.push(`transform: ${fromT.join(" ")}`);
      toProps.push(`transform: ${toT.join(" ")}`);
    }
    lines.push(`@keyframes ${a.name} {`);
    lines.push(`  from { ${fromProps.join("; ")}; }`);
    lines.push(`  to { ${toProps.join("; ")}; }`);
    lines.push(`}`);
  }
  if (format === "v4") {
    lines.push(`@utility animate-${a.name} {`);
  } else {
    lines.push(`.animate-${a.name} {`);
  }
  lines.push(`  animation: ${a.name} ${a.durationVar} ${a.easingVar};`);
  lines.push(`}`);
  return lines.join("\n");
}
function hexToRgb(hex) {
  const match = hex.replace("#", "").match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if (!match) return null;
  return `${parseInt(match[1], 16)} ${parseInt(match[2], 16)} ${parseInt(match[3], 16)}`;
}
function generateVariablesCss(tokens) {
  const lines = [];
  const p = tokens.primitive;
  lines.push(`/**`);
  lines.push(` * Design System - CSS Variables`);
  lines.push(` * \u26A0\uFE0F Auto-generated from figma-tokens.json \u2014 DO NOT EDIT`);
  lines.push(` *`);
  lines.push(` * No Tailwind required. Just import:`);
  lines.push(` * @import '@7onic-ui/tokens/css/variables.css';`);
  lines.push(` *`);
  lines.push(` * Regenerate: npx sync-tokens`);
  lines.push(` */`);
  lines.push(``);
  lines.push(`:root {`);
  lines.push(`  /* ========================================`);
  lines.push(`     Primitive Colors`);
  lines.push(`     Raw color palette \u2014 the building blocks`);
  lines.push(`     for semantic color tokens`);
  lines.push(`     ======================================== */`);
  lines.push(``);
  const colorData = p.color;
  const colorPalettes = orderedKeys(colorData, { type: "known", order: KNOWN_ORDERS.colorPalettes }, "primitive.color");
  for (const palette of colorPalettes) {
    const paletteData = colorData[palette];
    if (!paletteData) continue;
    if (typeof paletteData === "object" && "value" in paletteData) {
      if (palette === "white" || palette === "black") {
        if (palette === "white") lines.push(`  /* Base */`);
        const hexVal = String(paletteData.value);
        lines.push(`  --color-${palette}: ${hexVal};`);
        const rgb = hexToRgb(hexVal);
        if (rgb) lines.push(`  --color-${palette}-rgb: ${rgb};`);
        if (palette === "black") lines.push(``);
      }
    } else {
      const shades = paletteData;
      const paletteLabel = palette.charAt(0).toUpperCase() + palette.slice(1);
      lines.push(`  /* ${paletteLabel} */`);
      const shadeKeys = orderedKeys(shades, { type: "numeric" }, `primitive.color.${palette}`);
      for (const shade of shadeKeys) {
        const token = shades[shade];
        if (token && token.value) {
          const hexVal = String(token.value);
          lines.push(`  --color-${palette}-${shade}: ${hexVal};`);
          const rgb = hexToRgb(hexVal);
          if (rgb) lines.push(`  --color-${palette}-${shade}-rgb: ${rgb};`);
        }
      }
      lines.push(``);
    }
  }
  const fontFamilyData = p.fontFamily;
  lines.push(`  /* ========================================`);
  lines.push(`     Font Family`);
  lines.push(`     ======================================== */`);
  for (const [name, token] of Object.entries(fontFamilyData)) {
    if (name.startsWith("$")) continue;
    lines.push(`  --font-family-${name}: ${token.value};`);
  }
  lines.push(``);
  const fontSizeData = p.fontSize;
  lines.push(`  /* ========================================`);
  lines.push(`     Typography`);
  lines.push(`     ======================================== */`);
  for (const name of orderedKeys(fontSizeData, { type: "known", order: KNOWN_ORDERS.fontSize }, "primitive.fontSize")) {
    const token = fontSizeData[name];
    if (!token) continue;
    const lh = token.$extensions?.lineHeight;
    lines.push(`  --font-size-${name}: ${formatValue(String(token.value), "fontSizes")}; ${pxComment(String(token.value))}`);
    if (lh) lines.push(`  --line-height-${name}: ${pxToRem(lh)}; ${pxComment(lh)}`);
  }
  lines.push(``);
  const fontWeightData = p.fontWeight;
  lines.push(`  /* ========================================`);
  lines.push(`     Font Weight`);
  lines.push(`     ======================================== */`);
  for (const [name, token] of Object.entries(fontWeightData)) {
    if (name.startsWith("$")) continue;
    lines.push(`  --font-weight-${name}: ${token.value};`);
  }
  lines.push(``);
  const spacingData = p.spacing;
  lines.push(`  /* ========================================`);
  lines.push(`     Spacing`);
  lines.push(`     0~12px: 2px increments, 12px~: 4px increments`);
  lines.push(`     ======================================== */`);
  for (const key of orderedKeys(spacingData, { type: "numeric" }, "primitive.spacing")) {
    const token = spacingData[key];
    lines.push(`  --spacing-${spacingKeyToCssKey(key)}: ${formatValue(String(token.value), "spacing")}; ${pxComment(String(token.value))}`);
  }
  lines.push(``);
  const radiusData = p.borderRadius;
  lines.push(`  /* ========================================`);
  lines.push(`     Border Radius`);
  lines.push(`     ======================================== */`);
  for (const name of orderedKeys(radiusData, { type: "known", order: KNOWN_ORDERS.borderRadius }, "primitive.borderRadius")) {
    const token = radiusData[name];
    if (!token) continue;
    lines.push(`  --radius-${name}: ${formatValue(String(token.value), "borderRadius")};`);
  }
  lines.push(``);
  const borderWidthData = p.borderWidth;
  lines.push(`  /* ========================================`);
  lines.push(`     Border Width`);
  lines.push(`     ======================================== */`);
  for (const key of orderedKeys(borderWidthData, { type: "numeric" }, "primitive.borderWidth")) {
    lines.push(`  --border-width-${key}: ${formatValue(String(borderWidthData[key].value), "borderWidth")};`);
  }
  lines.push(``);
  const shadowData = p.shadow;
  lines.push(`  /* ========================================`);
  lines.push(`     Shadows (Light Mode)`);
  lines.push(`     ======================================== */`);
  for (const name of orderedKeys(shadowData, { type: "known", order: KNOWN_ORDERS.shadow }, "primitive.shadow")) {
    const token = shadowData[name];
    if (!token) continue;
    const ext = token.$extensions;
    lines.push(`  --shadow-${name}: ${formatShadow(token.value, ext)};`);
  }
  lines.push(``);
  const iconSizeData = p.iconSize;
  lines.push(`  /* ========================================`);
  lines.push(`     Icon Size (5-step scale)`);
  lines.push(`     ======================================== */`);
  for (const name of orderedKeys(iconSizeData, { type: "known", order: KNOWN_ORDERS.iconSize }, "primitive.iconSize")) {
    const token = iconSizeData[name];
    if (!token) continue;
    lines.push(`  --icon-size-${name}: ${pxToRem(String(token.value))}; ${pxComment(String(token.value))}`);
  }
  lines.push(``);
  const scaleData = p.scale;
  lines.push(`  /* ========================================`);
  lines.push(`     Scale`);
  lines.push(`     ======================================== */`);
  for (const [name, token] of Object.entries(scaleData)) {
    if (name.startsWith("$")) continue;
    lines.push(`  --scale-${name}: ${token.value};`);
  }
  lines.push(``);
  const zIndexData = p.zIndex;
  lines.push(`  /* ========================================`);
  lines.push(`     Z-Index`);
  lines.push(`     ======================================== */`);
  for (const name of orderedKeys(zIndexData, { type: "known", order: KNOWN_ORDERS.zIndex }, "primitive.zIndex")) {
    const token = zIndexData[name];
    if (!token) continue;
    lines.push(`  --z-index-${name}: ${token.value};`);
  }
  lines.push(``);
  const opacityData = p.opacity;
  lines.push(`  /* ========================================`);
  lines.push(`     Opacity`);
  lines.push(`     ======================================== */`);
  for (const key of orderedKeys(opacityData, { type: "numeric" }, "primitive.opacity")) {
    const pct = Math.round(Number(opacityData[key].value) * 100);
    lines.push(`  --opacity-${key}: ${pct}%;`);
  }
  lines.push(``);
  const durationData = p.duration;
  lines.push(`  /* ========================================`);
  lines.push(`     Duration`);
  lines.push(`     ======================================== */`);
  for (const name of orderedKeys(durationData, { type: "known", order: KNOWN_ORDERS.duration }, "primitive.duration")) {
    const token = durationData[name];
    if (!token) continue;
    lines.push(`  --duration-${name}: ${token.value};`);
  }
  lines.push(``);
  const easingData = p.easing;
  lines.push(`  /* ========================================`);
  lines.push(`     Easing`);
  lines.push(`     ======================================== */`);
  for (const name of orderedKeys(easingData, { type: "known", order: KNOWN_ORDERS.easing }, "primitive.easing")) {
    const token = easingData[name];
    if (!token) continue;
    lines.push(`  --easing-${camelToKebab(name)}: ${token.value};`);
  }
  lines.push(``);
  const breakpointData = p.breakpoint;
  lines.push(`  /* ========================================`);
  lines.push(`     Breakpoints`);
  lines.push(`     ======================================== */`);
  for (const name of orderedKeys(breakpointData, { type: "known", order: KNOWN_ORDERS.breakpoint }, "primitive.breakpoint")) {
    const token = breakpointData[name];
    if (!token) continue;
    lines.push(`  --breakpoint-${name}: ${formatValue(String(token.value), "dimension")};`);
  }
  lines.push(``);
  const sem = tokens.semantic;
  const compSizeData = sem?.componentSize;
  if (compSizeData) {
    lines.push(`  /* ========================================`);
    lines.push(`     Component Size`);
    lines.push(`     ======================================== */`);
    for (const comp of Object.keys(compSizeData)) {
      const compData = compSizeData[comp];
      if (!compData) continue;
      for (const part of Object.keys(compData)) {
        const partData = compData[part];
        if (!partData) continue;
        for (const size of Object.keys(partData)) {
          const token = partData[size];
          if (!token) continue;
          const val = token.value;
          if (typeof val === "object" && val !== null) {
            const obj = val;
            if (obj.width) lines.push(`  --component-${comp}-${part}-${size}-width: ${obj.width}px;`);
            if (obj.height) lines.push(`  --component-${comp}-${part}-${size}-height: ${obj.height}px;`);
          } else {
            lines.push(`  --component-${comp}-${part}-${size}: ${val}px;`);
          }
        }
      }
    }
    lines.push(``);
  }
  const semTypo = tokens.semantic.typography;
  lines.push(`  /* ========================================`);
  lines.push(`     Semantic Typography`);
  lines.push(`     ======================================== */`);
  const typoCategories = orderedKeys(semTypo, { type: "known", order: [...KNOWN_ORDERS.typographyCategories, "caption", "code"] }, "semantic.typography").filter((k) => KNOWN_ORDERS.typographyCategories.includes(k));
  const typoOrders = {
    ...KNOWN_ORDERS.typographyOrders
  };
  for (const cat of typoCategories) {
    const catData = semTypo[cat];
    if (!catData) continue;
    const order = typoOrders[cat];
    for (const name of order) {
      const token = catData[name];
      if (!token || !token.value) continue;
      const v = token.value;
      const prefix = `--typography-${cat}-${name}`;
      if (v.fontSize) {
        const sizeRef = v.fontSize.slice(1, -1).split(".").pop();
        const fsVal = fontSizeData[sizeRef]?.value;
        lines.push(`  ${prefix}-font-size: var(--font-size-${sizeRef});${inlineComment(fsVal ? `${fsVal}px` : void 0)}`);
      }
      const lhResolved = resolveLineHeight(v, fontSizeData);
      if (lhResolved) lines.push(`  ${prefix}-line-height: ${lhResolved.value};${inlineComment(lhResolved.comment)}`);
      if (v.fontWeight) {
        const weightRef = v.fontWeight.slice(1, -1).split(".").pop();
        const fwVal = fontWeightData[weightRef]?.value;
        lines.push(`  ${prefix}-font-weight: var(--font-weight-${weightRef});${inlineComment(fwVal ? String(fwVal) : void 0)}`);
      }
      if (v.fontFamily) {
        const familyRef = v.fontFamily.slice(1, -1).split(".").pop();
        lines.push(`  ${prefix}-font-family: var(--font-family-${familyRef});`);
      }
    }
  }
  const captionToken = semTypo.caption;
  if (captionToken?.value) {
    const cv = captionToken.value;
    if (cv.fontSize) {
      const sizeRef = cv.fontSize.slice(1, -1).split(".").pop();
      const fsVal = fontSizeData[sizeRef]?.value;
      lines.push(`  --typography-caption-font-size: var(--font-size-${sizeRef});${inlineComment(fsVal ? `${fsVal}px` : void 0)}`);
    }
    const captionLh = resolveLineHeight(cv, fontSizeData);
    if (captionLh) lines.push(`  --typography-caption-line-height: ${captionLh.value};${inlineComment(captionLh.comment)}`);
    if (cv.fontWeight) {
      const weightRef = cv.fontWeight.slice(1, -1).split(".").pop();
      const fwVal = fontWeightData[weightRef]?.value;
      lines.push(`  --typography-caption-font-weight: var(--font-weight-${weightRef});${inlineComment(fwVal ? String(fwVal) : void 0)}`);
    }
    if (cv.fontFamily) {
      const familyRef = cv.fontFamily.slice(1, -1).split(".").pop();
      lines.push(`  --typography-caption-font-family: var(--font-family-${familyRef});`);
    }
  }
  const codeData = semTypo.code;
  if (codeData) {
    for (const name of ["block", "inline"]) {
      const token = codeData[name];
      if (!token?.value) continue;
      const v = token.value;
      const prefix = `--typography-code-${name}`;
      if (v.fontSize) {
        const sizeRef = v.fontSize.slice(1, -1).split(".").pop();
        const fsVal = fontSizeData[sizeRef]?.value;
        lines.push(`  ${prefix}-font-size: var(--font-size-${sizeRef});${inlineComment(fsVal ? `${fsVal}px` : void 0)}`);
      }
      const codeLh = resolveLineHeight(v, fontSizeData);
      if (codeLh) lines.push(`  ${prefix}-line-height: ${codeLh.value};${inlineComment(codeLh.comment)}`);
      if (v.fontWeight) {
        const weightRef = v.fontWeight.slice(1, -1).split(".").pop();
        const fwVal = fontWeightData[weightRef]?.value;
        lines.push(`  ${prefix}-font-weight: var(--font-weight-${weightRef});${inlineComment(fwVal ? String(fwVal) : void 0)}`);
      }
      if (v.fontFamily) {
        const familyRef = v.fontFamily.slice(1, -1).split(".").pop();
        lines.push(`  ${prefix}-font-family: var(--font-family-${familyRef});`);
      }
    }
  }
  lines.push(``);
  lines.push(`}`);
  lines.push(``);
  const animTokens = readAnimationTokens(tokens);
  if (animTokens) {
    lines.push(`/* ========================================`);
    lines.push(`   Component Animations`);
    lines.push(`   Generated from semantic.animation in figma-tokens.json`);
    lines.push(`   Token name = keyframe name = class name (1:1)`);
    lines.push(`   ======================================== */`);
    lines.push(``);
    for (const a of animTokens) {
      lines.push(generateAnimationCss(a, "css"));
      lines.push(``);
    }
  }
  lines.push(`/* ========================================`);
  lines.push(`   Framework Compat Aliases`);
  lines.push(`   Maps Next.js 15 / Tailwind v4 convention`);
  lines.push(`   (--background, --foreground) to our tokens.`);
  lines.push(`   ======================================== */`);
  lines.push(``);
  lines.push(`html:root {`);
  lines.push(`  --background: var(--color-background);`);
  lines.push(`  --foreground: var(--color-text);`);
  lines.push(`  color-scheme: light dark;`);
  lines.push(`}`);
  lines.push(``);
  lines.push(`/* ========================================`);
  lines.push(`   Body Baseline`);
  lines.push(`   Overrides framework default body rules.`);
  lines.push(`   ======================================== */`);
  lines.push(``);
  lines.push(`html body {`);
  lines.push(`  background-color: var(--color-background);`);
  lines.push(`  color: var(--color-foreground);`);
  lines.push(`  font-family: var(--font-family-sans);`);
  lines.push(`  display: block;`);
  lines.push(`  place-items: initial;`);
  lines.push(`  min-width: auto;`);
  lines.push(`  margin: 0;`);
  lines.push(`}`);
  lines.push(``);
  lines.push(`html body code,`);
  lines.push(`html body pre,`);
  lines.push(`html body kbd {`);
  lines.push(`  font-family: var(--font-family-mono);`);
  lines.push(`}`);
  lines.push(``);
  return lines.join("\n");
}
function generateThemeLight(tokens) {
  const lines = [];
  lines.push(`/**`);
  lines.push(` * Light Theme \u2014 Semantic color overrides`);
  lines.push(` * \u26A0\uFE0F Auto-generated \u2014 DO NOT EDIT`);
  lines.push(` *`);
  lines.push(` * Usage: @import '@7onic-ui/tokens/css/themes/light.css';`);
  lines.push(` */`);
  lines.push(``);
  lines.push(`html:root {`);
  const lightColor = tokens.light.color;
  const semanticColorOrder = orderedKeys(lightColor, { type: "known", order: KNOWN_ORDERS.semanticColorCategories }, "light.color");
  for (const category of semanticColorOrder) {
    const catData = lightColor[category];
    if (!catData) continue;
    const catLabel = category.charAt(0).toUpperCase() + category.slice(1);
    lines.push(`  /* ${catLabel} */`);
    const entries = Object.entries(catData).filter(([k]) => !k.startsWith("$"));
    const sortedEntries = sortByKnownOrder(entries, KNOWN_ORDERS.semanticColorVariants);
    for (const [variant, token] of sortedEntries) {
      const tv = token;
      if (tv.type === "composition" && typeof tv.value === "object" && tv.value !== null) {
        const comp = tv.value;
        lines.push(`  ${semanticColorVar(category, variant)}: ${resolveCompositionToColorMix(comp)};`);
      } else {
        const resolved = typeof tv.value === "string" && tv.value.startsWith("{") ? resolveToVar(tv.value, tokens) : String(tv.value);
        lines.push(`  ${semanticColorVar(category, variant)}: ${resolved};`);
        const resolvedHex = typeof tv.value === "string" && tv.value.startsWith("{") ? resolveReference(tv.value, tokens) : String(tv.value);
        const rgb = hexToRgb(resolvedHex);
        if (rgb) lines.push(`  ${semanticColorVar(category, variant)}-rgb: ${rgb};`);
      }
    }
    lines.push(``);
  }
  lines.push(`}`);
  lines.push(``);
  return lines.join("\n");
}
function generateThemeDark(tokens) {
  const lines = [];
  lines.push(`/**`);
  lines.push(` * Dark Theme \u2014 Semantic color overrides`);
  lines.push(` * \u26A0\uFE0F Auto-generated \u2014 DO NOT EDIT`);
  lines.push(` *`);
  lines.push(` * Supports three dark mode strategies:`);
  lines.push(` * 1. OS auto-detection: follows prefers-color-scheme`);
  lines.push(` * 2. Manual dark:  <html data-theme="dark"> or <html class="dark">`);
  lines.push(` * 3. Manual light: <html data-theme="light"> (overrides OS dark)`);
  lines.push(` *`);
  lines.push(` * Usage: @import '@7onic-ui/tokens/css/themes/dark.css';`);
  lines.push(` */`);
  lines.push(``);
  const declLines = [];
  const darkColor = tokens.dark.color;
  const lightColor = tokens.light.color;
  const semanticColorOrder = orderedKeys(lightColor, { type: "known", order: KNOWN_ORDERS.semanticColorCategories }, "dark.color");
  for (const category of semanticColorOrder) {
    const catData = darkColor[category];
    if (!catData) continue;
    const catLabel = category.charAt(0).toUpperCase() + category.slice(1);
    declLines.push(`  /* ${catLabel} */`);
    const entries = Object.entries(catData).filter(([k]) => !k.startsWith("$"));
    const sortedEntries = sortByKnownOrder(entries, KNOWN_ORDERS.semanticColorVariants);
    for (const [variant, token] of sortedEntries) {
      const tv = token;
      if (tv.type === "composition" && typeof tv.value === "object" && tv.value !== null) {
        const comp = tv.value;
        declLines.push(`  ${semanticColorVar(category, variant)}: ${resolveCompositionToColorMix(comp)};`);
      } else {
        const resolved = typeof tv.value === "string" && tv.value.startsWith("{") ? resolveToVar(tv.value, tokens) : String(tv.value);
        declLines.push(`  ${semanticColorVar(category, variant)}: ${resolved};`);
        const resolvedHex = typeof tv.value === "string" && tv.value.startsWith("{") ? resolveReference(tv.value, tokens) : String(tv.value);
        const rgb = hexToRgb(resolvedHex);
        if (rgb) declLines.push(`  ${semanticColorVar(category, variant)}-rgb: ${rgb};`);
      }
    }
    declLines.push(``);
  }
  declLines.push(`  /* Dark Mode Shadows - increased opacity for visibility */`);
  const darkShadowData = tokens.primitive;
  const darkShadows = darkShadowData.shadow;
  for (const name of orderedKeys(darkShadows, { type: "known", order: KNOWN_ORDERS.shadow }, "dark.shadow")) {
    const token = darkShadows[name];
    if (!token) continue;
    const ext = token.$extensions;
    declLines.push(`  --shadow-${name}: ${formatShadowDark(token.value, ext)};`);
  }
  const declarations = declLines.join("\n");
  const mediaDeclarations = declLines.map((l) => l ? `  ${l}` : l).join("\n");
  lines.push(`@media (prefers-color-scheme: dark) {`);
  lines.push(`  html:root:not([data-theme="light"]) {`);
  lines.push(mediaDeclarations);
  lines.push(`  }`);
  lines.push(`}`);
  lines.push(``);
  lines.push(`html:root[data-theme="dark"],`);
  lines.push(`html:root.dark {`);
  lines.push(declarations);
  lines.push(`}`);
  lines.push(``);
  return lines.join("\n");
}
function generateJsTokens(tokens) {
  const p = tokens.primitive;
  const data = {};
  const colors = {};
  const colorData = p.color;
  for (const palette of orderedKeys(colorData, { type: "known", order: KNOWN_ORDERS.colorPalettes }, "js.color")) {
    const paletteData = colorData[palette];
    if (!paletteData) continue;
    if (typeof paletteData === "object" && "value" in paletteData) {
      colors[palette] = paletteData.value;
    } else {
      const shades = paletteData;
      const shadeObj = {};
      for (const shade of orderedKeys(shades, { type: "numeric" }, `js.color.${palette}`)) {
        const token = shades[shade];
        if (token?.value) shadeObj[shade] = String(token.value);
      }
      colors[palette] = shadeObj;
    }
  }
  data.colors = colors;
  const spacing = {};
  const spacingData = p.spacing;
  for (const key of orderedKeys(spacingData, { type: "numeric" }, "js.spacing")) {
    spacing[key] = pxToRem(String(spacingData[key].value));
  }
  data.spacing = spacing;
  const fontSize = {};
  const fontSizeData = p.fontSize;
  for (const name of orderedKeys(fontSizeData, { type: "known", order: KNOWN_ORDERS.fontSize }, "js.fontSize")) {
    const token = fontSizeData[name];
    if (!token) continue;
    const lh = token.$extensions?.lineHeight;
    fontSize[name] = {
      size: pxToRem(String(token.value)),
      lineHeight: pxToRem(String(lh || token.value))
    };
  }
  data.fontSize = fontSize;
  const borderRadius = {};
  const radiusData = p.borderRadius;
  for (const name of orderedKeys(radiusData, { type: "known", order: KNOWN_ORDERS.borderRadius }, "js.borderRadius")) {
    const token = radiusData[name];
    if (!token) continue;
    borderRadius[name] = formatValue(String(token.value), "borderRadius");
  }
  data.borderRadius = borderRadius;
  const shadow = {};
  const shadowData = p.shadow;
  for (const name of orderedKeys(shadowData, { type: "known", order: KNOWN_ORDERS.shadow }, "js.shadow")) {
    const token = shadowData[name];
    if (!token) continue;
    const ext = token.$extensions;
    shadow[name] = formatShadow(token.value, ext);
  }
  data.shadow = shadow;
  const zIndex = {};
  const zData = p.zIndex;
  for (const name of orderedKeys(zData, { type: "known", order: KNOWN_ORDERS.zIndex }, "js.zIndex")) {
    const token = zData[name];
    if (!token) continue;
    zIndex[name] = token.value;
  }
  data.zIndex = zIndex;
  const duration = {};
  const durationData = p.duration;
  for (const name of orderedKeys(durationData, { type: "known", order: KNOWN_ORDERS.duration }, "js.duration")) {
    const token = durationData[name];
    if (!token) continue;
    duration[name] = String(token.value);
  }
  data.duration = duration;
  const iconSize = {};
  const iconSizeData = p.iconSize;
  for (const name of orderedKeys(iconSizeData, { type: "known", order: KNOWN_ORDERS.iconSize }, "js.iconSize")) {
    const token = iconSizeData[name];
    if (!token) continue;
    iconSize[name] = pxToRem(String(token.value));
  }
  data.iconSize = iconSize;
  const opacity = {};
  const opacityData = p.opacity;
  if (opacityData) {
    for (const name of orderedKeys(opacityData, { type: "numeric" }, "js.opacity")) {
      const token = opacityData[name];
      if (!token) continue;
      opacity[name] = String(token.value);
    }
    data.opacity = opacity;
  }
  const fontWeight = {};
  const fontWeightData = p.fontWeight;
  if (fontWeightData) {
    for (const name of Object.keys(fontWeightData)) {
      const token = fontWeightData[name];
      if (!token) continue;
      fontWeight[name] = String(token.value);
    }
    data.fontWeight = fontWeight;
  }
  const borderWidth = {};
  const borderWidthData = p.borderWidth;
  if (borderWidthData) {
    for (const name of orderedKeys(borderWidthData, { type: "numeric" }, "js.borderWidth")) {
      const token = borderWidthData[name];
      if (!token) continue;
      borderWidth[name] = `${token.value}px`;
    }
    data.borderWidth = borderWidth;
  }
  const scale = {};
  const scaleData = p.scale;
  if (scaleData) {
    for (const name of Object.keys(scaleData)) {
      const token = scaleData[name];
      if (!token) continue;
      scale[name] = String(token.value);
    }
    data.scale = scale;
  }
  const easing = {};
  const easingData = p.easing;
  if (easingData) {
    for (const name of orderedKeys(easingData, { type: "known", order: KNOWN_ORDERS.easing }, "js.easing")) {
      const token = easingData[name];
      if (!token) continue;
      easing[name] = String(token.value);
    }
    data.easing = easing;
  }
  const breakpoint = {};
  const breakpointData = p.breakpoint;
  if (breakpointData) {
    for (const name of orderedKeys(breakpointData, { type: "known", order: KNOWN_ORDERS.breakpoint }, "js.breakpoint")) {
      const token = breakpointData[name];
      if (!token) continue;
      breakpoint[name] = `${token.value}px`;
    }
    data.breakpoint = breakpoint;
  }
  const fontFamily = {};
  const fontFamilyData = p.fontFamily;
  if (fontFamilyData) {
    for (const name of Object.keys(fontFamilyData)) {
      const token = fontFamilyData[name];
      if (!token) continue;
      fontFamily[name] = String(token.value);
    }
    data.fontFamily = fontFamily;
  }
  const compSizeData = tokens.semantic?.componentSize;
  if (compSizeData) {
    const componentSize = {};
    for (const comp of Object.keys(compSizeData)) {
      const compData = compSizeData[comp];
      if (!compData) continue;
      componentSize[comp] = {};
      for (const part of Object.keys(compData)) {
        const partData = compData[part];
        if (!partData) continue;
        componentSize[comp][part] = {};
        for (const size of Object.keys(partData)) {
          const token = partData[size];
          if (!token) continue;
          const val = token.value;
          if (typeof val === "object" && val !== null) {
            const obj = val;
            componentSize[comp][part][size] = {
              ...obj.width ? { width: `${obj.width}px` } : {},
              ...obj.height ? { height: `${obj.height}px` } : {}
            };
          } else {
            componentSize[comp][part][size] = `${val}px`;
          }
        }
      }
    }
    data.componentSize = componentSize;
  }
  const animSem = tokens.semantic?.animation;
  if (animSem) {
    const animData = {};
    for (const [name, entry] of Object.entries(animSem)) {
      if (name.startsWith("$")) continue;
      const token = entry;
      if (token.type !== "composition") continue;
      const val = token.value;
      const durationRaw = resolveRef(val.duration, p);
      const easingRaw = resolveRef(val.easing, p);
      const obj = {
        duration: durationRaw.endsWith("ms") ? durationRaw : `${durationRaw}ms`,
        easing: easingRaw
      };
      if (val.opacity) obj.opacity = resolveRef(val.opacity, p);
      if (val.scale) obj.scale = resolveRef(val.scale, p);
      if (val.translateX) obj.translateX = val.translateX.startsWith("{") ? resolveRef(val.translateX, p) : val.translateX;
      if (val.translateY) obj.translateY = resolveRef(val.translateY, p);
      if (val.heightVar) obj.heightVar = val.heightVar;
      animData[name] = obj;
    }
    data.animation = animData;
  }
  const sem = tokens.semantic;
  const typoData = sem?.typography;
  if (typoData) {
    const typography = {};
    for (const category of Object.keys(typoData)) {
      const catData = typoData[category];
      if (!catData) continue;
      if (catData.type === "typography" && catData.value) {
        const val = catData.value;
        typography[category] = {
          fontFamily: resolveRef(val.fontFamily, p),
          fontSize: pxToRem(resolveRef(val.fontSize, p)),
          fontWeight: resolveRef(val.fontWeight, p),
          lineHeight: pxToRem(val.lineHeight)
        };
      } else {
        const catObj = {};
        for (const name of Object.keys(catData)) {
          const entry = catData[name];
          if (!entry || entry.type !== "typography") continue;
          const val = entry.value;
          catObj[name] = {
            fontFamily: resolveRef(val.fontFamily, p),
            fontSize: pxToRem(resolveRef(val.fontSize, p)),
            fontWeight: resolveRef(val.fontWeight, p),
            lineHeight: pxToRem(val.lineHeight)
          };
        }
        typography[category] = catObj;
      }
    }
    data.typography = typography;
  }
  const json = JSON.stringify(data, null, 2);
  const cjsLines = [];
  cjsLines.push(`/**`);
  cjsLines.push(` * 7onic Design Tokens \u2014 JavaScript export`);
  cjsLines.push(` * \u26A0\uFE0F Auto-generated \u2014 DO NOT EDIT`);
  cjsLines.push(` */`);
  cjsLines.push(`'use strict';`);
  cjsLines.push(``);
  cjsLines.push(`const tokens = ${json};`);
  cjsLines.push(``);
  for (const key of Object.keys(data)) {
    cjsLines.push(`module.exports.${key} = tokens.${key};`);
  }
  cjsLines.push(`module.exports.default = tokens;`);
  cjsLines.push(``);
  const esmLines = [];
  esmLines.push(`/**`);
  esmLines.push(` * 7onic Design Tokens \u2014 JavaScript export (ESM)`);
  esmLines.push(` * \u26A0\uFE0F Auto-generated \u2014 DO NOT EDIT`);
  esmLines.push(` */`);
  esmLines.push(``);
  esmLines.push(`const tokens = ${json};`);
  esmLines.push(``);
  for (const key of Object.keys(data)) {
    esmLines.push(`export const ${key} = tokens.${key};`);
  }
  esmLines.push(`export default tokens;`);
  esmLines.push(``);
  return { cjs: cjsLines.join("\n"), esm: esmLines.join("\n") };
}
function generateTypeDefinitions(tokens) {
  const p = tokens.primitive;
  const lines = [];
  lines.push(`/**`);
  lines.push(` * 7onic Design Tokens \u2014 TypeScript type definitions`);
  lines.push(` * \u26A0\uFE0F Auto-generated \u2014 DO NOT EDIT`);
  lines.push(` */`);
  lines.push(``);
  lines.push(`type Shade = '50' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';`);
  lines.push(`type ShadeRecord = Record<Shade, string>;`);
  lines.push(``);
  const colorData = p.color;
  const colorPalettes = orderedKeys(colorData, { type: "known", order: KNOWN_ORDERS.colorPalettes }, "types.color");
  lines.push(`export declare const colors: {`);
  for (const palette of colorPalettes) {
    const paletteData = colorData[palette];
    if (!paletteData) continue;
    if (typeof paletteData === "object" && "value" in paletteData) {
      lines.push(`  ${palette}: string;`);
    } else {
      lines.push(`  ${palette}: ShadeRecord;`);
    }
  }
  lines.push(`};`);
  lines.push(``);
  const spacingData = p.spacing;
  const spacingKeys = orderedKeys(spacingData, { type: "numeric" }, "types.spacing");
  lines.push(`export declare const spacing: Record<${spacingKeys.map((k) => `'${k}'`).join(" | ")}, string>;`);
  lines.push(``);
  const fontSizeData = p.fontSize;
  const fsKeys = orderedKeys(fontSizeData, { type: "known", order: KNOWN_ORDERS.fontSize }, "types.fontSize");
  lines.push(`export declare const fontSize: Record<${fsKeys.map((k) => `'${k}'`).join(" | ")}, { size: string; lineHeight: string }>;`);
  lines.push(``);
  const radiusData = p.borderRadius;
  const rKeys = orderedKeys(radiusData, { type: "known", order: KNOWN_ORDERS.borderRadius }, "types.borderRadius");
  lines.push(`export declare const borderRadius: Record<${rKeys.map((k) => `'${k}'`).join(" | ")}, string>;`);
  lines.push(``);
  lines.push(`export declare const shadow: Record<${KNOWN_ORDERS.shadow.map((k) => `'${k}'`).join(" | ")}, string>;`);
  lines.push(``);
  const zData = p.zIndex;
  const zKeys = orderedKeys(zData, { type: "known", order: KNOWN_ORDERS.zIndex }, "types.zIndex");
  lines.push(`export declare const zIndex: Record<${zKeys.map((k) => `'${k}'`).join(" | ")}, string | number>;`);
  lines.push(``);
  lines.push(`export declare const duration: Record<${KNOWN_ORDERS.duration.map((k) => `'${k}'`).join(" | ")}, string>;`);
  lines.push(``);
  lines.push(`export declare const iconSize: Record<${KNOWN_ORDERS.iconSize.map((k) => `'${k}'`).join(" | ")}, string>;`);
  lines.push(``);
  const opacityData = p.opacity;
  if (opacityData) {
    const opKeys = orderedKeys(opacityData, { type: "numeric" }, "types.opacity");
    lines.push(`export declare const opacity: Record<${opKeys.map((k) => `'${k}'`).join(" | ")}, string>;`);
    lines.push(``);
  }
  const fontWeightData = p.fontWeight;
  if (fontWeightData) {
    const fwKeys = Object.keys(fontWeightData);
    lines.push(`export declare const fontWeight: Record<${fwKeys.map((k) => `'${k}'`).join(" | ")}, string>;`);
    lines.push(``);
  }
  const borderWidthData = p.borderWidth;
  if (borderWidthData) {
    const bwKeys = orderedKeys(borderWidthData, { type: "numeric" }, "types.borderWidth");
    lines.push(`export declare const borderWidth: Record<${bwKeys.map((k) => `'${k}'`).join(" | ")}, string>;`);
    lines.push(``);
  }
  const scaleData = p.scale;
  if (scaleData) {
    const scKeys = Object.keys(scaleData);
    lines.push(`export declare const scale: Record<${scKeys.map((k) => `'${k}'`).join(" | ")}, string>;`);
    lines.push(``);
  }
  const easingDataT = p.easing;
  if (easingDataT) {
    const eKeys = orderedKeys(easingDataT, { type: "known", order: KNOWN_ORDERS.easing }, "types.easing");
    lines.push(`export declare const easing: Record<${eKeys.map((k) => `'${k}'`).join(" | ")}, string>;`);
    lines.push(``);
  }
  const breakpointDataT = p.breakpoint;
  if (breakpointDataT) {
    const bpKeys = orderedKeys(breakpointDataT, { type: "known", order: KNOWN_ORDERS.breakpoint }, "types.breakpoint");
    lines.push(`export declare const breakpoint: Record<${bpKeys.map((k) => `'${k}'`).join(" | ")}, string>;`);
    lines.push(``);
  }
  const fontFamilyData = p.fontFamily;
  if (fontFamilyData) {
    const ffKeys = Object.keys(fontFamilyData);
    lines.push(`export declare const fontFamily: Record<${ffKeys.map((k) => `'${k}'`).join(" | ")}, string>;`);
    lines.push(``);
  }
  const compSizeDataT = tokens.semantic?.componentSize;
  if (compSizeDataT) {
    lines.push(`export declare const componentSize: {`);
    for (const comp of Object.keys(compSizeDataT)) {
      const compData = compSizeDataT[comp];
      if (!compData) continue;
      lines.push(`  ${comp}: {`);
      for (const part of Object.keys(compData)) {
        const partData = compData[part];
        if (!partData) continue;
        lines.push(`    ${part}: {`);
        for (const size of Object.keys(partData)) {
          const token = partData[size];
          if (!token) continue;
          const val = token.value;
          if (typeof val === "object" && val !== null) {
            lines.push(`      ${size}: { width: string; height: string };`);
          } else {
            lines.push(`      ${size}: string;`);
          }
        }
        lines.push(`    };`);
      }
      lines.push(`  };`);
    }
    lines.push(`};`);
    lines.push(``);
  }
  const animSemT = tokens.semantic?.animation;
  if (animSemT) {
    lines.push(`export declare const animation: {`);
    for (const [name, entry] of Object.entries(animSemT)) {
      if (name.startsWith("$")) continue;
      const token = entry;
      if (token.type !== "composition") continue;
      const val = token.value;
      const fields = ["duration: string", "easing: string"];
      if (val.opacity) fields.unshift("opacity: string");
      if (val.scale) fields.unshift("scale: string");
      if (val.translateX) fields.unshift("translateX: string");
      if (val.translateY) fields.unshift("translateY: string");
      if (val.heightVar) fields.unshift("heightVar: string");
      lines.push(`  '${name}': { ${fields.join("; ")} };`);
    }
    lines.push(`};`);
    lines.push(``);
  }
  const semT = tokens.semantic;
  const typoDataT = semT?.typography;
  if (typoDataT) {
    const typoType = `{ fontFamily: string; fontSize: string; fontWeight: string; lineHeight: string }`;
    lines.push(`export declare const typography: {`);
    for (const category of Object.keys(typoDataT)) {
      const catData = typoDataT[category];
      if (!catData) continue;
      if (catData.type === "typography") {
        lines.push(`  ${category}: ${typoType};`);
      } else {
        const childKeys = Object.keys(catData).filter((k) => {
          const entry = catData[k];
          return entry?.type === "typography";
        });
        lines.push(`  ${category}: {`);
        for (const name of childKeys) {
          lines.push(`    '${name}': ${typoType};`);
        }
        lines.push(`  };`);
      }
    }
    lines.push(`};`);
    lines.push(``);
  }
  lines.push(`// Named type aliases for convenience`);
  lines.push(`export type Colors = typeof colors;`);
  lines.push(`export type Spacing = typeof spacing;`);
  lines.push(`export type FontSize = typeof fontSize;`);
  lines.push(`export type BorderRadius = typeof borderRadius;`);
  lines.push(`export type Shadow = typeof shadow;`);
  lines.push(`export type ZIndex = typeof zIndex;`);
  lines.push(`export type Duration = typeof duration;`);
  lines.push(`export type IconSize = typeof iconSize;`);
  lines.push(`export type Opacity = typeof opacity;`);
  lines.push(`export type FontWeight = typeof fontWeight;`);
  lines.push(`export type BorderWidth = typeof borderWidth;`);
  lines.push(`export type Scale = typeof scale;`);
  lines.push(`export type Easing = typeof easing;`);
  lines.push(`export type Breakpoint = typeof breakpoint;`);
  lines.push(`export type FontFamily = typeof fontFamily;`);
  lines.push(`export type ComponentSize = typeof componentSize;`);
  lines.push(`export type Animation = typeof animation;`);
  lines.push(`export type Typography = typeof typography;`);
  lines.push(``);
  lines.push(`declare const tokens: {`);
  lines.push(`  colors: typeof colors;`);
  lines.push(`  spacing: typeof spacing;`);
  lines.push(`  fontSize: typeof fontSize;`);
  lines.push(`  borderRadius: typeof borderRadius;`);
  lines.push(`  shadow: typeof shadow;`);
  lines.push(`  zIndex: typeof zIndex;`);
  lines.push(`  duration: typeof duration;`);
  lines.push(`  iconSize: typeof iconSize;`);
  lines.push(`  opacity: typeof opacity;`);
  lines.push(`  fontWeight: typeof fontWeight;`);
  lines.push(`  borderWidth: typeof borderWidth;`);
  lines.push(`  scale: typeof scale;`);
  lines.push(`  easing: typeof easing;`);
  lines.push(`  breakpoint: typeof breakpoint;`);
  lines.push(`  fontFamily: typeof fontFamily;`);
  lines.push(`  componentSize: typeof componentSize;`);
  lines.push(`  animation: typeof animation;`);
  lines.push(`  typography: typeof typography;`);
  lines.push(`};`);
  lines.push(`export default tokens;`);
  lines.push(``);
  return lines.join("\n");
}
function generateNormalizedJson(tokens) {
  const p = tokens.primitive;
  const result = {};
  const colorFlat = {};
  const colorData = p.color;
  for (const palette of orderedKeys(colorData, { type: "known", order: KNOWN_ORDERS.colorPalettes }, "json.color")) {
    const paletteData = colorData[palette];
    if (!paletteData) continue;
    if (typeof paletteData === "object" && "value" in paletteData) {
      colorFlat[palette] = String(paletteData.value);
    } else {
      const shades = paletteData;
      for (const shade of orderedKeys(shades, { type: "numeric" }, `json.color.${palette}`)) {
        const token = shades[shade];
        if (token?.value) colorFlat[`${palette}-${shade}`] = String(token.value);
      }
    }
  }
  result.color = colorFlat;
  const spacingFlat = {};
  const spacingData = p.spacing;
  for (const key of orderedKeys(spacingData, { type: "numeric" }, "json.spacing")) {
    spacingFlat[key] = pxToRem(String(spacingData[key].value));
  }
  result.spacing = spacingFlat;
  const fontSizeFlat = {};
  const fontSizeData = p.fontSize;
  for (const name of orderedKeys(fontSizeData, { type: "known", order: KNOWN_ORDERS.fontSize }, "json.fontSize")) {
    const token = fontSizeData[name];
    if (!token) continue;
    fontSizeFlat[name] = pxToRem(String(token.value));
  }
  result.fontSize = fontSizeFlat;
  const lineHeightFlat = {};
  for (const name of orderedKeys(fontSizeData, { type: "known", order: KNOWN_ORDERS.fontSize }, "json.lineHeight")) {
    const token = fontSizeData[name];
    if (!token) continue;
    const lh = token.$extensions?.lineHeight;
    if (lh) lineHeightFlat[name] = pxToRem(lh);
  }
  result.lineHeight = lineHeightFlat;
  const radiusFlat = {};
  const radiusData = p.borderRadius;
  for (const name of orderedKeys(radiusData, { type: "known", order: KNOWN_ORDERS.borderRadius }, "json.borderRadius")) {
    const token = radiusData[name];
    if (!token) continue;
    radiusFlat[name] = formatValue(String(token.value), "borderRadius");
  }
  result.borderRadius = radiusFlat;
  const shadowFlat = {};
  const shadowData = p.shadow;
  for (const name of orderedKeys(shadowData, { type: "known", order: KNOWN_ORDERS.shadow }, "json.shadow")) {
    const token = shadowData[name];
    if (!token) continue;
    const ext = token.$extensions;
    shadowFlat[name] = formatShadow(token.value, ext);
  }
  result.shadow = shadowFlat;
  const iconSizeFlat = {};
  const iconSizeData = p.iconSize;
  for (const name of orderedKeys(iconSizeData, { type: "known", order: KNOWN_ORDERS.iconSize }, "json.iconSize")) {
    const token = iconSizeData[name];
    if (!token) continue;
    iconSizeFlat[name] = pxToRem(String(token.value));
  }
  result.iconSize = iconSizeFlat;
  const zFlat = {};
  const zData = p.zIndex;
  for (const name of orderedKeys(zData, { type: "known", order: KNOWN_ORDERS.zIndex }, "json.zIndex")) {
    const token = zData[name];
    if (!token) continue;
    zFlat[name] = token.value;
  }
  result.zIndex = zFlat;
  const durationFlat = {};
  const durationData = p.duration;
  for (const name of orderedKeys(durationData, { type: "known", order: KNOWN_ORDERS.duration }, "json.duration")) {
    const token = durationData[name];
    if (!token) continue;
    durationFlat[name] = String(token.value);
  }
  result.duration = durationFlat;
  const opacityFlat = {};
  const opacityData = p.opacity;
  if (opacityData) {
    for (const name of orderedKeys(opacityData, { type: "numeric" }, "json.opacity")) {
      const token = opacityData[name];
      if (!token) continue;
      opacityFlat[name] = String(token.value);
    }
    result.opacity = opacityFlat;
  }
  const fontWeightFlat = {};
  const fontWeightData = p.fontWeight;
  if (fontWeightData) {
    for (const name of Object.keys(fontWeightData)) {
      const token = fontWeightData[name];
      if (!token) continue;
      fontWeightFlat[name] = String(token.value);
    }
    result.fontWeight = fontWeightFlat;
  }
  const borderWidthFlat = {};
  const borderWidthData = p.borderWidth;
  if (borderWidthData) {
    for (const name of orderedKeys(borderWidthData, { type: "numeric" }, "json.borderWidth")) {
      const token = borderWidthData[name];
      if (!token) continue;
      borderWidthFlat[name] = `${token.value}px`;
    }
    result.borderWidth = borderWidthFlat;
  }
  const scaleFlat = {};
  const scaleData = p.scale;
  if (scaleData) {
    for (const name of Object.keys(scaleData)) {
      const token = scaleData[name];
      if (!token) continue;
      scaleFlat[name] = String(token.value);
    }
    result.scale = scaleFlat;
  }
  const easingFlat = {};
  const easingData = p.easing;
  if (easingData) {
    for (const name of orderedKeys(easingData, { type: "known", order: KNOWN_ORDERS.easing }, "json.easing")) {
      const token = easingData[name];
      if (!token) continue;
      easingFlat[name] = String(token.value);
    }
    result.easing = easingFlat;
  }
  const breakpointFlat = {};
  const breakpointData = p.breakpoint;
  if (breakpointData) {
    for (const name of orderedKeys(breakpointData, { type: "known", order: KNOWN_ORDERS.breakpoint }, "json.breakpoint")) {
      const token = breakpointData[name];
      if (!token) continue;
      breakpointFlat[name] = `${token.value}px`;
    }
    result.breakpoint = breakpointFlat;
  }
  const fontFamilyFlat = {};
  const fontFamilyData = p.fontFamily;
  if (fontFamilyData) {
    for (const name of Object.keys(fontFamilyData)) {
      const token = fontFamilyData[name];
      if (!token) continue;
      fontFamilyFlat[name] = String(token.value);
    }
    result.fontFamily = fontFamilyFlat;
  }
  const compSizeData = tokens.semantic?.componentSize;
  if (compSizeData) {
    const compFlat = {};
    for (const comp of Object.keys(compSizeData)) {
      const compData = compSizeData[comp];
      if (!compData) continue;
      for (const part of Object.keys(compData)) {
        const partData = compData[part];
        if (!partData) continue;
        for (const size of Object.keys(partData)) {
          const token = partData[size];
          if (!token) continue;
          const val = token.value;
          if (typeof val === "object" && val !== null) {
            const obj = val;
            if (obj.width) compFlat[`${comp}-${part}-${size}-width`] = `${obj.width}px`;
            if (obj.height) compFlat[`${comp}-${part}-${size}-height`] = `${obj.height}px`;
          } else {
            compFlat[`${comp}-${part}-${size}`] = `${val}px`;
          }
        }
      }
    }
    result.componentSize = compFlat;
  }
  const animSemJ = tokens.semantic?.animation;
  if (animSemJ) {
    const animFlat = {};
    for (const [name, entry] of Object.entries(animSemJ)) {
      if (name.startsWith("$")) continue;
      const token = entry;
      if (token.type !== "composition") continue;
      const val = token.value;
      const durationRaw = resolveRef(val.duration, p);
      const easingRaw = resolveRef(val.easing, p);
      animFlat[`${name}-duration`] = durationRaw.endsWith("ms") ? durationRaw : `${durationRaw}ms`;
      animFlat[`${name}-easing`] = easingRaw;
      if (val.opacity) animFlat[`${name}-opacity`] = resolveRef(val.opacity, p);
      if (val.scale) animFlat[`${name}-scale`] = resolveRef(val.scale, p);
      if (val.translateX) animFlat[`${name}-translateX`] = val.translateX.startsWith("{") ? resolveRef(val.translateX, p) : val.translateX;
      if (val.translateY) animFlat[`${name}-translateY`] = resolveRef(val.translateY, p);
      if (val.heightVar) animFlat[`${name}-heightVar`] = val.heightVar;
    }
    result.animation = animFlat;
  }
  return JSON.stringify(result, null, 2) + "\n";
}
function generateV3Preset(tokens) {
  const p = tokens.primitive;
  const lines = [];
  lines.push(`/**`);
  lines.push(` * Design System - Tailwind CSS v3 Preset`);
  lines.push(` * \u26A0\uFE0F Auto-generated from figma-tokens.json \u2014 DO NOT EDIT`);
  lines.push(` *`);
  lines.push(` * Non-color values reference CSS variables from variables.css for auto-sync.`);
  lines.push(` * Primitive colors use HEX for Tailwind v3 opacity modifier support (bg-white/10, etc.).`);
  lines.push(` * Semantic colors use rgb() with RGB channel variables for opacity modifier support (bg-primary/50, etc.).`);
  lines.push(` *`);
  lines.push(` * Usage:`);
  lines.push(` * \`\`\`js`);
  lines.push(` * // tailwind.config.js`);
  lines.push(` * module.exports = {`);
  lines.push(` *   presets: [require('@7onic-ui/react/tailwind-preset')],`);
  lines.push(` * }`);
  lines.push(` * \`\`\``);
  lines.push(` */`);
  lines.push(``);
  lines.push(`/** @type {import('tailwindcss').Config} */`);
  lines.push(`module.exports = {`);
  lines.push(`  theme: {`);
  lines.push(`    extend: {`);
  const colorData = p.color;
  lines.push(`      colors: {`);
  lines.push(`        // Standalone primitive colors (HEX for opacity modifier support: bg-white/10, etc.)`);
  const whiteToken = colorData.white;
  const blackToken = colorData.black;
  lines.push(`        white: '${whiteToken?.value || "#FFFFFF"}',`);
  lines.push(`        black: '${blackToken?.value || "#000000"}',`);
  lines.push(``);
  const rgbAlpha = (varName) => `'rgb(var(${varName}-rgb) / <alpha-value>)'`;
  lines.push(`        // Semantic colors (rgb() with alpha-value for opacity modifier support)`);
  lines.push(`        background: {`);
  lines.push(`          DEFAULT: ${rgbAlpha("--color-background")},`);
  lines.push(`          paper: ${rgbAlpha("--color-background-paper")},`);
  lines.push(`          elevated: ${rgbAlpha("--color-background-elevated")},`);
  lines.push(`          muted: ${rgbAlpha("--color-background-muted")},`);
  lines.push(`        },`);
  lines.push(`        foreground: ${rgbAlpha("--color-text")},`);
  lines.push(``);
  const brandColors = ["primary", "secondary"];
  for (const color of brandColors) {
    lines.push(`        ${color}: {`);
    lines.push(`          DEFAULT: ${rgbAlpha(`--color-${color}`)},`);
    lines.push(`          hover: ${rgbAlpha(`--color-${color}-hover`)},`);
    lines.push(`          active: ${rgbAlpha(`--color-${color}-active`)},`);
    lines.push(`          tint: ${rgbAlpha(`--color-${color}-tint`)},`);
    lines.push(`          foreground: ${rgbAlpha(`--color-${color}-text`)},`);
    const palette = colorData[color];
    if (palette) {
      for (const shade of orderedKeys(palette, { type: "known", order: KNOWN_ORDERS.shadeOrder }, `primitive.color.${color}`)) {
        const token = palette[shade];
        if (token?.value) {
          lines.push(`          '${shade}': '${token.value}',`);
        }
      }
    }
    lines.push(`        },`);
  }
  lines.push(``);
  lines.push(`        // Status colors`);
  const semanticColors = ["success", "warning", "error", "info"];
  for (const color of semanticColors) {
    lines.push(`        ${color}: {`);
    lines.push(`          DEFAULT: ${rgbAlpha(`--color-${color}`)},`);
    lines.push(`          hover: ${rgbAlpha(`--color-${color}-hover`)},`);
    lines.push(`          active: ${rgbAlpha(`--color-${color}-active`)},`);
    lines.push(`          tint: ${rgbAlpha(`--color-${color}-tint`)},`);
    lines.push(`          foreground: ${rgbAlpha(`--color-${color}-text`)},`);
    if (color === "error") {
      lines.push(`          bg: ${rgbAlpha("--color-error-bg")},`);
    }
    lines.push(`        },`);
  }
  lines.push(``);
  lines.push(`        // Primitive color palettes (HEX for opacity modifier support)`);
  const palettesOnly = ["gray", "blue", "green", "yellow", "red", "violet", "rose"];
  for (const palName of palettesOnly) {
    const palette = colorData[palName];
    if (!palette) continue;
    lines.push(`        ${palName}: {`);
    for (const shade of orderedKeys(palette, { type: "known", order: KNOWN_ORDERS.shadeOrder }, `primitive.color.${palName}`)) {
      const token = palette[shade];
      if (token?.value) {
        lines.push(`          '${shade}': '${token.value}',`);
      }
    }
    lines.push(`        },`);
  }
  lines.push(``);
  lines.push(`        // UI colors`);
  lines.push(`        border: {`);
  lines.push(`          DEFAULT: ${rgbAlpha("--color-border")},`);
  lines.push(`          strong: ${rgbAlpha("--color-border-strong")},`);
  lines.push(`          subtle: ${rgbAlpha("--color-border-subtle")},`);
  lines.push(`        },`);
  lines.push(`        ring: {`);
  lines.push(`          DEFAULT: ${rgbAlpha("--color-focus-ring")},`);
  lines.push(`          error: ${rgbAlpha("--color-focus-ring-error")},`);
  lines.push(`        },`);
  lines.push(`        muted: {`);
  lines.push(`          DEFAULT: ${rgbAlpha("--color-background-muted")},`);
  lines.push(`          foreground: ${rgbAlpha("--color-text-muted")},`);
  lines.push(`        },`);
  lines.push(`        disabled: {`);
  lines.push(`          DEFAULT: ${rgbAlpha("--color-disabled")},`);
  lines.push(`          foreground: ${rgbAlpha("--color-disabled-text")},`);
  lines.push(`        },`);
  lines.push(``);
  lines.push(`        // Chart colors`);
  lines.push(`        chart: {`);
  lines.push(`          '1': ${rgbAlpha("--color-chart-1")},`);
  lines.push(`          '2': ${rgbAlpha("--color-chart-2")},`);
  lines.push(`          '3': ${rgbAlpha("--color-chart-3")},`);
  lines.push(`          '4': ${rgbAlpha("--color-chart-4")},`);
  lines.push(`          '5': ${rgbAlpha("--color-chart-5")},`);
  lines.push(`        },`);
  lines.push(``);
  lines.push(`        // Text`);
  lines.push(`        text: {`);
  lines.push(`          DEFAULT: ${rgbAlpha("--color-text")},`);
  lines.push(`          muted: ${rgbAlpha("--color-text-muted")},`);
  lines.push(`          subtle: ${rgbAlpha("--color-text-subtle")},`);
  lines.push(`          link: ${rgbAlpha("--color-text-link")},`);
  lines.push(`          primary: ${rgbAlpha("--color-text-primary")},`);
  lines.push(`          info: ${rgbAlpha("--color-text-info")},`);
  lines.push(`          success: ${rgbAlpha("--color-text-success")},`);
  lines.push(`          error: ${rgbAlpha("--color-text-error")},`);
  lines.push(`          warning: ${rgbAlpha("--color-text-warning")},`);
  lines.push(`        },`);
  lines.push(`      },`);
  lines.push(``);
  const fontSizeData = p.fontSize;
  lines.push(`      fontSize: {`);
  for (const name of orderedKeys(fontSizeData, { type: "known", order: KNOWN_ORDERS.fontSize }, "primitive.fontSize")) {
    const token = fontSizeData[name];
    if (!token) continue;
    lines.push(`        '${name}': ['var(--font-size-${name})', { lineHeight: 'var(--line-height-${name})' }],`);
  }
  lines.push(`      },`);
  lines.push(``);
  const fontFamilyData = p.fontFamily;
  if (fontFamilyData) {
    lines.push(`      fontFamily: {`);
    for (const name of Object.keys(fontFamilyData).filter((k) => !k.startsWith("$"))) {
      const token = fontFamilyData[name];
      if (!token?.value) continue;
      lines.push(`        '${name}': ['var(--font-family-${name})'],`);
    }
    lines.push(`      },`);
    lines.push(``);
  }
  const spacingData = p.spacing;
  lines.push(`      spacing: {`);
  for (const key of orderedKeys(spacingData, { type: "numeric" }, "primitive.spacing")) {
    const cssKey = key.replace(".", "-");
    lines.push(`        '${key}': 'var(--spacing-${cssKey})',`);
  }
  lines.push(`      },`);
  lines.push(``);
  const radiusData = p.borderRadius;
  lines.push(`      borderRadius: {`);
  const radiusKeys = orderedKeys(radiusData, { type: "known", order: KNOWN_ORDERS.borderRadius }, "primitive.borderRadius");
  for (const name of radiusKeys) {
    const token = radiusData[name];
    if (!token) continue;
    lines.push(`        '${name}': 'var(--radius-${name})',`);
    if (name === "base") {
      lines.push(`        'DEFAULT': 'var(--radius-base)',`);
    }
  }
  lines.push(`      },`);
  lines.push(``);
  lines.push(`      boxShadow: {`);
  for (const name of orderedKeys(p.shadow, { type: "known", order: KNOWN_ORDERS.shadow }, "primitive.shadow")) {
    lines.push(`        '${name}': 'var(--shadow-${name})',`);
  }
  lines.push(`      },`);
  lines.push(``);
  const zIndexData = p.zIndex;
  lines.push(`      zIndex: {`);
  for (const name of orderedKeys(zIndexData, { type: "known", order: KNOWN_ORDERS.zIndex }, "primitive.zIndex")) {
    const token = zIndexData[name];
    if (!token) continue;
    lines.push(`        '${name}': 'var(--z-index-${name})',`);
  }
  lines.push(`      },`);
  lines.push(``);
  const durationData = p.duration;
  lines.push(`      transitionDuration: {`);
  for (const name of orderedKeys(durationData, { type: "known", order: KNOWN_ORDERS.duration }, "primitive.duration")) {
    const token = durationData[name];
    if (!token) continue;
    lines.push(`        '${name}': 'var(--duration-${name})',`);
  }
  lines.push(`      },`);
  lines.push(``);
  const easingData = p.easing;
  lines.push(`      transitionTimingFunction: {`);
  for (const name of orderedKeys(easingData, { type: "known", order: KNOWN_ORDERS.easing }, "primitive.easing")) {
    const token = easingData[name];
    if (!token) continue;
    lines.push(`        '${camelToKebab(name)}': 'var(--easing-${camelToKebab(name)})',`);
  }
  lines.push(`      },`);
  lines.push(``);
  const v3OpacityData = p.opacity;
  if (v3OpacityData) {
    lines.push(`      opacity: {`);
    for (const name of orderedKeys(v3OpacityData, { type: "numeric" }, "v3.opacity")) {
      const token = v3OpacityData[name];
      if (!token) continue;
      lines.push(`        '${name}': 'var(--opacity-${name})',`);
    }
    lines.push(`      },`);
    lines.push(``);
  }
  const scaleData = p.scale;
  lines.push(`      scale: {`);
  for (const name of Object.keys(scaleData)) {
    if (name.startsWith("$")) continue;
    lines.push(`        '${name}': 'var(--scale-${name})',`);
  }
  lines.push(`      },`);
  lines.push(``);
  const v3Anim = readAnimationTokens(tokens);
  lines.push(`      keyframes: {`);
  if (v3Anim) {
    for (const a of v3Anim) {
      if (a.type === "height-expand" || a.type === "height-collapse") {
        const isExpand = a.type === "height-expand";
        lines.push(`        '${a.name}': {`);
        lines.push(`          from: { height: '${isExpand ? "0" : `var(${a.heightVar})`}' },`);
        lines.push(`          to: { height: '${isExpand ? `var(${a.heightVar})` : "0"}' },`);
        lines.push(`        },`);
      } else if (a.type === "spin") {
        lines.push(`        '${a.name}': {`);
        lines.push(`          from: { 'transform': 'rotate(0deg)' },`);
        lines.push(`          to: { 'transform': 'rotate(360deg)' },`);
        lines.push(`        },`);
      } else if (a.type === "progress-stripe") {
        lines.push(`        '${a.name}': {`);
        lines.push(`          from: { 'background-position': '1rem 0' },`);
        lines.push(`          to: { 'background-position': '0 0' },`);
        lines.push(`        },`);
      } else if (a.type === "spinner-orbit") {
        lines.push(`        '${a.name}': {`);
        lines.push(`          from: { 'transform': 'rotateY(0deg)' },`);
        lines.push(`          to: { 'transform': 'rotateY(360deg)' },`);
        lines.push(`        },`);
      } else if (a.type === "spinner-dot") {
        lines.push(`        '${a.name}': {`);
        lines.push(`          '0%, 100%': { 'opacity': '0.2' },`);
        lines.push(`          '50%': { 'opacity': '1' },`);
        lines.push(`        },`);
      } else if (a.type === "spinner-bar") {
        lines.push(`        '${a.name}': {`);
        lines.push(`          '0%, 100%': { 'transform': 'scaleY(0.4)' },`);
        lines.push(`          '50%': { 'transform': 'scaleY(1)' },`);
        lines.push(`        },`);
      } else if (a.type === "spinner-morph") {
        lines.push(`        '${a.name}': {`);
        lines.push(`          '0%, 100%': { 'border-radius': '50%', 'transform': 'rotateY(0deg) rotate(0deg)' },`);
        lines.push(`          '25%': { 'border-radius': '30% 70% 70% 30% / 30% 30% 70% 70%', 'transform': 'rotateY(90deg) rotate(90deg)' },`);
        lines.push(`          '50%': { 'border-radius': '50%', 'transform': 'rotateY(180deg) rotate(180deg)' },`);
        lines.push(`          '75%': { 'border-radius': '70% 30% 30% 70% / 70% 70% 30% 30%', 'transform': 'rotateY(270deg) rotate(270deg)' },`);
        lines.push(`        },`);
      } else if (a.type === "skeleton-pulse") {
        lines.push(`        '${a.name}': {`);
        lines.push(`          '0%, 100%': { 'opacity': '1' },`);
        lines.push(`          '50%': { 'opacity': '0.4' },`);
        lines.push(`        },`);
      } else if (a.type === "skeleton-wave") {
        lines.push(`        '${a.name}': {`);
        lines.push(`          '0%': { 'transform': 'translateX(-100%)' },`);
        lines.push(`          '100%': { 'transform': 'translateX(100%)' },`);
        lines.push(`        },`);
      } else if (a.type === "typing-cursor") {
        lines.push(`        '${a.name}': {`);
        lines.push(`          '0%, 100%': { 'opacity': '1' },`);
        lines.push(`          '50%': { 'opacity': '0.4' },`);
        lines.push(`        },`);
      } else {
        const isEnter = a.type === "enter";
        const fromProps = [];
        const toProps = [];
        if (a.opacity) {
          fromProps.push(`'opacity': '${isEnter ? a.opacity : "1"}'`);
          toProps.push(`'opacity': '${isEnter ? "1" : a.opacity}'`);
        }
        const fromT = [], toT = [];
        if (a.scale) {
          fromT.push(isEnter ? `scale(${a.scale})` : "scale(1)");
          toT.push(isEnter ? "scale(1)" : `scale(${a.scale})`);
        }
        if (a.translateX) {
          const v = formatTranslateVal(a.translateX, a.translateXNegative);
          fromT.push(isEnter ? `translateX(${v})` : "translateX(0)");
          toT.push(isEnter ? "translateX(0)" : `translateX(${v})`);
        }
        if (a.translateY) {
          const v = formatTranslateVal(a.translateY, a.translateYNegative);
          fromT.push(isEnter ? `translateY(${v})` : "translateY(0)");
          toT.push(isEnter ? "translateY(0)" : `translateY(${v})`);
        }
        if (fromT.length) {
          fromProps.push(`'transform': '${fromT.join(" ")}'`);
          toProps.push(`'transform': '${toT.join(" ")}'`);
        }
        lines.push(`        '${a.name}': {`);
        lines.push(`          from: { ${fromProps.join(", ")} },`);
        lines.push(`          to: { ${toProps.join(", ")} },`);
        lines.push(`        },`);
      }
    }
  }
  lines.push(`      },`);
  lines.push(``);
  const infiniteTypes = /* @__PURE__ */ new Set(["spin", "progress-stripe", "spinner-orbit", "spinner-dot", "spinner-bar", "spinner-morph", "skeleton-pulse", "skeleton-wave", "typing-cursor"]);
  lines.push(`      animation: {`);
  if (v3Anim) {
    for (const a of v3Anim) {
      const infinite = infiniteTypes.has(a.type) ? " infinite" : "";
      lines.push(`        '${a.name}': '${a.name} ${a.durationVar} ${a.easingVar}${infinite}',`);
    }
  }
  lines.push(`      },`);
  lines.push(`    },`);
  lines.push(`  },`);
  lines.push(`  plugins: [`);
  lines.push(`    // Icon size utilities`);
  lines.push(`    function({ addUtilities }) {`);
  lines.push(`      addUtilities({`);
  for (const name of KNOWN_ORDERS.iconSize) {
    lines.push(`        '.icon-${name}': { width: 'var(--icon-size-${name})', height: 'var(--icon-size-${name})' },`);
  }
  lines.push(`      })`);
  lines.push(`    },`);
  lines.push(`    // Scale reset for grouped buttons (override active:scale-pressed)`);
  lines.push(`    function({ addUtilities }) {`);
  lines.push(`      addUtilities({`);
  lines.push(`        '.scale-none': { transform: 'none !important' },`);
  lines.push(`      })`);
  lines.push(`    },`);
  lines.push(`    // Focus ring utility (v3/v4 compatible)`);
  lines.push(`    function({ addUtilities }) {`);
  lines.push(`      addUtilities({`);
  lines.push(`        '.focus-ring': {`);
  lines.push(`          outline: '2px solid transparent',`);
  lines.push(`          'outline-offset': '2px',`);
  lines.push(`          'box-shadow': '0 0 0 2px var(--color-focus-ring)',`);
  lines.push(`        },`);
  lines.push(`      })`);
  lines.push(`    },`);
  if (v3Anim) {
    lines.push(`    // Animation utilities (generated from semantic.animation)`);
    lines.push(`    function({ addUtilities }) {`);
    lines.push(`      addUtilities({`);
    for (const a of v3Anim) {
      const infinite = infiniteTypes.has(a.type) ? " infinite" : "";
      lines.push(`        '.animate-${a.name}': { 'animation': '${a.name} ${a.durationVar} ${a.easingVar}${infinite}' },`);
    }
    lines.push(`      })`);
    lines.push(`    },`);
  }
  lines.push(`  ],`);
  lines.push(`}`);
  lines.push(``);
  return lines.join("\n");
}
function generateV4Theme(tokens) {
  const p = tokens.primitive;
  const lines = [];
  lines.push(`/**`);
  lines.push(` * Design System - Tailwind CSS v4 Theme`);
  lines.push(` * \u26A0\uFE0F Auto-generated from figma-tokens.json \u2014 DO NOT EDIT`);
  lines.push(` *`);
  lines.push(` * This file is a MAPPING layer between variables.css and Tailwind v4 utilities.`);
  lines.push(` * Actual values live in variables.css (single source of truth).`);
  lines.push(` *`);
  lines.push(` * - var() references: auto-sync when variables.css changes`);
  lines.push(` * - Hardcoded values: same-name variables (overridden by variables.css at runtime)`);
  lines.push(` * - Dark mode: handled entirely by variables.css .dark block (no duplication here)`);
  lines.push(` *`);
  lines.push(` * Usage:`);
  lines.push(` * \`\`\`css`);
  lines.push(` * @import "tailwindcss";`);
  lines.push(` * @import "@7onic-ui/react/tokens";   <- variables.css (values)`);
  lines.push(` * @import "@7onic-ui/react/theme";    <- this file (mapping)`);
  lines.push(` * \`\`\``);
  lines.push(` */`);
  lines.push(``);
  lines.push(`@theme {`);
  lines.push(`  /* =============================================`);
  lines.push(`     Colors \u2014 var() references (different names \u2192 auto-sync)`);
  lines.push(`     When variables.css changes, these follow automatically.`);
  lines.push(`     Dark mode: variables.css .dark changes the source \u2192 auto-cascade.`);
  lines.push(`     ============================================= */`);
  lines.push(``);
  const resolveLight = (cat, variant) => {
    const catData = tokens.light.color[cat];
    if (!catData) return "";
    const token = catData[variant];
    if (!token) return "";
    return typeof token.value === "string" && token.value.startsWith("{") ? resolveReference(token.value, tokens) : String(token.value);
  };
  lines.push(`  /* Background */`);
  lines.push(`  --color-background: ${resolveLight("background", "default")};          /* same name \u2192 overridden by variables.css */`);
  lines.push(`  --color-background-paper: ${resolveLight("background", "paper")};          /* same name \u2192 overridden by variables.css */`);
  lines.push(`  --color-background-elevated: ${resolveLight("background", "elevated")};       /* same name \u2192 overridden by variables.css */`);
  lines.push(`  --color-background-muted: ${resolveLight("background", "muted")};         /* same name \u2192 overridden by variables.css */`);
  lines.push(``);
  lines.push(`  /* Foreground */`);
  lines.push(`  --color-foreground: var(--color-text);`);
  lines.push(``);
  const v4ColorGroups = ["primary", "secondary", "success", "warning", "error", "info"];
  for (const group of v4ColorGroups) {
    const label = group.charAt(0).toUpperCase() + group.slice(1);
    lines.push(`  /* ${label} */`);
    lines.push(`  --color-${group}: ${resolveLight(group, "default")};               /* same name \u2192 overridden by variables.css */`);
    lines.push(`  --color-${group}-hover: ${resolveLight(group, "hover")};             /* same name \u2192 overridden by variables.css */`);
    lines.push(`  --color-${group}-active: ${resolveLight(group, "active")};            /* same name \u2192 overridden by variables.css */`);
    lines.push(`  --color-${group}-tint: ${resolveLight(group, "tint")};              /* same name \u2192 overridden by variables.css */`);
    lines.push(`  --color-${group}-foreground: var(--color-${group}-text);`);
    if (group === "error") {
      lines.push(`  --color-error-bg: var(--color-error-bg);`);
    }
    lines.push(``);
  }
  lines.push(`  /* Border */`);
  lines.push(`  --color-border: ${resolveLight("border", "default")};                /* same name \u2192 overridden by variables.css */`);
  lines.push(`  --color-border-strong: ${resolveLight("border", "strong")};             /* same name \u2192 overridden by variables.css */`);
  lines.push(`  --color-border-subtle: ${resolveLight("border", "subtle")};             /* same name \u2192 overridden by variables.css */`);
  lines.push(``);
  lines.push(`  /* Muted */`);
  lines.push(`  --color-muted: var(--color-background-muted);`);
  lines.push(`  --color-muted-foreground: var(--color-text-muted);`);
  lines.push(``);
  lines.push(`  /* Ring (focus) */`);
  lines.push(`  --color-ring: var(--color-focus-ring);`);
  lines.push(`  --color-ring-error: var(--color-focus-ring-error);`);
  lines.push(``);
  lines.push(`  /* Disabled */`);
  lines.push(`  --color-disabled: ${resolveLight("disabled", "default")};             /* same name \u2192 overridden by variables.css */`);
  lines.push(`  --color-disabled-foreground: var(--color-disabled-text);`);
  lines.push(``);
  lines.push(`  /* Chart */`);
  lines.push(`  --color-chart-1: ${resolveLight("chart", "1")};               /* same name \u2192 overridden by variables.css */`);
  lines.push(`  --color-chart-2: ${resolveLight("chart", "2")};               /* same name \u2192 overridden by variables.css */`);
  lines.push(`  --color-chart-3: ${resolveLight("chart", "3")};               /* same name \u2192 overridden by variables.css */`);
  lines.push(`  --color-chart-4: ${resolveLight("chart", "4")};               /* same name \u2192 overridden by variables.css */`);
  lines.push(`  --color-chart-5: ${resolveLight("chart", "5")};               /* same name \u2192 overridden by variables.css */`);
  lines.push(``);
  lines.push(`  /* Text */`);
  lines.push(`  --color-text: ${resolveLight("text", "default")};                   /* same name \u2192 overridden by variables.css */`);
  lines.push(`  --color-text-muted: ${resolveLight("text", "muted")};               /* same name \u2192 overridden by variables.css */`);
  lines.push(`  --color-text-subtle: ${resolveLight("text", "subtle")};              /* same name \u2192 overridden by variables.css */`);
  lines.push(`  --color-text-link: ${resolveLight("text", "link")};                /* same name \u2192 overridden by variables.css */`);
  lines.push(`  --color-text-primary: ${resolveLight("text", "primary")};             /* same name \u2192 overridden by variables.css */`);
  lines.push(`  --color-text-info: ${resolveLight("text", "info")};                /* same name \u2192 overridden by variables.css */`);
  lines.push(`  --color-text-success: ${resolveLight("text", "success")};             /* same name \u2192 overridden by variables.css */`);
  lines.push(`  --color-text-error: ${resolveLight("text", "error")};               /* same name \u2192 overridden by variables.css */`);
  lines.push(`  --color-text-warning: ${resolveLight("text", "warning")};             /* same name \u2192 overridden by variables.css */`);
  lines.push(``);
  const colorData = p.color;
  lines.push(`  /* =============================================`);
  lines.push(`     Primitive Color Palettes`);
  lines.push(`     Same names as variables.css \u2014 overridden at runtime.`);
  lines.push(`     ============================================= */`);
  lines.push(``);
  lines.push(`  --color-white: ${colorData.white.value};`);
  lines.push(`  --color-black: ${colorData.black.value};`);
  lines.push(``);
  const v4Palettes = ["gray", "primary", "secondary", "blue", "green", "yellow", "red", "violet", "rose"];
  for (const palName of v4Palettes) {
    const palette = colorData[palName];
    if (!palette) continue;
    lines.push(`  /* ${palName} */`);
    for (const shade of orderedKeys(palette, { type: "known", order: KNOWN_ORDERS.shadeOrder }, `primitive.color.${palName}`)) {
      const token = palette[shade];
      if (token?.value) {
        lines.push(`  --color-${palName}-${shade}: ${token.value};`);
      }
    }
    lines.push(``);
  }
  lines.push(`  /* =============================================`);
  lines.push(`     Typography \u2014 var() references (different namespace \u2192 auto-sync)`);
  lines.push(`     @theme uses --text-*, variables.css uses --font-size-*`);
  lines.push(`     ============================================= */`);
  for (const name of orderedKeys(p.fontSize, { type: "known", order: KNOWN_ORDERS.fontSize }, "primitive.fontSize")) {
    lines.push(`  --text-${name}: var(--font-size-${name});`);
    lines.push(`  --text-${name}--line-height: var(--line-height-${name});`);
  }
  lines.push(``);
  const fontFamilyData = p.fontFamily;
  if (fontFamilyData) {
    lines.push(`  /* =============================================`);
    lines.push(`     Font Family \u2014 var() references to variables.css`);
    lines.push(`     ============================================= */`);
    for (const name of Object.keys(fontFamilyData).filter((k) => !k.startsWith("$"))) {
      lines.push(`  --font-${name}: var(--font-family-${name});`);
    }
    lines.push(``);
  }
  lines.push(`  /* =============================================`);
  lines.push(`     Border Radius`);
  lines.push(`     Same names as variables.css \u2014 values here just register utilities.`);
  lines.push(`     Runtime values come from variables.css (unlayered > theme layer).`);
  lines.push(`     ============================================= */`);
  const radiusData = p.borderRadius;
  for (const name of orderedKeys(radiusData, { type: "known", order: KNOWN_ORDERS.borderRadius }, "primitive.borderRadius")) {
    const token = radiusData[name];
    if (!token) continue;
    if (name === "base") {
      lines.push(`  --radius-DEFAULT: ${radiusData["base"].value}px;`);
    } else {
      lines.push(`  --radius-${name}: ${formatValue(String(token.value), "borderRadius")};`);
    }
  }
  lines.push(``);
  lines.push(`  /* =============================================`);
  lines.push(`     Shadows`);
  lines.push(`     Same names as variables.css \u2014 overridden at runtime.`);
  lines.push(`     Dark mode shadows also handled by variables.css .dark block.`);
  lines.push(`     ============================================= */`);
  const shadowData = p.shadow;
  for (const name of orderedKeys(shadowData, { type: "known", order: KNOWN_ORDERS.shadow }, "primitive.shadow")) {
    const token = shadowData[name];
    if (!token) continue;
    const ext = token.$extensions;
    lines.push(`  --shadow-${name}: ${formatShadow(token.value, ext)};`);
  }
  lines.push(``);
  const v4CompSizeData = tokens.semantic?.componentSize;
  if (v4CompSizeData) {
    lines.push(`  /* =============================================`);
    lines.push(`     Component Sizes`);
    lines.push(`     Switch, Slider thumb/track dimensions.`);
    lines.push(`     ============================================= */`);
    for (const comp of Object.keys(v4CompSizeData)) {
      const compData = v4CompSizeData[comp];
      for (const part of Object.keys(compData)) {
        const partData = compData[part];
        for (const size of Object.keys(partData)) {
          const token = partData[size];
          const val = token.value;
          if (typeof val === "object" && val !== null) {
            const obj = val;
            if (obj.width) lines.push(`  --component-${comp}-${part}-${size}-width: ${obj.width}px;`);
            if (obj.height) lines.push(`  --component-${comp}-${part}-${size}-height: ${obj.height}px;`);
          } else {
            lines.push(`  --component-${comp}-${part}-${size}: ${val}px;`);
          }
        }
      }
    }
    lines.push(``);
  }
  const v4OpacityData = p.opacity;
  if (v4OpacityData) {
    lines.push(`  /* =============================================`);
    lines.push(`     Opacity`);
    lines.push(`     Same names as variables.css \u2014 overridden at runtime.`);
    lines.push(`     ============================================= */`);
    for (const name of orderedKeys(v4OpacityData, { type: "numeric" }, "v4.opacity")) {
      const token = v4OpacityData[name];
      if (!token) continue;
      const pct = Math.round(Number(token.value) * 100);
      lines.push(`  --opacity-${name}: ${pct}%;`);
    }
    lines.push(``);
  }
  const v4EasingData = p.easing;
  if (v4EasingData) {
    lines.push(`  /* =============================================`);
    lines.push(`     Easing \u2014 var() references to variables.css`);
    lines.push(`     ============================================= */`);
    for (const name of orderedKeys(v4EasingData, { type: "known", order: KNOWN_ORDERS.easing }, "v4.easing")) {
      const token = v4EasingData[name];
      if (!token) continue;
      const cssVarSuffix = camelToKebab(name);
      let v4Suffix;
      if (name === "ease") {
        v4Suffix = "DEFAULT";
      } else if (name === "linear") {
        v4Suffix = "linear";
      } else {
        v4Suffix = camelToKebab(name.replace(/^ease/, ""));
      }
      lines.push(`  --ease-${v4Suffix}: var(--easing-${cssVarSuffix});`);
    }
    lines.push(``);
  }
  lines.push(`  /* =============================================`);
  lines.push(`     Animation`);
  lines.push(`     ============================================= */`);
  lines.push(`  --animate-spin: spin 1s linear infinite;`);
  lines.push(`}`);
  lines.push(``);
  lines.push(`/*`);
  lines.push(` * NOTE: No .dark block needed here.`);
  lines.push(` *`);
  lines.push(` * Dark mode is handled entirely by variables.css .dark { } block.`);
  lines.push(` * - var() referenced variables: source changes in .dark \u2192 auto-cascade`);
  lines.push(` * - Same-name variables: variables.css (unlayered) overrides @theme (theme layer)`);
  lines.push(` *`);
  lines.push(` * CSS cascade: unlayered > @layer theme`);
  lines.push(` * So variables.css always wins over @theme for same-name variables.`);
  lines.push(` */`);
  lines.push(``);
  lines.push(`/* =============================================`);
  lines.push(`   Custom Utilities`);
  lines.push(`   ============================================= */`);
  lines.push(``);
  lines.push(`/* Transition duration \u2014 var() references to variables.css */`);
  for (const name of orderedKeys(p.duration, { type: "known", order: KNOWN_ORDERS.duration }, "primitive.duration")) {
    lines.push(`@utility duration-${name} {`);
    lines.push(`  transition-duration: var(--duration-${name});`);
    lines.push(`}`);
  }
  lines.push(``);
  lines.push(`/* Scale \u2014 var() references to variables.css */`);
  const v4ScaleData = p.scale;
  for (const name of Object.keys(v4ScaleData)) {
    if (name.startsWith("$")) continue;
    lines.push(`@utility scale-${name} {`);
    lines.push(`  scale: var(--scale-${name});`);
    lines.push(`}`);
  }
  lines.push(``);
  lines.push(`/* Icon size utilities (5-step system) \u2014 var() references */`);
  for (const name of orderedKeys(p.iconSize, { type: "known", order: KNOWN_ORDERS.iconSize }, "primitive.iconSize")) {
    lines.push(`@utility icon-${name} {`);
    lines.push(`  width: var(--icon-size-${name});`);
    lines.push(`  height: var(--icon-size-${name});`);
    lines.push(`}`);
  }
  lines.push(``);
  lines.push(`/* Focus ring utility (v3/v4 compatible) */`);
  lines.push(`@utility focus-ring {`);
  lines.push(`  outline: 2px solid transparent;`);
  lines.push(`  outline-offset: 2px;`);
  lines.push(`  box-shadow: 0 0 0 2px var(--color-focus-ring);`);
  lines.push(`}`);
  lines.push(``);
  lines.push(`/* Z-index utilities (named semantic values) \u2014 var() references */`);
  const zNamedOnly = ["sticky", "dropdown", "overlay", "modal", "popover", "tooltip", "toast"];
  const zUtilities = orderedKeys(p.zIndex, { type: "known", order: KNOWN_ORDERS.zIndex }).filter((k) => zNamedOnly.includes(k) || isNaN(Number(k)));
  for (const name of zUtilities) {
    lines.push(`@utility z-${name} {`);
    lines.push(`  z-index: var(--z-index-${name});`);
    lines.push(`}`);
  }
  lines.push(``);
  lines.push(`/* Scale reset for grouped buttons (override active:scale-pressed) */`);
  lines.push(`@utility scale-none {`);
  lines.push(`  scale: 1 !important;`);
  lines.push(`  transform: none !important;`);
  lines.push(`}`);
  lines.push(``);
  const v4Anim = readAnimationTokens(tokens);
  if (v4Anim) {
    lines.push(`/* =============================================`);
    lines.push(`   Animations`);
    lines.push(`   Generated from semantic.animation in figma-tokens.json`);
    lines.push(`   Token name = keyframe name = class name (1:1)`);
    lines.push(`   ============================================= */`);
    lines.push(``);
    for (const a of v4Anim) {
      lines.push(generateAnimationCss(a, "v4"));
      lines.push(``);
    }
  }
  return lines.join("\n");
}
function generateCssBundle() {
  const lines = [];
  lines.push(`/* Auto-generated by sync-tokens \u2014 DO NOT EDIT */`);
  lines.push(`/* All-in-one CSS bundle: variables + light/dark themes */`);
  lines.push(``);
  lines.push(`@import './variables.css';`);
  lines.push(`@import './themes/light.css';`);
  lines.push(`@import './themes/dark.css';`);
  lines.push(``);
  return lines.join("\n");
}
function generateV4Bundle() {
  const lines = [];
  lines.push(`/* Auto-generated by sync-tokens \u2014 DO NOT EDIT */`);
  lines.push(`/* All-in-one Tailwind v4 bundle: variables + themes + v4 mapping */`);
  lines.push(``);
  lines.push(`@import '../css/variables.css';`);
  lines.push(`@import '../css/themes/light.css';`);
  lines.push(`@import '../css/themes/dark.css';`);
  lines.push(`@import './v4-theme.css';`);
  lines.push(``);
  return lines.join("\n");
}
function parseExistingVars(cssContent) {
  const vars = /* @__PURE__ */ new Map();
  const rootMatch = cssContent.match(/:root\s*\{([\s\S]*?)\n\}/);
  if (!rootMatch) return vars;
  const rootBlock = rootMatch[1];
  const varRegex = /--([\w-]+)\s*:\s*([^;]+);/g;
  let match;
  while ((match = varRegex.exec(rootBlock)) !== null) {
    vars.set(`--${match[1]}`, match[2].trim());
  }
  return vars;
}
function detectBreakingChanges(oldVars, newVars) {
  const removed = /* @__PURE__ */ new Map();
  const added = /* @__PURE__ */ new Map();
  const renamed = [];
  const changed = [];
  for (const [name, value] of oldVars) {
    if (!newVars.has(name)) {
      removed.set(name, value);
    } else if (newVars.get(name) !== value) {
      changed.push({ name, oldValue: value, newValue: newVars.get(name) });
    }
  }
  for (const [name, value] of newVars) {
    if (!oldVars.has(name)) {
      added.set(name, value);
    }
  }
  for (const [oldName, oldValue] of removed) {
    for (const [newName, newValue] of added) {
      if (oldValue === newValue) {
        renamed.push({ oldName, newName, value: oldValue });
      }
    }
  }
  return { removed, added, renamed, changed };
}
function formatBreakingChanges(changes) {
  const lines = [];
  lines.push(`
\u26A0\uFE0F  Breaking Changes Detected:
`);
  if (changes.removed.size > 0) {
    lines.push(`  REMOVED (${changes.removed.size}):`);
    for (const [name, value] of changes.removed) {
      lines.push(`    - ${name}: ${value}`);
    }
    lines.push(``);
  }
  if (changes.renamed.length > 0) {
    lines.push(`  POSSIBLE RENAME (${changes.renamed.length}):`);
    for (const r of changes.renamed) {
      lines.push(`    ${r.oldName} \u2192 ${r.newName} (same value: ${r.value})`);
    }
    lines.push(``);
  }
  if (changes.added.size > 0) {
    lines.push(`  ADDED (${changes.added.size}):`);
    for (const [name, value] of changes.added) {
      lines.push(`    + ${name}: ${value}`);
    }
    lines.push(``);
  }
  lines.push(`  Affected files: variables.css, v3-preset.js, v4-theme.css, globals.css
`);
  return lines.join("\n");
}
function formatDiff(changes) {
  const total = changes.removed.size + changes.added.size + changes.renamed.length + changes.changed.length;
  if (total === 0) return "";
  const lines = [];
  lines.push(`
\u{1F4CA} Token Diff Summary (${total} changes):
`);
  if (changes.renamed.length > 0) {
    lines.push(`  RENAMED (${changes.renamed.length}):`);
    for (const r of changes.renamed) {
      lines.push(`    ~ ${r.oldName} \u2192 ${r.newName}`);
    }
    lines.push(``);
  }
  if (changes.changed.length > 0) {
    lines.push(`  VALUE CHANGED (${changes.changed.length}):`);
    for (const c of changes.changed) {
      lines.push(`    ~ ${c.name}: ${c.oldValue} \u2192 ${c.newValue}`);
    }
    lines.push(``);
  }
  if (changes.added.size > 0) {
    lines.push(`  ADDED (${changes.added.size}):`);
    for (const [name, value] of changes.added) {
      lines.push(`    + ${name}: ${value}`);
    }
    lines.push(``);
  }
  if (changes.removed.size > 0) {
    lines.push(`  REMOVED (${changes.removed.size}):`);
    for (const [name, value] of changes.removed) {
      lines.push(`    - ${name}: ${value}`);
    }
    lines.push(``);
  }
  return lines.join("\n");
}
function generateDeprecatedAliases(changes) {
  if (changes.renamed.length === 0) return "";
  const lines = [];
  lines.push(`/**`);
  lines.push(` * Deprecated CSS variable aliases`);
  lines.push(` * Auto-generated by sync-tokens \u2014 do not edit manually`);
  lines.push(` *`);
  lines.push(` * These aliases provide backwards compatibility for renamed tokens.`);
  lines.push(` * They will be removed in a future major version.`);
  lines.push(` */`);
  lines.push(`:root {`);
  for (const r of changes.renamed) {
    lines.push(`  /* @deprecated \u2014 use ${r.newName} instead */`);
    lines.push(`  ${r.oldName}: var(${r.newName});`);
  }
  lines.push(`}`);
  lines.push(``);
  return lines.join("\n");
}
async function promptUser(message) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve3) => {
    rl.question(`${message} Continue? (y/n) `, (answer) => {
      rl.close();
      resolve3(answer.toLowerCase() === "y");
    });
  });
}

// scripts/cli-sync.ts
function parseArgs(argv) {
  const args = argv.slice(2);
  const parsed = {
    input: "./figma-tokens.json",
    output: "./",
    force: false,
    dryRun: false,
    help: false
  };
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--input":
        parsed.input = args[++i] ?? parsed.input;
        break;
      case "--output":
        parsed.output = args[++i] ?? parsed.output;
        break;
      case "--force":
        parsed.force = true;
        break;
      case "--dry-run":
        parsed.dryRun = true;
        break;
      case "--help":
      case "-h":
        parsed.help = true;
        break;
    }
  }
  return parsed;
}
function showHelp() {
  console.log(`
@7onic-ui/tokens \u2014 Design Token Sync CLI

Usage:
  npx sync-tokens [options]

Options:
  --input <path>    Path to figma-tokens.json (default: ./figma-tokens.json)
  --output <dir>    Output directory (default: ./)
  --force           Skip confirmation prompts
  --dry-run         Preview changes without writing files
  --help, -h        Show this help message

Generated files:
  css/variables.css          All CSS custom properties + framework baseline (html body reset)
  css/themes/light.css       Light theme semantic colors
  css/themes/dark.css        Dark theme semantic colors
  css/all.css                All-in-one CSS bundle
  tailwind/v3-preset.js      Tailwind CSS v3 preset
  tailwind/v4-theme.css      Tailwind CSS v4 theme
  tailwind/v4.css            All-in-one Tailwind v4 bundle
  js/index.js                CommonJS token exports
  js/index.mjs               ESM token exports
  types/index.d.ts           TypeScript type definitions
  json/tokens.json           Flat resolved JSON

Example:
  npx sync-tokens --input ./design/figma-tokens.json --output ./tokens/
`);
}
function writeOutputFile(outputDir, relativePath, content) {
  const fullPath = path2.resolve(outputDir, relativePath);
  const dir = path2.dirname(fullPath);
  if (!fs2.existsSync(dir)) {
    fs2.mkdirSync(dir, { recursive: true });
  }
  let status;
  if (!fs2.existsSync(fullPath)) {
    status = "new";
  } else {
    const existing = fs2.readFileSync(fullPath, "utf-8");
    status = existing === content ? "unchanged" : "updated";
  }
  fs2.writeFileSync(fullPath, content);
  return status;
}
function formatStatusBadge(status) {
  if (status === "new") return "(NEW)";
  if (status === "updated") return "(updated)";
  return "(unchanged)";
}
async function cliMain() {
  const opts = parseArgs(process.argv);
  if (opts.help) {
    showHelp();
    return;
  }
  const inputPath = path2.resolve(opts.input);
  const outputDir = path2.resolve(opts.output);
  if (!fs2.existsSync(inputPath)) {
    console.error(`\u274C figma-tokens.json not found: ${inputPath}`);
    console.error("   Use --input <path> to specify the location.");
    process.exit(1);
  }
  console.log("\u{1F504} sync-tokens: Reading figma-tokens.json...");
  console.log(`   Input:  ${inputPath}`);
  console.log(`   Output: ${outputDir}`);
  console.log("");
  const tokens = readJsonFile(inputPath);
  console.log("\u{1F50D} Validating tokens...");
  const tokenWarnings = validateTokens(tokens);
  const hasErrors = tokenWarnings.some((w) => w.level === "error");
  if (hasErrors) {
    printTokenWarnings(tokenWarnings);
    console.error("\n\u274C Token validation failed with errors. Fix the issues above before syncing.");
    process.exit(1);
  }
  let deprecatedCss = "";
  const existingVarsCssPath = path2.join(outputDir, "css/variables.css");
  const existingCss = fs2.existsSync(existingVarsCssPath) ? fs2.readFileSync(existingVarsCssPath, "utf-8") : "";
  if (existingCss) {
    const oldVars = parseExistingVars(existingCss);
    const newCss = generateVariablesCss(tokens);
    const newVars = parseExistingVars(newCss);
    const changes = detectBreakingChanges(oldVars, newVars);
    const hasBreaking = changes.removed.size > 0 || changes.renamed.length > 0;
    const hasAnyChange = hasBreaking || changes.added.size > 0 || changes.changed.length > 0;
    if (hasAnyChange) {
      console.log(formatDiff(changes));
    }
    if (hasBreaking) {
      console.log(formatBreakingChanges(changes));
      if (!opts.force) {
        const proceed = await promptUser("");
        if (!proceed) {
          console.log("\u274C Aborted.");
          process.exit(1);
        }
      }
    }
    deprecatedCss = generateDeprecatedAliases(changes);
    if (deprecatedCss) {
      console.log(`\u{1F4DD} Generating deprecated aliases (${changes.renamed.length} renames)...`);
    }
  }
  console.log("\u{1F4DD} Generating files...");
  const variablesCss = generateVariablesCss(tokens);
  const themeLight = generateThemeLight(tokens);
  const themeDark = generateThemeDark(tokens);
  const v3Preset = generateV3Preset(tokens);
  const v4Theme = generateV4Theme(tokens);
  const jsTokens = generateJsTokens(tokens);
  const typeDefs = generateTypeDefinitions(tokens);
  const normalizedJson = generateNormalizedJson(tokens);
  const cssBundle = generateCssBundle();
  const v4Bundle = generateV4Bundle();
  if (opts.dryRun) {
    console.log("\n--- DRY RUN: No files written ---");
    printTokenWarnings(tokenWarnings);
    console.log("\nFiles that would be generated:");
    console.log("   \u{1F4C4} css/variables.css");
    console.log("   \u{1F4C4} css/themes/light.css");
    console.log("   \u{1F4C4} css/themes/dark.css");
    console.log("   \u{1F4C4} tailwind/v3-preset.js");
    console.log("   \u{1F4C4} tailwind/v4-theme.css");
    console.log("   \u{1F4C4} js/index.js");
    console.log("   \u{1F4C4} js/index.mjs");
    console.log("   \u{1F4C4} types/index.d.ts");
    console.log("   \u{1F4C4} json/tokens.json");
    console.log("   \u{1F4C4} css/all.css (bundle)");
    console.log("   \u{1F4C4} tailwind/v4.css (bundle)");
    console.log("\n\u2705 Dry run complete.");
    return;
  }
  const statuses = [
    { label: "css/variables.css", status: writeOutputFile(outputDir, "css/variables.css", variablesCss) },
    { label: "css/themes/light.css", status: writeOutputFile(outputDir, "css/themes/light.css", themeLight) },
    { label: "css/themes/dark.css", status: writeOutputFile(outputDir, "css/themes/dark.css", themeDark) },
    { label: "tailwind/v3-preset.js", status: writeOutputFile(outputDir, "tailwind/v3-preset.js", v3Preset) },
    { label: "tailwind/v4-theme.css", status: writeOutputFile(outputDir, "tailwind/v4-theme.css", v4Theme) },
    { label: "js/index.js", status: writeOutputFile(outputDir, "js/index.js", jsTokens.cjs) },
    { label: "js/index.mjs", status: writeOutputFile(outputDir, "js/index.mjs", jsTokens.esm) },
    { label: "types/index.d.ts", status: writeOutputFile(outputDir, "types/index.d.ts", typeDefs) },
    { label: "json/tokens.json", status: writeOutputFile(outputDir, "json/tokens.json", normalizedJson) },
    { label: "css/all.css (bundle)", status: writeOutputFile(outputDir, "css/all.css", cssBundle) },
    { label: "tailwind/v4.css (bundle)", status: writeOutputFile(outputDir, "tailwind/v4.css", v4Bundle) }
  ];
  if (deprecatedCss) {
    const depStatus = writeOutputFile(outputDir, "css/deprecated.css", deprecatedCss);
    statuses.push({ label: "css/deprecated.css (backwards compat)", status: depStatus });
  }
  printTokenWarnings(tokenWarnings);
  const newCount = statuses.filter((s) => s.status === "new").length;
  const updatedCount = statuses.filter((s) => s.status === "updated").length;
  const unchangedCount = statuses.filter((s) => s.status === "unchanged").length;
  console.log("");
  console.log(`\u2705 sync-tokens complete: ${newCount} new, ${updatedCount} updated, ${unchangedCount} unchanged`);
  for (const { label, status } of statuses) {
    const fullLabel = path2.relative(".", path2.join(outputDir, label.replace(/ \(.*\)/, "")));
    const suffix = label.includes("(bundle)") ? " (bundle)" : label.includes("(backwards compat)") ? " (backwards compat)" : "";
    console.log(`   \u{1F4C4} ${fullLabel}${suffix} ${formatStatusBadge(status)}`);
  }
}
cliMain().catch((err) => {
  console.error("\u274C sync-tokens failed:", err.message);
  process.exit(1);
});
