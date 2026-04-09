#!/usr/bin/env node
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
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

// node_modules/sisteransi/src/index.js
var require_src = __commonJS({
  "node_modules/sisteransi/src/index.js"(exports2, module2) {
    "use strict";
    var ESC2 = "\x1B";
    var CSI2 = `${ESC2}[`;
    var beep = "\x07";
    var cursor = {
      to(x, y2) {
        if (!y2) return `${CSI2}${x + 1}G`;
        return `${CSI2}${y2 + 1};${x + 1}H`;
      },
      move(x, y2) {
        let ret = "";
        if (x < 0) ret += `${CSI2}${-x}D`;
        else if (x > 0) ret += `${CSI2}${x}C`;
        if (y2 < 0) ret += `${CSI2}${-y2}A`;
        else if (y2 > 0) ret += `${CSI2}${y2}B`;
        return ret;
      },
      up: (count = 1) => `${CSI2}${count}A`,
      down: (count = 1) => `${CSI2}${count}B`,
      forward: (count = 1) => `${CSI2}${count}C`,
      backward: (count = 1) => `${CSI2}${count}D`,
      nextLine: (count = 1) => `${CSI2}E`.repeat(count),
      prevLine: (count = 1) => `${CSI2}F`.repeat(count),
      left: `${CSI2}G`,
      hide: `${CSI2}?25l`,
      show: `${CSI2}?25h`,
      save: `${ESC2}7`,
      restore: `${ESC2}8`
    };
    var scroll = {
      up: (count = 1) => `${CSI2}S`.repeat(count),
      down: (count = 1) => `${CSI2}T`.repeat(count)
    };
    var erase = {
      screen: `${CSI2}2J`,
      up: (count = 1) => `${CSI2}1J`.repeat(count),
      down: (count = 1) => `${CSI2}J`.repeat(count),
      line: `${CSI2}2K`,
      lineEnd: `${CSI2}K`,
      lineStart: `${CSI2}1K`,
      lines(count) {
        let clear = "";
        for (let i = 0; i < count; i++)
          clear += this.line + (i < count - 1 ? cursor.up() : "");
        if (count)
          clear += cursor.left;
        return clear;
      }
    };
    module2.exports = { cursor, scroll, erase, beep };
  }
});

// node_modules/picocolors/picocolors.js
var require_picocolors = __commonJS({
  "node_modules/picocolors/picocolors.js"(exports2, module2) {
    var p2 = process || {};
    var argv = p2.argv || [];
    var env = p2.env || {};
    var isColorSupported = !(!!env.NO_COLOR || argv.includes("--no-color")) && (!!env.FORCE_COLOR || argv.includes("--color") || p2.platform === "win32" || (p2.stdout || {}).isTTY && env.TERM !== "dumb" || !!env.CI);
    var formatter = (open, close, replace = open) => (input) => {
      let string = "" + input, index = string.indexOf(close, open.length);
      return ~index ? open + replaceClose(string, close, replace, index) + close : open + string + close;
    };
    var replaceClose = (string, close, replace, index) => {
      let result = "", cursor = 0;
      do {
        result += string.substring(cursor, index) + replace;
        cursor = index + close.length;
        index = string.indexOf(close, cursor);
      } while (~index);
      return result + string.substring(cursor);
    };
    var createColors = (enabled = isColorSupported) => {
      let f = enabled ? formatter : () => String;
      return {
        isColorSupported: enabled,
        reset: f("\x1B[0m", "\x1B[0m"),
        bold: f("\x1B[1m", "\x1B[22m", "\x1B[22m\x1B[1m"),
        dim: f("\x1B[2m", "\x1B[22m", "\x1B[22m\x1B[2m"),
        italic: f("\x1B[3m", "\x1B[23m"),
        underline: f("\x1B[4m", "\x1B[24m"),
        inverse: f("\x1B[7m", "\x1B[27m"),
        hidden: f("\x1B[8m", "\x1B[28m"),
        strikethrough: f("\x1B[9m", "\x1B[29m"),
        black: f("\x1B[30m", "\x1B[39m"),
        red: f("\x1B[31m", "\x1B[39m"),
        green: f("\x1B[32m", "\x1B[39m"),
        yellow: f("\x1B[33m", "\x1B[39m"),
        blue: f("\x1B[34m", "\x1B[39m"),
        magenta: f("\x1B[35m", "\x1B[39m"),
        cyan: f("\x1B[36m", "\x1B[39m"),
        white: f("\x1B[37m", "\x1B[39m"),
        gray: f("\x1B[90m", "\x1B[39m"),
        bgBlack: f("\x1B[40m", "\x1B[49m"),
        bgRed: f("\x1B[41m", "\x1B[49m"),
        bgGreen: f("\x1B[42m", "\x1B[49m"),
        bgYellow: f("\x1B[43m", "\x1B[49m"),
        bgBlue: f("\x1B[44m", "\x1B[49m"),
        bgMagenta: f("\x1B[45m", "\x1B[49m"),
        bgCyan: f("\x1B[46m", "\x1B[49m"),
        bgWhite: f("\x1B[47m", "\x1B[49m"),
        blackBright: f("\x1B[90m", "\x1B[39m"),
        redBright: f("\x1B[91m", "\x1B[39m"),
        greenBright: f("\x1B[92m", "\x1B[39m"),
        yellowBright: f("\x1B[93m", "\x1B[39m"),
        blueBright: f("\x1B[94m", "\x1B[39m"),
        magentaBright: f("\x1B[95m", "\x1B[39m"),
        cyanBright: f("\x1B[96m", "\x1B[39m"),
        whiteBright: f("\x1B[97m", "\x1B[39m"),
        bgBlackBright: f("\x1B[100m", "\x1B[49m"),
        bgRedBright: f("\x1B[101m", "\x1B[49m"),
        bgGreenBright: f("\x1B[102m", "\x1B[49m"),
        bgYellowBright: f("\x1B[103m", "\x1B[49m"),
        bgBlueBright: f("\x1B[104m", "\x1B[49m"),
        bgMagentaBright: f("\x1B[105m", "\x1B[49m"),
        bgCyanBright: f("\x1B[106m", "\x1B[49m"),
        bgWhiteBright: f("\x1B[107m", "\x1B[49m")
      };
    };
    module2.exports = createColors();
    module2.exports.createColors = createColors;
  }
});

// cli/src/commands/init.ts
var import_node_fs4 = __toESM(require("node:fs"));
var import_node_path4 = __toESM(require("node:path"));

// node_modules/@clack/core/dist/index.mjs
var import_node_util = require("node:util");
var import_node_process = require("node:process");
var _ = __toESM(require("node:readline"), 1);
var import_node_readline = __toESM(require("node:readline"), 1);

// node_modules/fast-string-truncated-width/dist/utils.js
var isAmbiguous = (x) => {
  return x === 161 || x === 164 || x === 167 || x === 168 || x === 170 || x === 173 || x === 174 || x >= 176 && x <= 180 || x >= 182 && x <= 186 || x >= 188 && x <= 191 || x === 198 || x === 208 || x === 215 || x === 216 || x >= 222 && x <= 225 || x === 230 || x >= 232 && x <= 234 || x === 236 || x === 237 || x === 240 || x === 242 || x === 243 || x >= 247 && x <= 250 || x === 252 || x === 254 || x === 257 || x === 273 || x === 275 || x === 283 || x === 294 || x === 295 || x === 299 || x >= 305 && x <= 307 || x === 312 || x >= 319 && x <= 322 || x === 324 || x >= 328 && x <= 331 || x === 333 || x === 338 || x === 339 || x === 358 || x === 359 || x === 363 || x === 462 || x === 464 || x === 466 || x === 468 || x === 470 || x === 472 || x === 474 || x === 476 || x === 593 || x === 609 || x === 708 || x === 711 || x >= 713 && x <= 715 || x === 717 || x === 720 || x >= 728 && x <= 731 || x === 733 || x === 735 || x >= 768 && x <= 879 || x >= 913 && x <= 929 || x >= 931 && x <= 937 || x >= 945 && x <= 961 || x >= 963 && x <= 969 || x === 1025 || x >= 1040 && x <= 1103 || x === 1105 || x === 8208 || x >= 8211 && x <= 8214 || x === 8216 || x === 8217 || x === 8220 || x === 8221 || x >= 8224 && x <= 8226 || x >= 8228 && x <= 8231 || x === 8240 || x === 8242 || x === 8243 || x === 8245 || x === 8251 || x === 8254 || x === 8308 || x === 8319 || x >= 8321 && x <= 8324 || x === 8364 || x === 8451 || x === 8453 || x === 8457 || x === 8467 || x === 8470 || x === 8481 || x === 8482 || x === 8486 || x === 8491 || x === 8531 || x === 8532 || x >= 8539 && x <= 8542 || x >= 8544 && x <= 8555 || x >= 8560 && x <= 8569 || x === 8585 || x >= 8592 && x <= 8601 || x === 8632 || x === 8633 || x === 8658 || x === 8660 || x === 8679 || x === 8704 || x === 8706 || x === 8707 || x === 8711 || x === 8712 || x === 8715 || x === 8719 || x === 8721 || x === 8725 || x === 8730 || x >= 8733 && x <= 8736 || x === 8739 || x === 8741 || x >= 8743 && x <= 8748 || x === 8750 || x >= 8756 && x <= 8759 || x === 8764 || x === 8765 || x === 8776 || x === 8780 || x === 8786 || x === 8800 || x === 8801 || x >= 8804 && x <= 8807 || x === 8810 || x === 8811 || x === 8814 || x === 8815 || x === 8834 || x === 8835 || x === 8838 || x === 8839 || x === 8853 || x === 8857 || x === 8869 || x === 8895 || x === 8978 || x >= 9312 && x <= 9449 || x >= 9451 && x <= 9547 || x >= 9552 && x <= 9587 || x >= 9600 && x <= 9615 || x >= 9618 && x <= 9621 || x === 9632 || x === 9633 || x >= 9635 && x <= 9641 || x === 9650 || x === 9651 || x === 9654 || x === 9655 || x === 9660 || x === 9661 || x === 9664 || x === 9665 || x >= 9670 && x <= 9672 || x === 9675 || x >= 9678 && x <= 9681 || x >= 9698 && x <= 9701 || x === 9711 || x === 9733 || x === 9734 || x === 9737 || x === 9742 || x === 9743 || x === 9756 || x === 9758 || x === 9792 || x === 9794 || x === 9824 || x === 9825 || x >= 9827 && x <= 9829 || x >= 9831 && x <= 9834 || x === 9836 || x === 9837 || x === 9839 || x === 9886 || x === 9887 || x === 9919 || x >= 9926 && x <= 9933 || x >= 9935 && x <= 9939 || x >= 9941 && x <= 9953 || x === 9955 || x === 9960 || x === 9961 || x >= 9963 && x <= 9969 || x === 9972 || x >= 9974 && x <= 9977 || x === 9979 || x === 9980 || x === 9982 || x === 9983 || x === 10045 || x >= 10102 && x <= 10111 || x >= 11094 && x <= 11097 || x >= 12872 && x <= 12879 || x >= 57344 && x <= 63743 || x >= 65024 && x <= 65039 || x === 65533 || x >= 127232 && x <= 127242 || x >= 127248 && x <= 127277 || x >= 127280 && x <= 127337 || x >= 127344 && x <= 127373 || x === 127375 || x === 127376 || x >= 127387 && x <= 127404 || x >= 917760 && x <= 917999 || x >= 983040 && x <= 1048573 || x >= 1048576 && x <= 1114109;
};
var isFullWidth = (x) => {
  return x === 12288 || x >= 65281 && x <= 65376 || x >= 65504 && x <= 65510;
};
var isWide = (x) => {
  return x >= 4352 && x <= 4447 || x === 8986 || x === 8987 || x === 9001 || x === 9002 || x >= 9193 && x <= 9196 || x === 9200 || x === 9203 || x === 9725 || x === 9726 || x === 9748 || x === 9749 || x >= 9800 && x <= 9811 || x === 9855 || x === 9875 || x === 9889 || x === 9898 || x === 9899 || x === 9917 || x === 9918 || x === 9924 || x === 9925 || x === 9934 || x === 9940 || x === 9962 || x === 9970 || x === 9971 || x === 9973 || x === 9978 || x === 9981 || x === 9989 || x === 9994 || x === 9995 || x === 10024 || x === 10060 || x === 10062 || x >= 10067 && x <= 10069 || x === 10071 || x >= 10133 && x <= 10135 || x === 10160 || x === 10175 || x === 11035 || x === 11036 || x === 11088 || x === 11093 || x >= 11904 && x <= 11929 || x >= 11931 && x <= 12019 || x >= 12032 && x <= 12245 || x >= 12272 && x <= 12287 || x >= 12289 && x <= 12350 || x >= 12353 && x <= 12438 || x >= 12441 && x <= 12543 || x >= 12549 && x <= 12591 || x >= 12593 && x <= 12686 || x >= 12688 && x <= 12771 || x >= 12783 && x <= 12830 || x >= 12832 && x <= 12871 || x >= 12880 && x <= 19903 || x >= 19968 && x <= 42124 || x >= 42128 && x <= 42182 || x >= 43360 && x <= 43388 || x >= 44032 && x <= 55203 || x >= 63744 && x <= 64255 || x >= 65040 && x <= 65049 || x >= 65072 && x <= 65106 || x >= 65108 && x <= 65126 || x >= 65128 && x <= 65131 || x >= 94176 && x <= 94180 || x === 94192 || x === 94193 || x >= 94208 && x <= 100343 || x >= 100352 && x <= 101589 || x >= 101632 && x <= 101640 || x >= 110576 && x <= 110579 || x >= 110581 && x <= 110587 || x === 110589 || x === 110590 || x >= 110592 && x <= 110882 || x === 110898 || x >= 110928 && x <= 110930 || x === 110933 || x >= 110948 && x <= 110951 || x >= 110960 && x <= 111355 || x === 126980 || x === 127183 || x === 127374 || x >= 127377 && x <= 127386 || x >= 127488 && x <= 127490 || x >= 127504 && x <= 127547 || x >= 127552 && x <= 127560 || x === 127568 || x === 127569 || x >= 127584 && x <= 127589 || x >= 127744 && x <= 127776 || x >= 127789 && x <= 127797 || x >= 127799 && x <= 127868 || x >= 127870 && x <= 127891 || x >= 127904 && x <= 127946 || x >= 127951 && x <= 127955 || x >= 127968 && x <= 127984 || x === 127988 || x >= 127992 && x <= 128062 || x === 128064 || x >= 128066 && x <= 128252 || x >= 128255 && x <= 128317 || x >= 128331 && x <= 128334 || x >= 128336 && x <= 128359 || x === 128378 || x === 128405 || x === 128406 || x === 128420 || x >= 128507 && x <= 128591 || x >= 128640 && x <= 128709 || x === 128716 || x >= 128720 && x <= 128722 || x >= 128725 && x <= 128727 || x >= 128732 && x <= 128735 || x === 128747 || x === 128748 || x >= 128756 && x <= 128764 || x >= 128992 && x <= 129003 || x === 129008 || x >= 129292 && x <= 129338 || x >= 129340 && x <= 129349 || x >= 129351 && x <= 129535 || x >= 129648 && x <= 129660 || x >= 129664 && x <= 129672 || x >= 129680 && x <= 129725 || x >= 129727 && x <= 129733 || x >= 129742 && x <= 129755 || x >= 129760 && x <= 129768 || x >= 129776 && x <= 129784 || x >= 131072 && x <= 196605 || x >= 196608 && x <= 262141;
};

// node_modules/fast-string-truncated-width/dist/index.js
var ANSI_RE = /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/y;
var CONTROL_RE = /[\x00-\x08\x0A-\x1F\x7F-\x9F]{1,1000}/y;
var TAB_RE = /\t{1,1000}/y;
var EMOJI_RE = new RegExp("[\\u{1F1E6}-\\u{1F1FF}]{2}|\\u{1F3F4}[\\u{E0061}-\\u{E007A}]{2}[\\u{E0030}-\\u{E0039}\\u{E0061}-\\u{E007A}]{1,3}\\u{E007F}|(?:\\p{Emoji}\\uFE0F\\u20E3?|\\p{Emoji_Modifier_Base}\\p{Emoji_Modifier}?|\\p{Emoji_Presentation})(?:\\u200D(?:\\p{Emoji_Modifier_Base}\\p{Emoji_Modifier}?|\\p{Emoji_Presentation}|\\p{Emoji}\\uFE0F\\u20E3?))*", "yu");
var LATIN_RE = /(?:[\x20-\x7E\xA0-\xFF](?!\uFE0F)){1,1000}/y;
var MODIFIER_RE = new RegExp("\\p{M}+", "gu");
var NO_TRUNCATION = { limit: Infinity, ellipsis: "" };
var getStringTruncatedWidth = (input, truncationOptions = {}, widthOptions = {}) => {
  const LIMIT = truncationOptions.limit ?? Infinity;
  const ELLIPSIS = truncationOptions.ellipsis ?? "";
  const ELLIPSIS_WIDTH = truncationOptions?.ellipsisWidth ?? (ELLIPSIS ? getStringTruncatedWidth(ELLIPSIS, NO_TRUNCATION, widthOptions).width : 0);
  const ANSI_WIDTH = widthOptions.ansiWidth ?? 0;
  const CONTROL_WIDTH = widthOptions.controlWidth ?? 0;
  const TAB_WIDTH = widthOptions.tabWidth ?? 8;
  const AMBIGUOUS_WIDTH = widthOptions.ambiguousWidth ?? 1;
  const EMOJI_WIDTH = widthOptions.emojiWidth ?? 2;
  const FULL_WIDTH_WIDTH = widthOptions.fullWidthWidth ?? 2;
  const REGULAR_WIDTH = widthOptions.regularWidth ?? 1;
  const WIDE_WIDTH = widthOptions.wideWidth ?? 2;
  let indexPrev = 0;
  let index = 0;
  let length = input.length;
  let lengthExtra = 0;
  let truncationEnabled = false;
  let truncationIndex = length;
  let truncationLimit = Math.max(0, LIMIT - ELLIPSIS_WIDTH);
  let unmatchedStart = 0;
  let unmatchedEnd = 0;
  let width = 0;
  let widthExtra = 0;
  outer: while (true) {
    if (unmatchedEnd > unmatchedStart || index >= length && index > indexPrev) {
      const unmatched = input.slice(unmatchedStart, unmatchedEnd) || input.slice(indexPrev, index);
      lengthExtra = 0;
      for (const char of unmatched.replaceAll(MODIFIER_RE, "")) {
        const codePoint = char.codePointAt(0) || 0;
        if (isFullWidth(codePoint)) {
          widthExtra = FULL_WIDTH_WIDTH;
        } else if (isWide(codePoint)) {
          widthExtra = WIDE_WIDTH;
        } else if (AMBIGUOUS_WIDTH !== REGULAR_WIDTH && isAmbiguous(codePoint)) {
          widthExtra = AMBIGUOUS_WIDTH;
        } else {
          widthExtra = REGULAR_WIDTH;
        }
        if (width + widthExtra > truncationLimit) {
          truncationIndex = Math.min(truncationIndex, Math.max(unmatchedStart, indexPrev) + lengthExtra);
        }
        if (width + widthExtra > LIMIT) {
          truncationEnabled = true;
          break outer;
        }
        lengthExtra += char.length;
        width += widthExtra;
      }
      unmatchedStart = unmatchedEnd = 0;
    }
    if (index >= length)
      break;
    LATIN_RE.lastIndex = index;
    if (LATIN_RE.test(input)) {
      lengthExtra = LATIN_RE.lastIndex - index;
      widthExtra = lengthExtra * REGULAR_WIDTH;
      if (width + widthExtra > truncationLimit) {
        truncationIndex = Math.min(truncationIndex, index + Math.floor((truncationLimit - width) / REGULAR_WIDTH));
      }
      if (width + widthExtra > LIMIT) {
        truncationEnabled = true;
        break;
      }
      width += widthExtra;
      unmatchedStart = indexPrev;
      unmatchedEnd = index;
      index = indexPrev = LATIN_RE.lastIndex;
      continue;
    }
    ANSI_RE.lastIndex = index;
    if (ANSI_RE.test(input)) {
      if (width + ANSI_WIDTH > truncationLimit) {
        truncationIndex = Math.min(truncationIndex, index);
      }
      if (width + ANSI_WIDTH > LIMIT) {
        truncationEnabled = true;
        break;
      }
      width += ANSI_WIDTH;
      unmatchedStart = indexPrev;
      unmatchedEnd = index;
      index = indexPrev = ANSI_RE.lastIndex;
      continue;
    }
    CONTROL_RE.lastIndex = index;
    if (CONTROL_RE.test(input)) {
      lengthExtra = CONTROL_RE.lastIndex - index;
      widthExtra = lengthExtra * CONTROL_WIDTH;
      if (width + widthExtra > truncationLimit) {
        truncationIndex = Math.min(truncationIndex, index + Math.floor((truncationLimit - width) / CONTROL_WIDTH));
      }
      if (width + widthExtra > LIMIT) {
        truncationEnabled = true;
        break;
      }
      width += widthExtra;
      unmatchedStart = indexPrev;
      unmatchedEnd = index;
      index = indexPrev = CONTROL_RE.lastIndex;
      continue;
    }
    TAB_RE.lastIndex = index;
    if (TAB_RE.test(input)) {
      lengthExtra = TAB_RE.lastIndex - index;
      widthExtra = lengthExtra * TAB_WIDTH;
      if (width + widthExtra > truncationLimit) {
        truncationIndex = Math.min(truncationIndex, index + Math.floor((truncationLimit - width) / TAB_WIDTH));
      }
      if (width + widthExtra > LIMIT) {
        truncationEnabled = true;
        break;
      }
      width += widthExtra;
      unmatchedStart = indexPrev;
      unmatchedEnd = index;
      index = indexPrev = TAB_RE.lastIndex;
      continue;
    }
    EMOJI_RE.lastIndex = index;
    if (EMOJI_RE.test(input)) {
      if (width + EMOJI_WIDTH > truncationLimit) {
        truncationIndex = Math.min(truncationIndex, index);
      }
      if (width + EMOJI_WIDTH > LIMIT) {
        truncationEnabled = true;
        break;
      }
      width += EMOJI_WIDTH;
      unmatchedStart = indexPrev;
      unmatchedEnd = index;
      index = indexPrev = EMOJI_RE.lastIndex;
      continue;
    }
    index += 1;
  }
  return {
    width: truncationEnabled ? truncationLimit : width,
    index: truncationEnabled ? truncationIndex : length,
    truncated: truncationEnabled,
    ellipsed: truncationEnabled && LIMIT >= ELLIPSIS_WIDTH
  };
};
var dist_default = getStringTruncatedWidth;

// node_modules/fast-string-width/dist/index.js
var NO_TRUNCATION2 = {
  limit: Infinity,
  ellipsis: "",
  ellipsisWidth: 0
};
var fastStringWidth = (input, options = {}) => {
  return dist_default(input, NO_TRUNCATION2, options).width;
};
var dist_default2 = fastStringWidth;

// node_modules/fast-wrap-ansi/lib/main.js
var ESC = "\x1B";
var CSI = "\x9B";
var END_CODE = 39;
var ANSI_ESCAPE_BELL = "\x07";
var ANSI_CSI = "[";
var ANSI_OSC = "]";
var ANSI_SGR_TERMINATOR = "m";
var ANSI_ESCAPE_LINK = `${ANSI_OSC}8;;`;
var GROUP_REGEX = new RegExp(`(?:\\${ANSI_CSI}(?<code>\\d+)m|\\${ANSI_ESCAPE_LINK}(?<uri>.*)${ANSI_ESCAPE_BELL})`, "y");
var getClosingCode = (openingCode) => {
  if (openingCode >= 30 && openingCode <= 37)
    return 39;
  if (openingCode >= 90 && openingCode <= 97)
    return 39;
  if (openingCode >= 40 && openingCode <= 47)
    return 49;
  if (openingCode >= 100 && openingCode <= 107)
    return 49;
  if (openingCode === 1 || openingCode === 2)
    return 22;
  if (openingCode === 3)
    return 23;
  if (openingCode === 4)
    return 24;
  if (openingCode === 7)
    return 27;
  if (openingCode === 8)
    return 28;
  if (openingCode === 9)
    return 29;
  if (openingCode === 0)
    return 0;
  return void 0;
};
var wrapAnsiCode = (code) => `${ESC}${ANSI_CSI}${code}${ANSI_SGR_TERMINATOR}`;
var wrapAnsiHyperlink = (url) => `${ESC}${ANSI_ESCAPE_LINK}${url}${ANSI_ESCAPE_BELL}`;
var wrapWord = (rows, word, columns) => {
  const characters = word[Symbol.iterator]();
  let isInsideEscape = false;
  let isInsideLinkEscape = false;
  let lastRow = rows.at(-1);
  let visible = lastRow === void 0 ? 0 : dist_default2(lastRow);
  let currentCharacter = characters.next();
  let nextCharacter = characters.next();
  let rawCharacterIndex = 0;
  while (!currentCharacter.done) {
    const character = currentCharacter.value;
    const characterLength = dist_default2(character);
    if (visible + characterLength <= columns) {
      rows[rows.length - 1] += character;
    } else {
      rows.push(character);
      visible = 0;
    }
    if (character === ESC || character === CSI) {
      isInsideEscape = true;
      isInsideLinkEscape = word.startsWith(ANSI_ESCAPE_LINK, rawCharacterIndex + 1);
    }
    if (isInsideEscape) {
      if (isInsideLinkEscape) {
        if (character === ANSI_ESCAPE_BELL) {
          isInsideEscape = false;
          isInsideLinkEscape = false;
        }
      } else if (character === ANSI_SGR_TERMINATOR) {
        isInsideEscape = false;
      }
    } else {
      visible += characterLength;
      if (visible === columns && !nextCharacter.done) {
        rows.push("");
        visible = 0;
      }
    }
    currentCharacter = nextCharacter;
    nextCharacter = characters.next();
    rawCharacterIndex += character.length;
  }
  lastRow = rows.at(-1);
  if (!visible && lastRow !== void 0 && lastRow.length && rows.length > 1) {
    rows[rows.length - 2] += rows.pop();
  }
};
var stringVisibleTrimSpacesRight = (string) => {
  const words = string.split(" ");
  let last = words.length;
  while (last) {
    if (dist_default2(words[last - 1])) {
      break;
    }
    last--;
  }
  if (last === words.length) {
    return string;
  }
  return words.slice(0, last).join(" ") + words.slice(last).join("");
};
var exec = (string, columns, options = {}) => {
  if (options.trim !== false && string.trim() === "") {
    return "";
  }
  let returnValue = "";
  let escapeCode;
  let escapeUrl;
  const words = string.split(" ");
  let rows = [""];
  let rowLength = 0;
  for (let index = 0; index < words.length; index++) {
    const word = words[index];
    if (options.trim !== false) {
      const row = rows.at(-1) ?? "";
      const trimmed = row.trimStart();
      if (row.length !== trimmed.length) {
        rows[rows.length - 1] = trimmed;
        rowLength = dist_default2(trimmed);
      }
    }
    if (index !== 0) {
      if (rowLength >= columns && (options.wordWrap === false || options.trim === false)) {
        rows.push("");
        rowLength = 0;
      }
      if (rowLength || options.trim === false) {
        rows[rows.length - 1] += " ";
        rowLength++;
      }
    }
    const wordLength = dist_default2(word);
    if (options.hard && wordLength > columns) {
      const remainingColumns = columns - rowLength;
      const breaksStartingThisLine = 1 + Math.floor((wordLength - remainingColumns - 1) / columns);
      const breaksStartingNextLine = Math.floor((wordLength - 1) / columns);
      if (breaksStartingNextLine < breaksStartingThisLine) {
        rows.push("");
      }
      wrapWord(rows, word, columns);
      rowLength = dist_default2(rows.at(-1) ?? "");
      continue;
    }
    if (rowLength + wordLength > columns && rowLength && wordLength) {
      if (options.wordWrap === false && rowLength < columns) {
        wrapWord(rows, word, columns);
        rowLength = dist_default2(rows.at(-1) ?? "");
        continue;
      }
      rows.push("");
      rowLength = 0;
    }
    if (rowLength + wordLength > columns && options.wordWrap === false) {
      wrapWord(rows, word, columns);
      rowLength = dist_default2(rows.at(-1) ?? "");
      continue;
    }
    rows[rows.length - 1] += word;
    rowLength += wordLength;
  }
  if (options.trim !== false) {
    rows = rows.map((row) => stringVisibleTrimSpacesRight(row));
  }
  const preString = rows.join("\n");
  let inSurrogate = false;
  for (let i = 0; i < preString.length; i++) {
    const character = preString[i];
    returnValue += character;
    if (!inSurrogate) {
      inSurrogate = character >= "\uD800" && character <= "\uDBFF";
    } else {
      continue;
    }
    if (character === ESC || character === CSI) {
      GROUP_REGEX.lastIndex = i + 1;
      const groupsResult = GROUP_REGEX.exec(preString);
      const groups = groupsResult?.groups;
      if (groups?.code !== void 0) {
        const code = Number.parseFloat(groups.code);
        escapeCode = code === END_CODE ? void 0 : code;
      } else if (groups?.uri !== void 0) {
        escapeUrl = groups.uri.length === 0 ? void 0 : groups.uri;
      }
    }
    if (preString[i + 1] === "\n") {
      if (escapeUrl) {
        returnValue += wrapAnsiHyperlink("");
      }
      const closingCode = escapeCode ? getClosingCode(escapeCode) : void 0;
      if (escapeCode && closingCode) {
        returnValue += wrapAnsiCode(closingCode);
      }
    } else if (character === "\n") {
      if (escapeCode && getClosingCode(escapeCode)) {
        returnValue += wrapAnsiCode(escapeCode);
      }
      if (escapeUrl) {
        returnValue += wrapAnsiHyperlink(escapeUrl);
      }
    }
  }
  return returnValue;
};
var CRLF_OR_LF = /\r?\n/;
function wrapAnsi(string, columns, options) {
  return String(string).normalize().split(CRLF_OR_LF).map((line) => exec(line, columns, options)).join("\n");
}

// node_modules/@clack/core/dist/index.mjs
var import_sisteransi = __toESM(require_src(), 1);
var import_node_tty = require("node:tty");
function d(r, t2, e) {
  if (!e.some((o) => !o.disabled)) return r;
  const s = r + t2, i = Math.max(e.length - 1, 0), n = s < 0 ? i : s > i ? 0 : s;
  return e[n].disabled ? d(n, t2 < 0 ? -1 : 1, e) : n;
}
var E = ["up", "down", "left", "right", "space", "enter", "cancel"];
var G = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var u = { actions: new Set(E), aliases: /* @__PURE__ */ new Map([["k", "up"], ["j", "down"], ["h", "left"], ["l", "right"], ["", "cancel"], ["escape", "cancel"]]), messages: { cancel: "Canceled", error: "Something went wrong" }, withGuide: true, date: { monthNames: [...G], messages: { required: "Please enter a valid date", invalidMonth: "There are only 12 months in a year", invalidDay: (r, t2) => `There are only ${r} days in ${t2}`, afterMin: (r) => `Date must be on or after ${r.toISOString().slice(0, 10)}`, beforeMax: (r) => `Date must be on or before ${r.toISOString().slice(0, 10)}` } } };
function V(r, t2) {
  if (typeof r == "string") return u.aliases.get(r) === t2;
  for (const e of r) if (e !== void 0 && V(e, t2)) return true;
  return false;
}
function j(r, t2) {
  if (r === t2) return;
  const e = r.split(`
`), s = t2.split(`
`), i = Math.max(e.length, s.length), n = [];
  for (let o = 0; o < i; o++) e[o] !== s[o] && n.push(o);
  return { lines: n, numLinesBefore: e.length, numLinesAfter: s.length, numLines: i };
}
var Y = globalThis.process.platform.startsWith("win");
var C = /* @__PURE__ */ Symbol("clack:cancel");
function q(r) {
  return r === C;
}
function w(r, t2) {
  const e = r;
  e.isTTY && e.setRawMode(t2);
}
function z({ input: r = import_node_process.stdin, output: t2 = import_node_process.stdout, overwrite: e = true, hideCursor: s = true } = {}) {
  const i = _.createInterface({ input: r, output: t2, prompt: "", tabSize: 1 });
  _.emitKeypressEvents(r, i), r instanceof import_node_tty.ReadStream && r.isTTY && r.setRawMode(true);
  const n = (o, { name: a, sequence: h }) => {
    const l = String(o);
    if (V([l, a, h], "cancel")) {
      s && t2.write(import_sisteransi.cursor.show), process.exit(0);
      return;
    }
    if (!e) return;
    const f = a === "return" ? 0 : -1, v = a === "return" ? -1 : 0;
    _.moveCursor(t2, f, v, () => {
      _.clearLine(t2, 1, () => {
        r.once("keypress", n);
      });
    });
  };
  return s && t2.write(import_sisteransi.cursor.hide), r.once("keypress", n), () => {
    r.off("keypress", n), s && t2.write(import_sisteransi.cursor.show), r instanceof import_node_tty.ReadStream && r.isTTY && !Y && r.setRawMode(false), i.terminal = false, i.close();
  };
}
var O = (r) => "columns" in r && typeof r.columns == "number" ? r.columns : 80;
var A = (r) => "rows" in r && typeof r.rows == "number" ? r.rows : 20;
function R(r, t2, e, s = e) {
  const i = O(r ?? import_node_process.stdout);
  return wrapAnsi(t2, i - e.length, { hard: true, trim: false }).split(`
`).map((n, o) => `${o === 0 ? s : e}${n}`).join(`
`);
}
var p = class {
  input;
  output;
  _abortSignal;
  rl;
  opts;
  _render;
  _track = false;
  _prevFrame = "";
  _subscribers = /* @__PURE__ */ new Map();
  _cursor = 0;
  state = "initial";
  error = "";
  value;
  userInput = "";
  constructor(t2, e = true) {
    const { input: s = import_node_process.stdin, output: i = import_node_process.stdout, render: n, signal: o, ...a } = t2;
    this.opts = a, this.onKeypress = this.onKeypress.bind(this), this.close = this.close.bind(this), this.render = this.render.bind(this), this._render = n.bind(this), this._track = e, this._abortSignal = o, this.input = s, this.output = i;
  }
  unsubscribe() {
    this._subscribers.clear();
  }
  setSubscriber(t2, e) {
    const s = this._subscribers.get(t2) ?? [];
    s.push(e), this._subscribers.set(t2, s);
  }
  on(t2, e) {
    this.setSubscriber(t2, { cb: e });
  }
  once(t2, e) {
    this.setSubscriber(t2, { cb: e, once: true });
  }
  emit(t2, ...e) {
    const s = this._subscribers.get(t2) ?? [], i = [];
    for (const n of s) n.cb(...e), n.once && i.push(() => s.splice(s.indexOf(n), 1));
    for (const n of i) n();
  }
  prompt() {
    return new Promise((t2) => {
      if (this._abortSignal) {
        if (this._abortSignal.aborted) return this.state = "cancel", this.close(), t2(C);
        this._abortSignal.addEventListener("abort", () => {
          this.state = "cancel", this.close();
        }, { once: true });
      }
      this.rl = import_node_readline.default.createInterface({ input: this.input, tabSize: 2, prompt: "", escapeCodeTimeout: 50, terminal: true }), this.rl.prompt(), this.opts.initialUserInput !== void 0 && this._setUserInput(this.opts.initialUserInput, true), this.input.on("keypress", this.onKeypress), w(this.input, true), this.output.on("resize", this.render), this.render(), this.once("submit", () => {
        this.output.write(import_sisteransi.cursor.show), this.output.off("resize", this.render), w(this.input, false), t2(this.value);
      }), this.once("cancel", () => {
        this.output.write(import_sisteransi.cursor.show), this.output.off("resize", this.render), w(this.input, false), t2(C);
      });
    });
  }
  _isActionKey(t2, e) {
    return t2 === "	";
  }
  _setValue(t2) {
    this.value = t2, this.emit("value", this.value);
  }
  _setUserInput(t2, e) {
    this.userInput = t2 ?? "", this.emit("userInput", this.userInput), e && this._track && this.rl && (this.rl.write(this.userInput), this._cursor = this.rl.cursor);
  }
  _clearUserInput() {
    this.rl?.write(null, { ctrl: true, name: "u" }), this._setUserInput("");
  }
  onKeypress(t2, e) {
    if (this._track && e.name !== "return" && (e.name && this._isActionKey(t2, e) && this.rl?.write(null, { ctrl: true, name: "h" }), this._cursor = this.rl?.cursor ?? 0, this._setUserInput(this.rl?.line)), this.state === "error" && (this.state = "active"), e?.name && (!this._track && u.aliases.has(e.name) && this.emit("cursor", u.aliases.get(e.name)), u.actions.has(e.name) && this.emit("cursor", e.name)), t2 && (t2.toLowerCase() === "y" || t2.toLowerCase() === "n") && this.emit("confirm", t2.toLowerCase() === "y"), this.emit("key", t2?.toLowerCase(), e), e?.name === "return") {
      if (this.opts.validate) {
        const s = this.opts.validate(this.value);
        s && (this.error = s instanceof Error ? s.message : s, this.state = "error", this.rl?.write(this.userInput));
      }
      this.state !== "error" && (this.state = "submit");
    }
    V([t2, e?.name, e?.sequence], "cancel") && (this.state = "cancel"), (this.state === "submit" || this.state === "cancel") && this.emit("finalize"), this.render(), (this.state === "submit" || this.state === "cancel") && this.close();
  }
  close() {
    this.input.unpipe(), this.input.removeListener("keypress", this.onKeypress), this.output.write(`
`), w(this.input, false), this.rl?.close(), this.rl = void 0, this.emit(`${this.state}`, this.value), this.unsubscribe();
  }
  restoreCursor() {
    const t2 = wrapAnsi(this._prevFrame, process.stdout.columns, { hard: true, trim: false }).split(`
`).length - 1;
    this.output.write(import_sisteransi.cursor.move(-999, t2 * -1));
  }
  render() {
    const t2 = wrapAnsi(this._render(this) ?? "", process.stdout.columns, { hard: true, trim: false });
    if (t2 !== this._prevFrame) {
      if (this.state === "initial") this.output.write(import_sisteransi.cursor.hide);
      else {
        const e = j(this._prevFrame, t2), s = A(this.output);
        if (this.restoreCursor(), e) {
          const i = Math.max(0, e.numLinesAfter - s), n = Math.max(0, e.numLinesBefore - s);
          let o = e.lines.find((a) => a >= i);
          if (o === void 0) {
            this._prevFrame = t2;
            return;
          }
          if (e.lines.length === 1) {
            this.output.write(import_sisteransi.cursor.move(0, o - n)), this.output.write(import_sisteransi.erase.lines(1));
            const a = t2.split(`
`);
            this.output.write(a[o]), this._prevFrame = t2, this.output.write(import_sisteransi.cursor.move(0, a.length - o - 1));
            return;
          } else if (e.lines.length > 1) {
            if (i < n) o = i;
            else {
              const h = o - n;
              h > 0 && this.output.write(import_sisteransi.cursor.move(0, h));
            }
            this.output.write(import_sisteransi.erase.down());
            const a = t2.split(`
`).slice(o);
            this.output.write(a.join(`
`)), this._prevFrame = t2;
            return;
          }
        }
        this.output.write(import_sisteransi.erase.down());
      }
      this.output.write(t2), this.state === "initial" && (this.state = "active"), this._prevFrame = t2;
    }
  }
};
var Q = class extends p {
  get cursor() {
    return this.value ? 0 : 1;
  }
  get _value() {
    return this.cursor === 0;
  }
  constructor(t2) {
    super(t2, false), this.value = !!t2.initialValue, this.on("userInput", () => {
      this.value = this._value;
    }), this.on("confirm", (e) => {
      this.output.write(import_sisteransi.cursor.move(0, -1)), this.value = e, this.state = "submit", this.close();
    }), this.on("cursor", () => {
      this.value = !this.value;
    });
  }
};
var nt = class extends p {
  options;
  cursor = 0;
  get _selectedValue() {
    return this.options[this.cursor];
  }
  changeValue() {
    this.value = this._selectedValue.value;
  }
  constructor(t2) {
    super(t2, false), this.options = t2.options;
    const e = this.options.findIndex(({ value: i }) => i === t2.initialValue), s = e === -1 ? 0 : e;
    this.cursor = this.options[s].disabled ? d(s, 1, this.options) : s, this.changeValue(), this.on("cursor", (i) => {
      switch (i) {
        case "left":
        case "up":
          this.cursor = d(this.cursor, -1, this.options);
          break;
        case "down":
        case "right":
          this.cursor = d(this.cursor, 1, this.options);
          break;
      }
      this.changeValue();
    });
  }
};
var at = class extends p {
  get userInputWithCursor() {
    if (this.state === "submit") return this.userInput;
    const t2 = this.userInput;
    if (this.cursor >= t2.length) return `${this.userInput}\u2588`;
    const e = t2.slice(0, this.cursor), [s, ...i] = t2.slice(this.cursor);
    return `${e}${(0, import_node_util.styleText)("inverse", s)}${i.join("")}`;
  }
  get cursor() {
    return this._cursor;
  }
  constructor(t2) {
    super({ ...t2, initialUserInput: t2.initialUserInput ?? t2.initialValue }), this.on("userInput", (e) => {
      this._setValue(e);
    }), this.on("finalize", () => {
      this.value || (this.value = t2.defaultValue), this.value === void 0 && (this.value = "");
    });
  }
};

// node_modules/@clack/prompts/dist/index.mjs
var import_node_util2 = require("node:util");
var import_node_process2 = __toESM(require("node:process"), 1);
var import_sisteransi2 = __toESM(require_src(), 1);
function Ze() {
  return import_node_process2.default.platform !== "win32" ? import_node_process2.default.env.TERM !== "linux" : !!import_node_process2.default.env.CI || !!import_node_process2.default.env.WT_SESSION || !!import_node_process2.default.env.TERMINUS_SUBLIME || import_node_process2.default.env.ConEmuTask === "{cmd::Cmder}" || import_node_process2.default.env.TERM_PROGRAM === "Terminus-Sublime" || import_node_process2.default.env.TERM_PROGRAM === "vscode" || import_node_process2.default.env.TERM === "xterm-256color" || import_node_process2.default.env.TERM === "alacritty" || import_node_process2.default.env.TERMINAL_EMULATOR === "JetBrains-JediTerm";
}
var ee = Ze();
var ae = () => process.env.CI === "true";
var w2 = (e, i) => ee ? e : i;
var _e = w2("\u25C6", "*");
var oe = w2("\u25A0", "x");
var ue = w2("\u25B2", "x");
var F = w2("\u25C7", "o");
var le = w2("\u250C", "T");
var d2 = w2("\u2502", "|");
var E2 = w2("\u2514", "\u2014");
var Ie = w2("\u2510", "T");
var Ee = w2("\u2518", "\u2014");
var z2 = w2("\u25CF", ">");
var H2 = w2("\u25CB", " ");
var te = w2("\u25FB", "[\u2022]");
var U = w2("\u25FC", "[+]");
var J = w2("\u25FB", "[ ]");
var xe = w2("\u25AA", "\u2022");
var se = w2("\u2500", "-");
var ce = w2("\u256E", "+");
var Ge = w2("\u251C", "+");
var $e = w2("\u256F", "+");
var de = w2("\u2570", "+");
var Oe = w2("\u256D", "+");
var he = w2("\u25CF", "\u2022");
var pe = w2("\u25C6", "*");
var me = w2("\u25B2", "!");
var ge = w2("\u25A0", "x");
var V2 = (e) => {
  switch (e) {
    case "initial":
    case "active":
      return (0, import_node_util2.styleText)("cyan", _e);
    case "cancel":
      return (0, import_node_util2.styleText)("red", oe);
    case "error":
      return (0, import_node_util2.styleText)("yellow", ue);
    case "submit":
      return (0, import_node_util2.styleText)("green", F);
  }
};
var ye = (e) => {
  switch (e) {
    case "initial":
    case "active":
      return (0, import_node_util2.styleText)("cyan", d2);
    case "cancel":
      return (0, import_node_util2.styleText)("red", d2);
    case "error":
      return (0, import_node_util2.styleText)("yellow", d2);
    case "submit":
      return (0, import_node_util2.styleText)("green", d2);
  }
};
var et2 = (e, i, s, r, u2) => {
  let n = i, o = 0;
  for (let c2 = s; c2 < r; c2++) {
    const a = e[c2];
    if (n = n - a.length, o++, n <= u2) break;
  }
  return { lineCount: n, removals: o };
};
var Y2 = ({ cursor: e, options: i, style: s, output: r = process.stdout, maxItems: u2 = Number.POSITIVE_INFINITY, columnPadding: n = 0, rowPadding: o = 4 }) => {
  const c2 = O(r) - n, a = A(r), l = (0, import_node_util2.styleText)("dim", "..."), $2 = Math.max(a - o, 0), y2 = Math.max(Math.min(u2, $2), 5);
  let p2 = 0;
  e >= y2 - 3 && (p2 = Math.max(Math.min(e - y2 + 3, i.length - y2), 0));
  let m = y2 < i.length && p2 > 0, g = y2 < i.length && p2 + y2 < i.length;
  const S2 = Math.min(p2 + y2, i.length), h = [];
  let f = 0;
  m && f++, g && f++;
  const v = p2 + (m ? 1 : 0), T = S2 - (g ? 1 : 0);
  for (let b = v; b < T; b++) {
    const x = wrapAnsi(s(i[b], b === e), c2, { hard: true, trim: false }).split(`
`);
    h.push(x), f += x.length;
  }
  if (f > $2) {
    let b = 0, x = 0, G2 = f;
    const M2 = e - v, R2 = (j2, D2) => et2(h, G2, j2, D2, $2);
    m ? ({ lineCount: G2, removals: b } = R2(0, M2), G2 > $2 && ({ lineCount: G2, removals: x } = R2(M2 + 1, h.length))) : ({ lineCount: G2, removals: x } = R2(M2 + 1, h.length), G2 > $2 && ({ lineCount: G2, removals: b } = R2(0, M2))), b > 0 && (m = true, h.splice(0, b)), x > 0 && (g = true, h.splice(h.length - x, x));
  }
  const C2 = [];
  m && C2.push(l);
  for (const b of h) for (const x of b) C2.push(x);
  return g && C2.push(l), C2;
};
var ot2 = (e) => {
  const i = e.active ?? "Yes", s = e.inactive ?? "No";
  return new Q({ active: i, inactive: s, signal: e.signal, input: e.input, output: e.output, initialValue: e.initialValue ?? true, render() {
    const r = e.withGuide ?? u.withGuide, u2 = `${V2(this.state)}  `, n = r ? `${(0, import_node_util2.styleText)("gray", d2)}  ` : "", o = R(e.output, e.message, n, u2), c2 = `${r ? `${(0, import_node_util2.styleText)("gray", d2)}
` : ""}${o}
`, a = this.value ? i : s;
    switch (this.state) {
      case "submit": {
        const l = r ? `${(0, import_node_util2.styleText)("gray", d2)}  ` : "";
        return `${c2}${l}${(0, import_node_util2.styleText)("dim", a)}`;
      }
      case "cancel": {
        const l = r ? `${(0, import_node_util2.styleText)("gray", d2)}  ` : "";
        return `${c2}${l}${(0, import_node_util2.styleText)(["strikethrough", "dim"], a)}${r ? `
${(0, import_node_util2.styleText)("gray", d2)}` : ""}`;
      }
      default: {
        const l = r ? `${(0, import_node_util2.styleText)("cyan", d2)}  ` : "", $2 = r ? (0, import_node_util2.styleText)("cyan", E2) : "";
        return `${c2}${l}${this.value ? `${(0, import_node_util2.styleText)("green", z2)} ${i}` : `${(0, import_node_util2.styleText)("dim", H2)} ${(0, import_node_util2.styleText)("dim", i)}`}${e.vertical ? r ? `
${(0, import_node_util2.styleText)("cyan", d2)}  ` : `
` : ` ${(0, import_node_util2.styleText)("dim", "/")} `}${this.value ? `${(0, import_node_util2.styleText)("dim", H2)} ${(0, import_node_util2.styleText)("dim", s)}` : `${(0, import_node_util2.styleText)("green", z2)} ${s}`}
${$2}
`;
      }
    }
  } }).prompt();
};
var dt = async (e, i) => {
  const s = {}, r = Object.keys(e);
  for (const u2 of r) {
    const n = e[u2], o = await n({ results: s })?.catch((c2) => {
      throw c2;
    });
    if (typeof i?.onCancel == "function" && q(o)) {
      s[u2] = "canceled", i.onCancel({ results: s });
      continue;
    }
    s[u2] = o;
  }
  return s;
};
var O2 = { message: (e = [], { symbol: i = (0, import_node_util2.styleText)("gray", d2), secondarySymbol: s = (0, import_node_util2.styleText)("gray", d2), output: r = process.stdout, spacing: u2 = 1, withGuide: n } = {}) => {
  const o = [], c2 = n ?? u.withGuide, a = c2 ? s : "", l = c2 ? `${i}  ` : "", $2 = c2 ? `${s}  ` : "";
  for (let p2 = 0; p2 < u2; p2++) o.push(a);
  const y2 = Array.isArray(e) ? e : e.split(`
`);
  if (y2.length > 0) {
    const [p2, ...m] = y2;
    p2.length > 0 ? o.push(`${l}${p2}`) : o.push(c2 ? i : "");
    for (const g of m) g.length > 0 ? o.push(`${$2}${g}`) : o.push(c2 ? s : "");
  }
  r.write(`${o.join(`
`)}
`);
}, info: (e, i) => {
  O2.message(e, { ...i, symbol: (0, import_node_util2.styleText)("blue", he) });
}, success: (e, i) => {
  O2.message(e, { ...i, symbol: (0, import_node_util2.styleText)("green", pe) });
}, step: (e, i) => {
  O2.message(e, { ...i, symbol: (0, import_node_util2.styleText)("green", F) });
}, warn: (e, i) => {
  O2.message(e, { ...i, symbol: (0, import_node_util2.styleText)("yellow", me) });
}, warning: (e, i) => {
  O2.warn(e, i);
}, error: (e, i) => {
  O2.message(e, { ...i, symbol: (0, import_node_util2.styleText)("red", ge) });
} };
var pt = (e = "", i) => {
  const s = i?.output ?? process.stdout, r = i?.withGuide ?? u.withGuide ? `${(0, import_node_util2.styleText)("gray", E2)}  ` : "";
  s.write(`${r}${(0, import_node_util2.styleText)("red", e)}

`);
};
var mt = (e = "", i) => {
  const s = i?.output ?? process.stdout, r = i?.withGuide ?? u.withGuide ? `${(0, import_node_util2.styleText)("gray", le)}  ` : "";
  s.write(`${r}${e}
`);
};
var gt = (e = "", i) => {
  const s = i?.output ?? process.stdout, r = i?.withGuide ?? u.withGuide ? `${(0, import_node_util2.styleText)("gray", d2)}
${(0, import_node_util2.styleText)("gray", E2)}  ` : "";
  s.write(`${r}${e}

`);
};
var ft = (e) => (0, import_node_util2.styleText)("dim", e);
var vt = (e, i, s) => {
  const r = { hard: true, trim: false }, u2 = wrapAnsi(e, i, r).split(`
`), n = u2.reduce((a, l) => Math.max(dist_default2(l), a), 0), o = u2.map(s).reduce((a, l) => Math.max(dist_default2(l), a), 0), c2 = i - (o - n);
  return wrapAnsi(e, c2, r);
};
var wt = (e = "", i = "", s) => {
  const r = s?.output ?? import_node_process2.default.stdout, u2 = s?.withGuide ?? u.withGuide, n = s?.format ?? ft, o = ["", ...vt(e, O(r) - 6, n).split(`
`).map(n), ""], c2 = dist_default2(i), a = Math.max(o.reduce((p2, m) => {
    const g = dist_default2(m);
    return g > p2 ? g : p2;
  }, 0), c2) + 2, l = o.map((p2) => `${(0, import_node_util2.styleText)("gray", d2)}  ${p2}${" ".repeat(a - dist_default2(p2))}${(0, import_node_util2.styleText)("gray", d2)}`).join(`
`), $2 = u2 ? `${(0, import_node_util2.styleText)("gray", d2)}
` : "", y2 = u2 ? Ge : de;
  r.write(`${$2}${(0, import_node_util2.styleText)("green", F)}  ${(0, import_node_util2.styleText)("reset", i)} ${(0, import_node_util2.styleText)("gray", se.repeat(Math.max(a - c2 - 1, 1)) + ce)}
${l}
${(0, import_node_util2.styleText)("gray", y2 + se.repeat(a + 2) + $e)}
`);
};
var Ct = (e) => (0, import_node_util2.styleText)("magenta", e);
var fe = ({ indicator: e = "dots", onCancel: i, output: s = process.stdout, cancelMessage: r, errorMessage: u2, frames: n = ee ? ["\u25D2", "\u25D0", "\u25D3", "\u25D1"] : ["\u2022", "o", "O", "0"], delay: o = ee ? 80 : 120, signal: c2, ...a } = {}) => {
  const l = ae();
  let $2, y2, p2 = false, m = false, g = "", S2, h = performance.now();
  const f = O(s), v = a?.styleFrame ?? Ct, T = (_2) => {
    const A2 = _2 > 1 ? u2 ?? u.messages.error : r ?? u.messages.cancel;
    m = _2 === 1, p2 && (W(A2, _2), m && typeof i == "function" && i());
  }, C2 = () => T(2), b = () => T(1), x = () => {
    process.on("uncaughtExceptionMonitor", C2), process.on("unhandledRejection", C2), process.on("SIGINT", b), process.on("SIGTERM", b), process.on("exit", T), c2 && c2.addEventListener("abort", b);
  }, G2 = () => {
    process.removeListener("uncaughtExceptionMonitor", C2), process.removeListener("unhandledRejection", C2), process.removeListener("SIGINT", b), process.removeListener("SIGTERM", b), process.removeListener("exit", T), c2 && c2.removeEventListener("abort", b);
  }, M2 = () => {
    if (S2 === void 0) return;
    l && s.write(`
`);
    const _2 = wrapAnsi(S2, f, { hard: true, trim: false }).split(`
`);
    _2.length > 1 && s.write(import_sisteransi2.cursor.up(_2.length - 1)), s.write(import_sisteransi2.cursor.to(0)), s.write(import_sisteransi2.erase.down());
  }, R2 = (_2) => _2.replace(/\.+$/, ""), j2 = (_2) => {
    const A2 = (performance.now() - _2) / 1e3, k = Math.floor(A2 / 60), L = Math.floor(A2 % 60);
    return k > 0 ? `[${k}m ${L}s]` : `[${L}s]`;
  }, D2 = a.withGuide ?? u.withGuide, ie = (_2 = "") => {
    p2 = true, $2 = z({ output: s }), g = R2(_2), h = performance.now(), D2 && s.write(`${(0, import_node_util2.styleText)("gray", d2)}
`);
    let A2 = 0, k = 0;
    x(), y2 = setInterval(() => {
      if (l && g === S2) return;
      M2(), S2 = g;
      const L = v(n[A2]);
      let Z;
      if (l) Z = `${L}  ${g}...`;
      else if (e === "timer") Z = `${L}  ${g} ${j2(h)}`;
      else {
        const Be = ".".repeat(Math.floor(k)).slice(0, 3);
        Z = `${L}  ${g}${Be}`;
      }
      const Ne = wrapAnsi(Z, f, { hard: true, trim: false });
      s.write(Ne), A2 = A2 + 1 < n.length ? A2 + 1 : 0, k = k < 4 ? k + 0.125 : 0;
    }, o);
  }, W = (_2 = "", A2 = 0, k = false) => {
    if (!p2) return;
    p2 = false, clearInterval(y2), M2();
    const L = A2 === 0 ? (0, import_node_util2.styleText)("green", F) : A2 === 1 ? (0, import_node_util2.styleText)("red", oe) : (0, import_node_util2.styleText)("red", ue);
    g = _2 ?? g, k || (e === "timer" ? s.write(`${L}  ${g} ${j2(h)}
`) : s.write(`${L}  ${g}
`)), G2(), $2();
  };
  return { start: ie, stop: (_2 = "") => W(_2, 0), message: (_2 = "") => {
    g = R2(_2 ?? g);
  }, cancel: (_2 = "") => W(_2, 1), error: (_2 = "") => W(_2, 2), clear: () => W("", 0, true), get isCancelled() {
    return m;
  } };
};
var Ve = { light: w2("\u2500", "-"), heavy: w2("\u2501", "="), block: w2("\u2588", "#") };
var re = (e, i) => e.includes(`
`) ? e.split(`
`).map((s) => i(s)).join(`
`) : i(e);
var _t = (e) => {
  const i = (s, r) => {
    const u2 = s.label ?? String(s.value);
    switch (r) {
      case "disabled":
        return `${(0, import_node_util2.styleText)("gray", H2)} ${re(u2, (n) => (0, import_node_util2.styleText)("gray", n))}${s.hint ? ` ${(0, import_node_util2.styleText)("dim", `(${s.hint ?? "disabled"})`)}` : ""}`;
      case "selected":
        return `${re(u2, (n) => (0, import_node_util2.styleText)("dim", n))}`;
      case "active":
        return `${(0, import_node_util2.styleText)("green", z2)} ${u2}${s.hint ? ` ${(0, import_node_util2.styleText)("dim", `(${s.hint})`)}` : ""}`;
      case "cancelled":
        return `${re(u2, (n) => (0, import_node_util2.styleText)(["strikethrough", "dim"], n))}`;
      default:
        return `${(0, import_node_util2.styleText)("dim", H2)} ${re(u2, (n) => (0, import_node_util2.styleText)("dim", n))}`;
    }
  };
  return new nt({ options: e.options, signal: e.signal, input: e.input, output: e.output, initialValue: e.initialValue, render() {
    const s = e.withGuide ?? u.withGuide, r = `${V2(this.state)}  `, u2 = `${ye(this.state)}  `, n = R(e.output, e.message, u2, r), o = `${s ? `${(0, import_node_util2.styleText)("gray", d2)}
` : ""}${n}
`;
    switch (this.state) {
      case "submit": {
        const c2 = s ? `${(0, import_node_util2.styleText)("gray", d2)}  ` : "", a = R(e.output, i(this.options[this.cursor], "selected"), c2);
        return `${o}${a}`;
      }
      case "cancel": {
        const c2 = s ? `${(0, import_node_util2.styleText)("gray", d2)}  ` : "", a = R(e.output, i(this.options[this.cursor], "cancelled"), c2);
        return `${o}${a}${s ? `
${(0, import_node_util2.styleText)("gray", d2)}` : ""}`;
      }
      default: {
        const c2 = s ? `${(0, import_node_util2.styleText)("cyan", d2)}  ` : "", a = s ? (0, import_node_util2.styleText)("cyan", E2) : "", l = o.split(`
`).length, $2 = s ? 2 : 1;
        return `${o}${c2}${Y2({ output: e.output, cursor: this.cursor, options: this.options, maxItems: e.maxItems, columnPadding: c2.length, rowPadding: l + $2, style: (y2, p2) => i(y2, y2.disabled ? "disabled" : p2 ? "active" : "inactive") }).join(`
${c2}`)}
${a}
`;
      }
    }
  } }).prompt();
};
var je = `${(0, import_node_util2.styleText)("gray", d2)}  `;
var Ot = (e) => new at({ validate: e.validate, placeholder: e.placeholder, defaultValue: e.defaultValue, initialValue: e.initialValue, output: e.output, signal: e.signal, input: e.input, render() {
  const i = e?.withGuide ?? u.withGuide, s = `${`${i ? `${(0, import_node_util2.styleText)("gray", d2)}
` : ""}${V2(this.state)}  `}${e.message}
`, r = e.placeholder ? (0, import_node_util2.styleText)("inverse", e.placeholder[0]) + (0, import_node_util2.styleText)("dim", e.placeholder.slice(1)) : (0, import_node_util2.styleText)(["inverse", "hidden"], "_"), u2 = this.userInput ? this.userInputWithCursor : r, n = this.value ?? "";
  switch (this.state) {
    case "error": {
      const o = this.error ? `  ${(0, import_node_util2.styleText)("yellow", this.error)}` : "", c2 = i ? `${(0, import_node_util2.styleText)("yellow", d2)}  ` : "", a = i ? (0, import_node_util2.styleText)("yellow", E2) : "";
      return `${s.trim()}
${c2}${u2}
${a}${o}
`;
    }
    case "submit": {
      const o = n ? `  ${(0, import_node_util2.styleText)("dim", n)}` : "", c2 = i ? (0, import_node_util2.styleText)("gray", d2) : "";
      return `${s}${c2}${o}`;
    }
    case "cancel": {
      const o = n ? `  ${(0, import_node_util2.styleText)(["strikethrough", "dim"], n)}` : "", c2 = i ? (0, import_node_util2.styleText)("gray", d2) : "";
      return `${s}${c2}${o}${n.trim() ? `
${c2}` : ""}`;
    }
    default: {
      const o = i ? `${(0, import_node_util2.styleText)("cyan", d2)}  ` : "", c2 = i ? (0, import_node_util2.styleText)("cyan", E2) : "";
      return `${s}${o}${u2}
${c2}
`;
    }
  }
} }).prompt();

// cli/src/commands/init.ts
var import_picocolors2 = __toESM(require_picocolors());

// cli/src/utils/config.ts
var import_node_fs = __toESM(require("node:fs"));
var import_node_path = __toESM(require("node:path"));
var CONFIG_FILE = "7onic.json";
function findProjectRoot(cwd) {
  let dir = import_node_path.default.resolve(cwd);
  while (dir !== import_node_path.default.dirname(dir)) {
    if (import_node_fs.default.existsSync(import_node_path.default.join(dir, "package.json"))) {
      return dir;
    }
    dir = import_node_path.default.dirname(dir);
  }
  return null;
}
function readConfig(cwd) {
  const configPath = import_node_path.default.join(cwd, CONFIG_FILE);
  if (!import_node_fs.default.existsSync(configPath)) return null;
  try {
    return JSON.parse(import_node_fs.default.readFileSync(configPath, "utf-8"));
  } catch {
    return null;
  }
}
function writeConfig(cwd, config) {
  const configPath = import_node_path.default.join(cwd, CONFIG_FILE);
  import_node_fs.default.writeFileSync(configPath, JSON.stringify(config, null, 2) + "\n", "utf-8");
}
function configExists(cwd) {
  return import_node_fs.default.existsSync(import_node_path.default.join(cwd, CONFIG_FILE));
}

// cli/src/utils/detect-tailwind.ts
var import_node_fs2 = __toESM(require("node:fs"));
var import_node_path2 = __toESM(require("node:path"));
var V3_CONFIG_FILES = [
  "tailwind.config.js",
  "tailwind.config.ts",
  "tailwind.config.cjs",
  "tailwind.config.mjs"
];
function detectTailwindVersion(cwd) {
  for (const file of V3_CONFIG_FILES) {
    if (import_node_fs2.default.existsSync(import_node_path2.default.join(cwd, file))) {
      return { version: 3, configPath: file };
    }
  }
  return { version: 4 };
}

// cli/src/utils/detect-pm.ts
var import_node_fs3 = __toESM(require("node:fs"));
var import_node_path3 = __toESM(require("node:path"));
var LOCKFILES = {
  "pnpm-lock.yaml": "pnpm",
  "yarn.lock": "yarn",
  "bun.lockb": "bun",
  "bun.lock": "bun",
  "package-lock.json": "npm"
};
function detectPackageManager(cwd) {
  for (const [lockfile, pm] of Object.entries(LOCKFILES)) {
    if (import_node_fs3.default.existsSync(import_node_path3.default.join(cwd, lockfile))) {
      return pm;
    }
  }
  return "npm";
}

// cli/src/utils/install-deps.ts
var import_node_child_process = require("node:child_process");
function installDeps(deps, options) {
  if (deps.length === 0) return;
  const { cwd, pm, dev } = options;
  const devFlag = dev ? " -D" : "";
  const commands = {
    npm: `npm install${devFlag} ${deps.join(" ")}`,
    pnpm: `pnpm add${devFlag} ${deps.join(" ")}`,
    yarn: `yarn add${devFlag} ${deps.join(" ")}`,
    bun: `bun add${devFlag} ${deps.join(" ")}`
  };
  (0, import_node_child_process.execSync)(commands[pm], { cwd, stdio: "pipe" });
}

// cli/src/utils/logger.ts
var import_picocolors = __toESM(require_picocolors());
var logger = {
  info(msg) {
    console.log(import_picocolors.default.cyan("i"), msg);
  },
  success(msg) {
    console.log(import_picocolors.default.green("\u2713"), msg);
  },
  warn(msg) {
    console.log(import_picocolors.default.yellow("!"), msg);
  },
  error(msg) {
    console.error(import_picocolors.default.red("\u2717"), msg);
  },
  break() {
    console.log("");
  },
  title(msg) {
    console.log(import_picocolors.default.bold(msg));
  }
};

// cli/src/commands/init.ts
var CSS_CANDIDATES = [
  "src/app/globals.css",
  "app/globals.css",
  "src/index.css",
  "src/styles/globals.css",
  "styles/globals.css"
];
var CN_UTIL = `import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
`;
var CSS_V3_IMPORTS = `@import '@7onic-ui/tokens/css/variables.css';
@import '@7onic-ui/tokens/css/themes/light.css';
@import '@7onic-ui/tokens/css/themes/dark.css';
`;
var CSS_V4_IMPORTS = `@import '@7onic-ui/tokens/css/variables.css';
@import '@7onic-ui/tokens/tailwind/v4.css';
`;
async function init(args) {
  const flagYes = args.includes("--yes") || args.includes("-y");
  const tailwindFlagIdx = args.indexOf("--tailwind");
  const tailwindFlagRaw = tailwindFlagIdx !== -1 ? args[tailwindFlagIdx + 1] : null;
  const forcedTailwindVersion = tailwindFlagRaw === "v3" || tailwindFlagRaw === "3" ? 3 : tailwindFlagRaw === "v4" || tailwindFlagRaw === "4" ? 4 : null;
  mt(import_picocolors2.default.bold("7onic init"));
  if (tailwindFlagIdx !== -1 && forcedTailwindVersion === null) {
    O2.warn(`Invalid --tailwind value: "${tailwindFlagRaw ?? "(empty)"}". Use v3 or v4.`);
  }
  const cwd = process.cwd();
  const projectRoot = findProjectRoot(cwd);
  if (!projectRoot) {
    pt("No package.json found. Run this command inside a project.");
    process.exit(1);
  }
  if (configExists(projectRoot) && !flagYes) {
    const overwrite = await ot2({
      message: "7onic.json already exists. Overwrite?"
    });
    if (q(overwrite) || !overwrite) {
      pt("Init cancelled.");
      process.exit(0);
    }
  }
  const hasTsConfig = import_node_fs4.default.existsSync(import_node_path4.default.join(projectRoot, "tsconfig.json"));
  if (!hasTsConfig) {
    pt("tsconfig.json not found. 7onic requires TypeScript.");
    process.exit(1);
  }
  const tw = detectTailwindVersion(projectRoot);
  const pm = detectPackageManager(projectRoot);
  let hasPathAlias = false;
  try {
    const tsConfigRaw = import_node_fs4.default.readFileSync(import_node_path4.default.join(projectRoot, "tsconfig.json"), "utf-8");
    hasPathAlias = tsConfigRaw.includes('"@/');
  } catch {
  }
  if (!hasPathAlias) {
    O2.warn(
      "No @/ path alias detected in tsconfig.json.\n  Components use @/lib/utils \u2014 make sure your project has path aliases configured.\n  Next.js: automatic. Vite: add resolve.alias in vite.config.ts"
    );
  }
  try {
    const pkgJson = JSON.parse(import_node_fs4.default.readFileSync(import_node_path4.default.join(projectRoot, "package.json"), "utf-8"));
    const allDeps = { ...pkgJson.dependencies, ...pkgJson.devDependencies };
    if (allDeps["@7onic-ui/react"]) {
      O2.info(
        "@7onic-ui/react detected \u2014 CLI copies source files for customization.\n  Use one method per component to avoid duplicates."
      );
    }
  } catch {
  }
  const cssDefault = CSS_CANDIDATES.find((c2) => import_node_fs4.default.existsSync(import_node_path4.default.join(projectRoot, c2))) || "src/app/globals.css";
  let config;
  if (flagYes) {
    const resolvedVersion = forcedTailwindVersion ?? tw.version;
    config = {
      componentsAlias: "@/components/ui",
      utilsAlias: "@/lib/utils",
      tailwindVersion: resolvedVersion,
      cssPath: cssDefault
    };
    O2.info(`Using defaults: Tailwind v${resolvedVersion}, CSS: ${cssDefault}`);
  } else {
    config = await dt(
      {
        componentsAlias: () => Ot({
          message: "Components path alias",
          placeholder: "@/components/ui",
          defaultValue: "@/components/ui"
        }),
        utilsAlias: () => Ot({
          message: "Utils path alias",
          placeholder: "@/lib/utils",
          defaultValue: "@/lib/utils"
        }),
        tailwindVersion: () => _t({
          message: `Tailwind version ${tw.configPath ? `(detected: v${tw.version})` : ""}`,
          options: [
            { value: 3, label: "Tailwind v3" },
            { value: 4, label: "Tailwind v4" }
          ],
          initialValue: forcedTailwindVersion ?? tw.version
        }),
        cssPath: () => Ot({
          message: "CSS file path",
          placeholder: cssDefault,
          defaultValue: cssDefault
        })
      },
      {
        onCancel: () => {
          pt("Init cancelled.");
          process.exit(0);
        }
      }
    );
  }
  const tailwindVersion = config.tailwindVersion;
  const s = fe();
  const baseDeps = ["@7onic-ui/tokens", "lucide-react", "clsx", "tailwind-merge", "class-variance-authority"];
  s.start(`Installing dependencies (${pm})...`);
  try {
    installDeps(baseDeps, { cwd: projectRoot, pm });
    s.stop("Dependencies installed");
  } catch (err) {
    s.stop("Failed to install dependencies");
    logger.error(String(err));
    process.exit(1);
  }
  const cssFullPath = import_node_path4.default.join(projectRoot, config.cssPath);
  const cssImports = tailwindVersion === 3 ? CSS_V3_IMPORTS : CSS_V4_IMPORTS;
  if (!import_node_fs4.default.existsSync(cssFullPath)) {
    const cssDir = import_node_path4.default.dirname(cssFullPath);
    if (!import_node_fs4.default.existsSync(cssDir)) {
      import_node_fs4.default.mkdirSync(cssDir, { recursive: true });
    }
    import_node_fs4.default.writeFileSync(cssFullPath, cssImports, "utf-8");
    O2.success(`Created ${config.cssPath} with token imports`);
  } else {
    const cssContent = import_node_fs4.default.readFileSync(cssFullPath, "utf-8");
    if (!cssContent.includes("@7onic-ui/tokens")) {
      import_node_fs4.default.writeFileSync(cssFullPath, cssImports + "\n" + cssContent, "utf-8");
      O2.success(`Added token imports to ${config.cssPath}`);
    } else {
      O2.info(`Token imports already present in ${config.cssPath}`);
    }
  }
  if (tailwindVersion === 3 && tw.configPath) {
    const configFullPath = import_node_path4.default.join(projectRoot, tw.configPath);
    if (import_node_fs4.default.existsSync(configFullPath)) {
      const configContent = import_node_fs4.default.readFileSync(configFullPath, "utf-8");
      if (!configContent.includes("@7onic-ui/tokens/tailwind/v3-preset")) {
        wt(
          `Add the 7onic preset to your ${tw.configPath}:

` + import_picocolors2.default.dim(`  module.exports = {
`) + import_picocolors2.default.green(`    presets: [require('@7onic-ui/tokens/tailwind/v3-preset')],
`) + import_picocolors2.default.dim(`    // ... rest of config
`) + import_picocolors2.default.dim(`  }`),
          "Tailwind v3 Setup"
        );
      } else {
        O2.info("7onic preset already in Tailwind config");
      }
    }
  }
  const utilsPath = resolveAliasPath(projectRoot, config.utilsAlias);
  if (utilsPath) {
    const utilsFullPath = utilsPath + ".ts";
    if (!import_node_fs4.default.existsSync(utilsFullPath)) {
      const utilsDir = import_node_path4.default.dirname(utilsFullPath);
      if (!import_node_fs4.default.existsSync(utilsDir)) {
        import_node_fs4.default.mkdirSync(utilsDir, { recursive: true });
      }
      import_node_fs4.default.writeFileSync(utilsFullPath, CN_UTIL, "utf-8");
      O2.success(`Created ${import_node_path4.default.relative(projectRoot, utilsFullPath)}`);
    } else {
      const utilsContent = import_node_fs4.default.readFileSync(utilsFullPath, "utf-8");
      if (!utilsContent.includes("tailwind-merge")) {
        O2.warn(
          `${import_node_path4.default.relative(projectRoot, utilsFullPath)} exists but does not import tailwind-merge.
  7onic components require cn() with tailwind-merge.`
        );
      } else {
        O2.info("cn() utility already exists");
      }
    }
  }
  const finalConfig = {
    $schema: "https://7onic.design/schema/7onic.json",
    tailwind: {
      version: tailwindVersion,
      ...tailwindVersion === 3 && tw.configPath ? { config: tw.configPath } : {},
      css: config.cssPath
    },
    aliases: {
      components: config.componentsAlias,
      utils: config.utilsAlias
    }
  };
  writeConfig(projectRoot, finalConfig);
  O2.success("Created 7onic.json");
  gt("Done! Run " + import_picocolors2.default.cyan("npx 7onic add <component>") + " to add components.");
}
function resolveAliasPath(projectRoot, alias) {
  if (!alias.startsWith("@/")) return null;
  const relative = alias.slice(2);
  for (const srcDir of ["src", "app", "."]) {
    const candidate = import_node_path4.default.join(projectRoot, srcDir, relative);
    if (import_node_fs4.default.existsSync(import_node_path4.default.dirname(candidate)) || srcDir === "src") {
      return import_node_path4.default.join(projectRoot, srcDir, relative);
    }
  }
  return import_node_path4.default.join(projectRoot, "src", relative);
}

// cli/src/commands/add.ts
var import_node_fs5 = __toESM(require("node:fs"));
var import_node_path5 = __toESM(require("node:path"));
var import_picocolors3 = __toESM(require_picocolors());

// cli/src/utils/rewrite-imports.ts
function rewriteImports(content, utilsAlias) {
  return content.replace(
    /from ['"]@\/lib\/utils['"]/g,
    `from '${utilsAlias}'`
  );
}

// cli/src/registry/index.ts
var registry = {
  "accordion": {
    name: "accordion",
    dependencies: ["@radix-ui/react-accordion"],
    registryDependencies: [],
    reverseDependencies: [],
    namespace: true,
    description: "",
    files: [{
      path: "accordion.tsx",
      content: `'use client'

import * as React from 'react'
import * as AccordionPrimitive from '@radix-ui/react-accordion'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// Default chevron icon (built-in, no external dependency)
const DefaultChevronIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
)

// Context to pass style props from Accordion root to children
type AccordionStyleContextValue = {
  variant?: 'default' | 'bordered' | 'splitted'
  size?: 'sm' | 'default' | 'lg'
  iconPosition?: 'left' | 'right'
}
const AccordionStyleContext = React.createContext<AccordionStyleContextValue>({})
const useAccordionStyleContext = () => React.useContext(AccordionStyleContext)

// \u2500\u2500\u2500 Accordion (Root) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

const accordionVariants = cva('w-full', {
  variants: {
    variant: {
      default: 'divide-y divide-border',
      bordered: 'divide-y divide-border border border-border rounded-xl',
      splitted: 'flex flex-col gap-3',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

export interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: 'single' | 'multiple'
  variant?: 'default' | 'bordered' | 'splitted'
  size?: 'sm' | 'default' | 'lg'
  iconPosition?: 'left' | 'right'
  collapsible?: boolean
  defaultValue?: string | string[]
  value?: string | string[]
  onValueChange?: ((value: string) => void) | ((value: string[]) => void)
  disabled?: boolean
}

const AccordionRoot = React.forwardRef<HTMLDivElement, AccordionProps>(
  ({ className, variant = 'default', size = 'default', iconPosition = 'right', type = 'single', collapsible = true, defaultValue, value, onValueChange, disabled, ...props }, ref) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Radix single/multiple union type conflict
    const restProps = props as any
    const sharedClassName = cn(accordionVariants({ variant }), className)

    const radixProps = type === 'multiple'
      ? {
          type: 'multiple' as const,
          defaultValue: defaultValue as string[] | undefined,
          value: value as string[] | undefined,
          onValueChange: onValueChange as ((value: string[]) => void) | undefined,
          disabled,
        }
      : {
          type: 'single' as const,
          collapsible,
          defaultValue: defaultValue as string | undefined,
          value: value as string | undefined,
          onValueChange: onValueChange as ((value: string) => void) | undefined,
          disabled,
        }

    return (
      <AccordionStyleContext.Provider value={{ variant, size, iconPosition }}>
          <AccordionPrimitive.Root
          ref={ref}
          className={sharedClassName}
          {...radixProps}
          {...restProps}
        />
      </AccordionStyleContext.Provider>
    )
  }
)
AccordionRoot.displayName = 'Accordion'

// \u2500\u2500\u2500 AccordionItem \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

const accordionItemVariants = cva('', {
  variants: {
    variant: {
      default: '',
      bordered: '',
      splitted: 'border border-border rounded-xl',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

export interface AccordionItemProps
  extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>,
    Omit<VariantProps<typeof accordionItemVariants>, 'variant'> {}

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  AccordionItemProps
>(({ className, ...props }, ref) => {
  const { variant } = useAccordionStyleContext()
  return (
    <AccordionPrimitive.Item
      ref={ref}
      className={cn(accordionItemVariants({ variant }), className)}
      {...props}
    />
  )
})
AccordionItem.displayName = 'AccordionItem'

// \u2500\u2500\u2500 AccordionTrigger \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

const accordionTriggerVariants = cva(
  [
    'flex flex-1 items-center gap-3 font-semibold text-foreground',
    'transition-all duration-micro ease-out cursor-pointer',
    'hover:bg-background-muted/50',
    'focus-visible:focus-ring focus-visible:rounded-md',
    'disabled:pointer-events-none disabled:text-text-subtle disabled:opacity-50',
    '[&[data-state=open]>svg.accordion-chevron]:rotate-180',
  ].join(' '),
  {
    variants: {
      size: {
        sm: 'py-3 px-4 text-sm',     // 13px
        default: 'py-4 px-4 text-md', // 14px
        lg: 'py-5 px-6 text-base',    // 16px
      },
      iconPosition: {
        left: 'flex-row',
        right: 'flex-row-reverse justify-between',
      },
    },
    defaultVariants: {
      size: 'default',
      iconPosition: 'right',
    },
  }
)

// Icon size per trigger size
const triggerIconSizeClasses = {
  sm: 'icon-xs',      // 14px
  default: 'icon-sm', // 16px
  lg: 'icon-sm',      // 16px
} as const

export interface AccordionTriggerProps
  extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger> {
  /** Custom indicator icon (replaces default chevron) */
  icon?: React.ReactNode
}

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  AccordionTriggerProps
>(({ className, children, icon, ...props }, ref) => {
  const { size, iconPosition } = useAccordionStyleContext()
  const resolvedSize = size || 'default'

  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        ref={ref}
        className={cn(
          'group',
          accordionTriggerVariants({ size: resolvedSize, iconPosition }),
          className
        )}
        {...props}
      >
        {icon || (
          <DefaultChevronIcon className={cn(
            'accordion-chevron shrink-0 text-text-muted transition-transform duration-normal',
            triggerIconSizeClasses[resolvedSize]
          )} />
        )}
        <span className="text-left">{children}</span>
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
})
AccordionTrigger.displayName = 'AccordionTrigger'

// \u2500\u2500\u2500 AccordionContent \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

const accordionContentSizeClasses = {
  sm: 'px-4 pb-3 text-sm',
  default: 'px-4 pb-4 text-md',
  lg: 'px-6 pb-5 text-base',
} as const

export interface AccordionContentProps
  extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content> {}

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  AccordionContentProps
>(({ className, children, ...props }, ref) => {
  const { size } = useAccordionStyleContext()
  const resolvedSize = size || 'default'

  return (
    <AccordionPrimitive.Content
      ref={ref}
      className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
      {...props}
    >
      <div className={cn(
        'text-text-muted',
        accordionContentSizeClasses[resolvedSize],
        className
      )}>
        {children}
      </div>
    </AccordionPrimitive.Content>
  )
})
AccordionContent.displayName = 'AccordionContent'

// \u2500\u2500\u2500 Exports \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

// \u2500\u2500\u2500 Namespace \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const Accordion = Object.assign(AccordionRoot, {
  Item: AccordionItem,
  Trigger: AccordionTrigger,
  Content: AccordionContent,
})

// eslint-disable-next-line @typescript-eslint/no-namespace
namespace Accordion {
  export type ItemProps = AccordionItemProps
  export type TriggerProps = AccordionTriggerProps
  export type ContentProps = AccordionContentProps
}

export {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  accordionVariants,
  accordionTriggerVariants,
}
`,
      type: "ui"
    }]
  },
  "alert": {
    name: "alert",
    dependencies: [],
    registryDependencies: [],
    reverseDependencies: [],
    namespace: true,
    description: "",
    files: [{
      path: "alert.tsx",
      content: `'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// \u2500\u2500\u2500 Built-in status icons (no external dependency) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
// All icons: Lucide-compatible 24\xD724 viewBox, strokeWidth=2, rounded caps/joins
// Info = circle + "i" | Success = circle + check | Warning = triangle + "!" | Error = circle + small \xD7
const InfoIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </svg>
)

const SuccessIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <path d="m9 12 2 2 4-4" />
  </svg>
)

const WarningIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </svg>
)

const ErrorIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 8v5" />
    <path d="M12 16h.01" />
  </svg>
)

const DefaultCloseIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
)

// \u2500\u2500\u2500 Status icon mapping \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const STATUS_ICONS: Record<AlertColor, React.FC<{ className?: string }>> = {
  info: InfoIcon,
  success: SuccessIcon,
  warning: WarningIcon,
  error: ErrorIcon,
}

// \u2500\u2500\u2500 Color \xD7 Variant class mapping \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
// Uses semantic tokens (*.tint, text-text-*) \u2014 same pattern as Badge
const colorMap = {
  info: {
    default: 'bg-info-tint text-text-info border-info/20',
    outline: 'bg-transparent text-text-info border-info',
    filled: 'bg-info text-info-foreground border-transparent',
  },
  success: {
    default: 'bg-success-tint text-text-success border-success/20',
    outline: 'bg-transparent text-text-success border-success',
    filled: 'bg-success text-success-foreground border-transparent',
  },
  warning: {
    default: 'bg-warning-tint text-text-warning border-warning/20',
    outline: 'bg-transparent text-text-warning border-warning',
    filled: 'bg-warning text-warning-foreground border-transparent',
  },
  error: {
    default: 'bg-error-tint text-text-error border-error/20',
    outline: 'bg-transparent text-text-error border-error',
    filled: 'bg-error text-error-foreground border-transparent',
  },
} as const

// \u2500\u2500\u2500 Alert variants \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const alertVariants = cva(
  'group relative flex items-center border w-full [&:has([data-alert-description])]:items-start',
  {
    variants: {
      size: {
        sm: 'gap-2 p-3 text-sm',
        default: 'gap-2.5 p-4 text-md',
        lg: 'gap-3 p-5 text-md',
      },
      radius: {
        none: 'rounded-none',
        sm: 'rounded-sm',
        base: 'rounded',
        md: 'rounded-md',
        lg: 'rounded-lg',
        xl: 'rounded-xl',
        '2xl': 'rounded-2xl',
        '3xl': 'rounded-3xl',
        full: 'rounded-full',
      },
    },
    defaultVariants: {
      size: 'default',
      radius: 'lg',
    },
  }
)

// \u2500\u2500\u2500 Size-dependent class maps \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const ICON_SIZE_MAP = {
  sm: 'icon-sm',                // 16px
  default: 'w-[18px] h-[18px]', // 18px \u2014 TOKEN-EXCEPTION: no 18px icon token
  lg: 'icon-md',                // 20px
} as const

const TITLE_SIZE_MAP = {
  sm: 'text-sm font-semibold leading-4 tracking-tight',
  default: 'font-semibold leading-[18px] tracking-tight',
  lg: 'text-base font-semibold leading-5 tracking-tight',
} as const

const DESC_SIZE_MAP = {
  sm: 'text-xs mt-0.5',
  default: 'text-sm mt-1',
  lg: 'text-md mt-1.5',
} as const

// \u2500\u2500\u2500 Types \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
export type AlertVariant = 'default' | 'outline' | 'filled'
export type AlertColor = 'info' | 'success' | 'warning' | 'error'
export type AlertSize = 'sm' | 'default' | 'lg'

// \u2500\u2500\u2500 Context \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
interface AlertContextValue {
  variant: AlertVariant
  color: AlertColor
  size: AlertSize
}

const AlertContext = React.createContext<AlertContextValue>({
  variant: 'default',
  color: 'info',
  size: 'default',
})

function useAlertContext() {
  return React.useContext(AlertContext)
}

// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
// Alert
// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550

// \u2500\u2500\u2500 AlertRoot \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
export interface AlertRootProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  /** Visual style */
  variant?: AlertVariant
  /** Semantic color (determines icon, colors, and ARIA role) */
  color?: AlertColor
  /** Size */
  size?: AlertSize
  /** Closable \u2014 shows close button */
  closable?: boolean
  /** Close callback */
  onClose?: () => void
  /** Custom close icon */
  closeIcon?: React.ReactNode
  /** Custom status icon (overrides default) */
  icon?: React.ReactNode
  /** Hide the status icon entirely */
  hideIcon?: boolean
}

const AlertRoot = React.forwardRef<HTMLDivElement, AlertRootProps>(
  ({
    className,
    variant = 'default',
    color = 'info',
    size = 'default',
    radius,
    closable = false,
    onClose,
    closeIcon,
    icon,
    hideIcon = false,
    children,
    ...props
  }, ref) => {
    // error \u2192 role="alert" (assertive), others \u2192 role="status" (polite)
    const role = color === 'error' ? 'alert' : 'status'
    const colorClasses = colorMap[color][variant]
    const StatusIcon = STATUS_ICONS[color]

    return (
      <AlertContext.Provider value={{ variant, color, size }}>
        <div
          ref={ref}
          role={role}
          className={cn(
            alertVariants({ size, radius }),
            colorClasses,
            className,
          )}
          {...props}
        >
          {/* Icon */}
          {!hideIcon && (
            <span className="shrink-0">
              {icon || <StatusIcon className={ICON_SIZE_MAP[size]} />}
            </span>
          )}

          {/* Content area */}
          <div className="flex-1 min-w-0">
            {children}
          </div>

          {/* Close button */}
          {closable && (
            <button
              type="button"
              className={cn(
                'shrink-0 rounded-md p-1 opacity-70 hover:opacity-100 transition-opacity focus-visible:focus-ring',
                'group-has-[[data-alert-description]]:absolute',
                size === 'sm'
                  ? 'group-has-[[data-alert-description]]:top-2 group-has-[[data-alert-description]]:right-2'
                  : 'group-has-[[data-alert-description]]:top-3 group-has-[[data-alert-description]]:right-3',
              )}
              onClick={onClose}
              aria-label="Close"
            >
              {closeIcon || <DefaultCloseIcon className="icon-sm" />}
            </button>
          )}
        </div>
      </AlertContext.Provider>
    )
  }
)
AlertRoot.displayName = 'AlertRoot'

// \u2500\u2500\u2500 AlertTitle \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
export interface AlertTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

const AlertTitle = React.forwardRef<HTMLHeadingElement, AlertTitleProps>(
  ({ className, ...props }, ref) => {
    const { size } = useAlertContext()
    return (
      <h5
        ref={ref}
        className={cn(TITLE_SIZE_MAP[size], className)}
        {...props}
      />
    )
  }
)
AlertTitle.displayName = 'AlertTitle'

// \u2500\u2500\u2500 AlertDescription \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
export interface AlertDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const AlertDescription = React.forwardRef<HTMLParagraphElement, AlertDescriptionProps>(
  ({ className, ...props }, ref) => {
    const { variant, size } = useAlertContext()
    return (
      <p
        ref={ref}
        data-alert-description=""
        className={cn(
          DESC_SIZE_MAP[size],
          variant === 'filled' ? 'opacity-90' : 'opacity-80',
          className,
        )}
        {...props}
      />
    )
  }
)
AlertDescription.displayName = 'AlertDescription'

// \u2500\u2500\u2500 Namespace: Alert \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const Alert = Object.assign(AlertRoot, {
  Title: AlertTitle,
  Description: AlertDescription,
})

// eslint-disable-next-line @typescript-eslint/no-namespace
namespace Alert {
  export type RootProps = AlertRootProps
  export type TitleProps = AlertTitleProps
  export type DescriptionProps = AlertDescriptionProps
}

// \u2500\u2500\u2500 Exports \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
export {
  Alert,
  AlertRoot,
  AlertTitle,
  AlertDescription,
  alertVariants,
}
`,
      type: "ui"
    }]
  },
  "avatar": {
    name: "avatar",
    dependencies: ["@radix-ui/react-avatar"],
    registryDependencies: [],
    reverseDependencies: [],
    namespace: true,
    description: "",
    files: [{
      path: "avatar.tsx",
      content: `'use client'

import * as React from 'react'
import * as AvatarPrimitive from '@radix-ui/react-avatar'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// Avatar root variants
const avatarVariants = cva(
  'relative inline-flex items-center justify-center overflow-hidden bg-background-muted select-none',
  {
    variants: {
      size: {
        xs:      'w-6 h-6',        // 24px
        sm:      'w-8 h-8',        // 32px
        default: 'w-10 h-10',      // 40px
        lg:      'w-12 h-12',      // 48px
        xl:      'w-16 h-16',      // 64px
        '2xl':   'w-20 h-20',      // 80px
      },
      shape: {
        circle: 'rounded-full',
        square: 'rounded-xl',
      },
    },
    defaultVariants: { size: 'default', shape: 'circle' },
  }
)

// Status dot sizes per avatar size
const statusDotSizes = {
  xs:      'w-1.5 h-1.5',
  sm:      'w-2 h-2',
  default: 'w-2.5 h-2.5',
  lg:      'w-3 h-3',
  xl:      'w-3.5 h-3.5',
  '2xl':   'w-4 h-4',
}

// Status dot colors
const statusColors = {
  online:  'bg-success',
  offline: 'bg-text-muted',
  busy:    'bg-error',
  away:    'bg-warning',
}

// Fallback font sizes per avatar size
const fallbackFontSizes = {
  xs:      'text-2xs',
  sm:      'text-xs',
  default: 'text-sm',
  lg:      'text-base',
  xl:      'text-xl',
  '2xl':   'text-2xl',
}

// Negative margin per size for AvatarGroup overlap
const groupNegativeMargins = {
  xs:      '-space-x-1.5',
  sm:      '-space-x-2',
  default: '-space-x-2.5',
  lg:      '-space-x-3',
  xl:      '-space-x-4',
  '2xl':   '-space-x-5',
}

// Colorized fallback palette (12 colors \xD7 2 variants) \u2014 exception 13 in TOKEN-EXCEPTIONS.md
const avatarColors = [
  { vivid: { bg: 'bg-[#DC2626]', text: 'text-white' }, soft: { bg: 'bg-[#FEE2E2]', text: 'text-[#DC2626]' } },  // red
  { vivid: { bg: 'bg-[#EA580C]', text: 'text-white' }, soft: { bg: 'bg-[#FFEDD5]', text: 'text-[#EA580C]' } },  // orange
  { vivid: { bg: 'bg-[#D97706]', text: 'text-white' }, soft: { bg: 'bg-[#FEF3C7]', text: 'text-[#B45309]' } },  // amber
  { vivid: { bg: 'bg-[#CA8A04]', text: 'text-white' }, soft: { bg: 'bg-[#FEF9C3]', text: 'text-[#A16207]' } },  // yellow
  { vivid: { bg: 'bg-[#059669]', text: 'text-white' }, soft: { bg: 'bg-[#D1FAE5]', text: 'text-[#047857]' } },  // emerald
  { vivid: { bg: 'bg-[#0D9488]', text: 'text-white' }, soft: { bg: 'bg-[#CCFBF1]', text: 'text-[#0F766E]' } },  // teal
  { vivid: { bg: 'bg-[#0891B2]', text: 'text-white' }, soft: { bg: 'bg-[#CFFAFE]', text: 'text-[#0E7490]' } },  // cyan
  { vivid: { bg: 'bg-[#2563EB]', text: 'text-white' }, soft: { bg: 'bg-[#DBEAFE]', text: 'text-[#1D4ED8]' } },  // blue
  { vivid: { bg: 'bg-[#4F46E5]', text: 'text-white' }, soft: { bg: 'bg-[#E0E7FF]', text: 'text-[#4338CA]' } },  // indigo
  { vivid: { bg: 'bg-[#7C3AED]', text: 'text-white' }, soft: { bg: 'bg-[#EDE9FE]', text: 'text-[#6D28D9]' } },  // violet
  { vivid: { bg: 'bg-[#9333EA]', text: 'text-white' }, soft: { bg: 'bg-[#F3E8FF]', text: 'text-[#7E22CE]' } },  // purple
  { vivid: { bg: 'bg-[#DB2777]', text: 'text-white' }, soft: { bg: 'bg-[#FCE7F3]', text: 'text-[#BE185D]' } },  // pink
] as const

export type AvatarColorVariant = 'vivid' | 'soft'

/** Extract initials from a name string (e.g. "John Doe" \u2192 "JD", "\uAE40\uBBFC\uC218" \u2192 "\uAE40\uBBFC") */
function getAvatarInitials(name: string, maxChars = 2): string {
  const trimmed = name.trim()
  if (!trimmed) return ''

  // CJK: use first character(s) directly
  const cjkRegex = /[\\u3000-\\u9fff\\uac00-\\ud7af\\uff00-\\uffef]/
  if (cjkRegex.test(trimmed.charAt(0))) {
    return trimmed.slice(0, maxChars)
  }

  // Split on spaces, hyphens, underscores, dots
  const parts = trimmed.split(/[\\s\\-_.]+/).filter(Boolean)
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase()
  }

  // First + last part initials
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0))
    .toUpperCase()
    .slice(0, maxChars)
}

/** Hash a name string to a deterministic avatar color pair (djb2 xor variant) */
function getAvatarColor(name: string, variant: AvatarColorVariant = 'vivid') {
  let hash = 5381
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) + hash) ^ name.charCodeAt(i)
  }
  return avatarColors[(hash >>> 0) % avatarColors.length][variant]
}

export type AvatarSize = 'xs' | 'sm' | 'default' | 'lg' | 'xl' | '2xl'
export type AvatarShape = 'circle' | 'square'
export type AvatarStatus = 'online' | 'offline' | 'busy' | 'away'

export interface AvatarProps
  extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>,
    VariantProps<typeof avatarVariants> {
  status?: AvatarStatus
}

const AvatarRoot = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  AvatarProps
>(({ className, size, shape, status, children, ...props }, ref) => {
  const resolvedSize = size || 'default'

  if (!status) {
    return (
      <AvatarPrimitive.Root
        ref={ref}
        className={cn(avatarVariants({ size, shape }), className)}
        {...props}
      >
        {children}
      </AvatarPrimitive.Root>
    )
  }

  // Wrap with an outer span so the status dot is not clipped by overflow-hidden
  return (
    <span className="relative inline-flex">
      <AvatarPrimitive.Root
        ref={ref}
        className={cn(avatarVariants({ size, shape }), className)}
        {...props}
      >
        {children}
      </AvatarPrimitive.Root>
      <span
        className={cn(
          'absolute bottom-0 right-0 rounded-full ring-2 ring-background',
          statusDotSizes[resolvedSize],
          statusColors[status]
        )}
      />
    </span>
  )
})
AvatarRoot.displayName = 'Avatar'

export interface AvatarImageProps
  extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image> {}

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  AvatarImageProps
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn('object-cover w-full h-full', className)}
    {...props}
  />
))
AvatarImage.displayName = 'AvatarImage'

export interface AvatarFallbackProps
  extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback> {
  size?: AvatarSize
  /** Shorthand: auto-generates initials + color from a name. Children override auto-initials. */
  name?: string
  /** Pass a name/key to enable colorized mode. The string is hashed to pick a deterministic color. */
  colorized?: string
  /** Color style: "vivid" (strong bg + white text) or "soft" (pastel bg + dark text). Default: "vivid" */
  colorVariant?: AvatarColorVariant
}

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  AvatarFallbackProps
>(({ className, size, name, colorized, colorVariant = 'vivid', children, ...props }, ref) => {
  const resolvedSize = size || 'default'
  const colorKey = name || colorized
  const color = colorKey ? getAvatarColor(colorKey, colorVariant) : null
  const resolvedChildren = children ?? (name ? getAvatarInitials(name) : undefined)
  return (
    <AvatarPrimitive.Fallback
      ref={ref}
      className={cn(
        'flex items-center justify-center w-full h-full font-semibold',
        color ? [color.bg, color.text] : 'bg-background-muted text-text-muted',
        fallbackFontSizes[resolvedSize],
        className
      )}
      {...props}
    >
      {resolvedChildren}
    </AvatarPrimitive.Fallback>
  )
})
AvatarFallback.displayName = 'AvatarFallback'

export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  max?: number
  size?: AvatarSize
  shape?: AvatarShape
}

const AvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ className, max, size = 'default', shape = 'circle', children, ...props }, ref) => {
    const childArray = React.Children.toArray(children)
    const visibleChildren = max ? childArray.slice(0, max) : childArray
    const overflowCount = max ? childArray.length - max : 0

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center',
          groupNegativeMargins[size],
          '[&>*]:ring-2 [&>*]:ring-background',
          className
        )}
        {...props}
      >
        {visibleChildren}
        {overflowCount > 0 && (
          <AvatarRoot size={size} shape={shape}>
            <AvatarFallback size={size}>+{overflowCount}</AvatarFallback>
          </AvatarRoot>
        )}
      </div>
    )
  }
)
AvatarGroup.displayName = 'AvatarGroup'

// \u2500\u2500\u2500 Namespace \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const Avatar = Object.assign(AvatarRoot, {
  Image: AvatarImage,
  Fallback: AvatarFallback,
  Group: AvatarGroup,
})

// eslint-disable-next-line @typescript-eslint/no-namespace
namespace Avatar {
  export type ImageProps = AvatarImageProps
  export type FallbackProps = AvatarFallbackProps
  export type GroupProps = AvatarGroupProps
}

export { Avatar, AvatarImage, AvatarFallback, AvatarGroup, avatarVariants, avatarColors, getAvatarColor, getAvatarInitials }
`,
      type: "ui"
    }]
  },
  "badge": {
    name: "badge",
    dependencies: ["@radix-ui/react-slot"],
    registryDependencies: [],
    reverseDependencies: [],
    namespace: false,
    description: "",
    files: [{
      path: "badge.tsx",
      content: `'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// Badge color maps for variant \xD7 color combinations
// Uses semantic tokens (*.tint, text-text-*) for v4 dark mode compatibility
const colorMap = {
  default: {
    solid: 'bg-foreground text-background',
    subtle: 'bg-background-muted text-foreground',
    outline: 'border-border text-foreground',
  },
  primary: {
    solid: 'bg-primary text-primary-foreground',
    subtle: 'bg-primary-tint text-text-primary',
    outline: 'border-primary text-text-primary',
  },
  success: {
    solid: 'bg-success text-success-foreground',
    subtle: 'bg-success-tint text-text-success',
    outline: 'border-success text-text-success',
  },
  warning: {
    solid: 'bg-warning text-warning-foreground',
    subtle: 'bg-warning-tint text-text-warning',
    outline: 'border-warning text-text-warning',
  },
  error: {
    solid: 'bg-error text-error-foreground',
    subtle: 'bg-error-tint text-text-error',
    outline: 'border-error text-text-error',
  },
  info: {
    solid: 'bg-info text-info-foreground',
    subtle: 'bg-info-tint text-text-info',
    outline: 'border-info text-text-info',
  },
} as const

const badgeVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap font-semibold transition-colors select-none',
  {
    variants: {
      size: {
        sm: 'h-5 min-w-5 px-1.5 text-2xs gap-1',       // 20px height, 6px paddingX, 11px font
        default: 'h-6 min-w-6 px-2 text-xs gap-1',      // 24px height, 8px paddingX, 12px font
        lg: 'h-7 min-w-7 px-2.5 text-sm gap-1.5',       // 28px height, 10px paddingX, 13px font
      },
      radius: {
        sm: 'rounded-sm',       // 2px
        base: 'rounded',        // 4px
        md: 'rounded-md',       // 6px
        lg: 'rounded-lg',       // 8px
        full: 'rounded-full',   // 9999px
      },
    },
    defaultVariants: {
      size: 'default',
      radius: 'full',
    },
  }
)

// Icon sizes per badge size
const badgeIconSizes = {
  sm: 'icon-2xs',      // 12px
  default: 'icon-2xs', // 12px
  lg: 'icon-xs',       // 14px
} as const

// Dot sizes per badge size
const badgeDotSizes = {
  sm: 'w-1 h-1',
  default: 'w-1.5 h-1.5',
  lg: 'w-1.5 h-1.5',
} as const

// Dot colors per color (matches the solid background)
const dotColorMap = {
  default: 'bg-foreground',
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  error: 'bg-error',
  info: 'bg-info',
} as const

export type BadgeVariant = 'solid' | 'subtle' | 'outline'
export type BadgeColor = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info'
export type BadgeSize = 'sm' | 'default' | 'lg'
export type BadgeRadius = 'sm' | 'base' | 'md' | 'lg' | 'full'

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  /** Visual style */
  variant?: BadgeVariant
  /** Semantic color */
  color?: BadgeColor
  /** Leading icon slot */
  icon?: React.ReactNode
  /** Show a status dot before text */
  dot?: boolean
  /** Show a remove button */
  removable?: boolean
  /** Callback when remove button is clicked */
  onRemove?: () => void
  /** Render as child element (Slot pattern) */
  asChild?: boolean
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({
    className,
    variant = 'subtle',
    color = 'default',
    size,
    radius,
    icon,
    dot = false,
    removable = false,
    onRemove,
    asChild = false,
    children,
    ...props
  }, ref) => {
    const Comp = asChild ? Slot : 'span'
    const resolvedSize = size || 'default'

    // Color classes from variant \xD7 color map
    const colorClasses = colorMap[color][variant]
    // Outline variant needs border
    const outlineClasses = variant === 'outline' ? 'border bg-transparent' : ''

    // Dot color: in solid variant use currentColor (white/foreground), otherwise use semantic color
    const dotColor = variant === 'solid' ? 'bg-current' : dotColorMap[color]

    return (
      <Comp
        ref={ref}
        className={cn(
          badgeVariants({ size, radius }),
          colorClasses,
          outlineClasses,
          className
        )}
        {...props}
      >
        {dot && (
          <span
            className={cn('shrink-0 rounded-full', badgeDotSizes[resolvedSize], dotColor)}
            aria-hidden="true"
          />
        )}
        {icon && (
          <span
            className={cn('shrink-0 [&>svg]:w-full [&>svg]:h-full', badgeIconSizes[resolvedSize])}
            aria-hidden="true"
          >
            {icon}
          </span>
        )}
        {children}
        {removable && (
          <button
            type="button"
            className="shrink-0 -mr-0.5 ml-0.5 rounded-full p-0.5 opacity-70 hover:opacity-100 transition-opacity focus-visible:focus-ring"
            onClick={(e) => {
              e.stopPropagation()
              onRemove?.()
            }}
            aria-label="Remove"
          >
            <svg
              className="w-3 h-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </Comp>
    )
  }
)
Badge.displayName = 'Badge'

export { Badge, badgeVariants }
`,
      type: "ui"
    }]
  },
  "breadcrumb": {
    name: "breadcrumb",
    dependencies: ["@radix-ui/react-slot"],
    registryDependencies: [],
    reverseDependencies: [],
    namespace: true,
    description: "",
    files: [{
      path: "breadcrumb.tsx",
      content: `'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '@/lib/utils'

// \u2500\u2500\u2500 Context \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

type BreadcrumbContextValue = {
  size?: 'sm' | 'default' | 'lg'
  separator?: React.ReactNode
}

const BreadcrumbContext = React.createContext<BreadcrumbContextValue>({})
const useBreadcrumbContext = () => React.useContext(BreadcrumbContext)

// \u2500\u2500\u2500 Default Separator Icon \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  )
}

// \u2500\u2500\u2500 Ellipsis Icon \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

function EllipsisIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <circle cx="6" cy="12" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="18" cy="12" r="1.5" />
    </svg>
  )
}

// \u2500\u2500\u2500 Breadcrumb (Root) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

const breadcrumbSizeMap = {
  sm: { text: 'text-xs', icon: 'icon-xs', gap: 'gap-1.5' },
  default: { text: 'text-sm', icon: 'icon-xs', gap: 'gap-2' },
  lg: { text: 'text-md', icon: 'icon-sm', gap: 'gap-2' },
} as const

export interface BreadcrumbProps extends React.ComponentPropsWithoutRef<'nav'> {
  /** Separator element between items */
  separator?: React.ReactNode
  /** Size of the breadcrumb */
  size?: 'sm' | 'default' | 'lg'
  /** Max items before collapsing (undefined = no collapse) */
  maxItems?: number
  /** Items visible before the ellipsis when collapsed */
  itemsBeforeCollapse?: number
  /** Items visible after the ellipsis when collapsed */
  itemsAfterCollapse?: number
}

const BreadcrumbRoot = React.forwardRef<HTMLElement, BreadcrumbProps>(
  ({ className, separator, size = 'default', ...props }, ref) => (
    <BreadcrumbContext.Provider value={{ size, separator }}>
      <nav
        ref={ref}
        aria-label="breadcrumb"
        className={cn('', className)}
        {...props}
      />
    </BreadcrumbContext.Provider>
  )
)
BreadcrumbRoot.displayName = 'Breadcrumb'

// \u2500\u2500\u2500 BreadcrumbList \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

const BreadcrumbList = React.forwardRef<HTMLOListElement, React.ComponentPropsWithoutRef<'ol'>>(
  ({ className, ...props }, ref) => {
    const { size = 'default' } = useBreadcrumbContext()
    const sizeClass = breadcrumbSizeMap[size]
    return (
      <ol
        ref={ref}
        className={cn(
          'flex flex-wrap items-center',
          sizeClass.gap,
          sizeClass.text,
          'text-text-muted',
          className
        )}
        {...props}
      />
    )
  }
)
BreadcrumbList.displayName = 'BreadcrumbList'

// \u2500\u2500\u2500 BreadcrumbItem \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

const BreadcrumbItem = React.forwardRef<HTMLLIElement, React.ComponentPropsWithoutRef<'li'>>(
  ({ className, ...props }, ref) => (
    <li
      ref={ref}
      className={cn('inline-flex items-center gap-1.5', className)}
      {...props}
    />
  )
)
BreadcrumbItem.displayName = 'BreadcrumbItem'

// \u2500\u2500\u2500 BreadcrumbLink \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

export interface BreadcrumbLinkProps extends React.ComponentPropsWithoutRef<'a'> {
  /** Use Radix Slot to compose with custom link components */
  asChild?: boolean
}

const BreadcrumbLink = React.forwardRef<HTMLAnchorElement, BreadcrumbLinkProps>(
  ({ asChild, className, ...props }, ref) => {
    const Comp = asChild ? Slot : 'a'
    return (
      <Comp
        ref={ref}
        className={cn(
          'transition-colors duration-fast hover:text-foreground',
          className
        )}
        {...props}
      />
    )
  }
)
BreadcrumbLink.displayName = 'BreadcrumbLink'

// \u2500\u2500\u2500 BreadcrumbPage \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

const BreadcrumbPage = React.forwardRef<HTMLSpanElement, React.ComponentPropsWithoutRef<'span'>>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn('text-foreground', className)}
      {...props}
    />
  )
)
BreadcrumbPage.displayName = 'BreadcrumbPage'

// \u2500\u2500\u2500 BreadcrumbSeparator \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

const BreadcrumbSeparator = React.forwardRef<HTMLLIElement, React.ComponentPropsWithoutRef<'li'>>(
  ({ children, className, ...props }, ref) => {
    const { separator, size = 'default' } = useBreadcrumbContext()
    const sizeClass = breadcrumbSizeMap[size]
    return (
      <li
        ref={ref}
        role="presentation"
        aria-hidden="true"
        className={cn('flex items-center text-text-subtle', className)}
        {...props}
      >
        {children ?? separator ?? <ChevronRightIcon className={sizeClass.icon} />}
      </li>
    )
  }
)
BreadcrumbSeparator.displayName = 'BreadcrumbSeparator'

// \u2500\u2500\u2500 BreadcrumbEllipsis \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

export interface BreadcrumbEllipsisProps extends React.ComponentPropsWithoutRef<'span'> {}

const BreadcrumbEllipsis = React.forwardRef<HTMLSpanElement, BreadcrumbEllipsisProps>(
  ({ className, ...props }, ref) => {
    const { size = 'default' } = useBreadcrumbContext()
    const sizeClass = breadcrumbSizeMap[size]
    return (
      <span
        ref={ref}
        role="presentation"
        aria-hidden="true"
        className={cn('flex items-center justify-center', className)}
        {...props}
      >
        <EllipsisIcon className={sizeClass.icon} />
        <span className="sr-only">More</span>
      </span>
    )
  }
)
BreadcrumbEllipsis.displayName = 'BreadcrumbEllipsis'

// \u2500\u2500\u2500 Exports \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

// \u2500\u2500\u2500 Namespace \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const Breadcrumb = Object.assign(BreadcrumbRoot, {
  List: BreadcrumbList,
  Item: BreadcrumbItem,
  Link: BreadcrumbLink,
  Page: BreadcrumbPage,
  Separator: BreadcrumbSeparator,
  Ellipsis: BreadcrumbEllipsis,
})

// eslint-disable-next-line @typescript-eslint/no-namespace
namespace Breadcrumb {
  export type LinkProps = BreadcrumbLinkProps
  export type EllipsisProps = BreadcrumbEllipsisProps
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
  breadcrumbSizeMap,
}
`,
      type: "ui"
    }]
  },
  "button-group": {
    name: "button-group",
    dependencies: [],
    registryDependencies: [],
    reverseDependencies: ["button"],
    namespace: false,
    description: "",
    files: [{
      path: "button-group.tsx",
      content: `'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

// ButtonGroup Context
type ButtonGroupContextValue = {
  variant?: 'outline' | 'ghost'
  size?: 'xs' | 'sm' | 'md' | 'default' | 'lg'
  radius?: 'none' | 'sm' | 'base' | 'default' | 'lg' | 'xl' | '2xl' | '3xl' | 'full'
  fontWeight?: 'normal' | 'semibold'
  disabled?: boolean
}

const ButtonGroupContext = React.createContext<ButtonGroupContextValue | null>(null)

export function useButtonGroup() {
  return React.useContext(ButtonGroupContext)
}

export interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical'
  attached?: boolean
  variant?: 'outline' | 'ghost'
  size?: 'xs' | 'sm' | 'md' | 'default' | 'lg'
  radius?: 'none' | 'sm' | 'base' | 'default' | 'lg' | 'xl' | '2xl' | '3xl' | 'full'
  fontWeight?: 'normal' | 'semibold'
  disabled?: boolean
}

const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({
    className,
    orientation = 'horizontal',
    attached = true,
    variant,
    size,
    radius,
    fontWeight,
    disabled,
    children,
    ...props
  }, ref) => {
    const contextValue = React.useMemo(() => ({
      variant,
      size,
      radius,
      fontWeight,
      disabled,
    }), [variant, size, radius, fontWeight, disabled])

    return (
      <ButtonGroupContext.Provider value={contextValue}>
        <div
          ref={ref}
          role="group"
          className={cn(
            'inline-flex',
            orientation === 'vertical' ? 'flex-col' : 'flex-row',
            // Attached mode: use negative margin to overlap borders, raise z-index on hover/focus
            attached && orientation === 'horizontal' && [
              '[&>*:not(:first-child)]:rounded-l-none',
              '[&>*:not(:last-child)]:rounded-r-none',
              '[&>*:not(:first-child)]:-ml-px',
              '[&>*]:relative',
              '[&>*:hover]:z-10',
              '[&>*:focus-visible]:z-10',
              '[&>*:active]:scale-none',
              '[&>*:hover]:border-border',
            ],
            attached && orientation === 'vertical' && [
              '[&>*:not(:first-child)]:rounded-t-none',
              '[&>*:not(:last-child)]:rounded-b-none',
              '[&>*:not(:first-child)]:-mt-px',
              '[&>*]:relative',
              '[&>*]:w-full',
              '[&>*:hover]:z-10',
              '[&>*:focus-visible]:z-10',
              '[&>*:active]:scale-none',
              '[&>*:hover]:border-border',
            ],
            !attached && 'gap-2',
            className
          )}
          {...props}
        >
          {children}
        </div>
      </ButtonGroupContext.Provider>
    )
  }
)
ButtonGroup.displayName = 'ButtonGroup'

export { ButtonGroup }
`,
      type: "ui"
    }]
  },
  "button": {
    name: "button",
    dependencies: ["@radix-ui/react-slot"],
    registryDependencies: ["button-group"],
    reverseDependencies: [],
    namespace: false,
    description: "",
    files: [{
      path: "button.tsx",
      content: `'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { useButtonGroup } from './button-group'

// Solid color maps (applied when variant="solid")
const solidColorMap = {
  default: 'bg-foreground text-background hover:bg-foreground/90 active:bg-foreground/80',
  primary: 'bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary-hover active:bg-secondary-active',
  destructive: 'bg-error text-error-foreground hover:bg-error-hover active:bg-error-active',
} as const

export type ButtonColor = keyof typeof solidColorMap

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap transition-all duration-micro focus-visible:focus-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        solid: 'font-semibold',
        outline: 'border border-border bg-background text-foreground hover:bg-background-muted font-normal',
        ghost: 'text-foreground hover:bg-background-muted font-normal',
        link: 'text-text-link underline-offset-4 hover:underline font-normal',
      },
      size: {
        xs: 'h-7 px-2.5 text-xs gap-1',     // 28px height, 10px paddingX, 12px font
        sm: 'h-8 px-3 text-sm gap-2',       // 32px height, 12px paddingX, 13px font
        md: 'h-9 px-3.5 text-md gap-2',     // 36px height, 14px paddingX, 14px font
        default: 'h-10 px-4 text-md gap-2', // 40px height, 16px paddingX, 14px font
        lg: 'h-12 px-6 text-base gap-2',    // 48px height, 24px paddingX, 16px font
        icon: 'h-10 w-10',
      },
      radius: {
        none: 'rounded-none',      // 0px - primitive.borderRadius.none
        sm: 'rounded-sm',          // 2px - primitive.borderRadius.sm
        base: 'rounded',           // 4px - primitive.borderRadius.base
        default: 'rounded-md',     // 6px - primitive.borderRadius.md (Figma button default)
        lg: 'rounded-lg',          // 8px - primitive.borderRadius.lg
        xl: 'rounded-xl',          // 12px - primitive.borderRadius.xl
        '2xl': 'rounded-2xl',      // 16px - primitive.borderRadius.2xl
        '3xl': 'rounded-3xl',      // 24px - primitive.borderRadius.3xl
        full: 'rounded-full',      // 9999px - primitive.borderRadius.full
      },
      fullWidth: {
        true: 'w-full',
        false: 'w-auto',
      },
    },
    defaultVariants: {
      variant: 'solid',
      size: 'default',
      radius: 'default',
      fullWidth: false,
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Solid variant color */
  color?: ButtonColor
  asChild?: boolean
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  selected?: boolean
  fontWeight?: 'normal' | 'semibold'
  pressEffect?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant: variantProp,
    color: colorProp,
    size: sizeProp,
    radius: radiusProp,
    fullWidth,
    asChild = false,
    loading = false,
    disabled: disabledProp,
    leftIcon,
    rightIcon,
    selected = false,
    fontWeight: fontWeightProp,
    pressEffect,
    children,
    ...props
  }, ref) => {
    const Comp = asChild ? Slot : 'button'
    const groupContext = useButtonGroup()

    // Use context values as fallback, individual props take precedence
    const variant = variantProp ?? groupContext?.variant ?? 'solid'
    const color = colorProp ?? 'default'
    const size = sizeProp ?? groupContext?.size
    const radius = radiusProp ?? groupContext?.radius
    const disabled = disabledProp ?? groupContext?.disabled

    // Priority: direct prop > ButtonGroup context > variant default (no class)
    const fontWeight = fontWeightProp ?? groupContext?.fontWeight

    // FontWeight class (overrides variant default)
    const fontWeightClass = fontWeight === 'normal' ? 'font-normal' : fontWeight === 'semibold' ? 'font-semibold' : ''

    // Icon size for button with text (5-step scale)
    // xs~sm: 14px, md~default~lg: 16px
    const iconSizeClass = {
      xs: 'icon-xs',      // 14px
      sm: 'icon-xs',      // 14px
      md: 'icon-sm',      // 16px
      default: 'icon-sm', // 16px
      lg: 'icon-sm',      // 16px
      icon: 'icon-md',    // icon-only \u2192 20px
    }[size || 'default']

    // Selected styles by variant (used in ButtonGroup)
    const selectedStyles = selected ? (
      variant === 'outline' ? 'bg-background-muted' :
      variant === 'ghost' ? 'font-semibold' : ''
    ) : ''

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, radius, fullWidth }), variant === 'solid' && solidColorMap[color], pressEffect !== false && 'active:scale-pressed', fontWeightClass, selectedStyles, className)}
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        aria-pressed={selected || undefined}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className={cn(iconSizeClass, 'animate-spin')}
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>{children}</span>
          </>
        ) : (
          <>
            {leftIcon && <span className={cn(iconSizeClass, '[&>svg]:w-full [&>svg]:h-full')} aria-hidden="true">{leftIcon}</span>}
            {children}
            {rightIcon && <span className={cn(iconSizeClass, '[&>svg]:w-full [&>svg]:h-full')} aria-hidden="true">{rightIcon}</span>}
          </>
        )}
      </Comp>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
`,
      type: "ui"
    }]
  },
  "card": {
    name: "card",
    dependencies: ["@radix-ui/react-slot"],
    registryDependencies: [],
    reverseDependencies: [],
    namespace: true,
    description: "",
    files: [{
      path: "card.tsx",
      content: `'use client'
/* eslint-disable @next/next/no-img-element */

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// \u2500\u2500 Context for size propagation \u2500\u2500
type CardSize = 'sm' | 'default' | 'lg'
type CardDirection = 'vertical' | 'horizontal'

const CardContext = React.createContext<{ size: CardSize; direction: CardDirection }>({
  size: 'default',
  direction: 'vertical',
})

function useCard() {
  return React.useContext(CardContext)
}

// \u2500\u2500 Card (Root) \u2500\u2500
const cardVariants = cva(
  'flex overflow-hidden transition-all duration-normal',
  {
    variants: {
      variant: {
        default: 'bg-background-paper border border-border-subtle shadow-sm',
        outline: 'bg-background-paper border border-border',
        ghost: 'bg-transparent',
      },
      size: {
        sm: '',
        default: '',
        lg: '',
      },
      radius: {
        sm: 'rounded-sm',       // 2px
        base: 'rounded',        // 4px
        md: 'rounded-md',       // 6px
        lg: 'rounded-lg',       // 8px
        xl: 'rounded-xl',       // 12px
        '2xl': 'rounded-2xl',   // 16px
      },
      direction: {
        vertical: 'flex-col',
        horizontal: 'flex-row',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      radius: 'xl',
      direction: 'vertical',
    },
  }
)

export type CardVariant = 'default' | 'outline' | 'ghost'
export type CardRadius = 'sm' | 'base' | 'md' | 'lg' | 'xl' | '2xl'

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  /** Visual style */
  variant?: CardVariant
  /** Content padding scale */
  size?: CardSize
  /** Border radius */
  radius?: CardRadius
  /** Layout direction */
  direction?: CardDirection
  /** Enable hover effect for interactive cards */
  interactive?: boolean
  /** Render as child element (Slot pattern) */
  asChild?: boolean
}

const CardRoot = React.forwardRef<HTMLDivElement, CardProps>(
  ({
    className,
    variant = 'default',
    size = 'default',
    radius = 'xl',
    direction = 'vertical',
    interactive = false,
    asChild = false,
    children,
    ...props
  }, ref) => {
    const Comp = asChild ? Slot : 'div'

    // Horizontal: separate CardImage from rest, wrap rest in flex-col
    let content = children
    if (direction === 'horizontal') {
      const childArray = React.Children.toArray(children)
      const imageChildren: React.ReactNode[] = []
      const otherChildren: React.ReactNode[] = []

      childArray.forEach((child) => {
        if (React.isValidElement(child) && child.type === CardImage) {
          imageChildren.push(child)
        } else {
          otherChildren.push(child)
        }
      })

      content = (
        <>
          {imageChildren}
          <div className="flex-1 flex flex-col min-w-0">
            {otherChildren}
          </div>
        </>
      )
    }

    return (
      <CardContext.Provider value={{ size, direction }}>
        <Comp
          ref={ref}
          className={cn(
            cardVariants({ variant, size, radius, direction }),
            interactive && 'cursor-pointer hover:shadow-md hover:-translate-y-0.5',
            className
          )}
          {...props}
        >
          {content}
        </Comp>
      </CardContext.Provider>
    )
  }
)
CardRoot.displayName = 'Card'

// \u2500\u2500 Size-based padding map (responsive: mobile \u2192 desktop) \u2500\u2500
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const sizePaddingMap = {
  sm: 'p-4',                // 16px
  default: 'p-4 sm:p-6',   // 16px \u2192 24px
  lg: 'p-6 sm:p-8',        // 24px \u2192 32px
} as const

const sizePaddingXMap = {
  sm: 'px-4',               // 16px
  default: 'px-4 sm:px-6',  // 16px \u2192 24px
  lg: 'px-6 sm:px-8',       // 24px \u2192 32px
} as const

const sizePaddingYMap = {
  sm: 'py-3',               // 12px
  default: 'py-3 sm:py-4',  // 12px \u2192 16px
  lg: 'py-4 sm:py-5',       // 16px \u2192 20px
} as const

// Top padding for CardHeader \u2014 optical balance (top >= sides)
const sizePaddingTMap = {
  sm: 'pt-5',               // 20px
  default: 'pt-5 sm:pt-6',  // 20px \u2192 24px
  lg: 'pt-6 sm:pt-8',       // 24px \u2192 32px
} as const

// Inner bottom padding (between sections) \u2014 tighter than outer
const sizeInnerPbMap = {
  sm: 'pb-3',               // 12px
  default: 'pb-3 sm:pb-4',  // 12px \u2192 16px
  lg: 'pb-3 sm:pb-4',       // 12px \u2192 16px (default\uC640 \uB3D9\uC77C)
} as const

// Last-child bottom padding for CardContent (when no footer) \u2014 match pt
const sizeLastPbMap = {
  sm: 'last:pb-5',                    // 20px
  default: 'last:pb-5 sm:last:pb-6',  // 20px \u2192 24px
  lg: 'last:pb-6 sm:last:pb-8',       // 24px \u2192 32px
} as const

// \u2500\u2500 CardImage \u2500\u2500
// Overlay opacity to Tailwind class mapping
const overlayOpacityMap: Record<number, string> = {
  10: 'from-black/10',
  20: 'from-black/20',
  30: 'from-black/30',
  40: 'from-black/40',
  50: 'from-black/50',
  60: 'from-black/60',
  70: 'from-black/70',
  80: 'from-black/80',
  90: 'from-black/90',
}

export interface CardImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** Gradient overlay on image */
  overlay?: boolean
  /** Overlay opacity (10\u201390). Default: 60 */
  overlayOpacity?: number
  /** Custom class for overlay gradient (overrides overlayOpacity) */
  overlayClassName?: string
}

const CardImage = React.forwardRef<HTMLImageElement, CardImageProps>(
  ({ className, overlay = false, overlayOpacity = 60, overlayClassName, alt = '', ...props }, ref) => {
    const { direction } = useCard()
    const isHorizontal = direction === 'horizontal'

    // Horizontal: use absolute positioning so the image fills the
    // wrapper height which is determined by the content side via
    // flexbox align-items:stretch (default).
    if (isHorizontal) {
      const opacityClass = overlay
        ? (overlayOpacityMap[overlayOpacity] || 'from-black/60')
        : null

      return (
        <div className={cn('relative shrink-0 w-48 overflow-hidden', className)}>
          <img
            ref={ref}
            alt={alt}
            className="absolute inset-0 w-full h-full object-cover"
            {...props}
          />
          {overlay && (
            <div className={cn('absolute inset-0 bg-gradient-to-t to-transparent', overlayClassName || opacityClass)} />
          )}
        </div>
      )
    }

    // Vertical
    if (overlay) {
      const opacityClass = overlayOpacityMap[overlayOpacity] || 'from-black/60'

      return (
        <div className="relative w-full shrink-0 overflow-hidden">
          <img
            ref={ref}
            alt={alt}
            className={cn('w-full object-cover', className)}
            {...props}
          />
          <div className={cn('absolute inset-0 bg-gradient-to-t to-transparent', overlayClassName || opacityClass)} />
        </div>
      )
    }

    return (
      <img
        ref={ref}
        alt={alt}
        className={cn('w-full object-cover shrink-0', className)}
        {...props}
      />
    )
  }
)
CardImage.displayName = 'CardImage'

// \u2500\u2500 CardHeader \u2500\u2500
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, children, ...props }, ref) => {
    const { size } = useCard()

    // Separate CardAction from other children for proper flex layout
    const childArray = React.Children.toArray(children)
    const actionChildren: React.ReactNode[] = []
    const otherChildren: React.ReactNode[] = []

    childArray.forEach((child) => {
      if (React.isValidElement(child) && child.type === CardAction) {
        actionChildren.push(child)
      } else {
        otherChildren.push(child)
      }
    })

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-start gap-3',
          sizePaddingXMap[size],
          sizePaddingTMap[size],
          sizeInnerPbMap[size],
          sizeLastPbMap[size],
          className
        )}
        {...props}
      >
        <div className="flex-1 min-w-0 space-y-3">
          {otherChildren}
        </div>
        {actionChildren}
      </div>
    )
  }
)
CardHeader.displayName = 'CardHeader'

// \u2500\u2500 CardTitle \u2500\u2500
export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /** Leading icon */
  icon?: React.ReactNode
}

const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, icon, children, ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={cn(
          'font-semibold text-foreground leading-none tracking-tight',
          icon && 'flex items-center gap-2',
          className
        )}
        {...props}
      >
        {icon && (
          <span className="shrink-0 icon-sm [&>svg]:w-full [&>svg]:h-full" aria-hidden="true">
            {icon}
          </span>
        )}
        {children}
      </h3>
    )
  }
)
CardTitle.displayName = 'CardTitle'

// \u2500\u2500 CardDescription \u2500\u2500
export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn('text-sm text-text-muted', className)}
        {...props}
      />
    )
  }
)
CardDescription.displayName = 'CardDescription'

// \u2500\u2500 CardAction \u2500\u2500
export interface CardActionProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardAction = React.forwardRef<HTMLDivElement, CardActionProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('shrink-0 ml-auto -mr-2 -mt-2', className)}
        {...props}
      />
    )
  }
)
CardAction.displayName = 'CardAction'

// \u2500\u2500 CardContent \u2500\u2500
export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => {
    const { size } = useCard()

    return (
      <div
        ref={ref}
        className={cn(sizePaddingXMap[size], 'pb-0', sizeLastPbMap[size], className)}
        {...props}
      />
    )
  }
)
CardContent.displayName = 'CardContent'

// \u2500\u2500 CardFooter \u2500\u2500
export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, ref) => {
    const { size } = useCard()

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center gap-2',
          sizePaddingXMap[size],
          sizePaddingYMap[size],
          'mt-auto',
          className
        )}
        {...props}
      />
    )
  }
)
CardFooter.displayName = 'CardFooter'

// \u2500\u2500\u2500 Namespace \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const Card = Object.assign(CardRoot, {
  Image: CardImage,
  Header: CardHeader,
  Title: CardTitle,
  Description: CardDescription,
  Action: CardAction,
  Content: CardContent,
  Footer: CardFooter,
})

// eslint-disable-next-line @typescript-eslint/no-namespace
namespace Card {
  export type ImageProps = CardImageProps
  export type HeaderProps = CardHeaderProps
  export type TitleProps = CardTitleProps
  export type DescriptionProps = CardDescriptionProps
  export type ActionProps = CardActionProps
  export type ContentProps = CardContentProps
  export type FooterProps = CardFooterProps
}

export {
  Card,
  CardImage,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
  cardVariants,
}
`,
      type: "ui"
    }]
  },
  "chart": {
    name: "chart",
    dependencies: ["recharts"],
    registryDependencies: [],
    reverseDependencies: [],
    namespace: true,
    description: "",
    aliases: ["bar-chart", "line-chart", "area-chart", "pie-chart"],
    files: [{
      path: "chart.tsx",
      content: `'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */

import * as React from 'react'
import * as RechartsPrimitive from 'recharts'
import { cn } from '@/lib/utils'

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: '', dark: '.dark' } as const

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  )
}

type ChartContextProps = {
  config: ChartConfig
  // Hover fade state
  hoverFade: boolean
  activeIndex: number | null
  setActiveIndex: (index: number | null) => void
  // Series-level hover fade (used by ChartLine)
  activeDataKey: string | null
  setActiveDataKey: (key: string | null) => void
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)
  if (!context) {
    throw new Error('useChart must be used within a <ChartContainer />')
  }
  return context
}

function ChartContainer({
  id,
  className,
  children,
  config,
  hoverFade = false,
  ...props
}: React.ComponentProps<'div'> & {
  config: ChartConfig
  /** Enable hover-to-highlight: hovered bar group stays full opacity, others fade. */
  hoverFade?: boolean
  children: React.ComponentProps<
    typeof RechartsPrimitive.ResponsiveContainer
  >['children']
}) {
  const uniqueId = React.useId()
  const chartId = \`chart-\${id || uniqueId.replace(/:/g, '')}\`
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null)
  const [activeDataKey, setActiveDataKey] = React.useState<string | null>(null)

  return (
    <ChartContext.Provider value={{ config, hoverFade, activeIndex, setActiveIndex, activeDataKey, setActiveDataKey }}>
      <div
        data-slot="chart"
        data-chart={chartId}
        onMouseLeave={hoverFade ? () => { setActiveIndex(null); setActiveDataKey(null) } : undefined}
        className={cn(
          'flex aspect-video w-full justify-center text-xs outline-none [&_*]:outline-none',
          // Responsive axis tick font-size \u2014 consumed by ChartXAxis / ChartYAxis via var()
          '[--chart-axis-fs:var(--font-size-2xs)] sm:[--chart-axis-fs:var(--font-size-xs)]',
          // Recharts element overrides \u2014 use arbitrary properties for v3/v4 compat
          '[&_.recharts-cartesian-axis-tick_text]:[fill:var(--color-text-muted)]',
          "[&_.recharts-cartesian-grid_line[stroke='#ccc']]:[stroke:var(--color-border)]",
          '[&_.recharts-cartesian-grid_line]:[stroke-dasharray:3_3]',
          '[&_.recharts-curve.recharts-tooltip-cursor]:[stroke:var(--color-border)]',
          "[&_.recharts-dot[stroke='#fff']]:stroke-transparent",
          '[&_.recharts-layer]:outline-none',
          "[&_.recharts-polar-grid_[stroke='#ccc']]:[stroke:var(--color-border)]",
          '[&_.recharts-radial-bar-background-sector]:[fill:var(--color-background-muted)]',
          '[&_.recharts-rectangle.recharts-tooltip-cursor]:[fill:transparent]',
          "[&_.recharts-reference-line_[stroke='#ccc']]:[stroke:var(--color-border)]",
          '[&_.recharts-sector]:outline-none',
          "[&_.recharts-sector[stroke='#fff']]:stroke-transparent",
          '[&_.recharts-surface]:outline-none',
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
}

// Tooltip fade-in keyframe \u2014 injected once per chart via ChartStyle
const CHART_TOOLTIP_KEYFRAME = '@keyframes chart-tooltip-in{from{opacity:0}to{opacity:1}}'

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([, config]) => config.theme || config.color
  )

  const colorCss = colorConfig.length
    ? Object.entries(THEMES)
        .map(
          ([theme, prefix]) => \`
\${prefix} [data-chart=\${id}] {
\${colorConfig
  .map(([key, itemConfig]) => {
    const color =
      itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ||
      itemConfig.color
    return color ? \`  --color-\${key}: \${color};\` : null
  })
  .join('\\n')}
}
\`
        )
        .join('\\n')
    : ''

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: CHART_TOOLTIP_KEYFRAME + colorCss,
      }}
    />
  )
}

// \u2500\u2500\u2500 ChartBar \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

export type ChartBarRadius = 'none' | 'sm' | 'base' | 'md' | 'lg'
export type ChartBarVariant = 'solid' | 'outline'

// TOKEN-EXCEPTION: SVG fillOpacity requires numeric value.
// Matches --opacity-35 token (0.35).
const CHART_HOVER_FADE_OPACITY = 0.35

// Fade transition for hover effect \u2014 uses --duration-fast token via CSS variable
const CHART_FADE_TRANSITION = { transition: 'fill-opacity var(--duration-fast) ease-out, stroke-opacity var(--duration-fast) ease-out' } as const

// TOKEN-EXCEPTION: Recharts Bar radius is an SVG attribute \u2014 CSS variables not supported.
// Values mirror --radius-* tokens from variables.css.
const CHART_BAR_RADIUS_MAP: Record<ChartBarRadius, number> = {
  none: 0, // --radius-none: 0px
  sm:   2, // --radius-sm:   2px
  base: 4, // --radius-base: 4px
  md:   6, // --radius-md:   6px
  lg:   8, // --radius-lg:   8px
}

type ChartBarProps = Omit<React.ComponentProps<typeof RechartsPrimitive.Bar>, 'radius'> & {
  /** Named radius token. Auto-adapts corners based on layout and stack position. */
  radius?: ChartBarRadius
  /** 'horizontal' rounds the right side (away from Y-axis). Default: 'vertical' */
  layout?: 'vertical' | 'horizontal'
  /** 'bottom' rounds the bottom corners (base of a stack). Default: 'top' */
  stackPosition?: 'top' | 'bottom'
  /** 'outline' renders a thick border with a semi-transparent fill. Default: 'solid' */
  variant?: ChartBarVariant
}

function ChartBar({
  radius = 'none',
  layout = 'vertical',
  stackPosition = 'top',
  variant = 'solid',
  fill,
  stackId,
  ...props
}: ChartBarProps) {
  const { hoverFade, activeIndex, setActiveIndex } = useChart()
  const r = CHART_BAR_RADIUS_MAP[radius]
  const isStacked = !!stackId || stackPosition === 'bottom'
  const appliedRadius: number | [number, number, number, number] =
    r === 0                                           ? 0
    : variant === 'outline' && !isStacked             ? r                  // outline standalone: all 4 corners (works for negative bars too)
    : layout === 'horizontal' && stackPosition === 'bottom' ? 0           // stacked horiz inner: all flat (connects to next bar)
    : layout === 'horizontal'                         ? [0, r, r, 0]      // horiz tip: right corners
    : stackPosition === 'bottom'                      ? 0                 // vertical stacked base: all flat (sits on axis, top connects to next bar)
    :                                                   [r, r, 0, 0]      // default vertical: top corners only

  // TOKEN-EXCEPTION: SVG stroke is centered by default (half inside, half outside).
  // Custom shape renders an inset rect so the stroke stays fully inside the bar bounds.
  const outlineShape = React.useCallback((shapeProps: RechartsPrimitive.BarShapeProps & { x?: number; y?: number; width?: number; height?: number; index?: number }) => {
    const x = shapeProps.x ?? 0
    const y = shapeProps.y ?? 0
    const width = shapeProps.width ?? 0
    const height = shapeProps.height ?? 0
    if (!width || !height || width <= 0 || height <= 0) return <g />
    const sw = 2
    const inset = sw / 2
    const rx = typeof appliedRadius === 'number' ? Math.max(0, appliedRadius - inset) : 0
    // Hover fade: modulate base outline opacity (fill: 0.4, stroke: 1.0)
    const fadeMultiplier = hoverFade && activeIndex !== null && shapeProps.index !== activeIndex ? CHART_HOVER_FADE_OPACITY : 1
    return (
      <rect
        x={x + inset}
        y={y + inset}
        width={Math.max(0, width - sw)}
        height={Math.max(0, height - sw)}
        rx={rx}
        fill={fill}
        fillOpacity={0.4 * fadeMultiplier}
        stroke={fill}
        strokeOpacity={fadeMultiplier}
        strokeWidth={sw}
        style={hoverFade ? CHART_FADE_TRANSITION : undefined}
      />
    )
  }, [appliedRadius, fill, hoverFade, activeIndex])

  // Solid variant hover-fade shape: renders Rectangle with per-bar opacity
  const solidHoverShape = React.useCallback((shapeProps: any) => {
    const opacity = activeIndex === null ? 1 : shapeProps.index === activeIndex ? 1 : CHART_HOVER_FADE_OPACITY
    return (
      <RechartsPrimitive.Rectangle
        {...shapeProps}
        fillOpacity={opacity}
        style={CHART_FADE_TRANSITION}
      />
    )
  }, [activeIndex])

  // Determine which shape function to use
  const useOutline = variant === 'outline' && !isStacked
  const needsHoverShape = hoverFade && variant === 'solid' && !useOutline

  return (
    <RechartsPrimitive.Bar
      radius={appliedRadius}
      fill={fill}
      stackId={stackId}
      // Disable Recharts animation to prevent label/total flicker on hover
      {...(hoverFade && { isAnimationActive: false })}
      {...(useOutline && { shape: outlineShape as any })}
      {...(needsHoverShape && { shape: solidHoverShape as any })}
      {...(hoverFade && { onMouseEnter: (_: unknown, index: number) => setActiveIndex(index) })}
      {...props}
    />
  )
}

// \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

// Wrapper: kill position-slide so tooltip appears at the hovered bar instantly.
// Smooth appearance is handled by CSS fade on ChartTooltipContent instead.
function ChartTooltip(props: React.ComponentProps<typeof RechartsPrimitive.Tooltip>) {
  return <RechartsPrimitive.Tooltip animationDuration={0} {...props} />
}

// Recharts 3.x injects these props at runtime via content render prop.
// We define explicit types instead of deriving from RechartsPrimitive.Tooltip.
type TooltipPayloadItem = {
  dataKey?: string | number
  name?: string
  value?: number | string
  type?: string
  color?: string
  payload?: Record<string, unknown>
  fill?: string
}

type ChartTooltipContentProps = React.ComponentProps<'div'> & {
  active?: boolean
  payload?: TooltipPayloadItem[]
  label?: string
  labelFormatter?: (value: unknown, payload: TooltipPayloadItem[]) => React.ReactNode
  labelClassName?: string
  formatter?: (value: unknown, name: string, item: TooltipPayloadItem, index: number, payload: Record<string, unknown>) => React.ReactNode
  color?: string
  hideLabel?: boolean
  hideIndicator?: boolean
  indicator?: 'line' | 'dot' | 'dashed'
  nameKey?: string
  labelKey?: string
}

function ChartTooltipContent({
  active,
  payload,
  className,
  indicator = 'dot',
  hideLabel = false,
  hideIndicator = false,
  label,
  labelFormatter,
  labelClassName,
  formatter,
  color,
  nameKey,
  labelKey,
}: ChartTooltipContentProps) {
  const { config } = useChart()

  const tooltipLabel = React.useMemo(() => {
    if (hideLabel || !payload?.length) {
      return null
    }

    const [item] = payload
    const key = \`\${labelKey || item?.dataKey || item?.name || 'value'}\`
    const itemConfig = getPayloadConfigFromPayload(config, item, key)
    const value =
      !labelKey && typeof label === 'string'
        ? config[label as keyof typeof config]?.label || label
        : itemConfig?.label

    if (labelFormatter) {
      return (
        <div className={cn('font-semibold', labelClassName)}>
          {labelFormatter(value, payload)}
        </div>
      )
    }

    if (!value) {
      return null
    }

    return <div className={cn('font-semibold', labelClassName)}>{value}</div>
  }, [label, labelFormatter, payload, hideLabel, labelClassName, config, labelKey])

  if (!active || !payload?.length) {
    return null
  }

  const nestLabel = payload.length === 1 && indicator !== 'dot'

  return (
    <div
      className={cn(
        'grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs shadow-xl',
        className
      )}
      style={{ animation: 'chart-tooltip-in var(--duration-slow) ease-out' }}
    >
      {!nestLabel ? tooltipLabel : null}
      <div className="grid gap-1.5">
        {payload
          .filter((item: TooltipPayloadItem) => item.type !== 'none')
          .map((item: TooltipPayloadItem, index: number) => {
            const key = \`\${nameKey || item.name || item.dataKey || 'value'}\`
            const itemConfig = getPayloadConfigFromPayload(config, item, key)
            const indicatorColor = color || (item.payload as Record<string, unknown>)?.fill as string || item.color

            return (
              <div
                key={item.dataKey}
                className={cn(
                  'flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-text-muted',
                  indicator === 'dot' && 'items-center'
                )}
              >
                {formatter && item?.value !== undefined && item.name ? (
                  formatter(item.value, item.name, item, index, item.payload as Record<string, unknown>)
                ) : (
                  <>
                    {itemConfig?.icon ? (
                      <itemConfig.icon />
                    ) : (
                      !hideIndicator && (
                        <div
                          className={cn(
                            'shrink-0 rounded-sm',
                            {
                              'h-2.5 w-2.5': indicator === 'dot',
                              'w-1': indicator === 'line',
                              'w-0 border-[1.5px] border-dashed bg-transparent':
                                indicator === 'dashed',
                              'my-0.5': nestLabel && indicator === 'dashed',
                            }
                          )}
                          style={{
                            backgroundColor: indicator === 'dashed' ? 'transparent' : indicatorColor,
                            borderColor: indicatorColor,
                          }}
                        />
                      )
                    )}
                    <div
                      className={cn(
                        'flex flex-1 justify-between leading-none',
                        nestLabel ? 'items-end' : 'items-center'
                      )}
                    >
                      <div className="grid gap-1.5">
                        {nestLabel ? tooltipLabel : null}
                        <span className="text-text-muted">
                          {itemConfig?.label || item.name}
                        </span>
                      </div>
                      {item.value && (
                        <span className="font-mono font-semibold text-foreground tabular-nums">
                          {item.value.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            )
          })}
      </div>
    </div>
  )
}

const ChartLegend = RechartsPrimitive.Legend

// Recharts 3.x legend payload type
type LegendPayloadItem = {
  value?: string
  type?: string
  color?: string
  dataKey?: string
}

type ChartLegendContentProps = React.ComponentProps<'div'> & {
  payload?: LegendPayloadItem[]
  verticalAlign?: 'top' | 'middle' | 'bottom'
  align?: 'left' | 'center' | 'right'
  /** Recharts passes layout when Legend uses layout prop */
  layout?: 'horizontal' | 'vertical'
  hideIcon?: boolean
  nameKey?: string
}

function ChartLegendContent({
  className,
  hideIcon = false,
  payload,
  verticalAlign = 'bottom',
  align = 'center',
  layout = 'horizontal',
  nameKey,
}: ChartLegendContentProps) {
  const { config } = useChart()

  if (!payload?.length) {
    return null
  }

  const isVertical = layout === 'vertical'

  return (
    <div
      className={cn(
        'flex gap-4',
        isVertical
          ? 'flex-col items-start gap-1.5'
          : [
              'items-center',
              align === 'left' ? 'justify-start' : align === 'right' ? 'justify-end' : 'justify-center',
              verticalAlign === 'top' ? 'pb-3' : 'pt-3',
            ],
        className
      )}
    >
      {payload
        .filter((item: LegendPayloadItem) => item.type !== 'none')
        .map((item: LegendPayloadItem) => {
          const key = \`\${nameKey || item.dataKey || 'value'}\`
          const itemConfig = getPayloadConfigFromPayload(config, item, key)

          return (
            <div
              key={item.value}
              className="flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-text-muted"
            >
              {itemConfig?.icon && !hideIcon ? (
                <itemConfig.icon />
              ) : (
                <div
                  className="h-2 w-2 shrink-0 rounded-sm"
                  style={{
                    backgroundColor: item.color,
                  }}
                />
              )}
              <span className="text-foreground">{itemConfig?.label}</span>
            </div>
          )
        })}
    </div>
  )
}

// Helper to extract item config from a payload
function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: unknown,
  key: string
) {
  if (typeof payload !== 'object' || payload === null) {
    return undefined
  }

  const payloadPayload =
    'payload' in payload &&
    typeof payload.payload === 'object' &&
    payload.payload !== null
      ? payload.payload
      : undefined

  let configLabelKey: string = key

  if (
    key in payload &&
    typeof payload[key as keyof typeof payload] === 'string'
  ) {
    configLabelKey = payload[key as keyof typeof payload] as string
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key as keyof typeof payloadPayload] === 'string'
  ) {
    configLabelKey = payloadPayload[
      key as keyof typeof payloadPayload
    ] as string
  }

  return configLabelKey in config
    ? config[configLabelKey]
    : config[key as keyof typeof config]
}

// \u2500\u2500\u2500 ChartXAxis / ChartYAxis \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

// TOKEN-EXCEPTION: Recharts ignores CSS overrides on axis tick text.
// Wrapper components apply design-token styles via inline style to ensure override.
const CHART_AXIS_TICK_STYLE = { style: { fontSize: 'var(--chart-axis-fs)', fill: 'var(--color-text-subtle)' } } as const

type ChartXAxisProps = React.ComponentProps<typeof RechartsPrimitive.XAxis>
type ChartYAxisProps = React.ComponentProps<typeof RechartsPrimitive.YAxis>

const CHART_XAXIS_PADDING = { left: 16, right: 16 } as const

function ChartXAxis({ tick, padding, ...props }: ChartXAxisProps) {
  return <RechartsPrimitive.XAxis tick={tick ?? CHART_AXIS_TICK_STYLE} padding={padding ?? CHART_XAXIS_PADDING} {...props} />
}

function ChartYAxis({ tick, width = 'auto', ...props }: ChartYAxisProps) {
  return <RechartsPrimitive.YAxis tick={tick ?? CHART_AXIS_TICK_STYLE} width={width} {...props} />
}

// \u2500\u2500\u2500 ChartLine \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

export type ChartLineType = 'linear' | 'monotone' | 'step' | 'natural'
export type ChartLineVariant = 'solid' | 'dashed'

// TOKEN-EXCEPTION: SVG strokeDasharray requires numeric values \u2014 CSS variables not supported.
const CHART_LINE_DASH = '5 5' as const

// TOKEN-EXCEPTION: SVG r / strokeWidth are geometric attributes \u2014 CSS variables not supported.
// Dot: r=3 strokeWidth=2, ActiveDot: r=5 strokeWidth=2
const CHART_DOT_PROPS = { r: 3, strokeWidth: 2 } as const
const CHART_ACTIVE_DOT_PROPS = { r: 5, strokeWidth: 2 } as const

type ChartLineProps = Omit<React.ComponentProps<typeof RechartsPrimitive.Line>, 'type' | 'dot' | 'activeDot'> & {
  /** Curve interpolation type. Default: 'monotone' */
  type?: ChartLineType
  /** Line style. 'dashed' applies stroke-dasharray. Default: 'solid' */
  variant?: ChartLineVariant
  /** Show data point dots. Default: true */
  dot?: boolean
  /** Show highlighted dot on hover. Default: true */
  activeDot?: boolean
}

function ChartLine({
  type = 'monotone',
  variant = 'solid',
  dot: showDot = true,
  activeDot: showActiveDot = true,
  stroke,
  dataKey,
  ...props
}: ChartLineProps) {
  const { hoverFade, activeDataKey, setActiveDataKey } = useChart()

  const isFaded = hoverFade && activeDataKey !== null && activeDataKey !== dataKey
  const opacity = isFaded ? CHART_HOVER_FADE_OPACITY : 1

  // When dashed, override strokeDasharray on dots so they remain solid circles.
  const dotProps = showDot
    ? variant === 'dashed' ? { ...CHART_DOT_PROPS, strokeDasharray: '0' } : CHART_DOT_PROPS
    : false
  const activeDotProps = showActiveDot
    ? variant === 'dashed' ? { ...CHART_ACTIVE_DOT_PROPS, strokeDasharray: '0' } : CHART_ACTIVE_DOT_PROPS
    : false

  return (
    <RechartsPrimitive.Line
      type={type}
      dataKey={dataKey}
      stroke={stroke}
      strokeWidth={2}
      strokeDasharray={variant === 'dashed' ? CHART_LINE_DASH : undefined}
      dot={dotProps}
      activeDot={activeDotProps}
      strokeOpacity={opacity}
      // Disable Recharts animation to prevent flicker on hover
      {...(hoverFade && { isAnimationActive: false })}
      {...(hoverFade && { onMouseEnter: () => setActiveDataKey(dataKey as string) })}
      style={hoverFade ? { transition: 'stroke-opacity var(--duration-fast) ease-out' } : undefined}
      {...props}
    />
  )
}

// \u2500\u2500\u2500 ChartArea \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

export type ChartAreaType = 'linear' | 'monotone' | 'step' | 'natural'
export type ChartAreaVariant = 'solid' | 'gradient'

// TOKEN-EXCEPTION: SVG fillOpacity requires numeric value.
const CHART_AREA_DEFAULT_OPACITY = 0.4

type ChartAreaProps = Omit<React.ComponentProps<typeof RechartsPrimitive.Area>, 'type' | 'dot' | 'activeDot'> & {
  /** Curve interpolation type. Default: 'monotone' */
  type?: ChartAreaType
  /** Fill style. 'gradient' auto-generates an SVG linearGradient. Default: 'solid' */
  variant?: ChartAreaVariant
  /** Show data point dots. Default: true */
  dot?: boolean
  /** Show highlighted dot on hover. Default: true */
  activeDot?: boolean
  /** Fill opacity for this area (0\u20131). Default: 0.4 */
  fillOpacity?: number
}

function ChartArea({
  type = 'monotone',
  variant = 'solid',
  dot: showDot = true,
  activeDot: showActiveDot = true,
  fillOpacity = CHART_AREA_DEFAULT_OPACITY,
  stroke,
  fill,
  dataKey,
  ...props
}: ChartAreaProps) {
  const { hoverFade, activeDataKey, setActiveDataKey } = useChart()

  const isFaded = hoverFade && activeDataKey !== null && activeDataKey !== dataKey
  const opacity = isFaded ? CHART_HOVER_FADE_OPACITY : 1

  const dotProps = showDot
    ? CHART_DOT_PROPS
    : false
  const activeDotProps = showActiveDot
    ? CHART_ACTIVE_DOT_PROPS
    : false

  // Gradient variant: use unique ID referencing dataKey
  const gradientId = \`area-gradient-\${String(dataKey)}\`
  const effectiveFill = variant === 'gradient' ? \`url(#\${gradientId})\` : (fill || stroke)
  const effectiveFillOpacity = variant === 'gradient' ? 1 : fillOpacity

  return (
    <>
      {variant === 'gradient' && (
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            {/* TOKEN-EXCEPTION: SVG stop attributes require inline values */}
            <stop offset="5%" stopColor={fill || stroke} stopOpacity={0.8} />
            <stop offset="95%" stopColor={fill || stroke} stopOpacity={0} />
          </linearGradient>
        </defs>
      )}
      <RechartsPrimitive.Area
        type={type}
        dataKey={dataKey}
        stroke={stroke}
        fill={effectiveFill}
        fillOpacity={effectiveFillOpacity * opacity}
        strokeWidth={2}
        dot={dotProps}
        activeDot={activeDotProps}
        strokeOpacity={opacity}
        // Disable Recharts animation to prevent flicker on hover
        {...(hoverFade && { isAnimationActive: false })}
        {...(hoverFade && { onMouseEnter: () => setActiveDataKey(dataKey as string) })}
        style={hoverFade ? { transition: 'fill-opacity var(--duration-fast) ease-out, stroke-opacity var(--duration-fast) ease-out' } : undefined}
        {...props}
      />
    </>
  )
}

// \u2500\u2500\u2500 ChartPie \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

export type ChartPieVariant = 'pie' | 'donut'
export type ChartPieLabel = 'none' | 'outside' | 'inside'
export type ChartPieLabelContent = 'value' | 'percent'

// TOKEN-EXCEPTION: SVG outerRadius expansion on hover \u2014 numeric constant.
const CHART_PIE_ACTIVE_OFFSET = 8

// TOKEN-EXCEPTION: SVG innerRadius for donut variant \u2014 numeric constant.
const CHART_PIE_DONUT_INNER_RADIUS = 60

// TOKEN-EXCEPTION: SVG outside label line \u2014 numeric constants.
const CHART_PIE_LABEL_RADIAL = 16   // radial segment length from slice edge
const CHART_PIE_LABEL_HORIZ = 20    // horizontal segment length

// TOKEN-EXCEPTION: SVG inside label skip angle \u2014 numeric constant.
const CHART_PIE_SKIP_ANGLE = 15     // hide label for slices smaller than this (degrees)

type ChartPieProps = Omit<React.ComponentProps<typeof RechartsPrimitive.Pie>, 'label' | 'labelLine' | 'activeShape'> & {
  /** 'donut' applies innerRadius automatically. Default: 'pie' */
  variant?: ChartPieVariant
  /** Label position. Default: 'none' */
  label?: ChartPieLabel
  /** Label display content. Default: 'value' */
  labelContent?: ChartPieLabelContent
  /** Hover expand effect. Default: true */
  activeShape?: boolean
  /** Override inner radius (default: 0 for pie, 60 for donut) */
  innerRadius?: number
  /** Padding angle between slices (degrees). Default: 0 */
  paddingAngle?: number
  /** Corner radius for slices. Default: 0 */
  cornerRadius?: number
}

function ChartPie({
  variant = 'pie',
  label: labelMode = 'none',
  labelContent = 'value',
  activeShape: showActiveShape = true,
  innerRadius,
  paddingAngle = 0,
  cornerRadius = 0,
  startAngle = 90,
  endAngle = -270,
  ...props
}: ChartPieProps) {
  // Resolve inner radius: explicit prop > variant default
  const resolvedInnerRadius = innerRadius ?? (variant === 'donut' ? CHART_PIE_DONUT_INNER_RADIUS : 0)

  // Active shape: render Sector with expanded outer radius on hover
  const activeShapeConfig = showActiveShape
    ? (props: any) => (
        <RechartsPrimitive.Sector
          {...props}
          outerRadius={props.outerRadius + CHART_PIE_ACTIVE_OFFSET}
        />
      )
    : undefined

  // Resolve display text from labelContent
  const getDisplayText = (entry: any) =>
    labelContent === 'percent'
      ? \`\${(entry.percent * 100).toFixed(0)}%\`
      : entry.value

  // Label rendering
  const labelConfig = labelMode === 'outside'
    ? (entry: any) => {
        const RADIAN = Math.PI / 180
        const { cx, cy, midAngle, outerRadius, fill } = entry

        // Point on slice edge
        const sx = cx + outerRadius * Math.cos(-midAngle * RADIAN)
        const sy = cy + outerRadius * Math.sin(-midAngle * RADIAN)

        // End of radial segment
        const mx = cx + (outerRadius + CHART_PIE_LABEL_RADIAL) * Math.cos(-midAngle * RADIAN)
        const my = cy + (outerRadius + CHART_PIE_LABEL_RADIAL) * Math.sin(-midAngle * RADIAN)

        // Horizontal elbow direction
        const isRight = mx > cx
        const ex = mx + (isRight ? CHART_PIE_LABEL_HORIZ : -CHART_PIE_LABEL_HORIZ)

        return (
          <g>
            <polyline
              points={\`\${sx},\${sy} \${mx},\${my} \${ex},\${my}\`}
              fill="none"
              stroke={fill}
              strokeWidth={1}
              strokeOpacity={0.5}
            />
            <text
              x={ex + (isRight ? 4 : -4)}
              y={my}
              textAnchor={isRight ? 'start' : 'end'}
              dominantBaseline="central"
              style={{ fontSize: 'var(--font-size-xs)', fill: 'var(--color-text-muted)' }}
            >
              {getDisplayText(entry)}
            </text>
          </g>
        )
      }
    : labelMode === 'inside'
      ? (entry: any) => {
          // Skip label for small slices
          const angle = Math.abs(entry.endAngle - entry.startAngle)
          if (angle < CHART_PIE_SKIP_ANGLE) return null

          const RADIAN = Math.PI / 180
          const { cx, cy, innerRadius: ir, outerRadius: or, midAngle } = entry
          // Pie: push toward outer edge (0.65). Donut ring: use midpoint (0.5)
          const ratio = ir > 0 ? 0.5 : 0.65
          const radius = ir + (or - ir) * ratio
          const x = cx + radius * Math.cos(-midAngle * RADIAN)
          const y = cy + radius * Math.sin(-midAngle * RADIAN)

          return (
            <text
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="central"
              style={{ fontSize: 'var(--font-size-xs)', fill: 'white', fontWeight: 600 }}
            >
              {getDisplayText(entry)}
            </text>
          )
        }
      : false

  return (
    <RechartsPrimitive.Pie
      innerRadius={resolvedInnerRadius}
      paddingAngle={paddingAngle}
      cornerRadius={cornerRadius}
      startAngle={startAngle}
      endAngle={endAngle}
      label={labelConfig as any}
      labelLine={false}
      activeShape={activeShapeConfig as any}
      {...props}
    />
  )
}

// \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

// \u2500\u2500\u2500 Namespace \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const Chart = Object.assign(ChartContainer, {
  Bar: ChartBar,
  Line: ChartLine,
  Area: ChartArea,
  Pie: ChartPie,
  Tooltip: ChartTooltip,
  TooltipContent: ChartTooltipContent,
  Legend: ChartLegend,
  LegendContent: ChartLegendContent,
  XAxis: ChartXAxis,
  YAxis: ChartYAxis,
  Style: ChartStyle,
})

export {
  Chart,
  ChartContainer,
  ChartBar,
  ChartLine,
  ChartArea,
  ChartPie,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartXAxis,
  ChartYAxis,
  ChartStyle,
  useChart,
}
`,
      type: "ui"
    }]
  },
  "checkbox": {
    name: "checkbox",
    dependencies: ["@radix-ui/react-checkbox"],
    registryDependencies: ["field"],
    reverseDependencies: [],
    namespace: false,
    description: "",
    files: [{
      path: "checkbox.tsx",
      content: `'use client'

import * as React from 'react'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { useFieldContext } from './field'

// Color maps for checked/indeterminate state
const checkboxColorMap = {
  default: 'data-[state=checked]:bg-foreground data-[state=checked]:border-foreground data-[state=checked]:text-background data-[state=indeterminate]:bg-foreground data-[state=indeterminate]:border-foreground data-[state=indeterminate]:text-background',
  primary: 'data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-primary-foreground data-[state=indeterminate]:bg-primary data-[state=indeterminate]:border-primary data-[state=indeterminate]:text-primary-foreground',
} as const

export type CheckboxColor = keyof typeof checkboxColorMap

// Checkbox box variants
const checkboxVariants = cva(
  [
    'peer relative shrink-0 border-border hover:border-border-strong transition-all duration-micro ease-out',
    'focus-visible:focus-ring',
    'disabled:cursor-not-allowed disabled:opacity-50',
    // Transparent hit area expansion via ::after
    "after:absolute after:content-['']",
  ].join(' '),
  {
    variants: {
      size: {
        sm: 'w-3.5 h-3.5 after:-inset-[5px]',  // 14px box \u2192 24px click
        default: 'w-4 h-4 after:-inset-2',    // 16px box \u2192 32px click
        lg: 'w-5 h-5 after:-inset-2',         // 20px box \u2192 36px click
      },
      radius: {
        none: 'rounded-none',  // 0px \u2014 sharp square
        sm: 'rounded-sm',      // 2px \u2014 default checkbox style
        md: 'rounded',         // 4px \u2014 softer corners
      },
      weight: {
        thin: 'border',   // 1px
        bold: 'border-2', // 2px
      },
    },
    defaultVariants: {
      size: 'default',
      radius: 'sm',
      weight: 'bold',
    },
  }
)

// Check icon sizes per checkbox size
const checkIconSizes = {
  sm: 'w-2.5 h-2.5',  // 10px in 14px box
  default: 'w-3 h-3', // 12px in 16px box
  lg: 'icon-xs',       // 14px in 20px box
}

// Label font sizes per checkbox size
const labelSizes = {
  sm: 'text-xs',     // 12px
  default: 'text-md', // 14px
  lg: 'text-base',   // 16px
}

// Gap between checkbox and label
const gapSizes = {
  sm: 'gap-1.5',
  default: 'gap-2',
  lg: 'gap-2.5',
}

export interface CheckboxProps
  extends Omit<React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>, 'children'>,
    VariantProps<typeof checkboxVariants> {
  /** Checked state color */
  color?: CheckboxColor
  label?: string
  radius?: 'none' | 'sm' | 'md'
}

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, size, radius, weight, color = 'default', label, disabled, id, ...props }, ref) => {
  const fieldContext = useFieldContext()
  const resolvedSize = size || 'default'
  const resolvedDisabled = disabled ?? fieldContext?.disabled
  const generatedId = React.useId()
  const checkboxId = id ?? fieldContext?.id ?? generatedId

  const checkbox = (
    <CheckboxPrimitive.Root
      ref={ref}
      id={checkboxId}
      disabled={resolvedDisabled}
      className={cn(
        checkboxVariants({ size, radius, weight }),
        checkboxColorMap[color],
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center animate-checkbox-enter">
        <CheckIcon className={checkIconSizes[resolvedSize]} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )

  if (!label) return checkbox

  return (
    <div className={cn('group flex items-center', gapSizes[resolvedSize])}>
      <div className="flex items-center">
        {checkbox}
      </div>
      <label
        htmlFor={checkboxId}
        className={cn(
          labelSizes[resolvedSize],
          'text-text-muted cursor-pointer select-none transition-colors duration-micro',
          'group-hover:text-foreground',
          resolvedDisabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        {label}
      </label>
    </div>
  )
})
Checkbox.displayName = 'Checkbox'

// Check icon \u2014 renders \u2713 for checked, \u2014 for indeterminate
function CheckIcon({ className }: { className?: string }) {
  return (
    <>
      {/* Check mark (shown when data-state=checked on parent Indicator) */}
      <svg
        className={cn(className, 'hidden [[data-state=checked]_&]:block')}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={3}
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
      {/* Dash (shown when data-state=indeterminate on parent Indicator) */}
      <svg
        className={cn(className, 'hidden [[data-state=indeterminate]_&]:block')}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={3}
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
      </svg>
    </>
  )
}

export { Checkbox, checkboxVariants }
`,
      type: "ui"
    }]
  },
  "divider": {
    name: "divider",
    dependencies: ["@radix-ui/react-separator"],
    registryDependencies: [],
    reverseDependencies: [],
    namespace: false,
    description: "",
    files: [{
      path: "divider.tsx",
      content: `'use client'

import * as React from 'react'
import * as SeparatorPrimitive from '@radix-ui/react-separator'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// \u2500\u2500\u2500 Divider \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

const dividerVariants = cva('shrink-0', {
  variants: {
    orientation: {
      horizontal: 'w-full',
      vertical: 'h-full self-stretch',
    },
    variant: {
      solid: 'border-solid',
      dashed: 'border-dashed',
      dotted: 'border-dotted',
    },
    color: {
      default: 'border-border/60',
      muted: 'border-border-subtle',
      strong: 'border-border-strong',
    },
    spacing: {
      sm: '',
      md: '',
      default: '',
      lg: '',
    },
  },
  compoundVariants: [
    // Horizontal spacing
    { orientation: 'horizontal', spacing: 'sm', className: 'my-2' },
    { orientation: 'horizontal', spacing: 'md', className: 'my-3' },
    { orientation: 'horizontal', spacing: 'default', className: 'my-4' },
    { orientation: 'horizontal', spacing: 'lg', className: 'my-8' },
    // Vertical spacing
    { orientation: 'vertical', spacing: 'sm', className: 'mx-2' },
    { orientation: 'vertical', spacing: 'md', className: 'mx-3' },
    { orientation: 'vertical', spacing: 'default', className: 'mx-4' },
    { orientation: 'vertical', spacing: 'lg', className: 'mx-8' },
    // Horizontal line style (border-top)
    { orientation: 'horizontal', className: 'border-t border-l-0' },
    // Vertical line style (border-left)
    { orientation: 'vertical', className: 'border-l border-t-0' },
  ],
  defaultVariants: {
    orientation: 'horizontal',
    variant: 'solid',
    color: 'default',
    spacing: 'default',
  },
})

export interface DividerProps
  extends Omit<React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>, 'children' | 'color' | 'orientation'> {
  /** Direction of the divider */
  orientation?: 'horizontal' | 'vertical'
  /** Line style */
  variant?: 'solid' | 'dashed' | 'dotted'
  /** Line color intensity */
  color?: 'default' | 'muted' | 'strong'
  /** Spacing around the divider */
  spacing?: 'sm' | 'md' | 'default' | 'lg'
  /** Content to display on the divider line (horizontal only) */
  label?: React.ReactNode
  /** Label position along the line */
  labelPosition?: 'left' | 'center' | 'right'
}

const Divider = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  DividerProps
>(({
  className,
  orientation = 'horizontal',
  variant = 'solid',
  color = 'default',
  spacing = 'default',
  label,
  labelPosition = 'center',
  decorative = true,
  ...props
}, ref) => {
  // Line style class for label mode
  const lineClass = cn(
    'flex-1',
    variant === 'dashed' ? 'border-dashed' : variant === 'dotted' ? 'border-dotted' : 'border-solid',
    color === 'muted' ? 'border-border-subtle' : color === 'strong' ? 'border-border-strong' : 'border-border/60',
    'border-t'
  )

  // Spacing class for label wrapper
  const spacingClass =
    spacing === 'sm' ? 'my-2'
    : spacing === 'md' ? 'my-3'
    : spacing === 'lg' ? 'my-8'
    : 'my-4'

  // Horizontal with label: render as flex container with two lines
  if (label && orientation === 'horizontal') {
    return (
      <div
        role={decorative ? 'none' : 'separator'}
        aria-orientation="horizontal"
        className={cn(
          'flex items-center w-full',
          spacingClass,
          className
        )}
      >
        <div className={cn(
          lineClass,
          labelPosition === 'left' ? 'max-w-[10%]' : ''
        )} />
        <span className="px-3 text-sm text-text-muted shrink-0 select-none">{label}</span>
        <div className={cn(
          lineClass,
          labelPosition === 'right' ? 'max-w-[10%]' : ''
        )} />
      </div>
    )
  }

  // Default: Radix Separator
  return (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        dividerVariants({ orientation, variant, color, spacing }),
        className
      )}
      {...props}
    />
  )
})
Divider.displayName = 'Divider'

// \u2500\u2500\u2500 Exports \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

export { Divider, dividerVariants }
`,
      type: "ui"
    }]
  },
  "drawer": {
    name: "drawer",
    dependencies: ["@radix-ui/react-dialog"],
    registryDependencies: [],
    reverseDependencies: [],
    namespace: true,
    description: "",
    files: [{
      path: "drawer.tsx",
      content: `'use client'

import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// \u2500\u2500\u2500 Default Close Icon (built-in, no external dependency) \u2500\u2500
const DefaultCloseIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
)

// \u2500\u2500\u2500 Types \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
export type DrawerSide = 'left' | 'right' | 'top' | 'bottom'
export type DrawerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full'

// \u2500\u2500\u2500 Animation class mapping (static strings for Tailwind scanner) \u2500\u2500
const ANIMATION_CLASSES: Record<DrawerSide, string> = {
  right:  'data-[state=open]:animate-drawer-right-enter data-[state=closed]:animate-drawer-right-exit',
  left:   'data-[state=open]:animate-drawer-left-enter data-[state=closed]:animate-drawer-left-exit',
  top:    'data-[state=open]:animate-drawer-top-enter data-[state=closed]:animate-drawer-top-exit',
  bottom: 'data-[state=open]:animate-drawer-bottom-enter data-[state=closed]:animate-drawer-bottom-exit',
}

// \u2500\u2500\u2500 Size variants \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const drawerSizeHorizontal = cva('', {
  variants: {
    size: {
      sm:   'w-[320px]',
      md:   'w-[400px]',
      lg:   'w-[480px]',
      xl:   'w-[640px]',
      full: 'w-full',
    },
  },
  defaultVariants: { size: 'md' },
})

const drawerSizeVertical = cva('', {
  variants: {
    size: {
      sm:   'h-[320px]',
      md:   'h-[400px]',
      lg:   'h-[480px]',
      xl:   'h-[640px]',
      full: 'h-full',
    },
  },
  defaultVariants: { size: 'md' },
})

// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
// Drawer
// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550

// \u2500\u2500\u2500 Drawer (Root) \u2014 wrapper to avoid Object.assign mutating DialogPrimitive.Root \u2500\u2500
function DrawerRoot(props: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root {...props} />
}

// \u2500\u2500\u2500 DrawerTrigger \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const DrawerTrigger = DialogPrimitive.Trigger

// \u2500\u2500\u2500 DrawerPortal \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const DrawerPortal = DialogPrimitive.Portal

// \u2500\u2500\u2500 DrawerClose \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const DrawerClose = DialogPrimitive.Close

// \u2500\u2500\u2500 DrawerOverlay \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const DrawerOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-overlay bg-black/50',
      'data-[state=open]:animate-modal-overlay-enter data-[state=closed]:animate-modal-overlay-exit',
      className
    )}
    {...props}
  />
))
DrawerOverlay.displayName = 'DrawerOverlay'

// \u2500\u2500\u2500 DrawerContent \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
export interface DrawerContentProps
  extends Omit<React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>, 'children'> {
  /** Side from which the drawer slides in */
  side?: DrawerSide
  /** Panel size (width for left/right, height for top/bottom) */
  size?: DrawerSize
  /** Show built-in close button */
  showCloseButton?: boolean
  /** Custom close icon (replaces default X) */
  closeIcon?: React.ReactNode
  children?: React.ReactNode
}

const SIDE_POSITION: Record<DrawerSide, string> = {
  right:  'inset-y-0 right-0',
  left:   'inset-y-0 left-0',
  top:    'inset-x-0 top-0',
  bottom: 'inset-x-0 bottom-0',
}

const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DrawerContentProps
>(({ className, children, side = 'right', size = 'md', showCloseButton = true, closeIcon, ...props }, ref) => {
  const isHorizontal = side === 'left' || side === 'right'
  const sizeClass = isHorizontal
    ? drawerSizeHorizontal({ size })
    : drawerSizeVertical({ size })

  return (
    <DrawerPortal>
      <DrawerOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          'fixed z-modal flex flex-col bg-background shadow-xl',
          'focus:outline-none',
          SIDE_POSITION[side],
          isHorizontal ? 'max-w-full h-full' : 'max-h-full w-full',
          sizeClass,
          ANIMATION_CLASSES[side],
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close className={cn(
            'absolute right-4 top-4 rounded-md p-1',
            'text-text-muted hover:text-foreground',
            'transition-colors duration-fast',
            'focus-visible:focus-ring focus-visible:outline-none',
            'disabled:pointer-events-none'
          )}>
            {closeIcon || <DefaultCloseIcon className="icon-sm" />}
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DrawerPortal>
  )
})
DrawerContent.displayName = 'DrawerContent'

// \u2500\u2500\u2500 DrawerHeader \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const DrawerHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col gap-1.5 p-6 pb-0', className)}
    {...props}
  />
))
DrawerHeader.displayName = 'DrawerHeader'

// \u2500\u2500\u2500 DrawerTitle \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const DrawerTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('text-lg font-semibold text-foreground', className)}
    {...props}
  />
))
DrawerTitle.displayName = 'DrawerTitle'

// \u2500\u2500\u2500 DrawerDescription \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const DrawerDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-md text-text-muted', className)}
    {...props}
  />
))
DrawerDescription.displayName = 'DrawerDescription'

// \u2500\u2500\u2500 DrawerBody \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const DrawerBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex-1 overflow-y-auto p-6', className)}
    {...props}
  />
))
DrawerBody.displayName = 'DrawerBody'

// \u2500\u2500\u2500 DrawerFooter \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const DrawerFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex items-center justify-end gap-3 p-6 pt-0',
      className
    )}
    {...props}
  />
))
DrawerFooter.displayName = 'DrawerFooter'

// \u2500\u2500\u2500 Namespace: Drawer \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const Drawer = Object.assign(DrawerRoot, {
  Trigger: DrawerTrigger,
  Portal: DrawerPortal,
  Overlay: DrawerOverlay,
  Content: DrawerContent,
  Header: DrawerHeader,
  Title: DrawerTitle,
  Description: DrawerDescription,
  Body: DrawerBody,
  Footer: DrawerFooter,
  Close: DrawerClose,
})

// eslint-disable-next-line @typescript-eslint/no-namespace
namespace Drawer {
  export type ContentProps = DrawerContentProps
}

// \u2500\u2500\u2500 Exports \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
export {
  Drawer,
  DrawerRoot,
  DrawerTrigger,
  DrawerPortal,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerBody,
  DrawerFooter,
  DrawerClose,
  drawerSizeHorizontal,
  drawerSizeVertical,
}
`,
      type: "ui"
    }]
  },
  "dropdown": {
    name: "dropdown",
    dependencies: ["@radix-ui/react-dropdown-menu"],
    registryDependencies: [],
    reverseDependencies: [],
    namespace: true,
    description: "",
    files: [{
      path: "dropdown.tsx",
      content: `'use client'

import * as React from 'react'
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import { cn } from '@/lib/utils'

// Radius variants for Content and Item (concentric rounded rectangles)
type DropdownMenuRadius = 'md' | 'lg' | 'xl'

const contentRadiusMap: Record<DropdownMenuRadius, string> = {
  md: 'rounded-md',     // 6px
  lg: 'rounded-lg',     // 8px
  xl: 'rounded-xl',     // 12px (default)
}

const itemRadiusMap: Record<DropdownMenuRadius, string> = {
  md: 'rounded',        // 4px \u2014 perceptual balance (67%)
  lg: 'rounded-md',     // 6px \u2014 perceptual balance (75%)
  xl: 'rounded-lg',     // 8px \u2014 perceptual balance (67%)
}

// Size variants
type DropdownMenuSize = 'sm' | 'md' | 'lg'

const itemSizeMap: Record<DropdownMenuSize, string> = {
  sm: 'px-2 py-1.5 text-xs',
  md: 'px-2 py-1.5 text-sm',
  lg: 'px-3 py-2.5 text-md',
}

const indicatorItemSizeMap: Record<DropdownMenuSize, string> = {
  sm: 'py-1.5 pl-6 pr-2 text-xs',
  md: 'py-1.5 pl-8 pr-2 text-sm',
  lg: 'py-2.5 pl-10 pr-3 text-md',
}

const indicatorSizeMap: Record<DropdownMenuSize, string> = {
  sm: 'left-2 h-3 w-3',
  md: 'left-2 h-3.5 w-3.5',
  lg: 'left-3 h-4 w-4',
}

const labelSizeMap: Record<DropdownMenuSize, string> = {
  sm: 'px-2 py-1.5 text-xs',
  md: 'px-2 py-1.5 text-xs',
  lg: 'px-3 py-2.5 text-xs',
}

const flushItemPaddingMap: Record<DropdownMenuSize, string> = {
  sm: 'px-3',
  md: 'px-3',
  lg: 'px-4',
}

const flushIndicatorItemPaddingMap: Record<DropdownMenuSize, string> = {
  sm: 'pl-7 pr-3',
  md: 'pl-9 pr-3',
  lg: 'pl-11 pr-4',
}

const insetSizeMap: Record<DropdownMenuSize, string> = {
  sm: 'pl-6',
  md: 'pl-8',
  lg: 'pl-10',
}

// Style context \u2014 propagates radius, flush, size from Content to children
const DropdownMenuStyleContext = React.createContext<{
  radius: DropdownMenuRadius
  flush: boolean
  size: DropdownMenuSize
}>({ radius: 'lg', flush: false, size: 'md' })

// Root \u2014 state management (controlled / uncontrolled)
const DropdownMenuRoot = DropdownMenuPrimitive.Root

// Trigger \u2014 the element that toggles the menu
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger

// Group \u2014 groups related items
const DropdownMenuGroup = DropdownMenuPrimitive.Group

// Sub \u2014 submenu root
const DropdownMenuSub = DropdownMenuPrimitive.Sub

// RadioGroup \u2014 radio selection group
const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup

// Content \u2014 the floating panel (rendered in a Portal)
const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content> & {
    radius?: DropdownMenuRadius
    flush?: boolean
    size?: DropdownMenuSize
  }
>(({ className, sideOffset = 4, radius = 'md', flush = false, size = 'md', onCloseAutoFocus, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuStyleContext.Provider value={{ radius, flush, size }}>
      <DropdownMenuPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        onCloseAutoFocus={(e) => {
          e.preventDefault()
          onCloseAutoFocus?.(e)
        }}
        className={cn(
          'z-dropdown min-w-[8rem] overflow-hidden border border-border bg-background shadow-lg',
          flush ? 'py-1' : 'p-1',
          contentRadiusMap[radius],
          className
        )}
        {...props}
      />
    </DropdownMenuStyleContext.Provider>
  </DropdownMenuPrimitive.Portal>
))
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName

// Item \u2014 a single menu item
const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => {
  const { radius, flush, size } = React.useContext(DropdownMenuStyleContext)
  return (
    <DropdownMenuPrimitive.Item
      ref={ref}
      className={cn(
        'relative flex cursor-default select-none items-center outline-none',
        itemSizeMap[size],
        !flush && itemRadiusMap[radius],
        flush && flushItemPaddingMap[size],
        'transition-colors duration-fast',
        'focus:bg-background-muted',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        inset && insetSizeMap[size],
        className
      )}
      {...props}
    />
  )
})
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName

// CheckboxItem \u2014 item with a checkbox indicator
const DropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => {
  const { radius, flush, size } = React.useContext(DropdownMenuStyleContext)
  return (
    <DropdownMenuPrimitive.CheckboxItem
      ref={ref}
      className={cn(
        'relative flex cursor-default select-none items-center outline-none',
        indicatorItemSizeMap[size],
        !flush && itemRadiusMap[radius],
        flush && flushIndicatorItemPaddingMap[size],
        'transition-colors duration-fast',
        'focus:bg-background-muted',
        'data-[state=checked]:text-foreground data-[state=checked]:font-semibold',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className
      )}
      checked={checked}
      {...props}
    >
      <span className={cn('absolute flex items-center justify-center', indicatorSizeMap[size])}>
        <DropdownMenuPrimitive.ItemIndicator>
          <svg className="icon-xs" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  )
})
DropdownMenuCheckboxItem.displayName = DropdownMenuPrimitive.CheckboxItem.displayName

// RadioItem \u2014 item within a RadioGroup
const DropdownMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => {
  const { radius, flush, size } = React.useContext(DropdownMenuStyleContext)
  return (
    <DropdownMenuPrimitive.RadioItem
      ref={ref}
      className={cn(
        'relative flex cursor-default select-none items-center outline-none',
        indicatorItemSizeMap[size],
        !flush && itemRadiusMap[radius],
        flush && flushIndicatorItemPaddingMap[size],
        'transition-colors duration-fast',
        'focus:bg-background-muted',
        'data-[state=checked]:text-foreground data-[state=checked]:font-semibold',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className
      )}
      {...props}
    >
      <span className={cn('absolute flex items-center justify-center', indicatorSizeMap[size])}>
        <DropdownMenuPrimitive.ItemIndicator>
          <svg className="icon-xs" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <circle cx="12" cy="12" r="6" />
          </svg>
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  )
})
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName

// Label \u2014 non-interactive group heading
const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => {
  const { flush, size } = React.useContext(DropdownMenuStyleContext)
  return (
    <DropdownMenuPrimitive.Label
      ref={ref}
      className={cn(
        'font-semibold text-text-muted',
        labelSizeMap[size],
        flush && flushItemPaddingMap[size],
        inset && insetSizeMap[size],
        className
      )}
      {...props}
    />
  )
})
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName

// Separator \u2014 visual divider between groups
const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => {
  const { flush } = React.useContext(DropdownMenuStyleContext)
  return (
    <DropdownMenuPrimitive.Separator
      ref={ref}
      className={cn('h-px bg-border my-1', !flush && '-mx-1', className)}
      {...props}
    />
  )
})
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName

// SubTrigger \u2014 item that opens a submenu
const DropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & {
    inset?: boolean
  }
>(({ className, inset, children, ...props }, ref) => {
  const { radius, flush, size } = React.useContext(DropdownMenuStyleContext)
  return (
    <DropdownMenuPrimitive.SubTrigger
      ref={ref}
      className={cn(
        'flex cursor-default select-none items-center outline-none',
        itemSizeMap[size],
        !flush && itemRadiusMap[radius],
        flush && flushItemPaddingMap[size],
        'focus:bg-background-muted data-[state=open]:bg-background-muted',
        inset && insetSizeMap[size],
        className
      )}
      {...props}
    >
      {children}
      <svg className="ml-auto icon-xs" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </DropdownMenuPrimitive.SubTrigger>
  )
})
DropdownMenuSubTrigger.displayName = DropdownMenuPrimitive.SubTrigger.displayName

// SubContent \u2014 the floating panel for a submenu
const DropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => {
  const { radius, flush } = React.useContext(DropdownMenuStyleContext)
  return (
    <DropdownMenuPrimitive.SubContent
      ref={ref}
      className={cn(
        'z-dropdown min-w-[8rem] overflow-hidden border border-border bg-background shadow-lg',
        flush ? 'py-1' : 'p-1',
        contentRadiusMap[radius],
        className
      )}
      {...props}
    />
  )
})
DropdownMenuSubContent.displayName = DropdownMenuPrimitive.SubContent.displayName

// Shortcut \u2014 keyboard shortcut hint text
function DropdownMenuShortcut({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn('ml-auto pl-4 text-xs text-text-subtle tracking-widest', className)}
      {...props}
    />
  )
}
DropdownMenuShortcut.displayName = 'DropdownMenuShortcut'

export type { DropdownMenuRadius, DropdownMenuSize }

// \u2500\u2500\u2500 Namespace \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const DropdownMenu = Object.assign(DropdownMenuRoot, {
  Trigger: DropdownMenuTrigger,
  Content: DropdownMenuContent,
  Item: DropdownMenuItem,
  CheckboxItem: DropdownMenuCheckboxItem,
  RadioGroup: DropdownMenuRadioGroup,
  RadioItem: DropdownMenuRadioItem,
  Label: DropdownMenuLabel,
  Separator: DropdownMenuSeparator,
  Group: DropdownMenuGroup,
  Sub: DropdownMenuSub,
  SubTrigger: DropdownMenuSubTrigger,
  SubContent: DropdownMenuSubContent,
  Shortcut: DropdownMenuShortcut,
})

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuShortcut,
}
`,
      type: "ui"
    }]
  },
  "field": {
    name: "field",
    dependencies: [],
    registryDependencies: [],
    reverseDependencies: [],
    namespace: true,
    description: "",
    files: [{
      path: "field.tsx",
      content: `'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// Field Context for sharing state between components
interface FieldContextValue {
  id: string
  error?: boolean
  disabled?: boolean
}

const FieldContext = React.createContext<FieldContextValue | null>(null)

function useFieldContext() {
  return React.useContext(FieldContext)
}

// Field wrapper
const fieldVariants = cva('flex flex-col', {
  variants: {
    gap: {
      none: 'gap-0',
      xs: 'gap-1',
      sm: 'gap-1.5',
      default: 'gap-2',
      lg: 'gap-3',
    },
  },
  defaultVariants: {
    gap: 'default',
  },
})

export interface FieldProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof fieldVariants> {
  error?: boolean
  disabled?: boolean
}

const FieldRoot = React.forwardRef<HTMLDivElement, FieldProps>(
  ({ className, gap, error, disabled, children, ...props }, ref) => {
    const id = React.useId()

    return (
      <FieldContext.Provider value={{ id, error, disabled }}>
        <div
          ref={ref}
          className={cn(fieldVariants({ gap }), className)}
          data-error={error || undefined}
          data-disabled={disabled || undefined}
          {...props}
        >
          {children}
        </div>
      </FieldContext.Provider>
    )
  }
)
FieldRoot.displayName = 'Field'

// Field Label
export interface FieldLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean
}

const FieldLabel = React.forwardRef<HTMLLabelElement, FieldLabelProps>(
  ({ className, required, children, ...props }, ref) => {
    const context = useFieldContext()

    return (
      <label
        ref={ref}
        htmlFor={context?.id}
        className={cn(
          'text-md font-semibold text-foreground', // 14px - primary field identifier
          context?.disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        {...props}
      >
        {children}
        {required && <span className="text-error ml-0.5">*</span>}
      </label>
    )
  }
)
FieldLabel.displayName = 'FieldLabel'

// Field Error
const FieldError = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const context = useFieldContext()

  if (!children) return null

  return (
    <p
      ref={ref}
      id={context ? \`\${context.id}-error\` : undefined}
      role="alert"
      className={cn('text-xs text-error pl-1', className)} // 12px - color-distinguished, left-aligned with input text
      {...props}
    >
      {children}
    </p>
  )
})
FieldError.displayName = 'FieldError'

// Field Character Count
const FieldCharCount = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const context = useFieldContext()

  return (
    <p
      ref={ref}
      id={context ? \`\${context.id}-charcount\` : undefined}
      className={cn(
        'text-xs text-text-muted text-right pr-1 -mt-1', // 12px - right-aligned, 4px gap from input (gap-2 8px - mt-1 4px)
        context?.disabled && 'opacity-50',
        className
      )}
      {...props}
    />
  )
})
FieldCharCount.displayName = 'FieldCharCount'

// \u2500\u2500\u2500 Namespace \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const Field = Object.assign(FieldRoot, {
  Label: FieldLabel,
  Error: FieldError,
  CharCount: FieldCharCount,
})

// eslint-disable-next-line @typescript-eslint/no-namespace
namespace Field {
  export type LabelProps = FieldLabelProps
}

export { Field, FieldLabel, FieldError, FieldCharCount, useFieldContext }
`,
      type: "ui"
    }]
  },
  "icon-button": {
    name: "icon-button",
    dependencies: ["@radix-ui/react-slot"],
    registryDependencies: ["button", "button-group"],
    reverseDependencies: [],
    namespace: false,
    description: "",
    files: [{
      path: "icon-button.tsx",
      content: `'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { useButtonGroup } from './button-group'

import { type ButtonColor } from './button'

// Solid color maps (same as Button)
const solidColorMap = {
  default: 'bg-foreground text-background hover:bg-foreground/90 active:bg-foreground/80',
  primary: 'bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary-hover active:bg-secondary-active',
  destructive: 'bg-error text-error-foreground hover:bg-error-hover active:bg-error-active',
} as const

const iconButtonVariants = cva(
  'inline-flex items-center justify-center transition-all duration-micro focus-visible:focus-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        solid: '',
        outline: 'border border-border bg-background text-foreground hover:bg-background-muted',
        ghost: 'text-foreground hover:bg-background-muted',
        subtle: 'text-text-muted hover:text-foreground',
      },
      size: {
        xs: 'h-7 w-7',      // 28px - spacing.7
        sm: 'h-8 w-8',      // 32px - spacing.8
        md: 'h-9 w-9',      // 36px - spacing.9
        default: 'h-10 w-10', // 40px - spacing.10
        lg: 'h-12 w-12',    // 48px - spacing.12
      },
      radius: {
        none: 'rounded-none',      // 0px - primitive.borderRadius.none
        sm: 'rounded-sm',          // 2px - primitive.borderRadius.sm
        base: 'rounded',           // 4px - primitive.borderRadius.base
        default: 'rounded-md',     // 6px - primitive.borderRadius.md (Figma button default)
        lg: 'rounded-lg',          // 8px - primitive.borderRadius.lg
        xl: 'rounded-xl',          // 12px - primitive.borderRadius.xl
        '2xl': 'rounded-2xl',      // 16px - primitive.borderRadius.2xl
        '3xl': 'rounded-3xl',      // 24px - primitive.borderRadius.3xl
        full: 'rounded-full',      // 9999px - primitive.borderRadius.full
      },
    },
    defaultVariants: {
      variant: 'solid',
      size: 'default',
      radius: 'default',
    },
  }
)

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconButtonVariants> {
  /** Solid variant color */
  color?: ButtonColor
  asChild?: boolean
  loading?: boolean
  pressEffect?: boolean
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant: variantProp, color: colorProp, size: sizeProp, radius: radiusProp, asChild = false, loading, pressEffect, children, disabled: disabledProp, ...props }, ref) => {
    const groupContext = useButtonGroup()

    // Priority: direct prop > ButtonGroup context > variant default
    const variant = variantProp ?? groupContext?.variant ?? 'solid'
    const color = colorProp ?? 'default'
    const size = sizeProp ?? groupContext?.size
    const radius = radiusProp ?? groupContext?.radius
    const disabled = disabledProp ?? groupContext?.disabled

    const Comp = asChild ? Slot : 'button'

    // Icon size for icon-only button (5-step scale)
    // XS: 14px, SM~MD: 16px, Default: 20px, LG: 24px
    const iconSize = {
      xs: 'icon-xs',      // 14px
      sm: 'icon-sm',      // 16px
      md: 'icon-sm',      // 16px
      default: 'icon-md', // 20px
      lg: 'icon-lg',      // 24px
    }[size || 'default']

    return (
      <Comp
        className={cn(iconButtonVariants({ variant, size, radius }), variant === 'solid' && solidColorMap[color], pressEffect !== false && 'active:scale-pressed', className)}
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading ? (
          <svg
            className={cn(iconSize, 'animate-spin')}
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : (
          <span className={cn(iconSize, '[&>svg]:w-full [&>svg]:h-full')} aria-hidden="true">
            {children}
          </span>
        )}
      </Comp>
    )
  }
)
IconButton.displayName = 'IconButton'

export { IconButton, iconButtonVariants }
`,
      type: "ui"
    }]
  },
  "input": {
    name: "input",
    dependencies: [],
    registryDependencies: ["field"],
    reverseDependencies: [],
    namespace: false,
    description: "",
    files: [{
      path: "input.tsx",
      content: `'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { useFieldContext } from './field'

const inputVariants = cva(
  [
    'flex w-full bg-background text-foreground placeholder:text-foreground/30',
    'border transition-colors duration-micro',
    'focus:[outline:2px_solid_transparent]',
    'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-background-muted',
    'file:border-0 file:bg-transparent file:text-sm file:font-semibold',
  ].join(' '),
  {
    variants: {
      variant: {
        default: 'border-border hover:border-border-strong',
        filled: 'border-transparent bg-background-muted',
      },
      focusRing: {
        true: '',
        false: '',
      },
      size: {
        xs: 'h-9 px-3 text-sm',          // 36px / 12px padding / 13px font (3.0:1)
        sm: 'h-10 px-3 text-md',         // 40px / 12px padding / 14px font (3.3:1)
        default: 'h-11 px-4 text-base',  // 44px / 16px padding / 16px font (2.75:1)
        lg: 'h-12 px-4 text-base',       // 48px / 16px padding / 16px font (3.0:1)
        xl: 'h-14 px-4 text-base',        // 56px / 16px padding / 16px font (3.5:1)
      },
      radius: {
        none: 'rounded-none',
        sm: 'rounded-sm',
        base: 'rounded',
        default: 'rounded-md',
        lg: 'rounded-lg',
        xl: 'rounded-xl',
        '2xl': 'rounded-2xl',
        '3xl': 'rounded-3xl',
        full: 'rounded-full',
      },
      state: {
        default: '',
        error: 'border-error hover:border-error focus:border-error shadow-[0_0_0_2px_var(--color-focus-ring-error)]',
      },
    },
    compoundVariants: [
      // focusRing: true \u2192 show custom focus ring
      { focusRing: true, className: 'focus-visible:shadow-[0_0_0_2px_var(--color-focus-ring)]' },
      // focusRing: false \u2192 keep same state as hover
      { variant: 'default', focusRing: false, className: 'focus:border-border-strong' },
      // filled + error
      {
        variant: 'filled',
        state: 'error',
        className: 'border-transparent hover:border-transparent focus:border-transparent bg-[var(--color-error-bg)] hover:bg-[var(--color-error-bg)] focus:bg-[var(--color-error-bg)] shadow-none',
      },
    ],
    defaultVariants: {
      variant: 'default',
      size: 'default',
      radius: 'default',
      state: 'default',
      focusRing: false,
    },
  }
)

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  error?: boolean
  focusRing?: boolean
}

// Icon size for input (2-step scale)
// xs~sm: 14px, default~xl: 16px
const iconSizeClasses = {
  xs: 'icon-xs',      // 14px
  sm: 'icon-xs',      // 14px
  default: 'icon-sm', // 16px
  lg: 'icon-sm',      // 16px
  xl: 'icon-sm',      // 16px
}

// Icon padding (padding + icon + gap)
const iconPaddingClasses = {
  xs: { left: 'pl-8', right: 'pr-8' },       // 12px + 14px icon + 6px gap = 32px
  sm: { left: 'pl-9', right: 'pr-9' },       // 12px + 14px icon + 8px gap = 34px \u2192 36px
  default: { left: 'pl-10', right: 'pr-10' }, // 16px + 16px icon + 8px gap = 40px
  lg: { left: 'pl-10', right: 'pr-10' },     // 16px + 16px icon + 8px gap = 40px
  xl: { left: 'pl-10', right: 'pr-10' },     // 16px + 16px icon + 8px gap = 40px
}

// Icon position (matches horizontal padding)
const iconPositionClasses = {
  xs: { left: 'left-3', right: 'right-3' },      // 12px
  sm: { left: 'left-3', right: 'right-3' },      // 12px
  default: { left: 'left-4', right: 'right-4' }, // 16px
  lg: { left: 'left-4', right: 'right-4' },      // 16px
  xl: { left: 'left-4', right: 'right-4' },      // 16px
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, size, radius, state, type, leftIcon, rightIcon, error, focusRing, id, onPointerDown, onFocus, onBlur, ...props }, ref) => {
    const fieldContext = useFieldContext()
    const resolvedSize = size || 'default'
    const resolvedError = error ?? fieldContext?.error
    const resolvedState = resolvedError ? 'error' : state
    const inputId = id ?? fieldContext?.id
    const isDisabled = props.disabled ?? fieldContext?.disabled

    // Keyboard focus detection (when focusRing: false, auto-show ring on Tab navigation)
    const pointerRef = React.useRef(false)
    const windowBlurredRef = React.useRef(false)
    const [keyboardFocus, setKeyboardFocus] = React.useState(false)

    // Track window blur/focus to distinguish Tab navigation from window re-activation
    React.useEffect(() => {
      const onBlur = () => { windowBlurredRef.current = true }
      const onFocus = () => { requestAnimationFrame(() => { windowBlurredRef.current = false }) }
      window.addEventListener('blur', onBlur)
      window.addEventListener('focus', onFocus)
      return () => { window.removeEventListener('blur', onBlur); window.removeEventListener('focus', onFocus) }
    }, [])

    const handlePointerDown = React.useCallback((e: React.PointerEvent<HTMLInputElement>) => {
      pointerRef.current = true
      onPointerDown?.(e)
    }, [onPointerDown])

    const handleFocus = React.useCallback((e: React.FocusEvent<HTMLInputElement>) => {
      if (!pointerRef.current && !focusRing && !windowBlurredRef.current) {
        setKeyboardFocus(true)
      }
      pointerRef.current = false
      onFocus?.(e)
    }, [focusRing, onFocus])

    const handleBlur = React.useCallback((e: React.FocusEvent<HTMLInputElement>) => {
      setKeyboardFocus(false)
      pointerRef.current = false
      onBlur?.(e)
    }, [onBlur])

    // Build aria-describedby from context
    const ariaDescribedBy = fieldContext
      ? [
          resolvedError ? \`\${fieldContext.id}-error\` : null,
        ]
          .filter(Boolean)
          .join(' ') || undefined
      : undefined

    const focusHandlers = {
      onPointerDown: handlePointerDown,
      onFocus: handleFocus,
      onBlur: handleBlur,
    }

    // If icons are present, wrap input in a container
    if (leftIcon || rightIcon) {
      return (
        <div className="relative w-full">
          {leftIcon && (
            <div className={cn(
              'absolute top-1/2 -translate-y-1/2 pointer-events-none text-text-muted z-10',
              iconPositionClasses[resolvedSize].left,
              \`[&>svg]:\${iconSizeClasses[resolvedSize]}\`
            )}>
              {leftIcon}
            </div>
          )}
          <input
            type={type}
            id={inputId}
            className={cn(
              inputVariants({ variant, size, radius, state: resolvedState, focusRing }),
              keyboardFocus && 'shadow-[0_0_0_2px_var(--color-focus-ring)]',
              leftIcon && iconPaddingClasses[resolvedSize].left,
              rightIcon && iconPaddingClasses[resolvedSize].right,
              className
            )}
            aria-invalid={resolvedError || undefined}
            aria-describedby={ariaDescribedBy}
            disabled={isDisabled}
            ref={ref}
            {...focusHandlers}
            {...props}
          />
          {rightIcon && (
            <div className={cn(
              'absolute top-1/2 -translate-y-1/2 pointer-events-none text-text-muted z-10',
              iconPositionClasses[resolvedSize].right,
              \`[&>svg]:\${iconSizeClasses[resolvedSize]}\`
            )}>
              {rightIcon}
            </div>
          )}
        </div>
      )
    }

    return (
      <input
        type={type}
        id={inputId}
        className={cn(
          inputVariants({ variant, size, radius, state: resolvedState, focusRing }),
          keyboardFocus && 'shadow-[0_0_0_2px_var(--color-focus-ring)]',
          className
        )}
        aria-invalid={resolvedError || undefined}
        aria-describedby={ariaDescribedBy}
        disabled={isDisabled}
        ref={ref}
        {...focusHandlers}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input, inputVariants }
`,
      type: "ui"
    }]
  },
  "metric-card": {
    name: "metric-card",
    dependencies: [],
    registryDependencies: [],
    reverseDependencies: [],
    namespace: true,
    description: "",
    files: [{
      path: "metric-card.tsx",
      content: `'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// \u2500\u2500 CVA Variants \u2500\u2500

const metricCardVariants = cva(
  'transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-background-paper border border-border',
        elevated: 'bg-background-paper shadow-md',
        ghost: 'bg-transparent',
      },
      size: {
        sm: 'p-4',
        default: 'p-4 sm:p-5',
        lg: 'p-4 sm:p-6',
      },
      radius: {
        none: 'rounded-none',    // 0px
        sm: 'rounded-sm',        // 2px
        base: 'rounded',         // 4px
        default: 'rounded-xl',   // 12px - card default
        lg: 'rounded-lg',        // 8px
        xl: 'rounded-xl',        // 12px
        '2xl': 'rounded-2xl',    // 16px
        '3xl': 'rounded-3xl',    // 24px
        full: 'rounded-full',    // 9999px
      },
    },
    defaultVariants: { variant: 'default', size: 'default', radius: 'default' },
  }
)

// \u2500\u2500 Size maps \u2500\u2500

const valueSizes = {
  sm: 'text-xl',
  default: 'text-2xl',
  lg: 'text-3xl',
} as const

const titleSizes = {
  sm: 'text-xs',
  default: 'text-sm',
  lg: 'text-sm',
} as const

const iconWrapperSizes = {
  sm: '[&>svg]:icon-sm',
  default: '[&>svg]:icon-md',
  lg: '[&>svg]:icon-lg',
} as const

// \u2500\u2500 Trend config \u2500\u2500

const trendConfig = {
  up: { color: 'text-text-success', srLabel: 'Increased' },
  down: { color: 'text-text-error', srLabel: 'Decreased' },
  neutral: { color: 'text-text-muted', srLabel: 'No change' },
} as const

// \u2500\u2500 Context \u2500\u2500

type MetricCardContextValue = { size: 'sm' | 'default' | 'lg'; animated: boolean }
const MetricCardContext = React.createContext<MetricCardContextValue>({ size: 'default', animated: false })

// \u2500\u2500 Types \u2500\u2500

export type MetricCardVariant = 'default' | 'elevated' | 'ghost'
export type MetricCardSize = 'sm' | 'default' | 'lg'
export type MetricCardRadius = 'none' | 'sm' | 'base' | 'default' | 'lg' | 'xl' | '2xl' | '3xl' | 'full'
export type MetricCardTrendDirection = 'up' | 'down' | 'neutral'

// \u2500\u2500 MetricCard (root) \u2500\u2500

export interface MetricCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof metricCardVariants> {
  animated?: boolean
}

const MetricCardRoot = React.forwardRef<HTMLDivElement, MetricCardProps>(
  ({ className, variant, size, radius, animated = false, children, ...props }, ref) => {
    const resolvedSize = (size || 'default') as MetricCardSize
    return (
      <MetricCardContext.Provider value={{ size: resolvedSize, animated }}>
        <div
          ref={ref}
          className={cn(metricCardVariants({ variant, size, radius }), className)}
          {...props}
        >
          {children}
        </div>
      </MetricCardContext.Provider>
    )
  }
)
MetricCardRoot.displayName = 'MetricCard'

// \u2500\u2500 MetricCardHeader \u2500\u2500

export interface MetricCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

const MetricCardHeader = React.forwardRef<HTMLDivElement, MetricCardHeaderProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center justify-between gap-2', className)}
      {...props}
    />
  )
)
MetricCardHeader.displayName = 'MetricCardHeader'

// \u2500\u2500 MetricCardTitle \u2500\u2500

export interface MetricCardTitleProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const MetricCardTitle = React.forwardRef<HTMLParagraphElement, MetricCardTitleProps>(
  ({ className, ...props }, ref) => {
    const { size } = React.useContext(MetricCardContext)
    return (
      <p
        ref={ref}
        className={cn(titleSizes[size], 'font-semibold text-text-muted', className)}
        {...props}
      />
    )
  }
)
MetricCardTitle.displayName = 'MetricCardTitle'

// \u2500\u2500 MetricCardValue \u2500\u2500

export interface MetricCardValueProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const MetricCardValue = React.forwardRef<HTMLParagraphElement, MetricCardValueProps>(
  ({ className, children, ...props }, ref) => {
    const { size, animated } = React.useContext(MetricCardContext)
    const [display, setDisplay] = React.useState<React.ReactNode>(children)

    React.useEffect(() => {
      if (!animated || typeof children !== 'string') { setDisplay(children); return }
      const numMatch = children.match(/[\\d,.]+/)
      if (!numMatch) { setDisplay(children); return }
      const numStr = numMatch[0].replace(/,/g, '')
      const target = parseFloat(numStr)
      if (isNaN(target)) { setDisplay(children); return }
      const prefix = children.slice(0, children.indexOf(numMatch[0]))
      const suffix = children.slice(children.indexOf(numMatch[0]) + numMatch[0].length)
      const steps = 24
      const duration = 700
      let step = 0
      setDisplay(prefix + '0' + suffix)
      const timer = setInterval(() => {
        step++
        const eased = 1 - Math.pow(1 - step / steps, 3)
        const current = target * eased
        const formatted = target >= 1000
          ? Math.floor(current).toLocaleString()
          : current.toFixed(numStr.includes('.') ? 2 : 0)
        setDisplay(prefix + formatted + suffix)
        if (step >= steps) { setDisplay(children); clearInterval(timer) }
      }, duration / steps)
      return () => clearInterval(timer)
    }, [children, animated])

    return (
      <p
        ref={ref}
        className={cn(valueSizes[size], 'font-bold text-foreground mt-1', className)}
        {...props}
      >
        {display}
      </p>
    )
  }
)
MetricCardValue.displayName = 'MetricCardValue'

// \u2500\u2500 MetricCardTrend \u2500\u2500

export interface MetricCardTrendProps extends React.HTMLAttributes<HTMLParagraphElement> {
  direction: MetricCardTrendDirection
}

const MetricCardTrend = React.forwardRef<HTMLParagraphElement, MetricCardTrendProps>(
  ({ className, direction, children, ...props }, ref) => {
    const config = trendConfig[direction]
    return (
      <p
        ref={ref}
        className={cn('flex items-center gap-1 text-sm mt-2', config.color, className)}
        {...props}
      >
        {direction === 'up' && (
          <svg className="icon-xs" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
          </svg>
        )}
        {direction === 'down' && (
          <svg className="icon-xs" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        )}
        {direction === 'neutral' && (
          <svg className="icon-xs" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
          </svg>
        )}
        <span className="sr-only">{config.srLabel}</span>
        {children}
      </p>
    )
  }
)
MetricCardTrend.displayName = 'MetricCardTrend'

// \u2500\u2500 MetricCardDescription \u2500\u2500

export interface MetricCardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const MetricCardDescription = React.forwardRef<HTMLParagraphElement, MetricCardDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-xs text-text-muted mt-1', className)}
      {...props}
    />
  )
)
MetricCardDescription.displayName = 'MetricCardDescription'

// \u2500\u2500 MetricCardSymbol \u2500\u2500

export interface MetricCardSymbolProps extends React.HTMLAttributes<HTMLDivElement> {}

const MetricCardSymbol = React.forwardRef<HTMLDivElement, MetricCardSymbolProps>(
  ({ className, ...props }, ref) => {
    const { size } = React.useContext(MetricCardContext)
    return (
      <div
        ref={ref}
        className={cn('text-text-muted', iconWrapperSizes[size], className)}
        {...props}
      />
    )
  }
)
MetricCardSymbol.displayName = 'MetricCardSymbol'

// \u2500\u2500 Exports \u2500\u2500

// \u2500\u2500\u2500 Namespace \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const MetricCard = Object.assign(MetricCardRoot, {
  Header: MetricCardHeader,
  Title: MetricCardTitle,
  Value: MetricCardValue,
  Trend: MetricCardTrend,
  Description: MetricCardDescription,
  Symbol: MetricCardSymbol,
})

// eslint-disable-next-line @typescript-eslint/no-namespace
namespace MetricCard {
  export type HeaderProps = MetricCardHeaderProps
  export type TitleProps = MetricCardTitleProps
  export type ValueProps = MetricCardValueProps
  export type TrendProps = MetricCardTrendProps
  export type DescriptionProps = MetricCardDescriptionProps
  export type SymbolProps = MetricCardSymbolProps
}

export {
  MetricCard,
  MetricCardHeader,
  MetricCardTitle,
  MetricCardValue,
  MetricCardTrend,
  MetricCardDescription,
  MetricCardSymbol,
  metricCardVariants,
}
`,
      type: "ui"
    }]
  },
  "modal": {
    name: "modal",
    dependencies: ["@radix-ui/react-alert-dialog", "@radix-ui/react-dialog"],
    registryDependencies: [],
    reverseDependencies: [],
    namespace: true,
    description: "",
    files: [{
      path: "modal.tsx",
      content: `'use client'

import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// \u2500\u2500\u2500 Default Close Icon (built-in, no external dependency) \u2500\u2500
const DefaultCloseIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
)

// \u2500\u2500\u2500 Style Context \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
type ModalStyleContextValue = {
  scrollBehavior: 'inside' | 'outside'
}
const ModalStyleContext = React.createContext<ModalStyleContextValue>({
  scrollBehavior: 'outside',
})

// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
// Modal (Dialog)
// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550

// \u2500\u2500\u2500 Modal (Root) \u2014 wrapper to avoid Object.assign mutating DialogPrimitive.Root \u2500\u2500
function ModalRoot(props: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root {...props} />
}

// \u2500\u2500\u2500 ModalTrigger \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const ModalTrigger = DialogPrimitive.Trigger

// \u2500\u2500\u2500 ModalPortal \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const ModalPortal = DialogPrimitive.Portal

// \u2500\u2500\u2500 ModalClose \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const ModalClose = DialogPrimitive.Close

// \u2500\u2500\u2500 ModalOverlay \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const ModalOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-overlay bg-black/50',
      'data-[state=open]:animate-modal-overlay-enter data-[state=closed]:animate-modal-overlay-exit',
      className
    )}
    {...props}
  />
))
ModalOverlay.displayName = 'ModalOverlay'

// \u2500\u2500\u2500 ModalContent \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const modalContentVariants = cva('', {
  variants: {
    size: {
      xs: 'max-w-[360px]',   // 360px \u2014 simple confirmation
      sm: 'max-w-[480px]',   // 480px \u2014 standard (default)
      md: 'max-w-[600px]',   // 600px \u2014 standard form
      lg: 'max-w-[760px]',   // 760px \u2014 complex form
      xl: 'max-w-[960px]',   // 960px \u2014 table, dashboard
      full: 'max-w-none',    // full width (constrained by wrapper padding)
    },
  },
  defaultVariants: {
    size: 'sm',
  },
})

export interface ModalContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof modalContentVariants> {
  /** Scroll behavior when content overflows */
  scrollBehavior?: 'inside' | 'outside'
  /** Show built-in close button */
  showCloseButton?: boolean
  /** Custom close icon (replaces default X) */
  closeIcon?: React.ReactNode
}

const ModalContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  ModalContentProps
>(({ className, children, size = 'sm', scrollBehavior = 'outside', showCloseButton = true, closeIcon, ...props }, ref) => {
  const isInside = scrollBehavior === 'inside'
  const isFull = size === 'full'
  const useInsideScroll = isInside || isFull

  const closeButton = showCloseButton && (
    <DialogPrimitive.Close className={cn(
      'absolute right-4 top-4 rounded-md p-1',
      'text-text-muted hover:text-foreground',
      'transition-colors duration-fast',
      'focus-visible:focus-ring focus-visible:outline-none',
      'disabled:pointer-events-none'
    )}>
      {closeIcon || <DefaultCloseIcon className="icon-sm" />}
      <span className="sr-only">Close</span>
    </DialogPrimitive.Close>
  )

  if (!useInsideScroll) {
    // Outside scroll: DialogPrimitive.Content becomes the full-screen scrollable container.
    // Radix's internal RemoveScroll detects its own root element as scrollable,
    // allowing wheel/touch scroll events to pass through correctly.
    return (
      <ModalPortal>
        <ModalOverlay />
        <ModalStyleContext.Provider value={{ scrollBehavior: 'outside' }}>
          <DialogPrimitive.Content
            ref={ref}
            className={cn(
              'fixed inset-0 z-modal overflow-y-auto',
              'focus:outline-none',
              'data-[state=open]:animate-modal-content-enter data-[state=closed]:animate-modal-content-exit',
            )}
            {...props}
          >
            {/* Backdrop click area: closes dialog when clicking outside the panel */}
            <DialogPrimitive.Close asChild>
              <div className="flex min-h-full items-center justify-center p-4">
                <div
                  className={cn(
                    'relative w-full rounded-xl bg-background shadow-xl overflow-hidden',
                    modalContentVariants({ size }),
                    className,
                  )}
                  onClick={(e) => e.stopPropagation()}
                >
                  {children}
                  {closeButton}
                </div>
              </div>
            </DialogPrimitive.Close>
          </DialogPrimitive.Content>
        </ModalStyleContext.Provider>
      </ModalPortal>
    )
  }

  // Inside scroll / full: DialogPrimitive.Content is the visual modal panel.
  return (
    <ModalPortal>
      <ModalOverlay />
      <ModalStyleContext.Provider value={{ scrollBehavior: 'inside' }}>
        <div className="fixed inset-0 z-modal flex items-center justify-center p-4">
          <DialogPrimitive.Content
            ref={ref}
            className={cn(
              'relative w-full rounded-xl bg-background shadow-xl overflow-hidden',
              'focus:outline-none',
              'data-[state=open]:animate-modal-content-enter data-[state=closed]:animate-modal-content-exit',
              modalContentVariants({ size }),
              isInside && 'flex flex-col max-h-[85vh]',
              isFull && 'flex flex-col h-full',
              className,
            )}
            {...props}
          >
            {children}
            {closeButton}
          </DialogPrimitive.Content>
        </div>
      </ModalStyleContext.Provider>
    </ModalPortal>
  )
})
ModalContent.displayName = 'ModalContent'

// \u2500\u2500\u2500 ModalHeader \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const ModalHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col gap-1.5 p-6 pb-0', className)}
    {...props}
  />
))
ModalHeader.displayName = 'ModalHeader'

// \u2500\u2500\u2500 ModalTitle \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const ModalTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('text-lg font-semibold text-foreground', className)}
    {...props}
  />
))
ModalTitle.displayName = 'ModalTitle'

// \u2500\u2500\u2500 ModalDescription \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const ModalDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-md text-text-muted', className)}
    {...props}
  />
))
ModalDescription.displayName = 'ModalDescription'

// \u2500\u2500\u2500 ModalBody \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const ModalBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { scrollBehavior } = React.useContext(ModalStyleContext)
  return (
    <div
      ref={ref}
      className={cn(
        'p-6',
        scrollBehavior === 'inside' && 'flex-1 overflow-y-auto',
        className
      )}
      {...props}
    />
  )
})
ModalBody.displayName = 'ModalBody'

// \u2500\u2500\u2500 ModalFooter \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const ModalFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex items-center justify-end gap-3 p-6 pt-0',
      className
    )}
    {...props}
  />
))
ModalFooter.displayName = 'ModalFooter'

// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
// AlertModal (AlertDialog)
// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550

// \u2500\u2500\u2500 AlertModal (Root) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const AlertModalRoot = AlertDialogPrimitive.Root

// \u2500\u2500\u2500 AlertModalTrigger \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const AlertModalTrigger = AlertDialogPrimitive.Trigger

// \u2500\u2500\u2500 AlertModalPortal \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const AlertModalPortal = AlertDialogPrimitive.Portal

// \u2500\u2500\u2500 AlertModalOverlay \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const AlertModalOverlay = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-overlay bg-black/50',
      'data-[state=open]:animate-modal-overlay-enter data-[state=closed]:animate-modal-overlay-exit',
      className
    )}
    {...props}
  />
))
AlertModalOverlay.displayName = 'AlertModalOverlay'

// \u2500\u2500\u2500 AlertModalContent \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const alertModalContentVariants = cva('', {
  variants: {
    size: {
      xs: 'max-w-[360px]',  // 360px
      sm: 'max-w-[480px]',  // 480px (default)
    },
  },
  defaultVariants: {
    size: 'sm',
  },
})

export interface AlertModalContentProps
  extends React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>,
    VariantProps<typeof alertModalContentVariants> {}

const AlertModalContent = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Content>,
  AlertModalContentProps
>(({ className, children, size = 'sm', ...props }, ref) => (
  <AlertModalPortal>
    <AlertModalOverlay />
    <div className="fixed inset-0 z-modal flex items-center justify-center p-4">
      <AlertDialogPrimitive.Content
        ref={ref}
        className={cn(
          'relative w-full rounded-xl bg-background shadow-xl',
          'focus:outline-none',
          'data-[state=open]:animate-modal-content-enter data-[state=closed]:animate-modal-content-exit',
          alertModalContentVariants({ size }),
          className
        )}
        {...props}
      >
        {children}
      </AlertDialogPrimitive.Content>
    </div>
  </AlertModalPortal>
))
AlertModalContent.displayName = 'AlertModalContent'

// \u2500\u2500\u2500 AlertModalHeader \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const AlertModalHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col gap-1.5 p-6 pb-0', className)}
    {...props}
  />
))
AlertModalHeader.displayName = 'AlertModalHeader'

// \u2500\u2500\u2500 AlertModalTitle \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const AlertModalTitle = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title
    ref={ref}
    className={cn('text-lg font-semibold text-foreground', className)}
    {...props}
  />
))
AlertModalTitle.displayName = 'AlertModalTitle'

// \u2500\u2500\u2500 AlertModalDescription \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const AlertModalDescription = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Description
    ref={ref}
    className={cn('text-md text-text-muted', className)}
    {...props}
  />
))
AlertModalDescription.displayName = 'AlertModalDescription'

// \u2500\u2500\u2500 AlertModalBody \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const AlertModalBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('p-6', className)}
    {...props}
  />
))
AlertModalBody.displayName = 'AlertModalBody'

// \u2500\u2500\u2500 AlertModalFooter \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const AlertModalFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex items-center justify-end gap-3 p-6 pt-0',
      className
    )}
    {...props}
  />
))
AlertModalFooter.displayName = 'AlertModalFooter'

// \u2500\u2500\u2500 AlertModalAction \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const AlertModalAction = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Action
    ref={ref}
    className={className}
    {...props}
  />
))
AlertModalAction.displayName = 'AlertModalAction'

// \u2500\u2500\u2500 AlertModalCancel \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const AlertModalCancel = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Cancel>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Cancel
    ref={ref}
    className={className}
    {...props}
  />
))
AlertModalCancel.displayName = 'AlertModalCancel'

// \u2500\u2500\u2500 Namespace: Modal \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const Modal = Object.assign(ModalRoot, {
  Trigger: ModalTrigger,
  Portal: ModalPortal,
  Overlay: ModalOverlay,
  Content: ModalContent,
  Header: ModalHeader,
  Title: ModalTitle,
  Description: ModalDescription,
  Body: ModalBody,
  Footer: ModalFooter,
  Close: ModalClose,
})

// eslint-disable-next-line @typescript-eslint/no-namespace
namespace Modal {
  export type ContentProps = ModalContentProps
}

// \u2500\u2500\u2500 Namespace: AlertModal \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const AlertModal = Object.assign(AlertModalRoot, {
  Trigger: AlertModalTrigger,
  Portal: AlertModalPortal,
  Overlay: AlertModalOverlay,
  Content: AlertModalContent,
  Header: AlertModalHeader,
  Title: AlertModalTitle,
  Description: AlertModalDescription,
  Body: AlertModalBody,
  Footer: AlertModalFooter,
  Action: AlertModalAction,
  Cancel: AlertModalCancel,
})

// eslint-disable-next-line @typescript-eslint/no-namespace
namespace AlertModal {
  export type ContentProps = AlertModalContentProps
}

// \u2500\u2500\u2500 Exports \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
export {
  Modal,
  ModalTrigger,
  ModalPortal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalBody,
  ModalFooter,
  ModalClose,
  modalContentVariants,
  AlertModal,
  AlertModalTrigger,
  AlertModalPortal,
  AlertModalOverlay,
  AlertModalContent,
  AlertModalHeader,
  AlertModalTitle,
  AlertModalDescription,
  AlertModalBody,
  AlertModalFooter,
  AlertModalAction,
  AlertModalCancel,
  alertModalContentVariants,
}
`,
      type: "ui"
    }]
  },
  "navigation-menu": {
    name: "navigation-menu",
    dependencies: ["@radix-ui/react-collapsible", "@radix-ui/react-navigation-menu", "@radix-ui/react-slot"],
    registryDependencies: [],
    reverseDependencies: [],
    namespace: true,
    description: "",
    files: [{
      path: "navigation-menu.tsx",
      content: `'use client'

import * as React from 'react'
import * as NavigationMenuPrimitive from '@radix-ui/react-navigation-menu'
import * as CollapsiblePrimitive from '@radix-ui/react-collapsible'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '@/lib/utils'

// \u2500\u2500\u2500 Built-in Icons \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  )
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  )
}

// \u2500\u2500\u2500 Radius Configuration \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

type NavigationMenuRadius = 'sm' | 'md' | 'lg' | 'xl'

const contentRadiusMap: Record<NavigationMenuRadius, string> = {
  sm: 'rounded',        // 4px
  md: 'rounded-md',     // 6px
  lg: 'rounded-lg',     // 8px
  xl: 'rounded-xl',     // 12px
}

const itemRadiusMap: Record<NavigationMenuRadius, string> = {
  sm: 'rounded-sm',     // 2px
  md: 'rounded',        // 4px
  lg: 'rounded-md',     // 6px
  xl: 'rounded-lg',     // 8px
}

// \u2500\u2500\u2500 Contexts \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

type NavigationMenuContextValue = {
  orientation: 'horizontal' | 'vertical'
  size: 'sm' | 'md' | 'default' | 'lg'
  collapsed: boolean
  radius: NavigationMenuRadius
  fontWeight: 'normal' | 'semibold'
}

const NavigationMenuContext = React.createContext<NavigationMenuContextValue>({
  orientation: 'horizontal',
  size: 'default',
  collapsed: false,
  radius: 'lg',
  fontWeight: 'normal',
})
const useNavigationMenuContext = () => React.useContext(NavigationMenuContext)

// Whether we're inside NavigationMenuContent (affects link styling)
const ContentLevelContext = React.createContext(false)

// \u2500\u2500\u2500 Size Configuration \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

const navigationMenuSizeMap = {
  sm: {
    trigger: 'h-8 text-sm px-3 gap-2',
    link: 'h-8 text-sm px-3 gap-2',
    icon: 'icon-xs',
    collapsedSquare: 'size-8', collapsedWidth: 56,
    dropdownLink: 'px-3 py-1.5 text-sm gap-2',
    subLink: 'h-8 text-sm pl-8 pr-3 gap-2',
    groupLabel: 'text-2xs px-3 mb-1', groupMargin: 'mt-4 first:mt-0',
  },
  md: {
    trigger: 'h-9 text-md px-3.5 gap-2',
    link: 'h-9 text-md px-3.5 gap-2',
    icon: 'icon-sm',
    collapsedSquare: 'size-9', collapsedWidth: 60,
    dropdownLink: 'px-3 py-1.5 text-md gap-2',
    subLink: 'h-9 text-md pl-9 pr-3.5 gap-2',
    groupLabel: 'text-xs px-3.5 mb-1', groupMargin: 'mt-4 first:mt-0',
  },
  default: {
    trigger: 'h-10 text-md px-4 gap-2',
    link: 'h-10 text-md px-4 gap-2',
    icon: 'icon-sm',
    collapsedSquare: 'size-10', collapsedWidth: 64,
    dropdownLink: 'px-3 py-2 text-md gap-2',
    subLink: 'h-10 text-md pl-10 pr-4 gap-2',
    groupLabel: 'text-xs px-4 mb-1.5', groupMargin: 'mt-5 first:mt-0',
  },
  lg: {
    trigger: 'h-12 text-base px-6 gap-2',
    link: 'h-12 text-base px-6 gap-2',
    icon: 'icon-sm',
    collapsedSquare: 'size-12', collapsedWidth: 72,
    dropdownLink: 'px-3 py-2.5 text-base gap-2',
    subLink: 'h-12 text-base pl-12 pr-6 gap-2',
    groupLabel: 'text-xs px-4 mb-2', groupMargin: 'mt-6 first:mt-0',
  },
} as const

// \u2500\u2500\u2500 NavigationMenu (Root) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

export interface NavigationMenuProps extends React.HTMLAttributes<HTMLElement> {
  /** Layout orientation */
  orientation?: 'horizontal' | 'vertical'
  /** Size of the menu items */
  size?: 'sm' | 'md' | 'default' | 'lg'
  /** Vertical only: show icons only (collapsed sidebar) */
  collapsed?: boolean
  /** Vertical only: sidebar width (default: 256px / 16rem) */
  width?: number | string
  /** Vertical only: collapsed sidebar width (default: 64px / 4rem) */
  collapsedWidth?: number | string
  /** Border radius for dropdown content and items */
  radius?: NavigationMenuRadius
  /** Font weight for menu items (default: normal, active items always use semibold) */
  fontWeight?: 'normal' | 'semibold'
  /** Horizontal only: delay before hover opens in ms */
  delayDuration?: number
  /** Horizontal only: skip delay when moving between triggers */
  skipDelayDuration?: number
  /** Controlled active menu item value */
  value?: string
  /** Default active menu item value (uncontrolled) */
  defaultValue?: string
  /** Callback when active item changes */
  onValueChange?: (value: string) => void
}

const NavigationMenuRoot = React.forwardRef<HTMLElement, NavigationMenuProps>(
  ({
    className,
    orientation = 'horizontal',
    size = 'default',
    collapsed = false,
    width,
    collapsedWidth,
    radius = 'lg',
    fontWeight = 'normal',
    delayDuration = 200,
    skipDelayDuration = 300,
    value,
    defaultValue,
    onValueChange,
    children,
    style,
    ...props
  }, ref) => {
    const contextValue = React.useMemo(
      () => ({ orientation, size, collapsed: orientation === 'vertical' ? collapsed : false, radius, fontWeight }),
      [orientation, size, collapsed, radius, fontWeight]
    )

    if (orientation === 'horizontal') {
      return (
        <NavigationMenuContext.Provider value={contextValue}>
          <NavigationMenuPrimitive.Root
            ref={ref as React.Ref<HTMLDivElement>}
            className={cn('relative', className)}
            delayDuration={delayDuration}
            skipDelayDuration={skipDelayDuration}
            value={value}
            defaultValue={defaultValue ?? ''}
            onValueChange={onValueChange}
          >
            {children}
          </NavigationMenuPrimitive.Root>
        </NavigationMenuContext.Provider>
      )
    }

    // Vertical mode
    const resolvedWidth = collapsed
      ? (collapsedWidth ?? navigationMenuSizeMap[size].collapsedWidth)
      : (width ?? 256)
    const widthValue = typeof resolvedWidth === 'number' ? \`\${resolvedWidth}px\` : resolvedWidth

    return (
      <NavigationMenuContext.Provider value={contextValue}>
        <nav
          ref={ref}
          aria-label="navigation"
          className={cn(
            'flex flex-col',
            'transition-[width] duration-normal ease-out',
            className
          )}
          style={{ width: widthValue, ...style }}
          {...props}
        >
          {children}
        </nav>
      </NavigationMenuContext.Provider>
    )
  }
)
NavigationMenuRoot.displayName = 'NavigationMenu'

// \u2500\u2500\u2500 NavigationMenuList \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

export interface NavigationMenuListProps extends React.HTMLAttributes<HTMLUListElement> {}

const NavigationMenuList = React.forwardRef<HTMLUListElement, NavigationMenuListProps>(
  ({ className, children, ...props }, ref) => {
    const { orientation } = useNavigationMenuContext()

    if (orientation === 'horizontal') {
      return (
        <NavigationMenuPrimitive.List
          ref={ref}
          className={cn('flex items-center gap-1', className)}
          {...props}
        >
          {children}
        </NavigationMenuPrimitive.List>
      )
    }

    return (
      <ul
        ref={ref}
        className={cn('flex flex-col gap-0.5', className)}
        {...props}
      >
        {children}
      </ul>
    )
  }
)
NavigationMenuList.displayName = 'NavigationMenuList'

// \u2500\u2500\u2500 NavigationMenuItem \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

export interface NavigationMenuItemProps extends React.HTMLAttributes<HTMLLIElement> {
  /** Value identifier for Radix (horizontal mode) */
  value?: string
  /** Vertical only: default open state for sub-menu */
  defaultOpen?: boolean
}

const NavigationMenuItem = React.forwardRef<HTMLLIElement, NavigationMenuItemProps>(
  ({ className, value, defaultOpen = false, children, ...props }, ref) => {
    const { orientation, collapsed } = useNavigationMenuContext()
    const [open, setOpen] = React.useState(defaultOpen)

    // Auto-close sub-menus when collapsed
    React.useEffect(() => {
      if (collapsed) setOpen(false)
    }, [collapsed])

    if (orientation === 'horizontal') {
      return (
        <NavigationMenuPrimitive.Item
          ref={ref}
          className={cn('relative', className)}
          value={value}
          {...props}
        >
          {children}
        </NavigationMenuPrimitive.Item>
      )
    }

    // Vertical: wrap in Collapsible.Root for sub-menu support
    return (
      <CollapsiblePrimitive.Root
        open={collapsed ? false : open}
        onOpenChange={collapsed ? undefined : setOpen}
        asChild
      >
        <li ref={ref} className={cn('', className)} {...props}>
          {children}
        </li>
      </CollapsiblePrimitive.Root>
    )
  }
)
NavigationMenuItem.displayName = 'NavigationMenuItem'

// \u2500\u2500\u2500 NavigationMenuTrigger \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

export interface NavigationMenuTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Icon displayed before the label */
  icon?: React.ReactNode
  /** Custom chevron icon (default: built-in ChevronDown for horizontal, ChevronRight for vertical) */
  chevronIcon?: React.ReactNode
}

const NavigationMenuTrigger = React.forwardRef<HTMLButtonElement, NavigationMenuTriggerProps>(
  ({ className, children, icon, chevronIcon, ...props }, ref) => {
    const { orientation, size, collapsed, radius, fontWeight: fw } = useNavigationMenuContext()
    const s = navigationMenuSizeMap[size]
    const fwClass = fw === 'semibold' ? 'font-semibold' : 'font-normal'

    if (orientation === 'horizontal') {
      return (
        <NavigationMenuPrimitive.Trigger
          ref={ref}
          className={cn(
            'group inline-flex items-center justify-center',
            s.trigger,
            'gap-0',
            fwClass, 'text-text-muted',
            'transition-colors duration-fast',
            'hover:text-foreground',
            'data-[state=open]:text-foreground',
            'focus-visible:focus-ring',
            'disabled:pointer-events-none disabled:opacity-50',
            className
          )}
          {...props}
        >
          {icon && <span className={cn('shrink-0 mr-2', s.icon)}>{icon}</span>}
          {children}
          <span className={cn('shrink-0 ml-1 text-text-subtle transition-transform duration-fast group-data-[state=open]:rotate-180', s.icon)}>
            {chevronIcon ?? <ChevronDownIcon className="size-full" />}
          </span>
        </NavigationMenuPrimitive.Trigger>
      )
    }

    // Vertical: Collapsible trigger
    return (
      <CollapsiblePrimitive.Trigger
        ref={ref}
        className={cn(
          'group flex items-center cursor-pointer',
          contentRadiusMap[radius],
          collapsed
            ? [s.collapsedSquare, 'justify-center mx-auto']
            : ['w-full', s.trigger],
          fwClass, 'text-text-muted transition-colors duration-fast',
          'hover:text-foreground hover:bg-background-muted',
          !collapsed && 'data-[state=open]:text-foreground',
          'focus-visible:focus-ring',
          'disabled:pointer-events-none disabled:opacity-50',
          className
        )}
        {...(collapsed && typeof children === 'string' ? { title: children } : {})}
        {...props}
      >
        {icon && <span className={cn('shrink-0', s.icon)}>{icon}</span>}
        {!collapsed && (
          <>
            <span className="flex-1 text-left truncate">{children}</span>
            <span
              className={cn(
                'shrink-0 text-text-subtle transition-transform duration-normal',
                s.icon,
                'group-data-[state=open]:rotate-90'
              )}
            >
              {chevronIcon ?? <ChevronRightIcon className="size-full" />}
            </span>
          </>
        )}
      </CollapsiblePrimitive.Trigger>
    )
  }
)
NavigationMenuTrigger.displayName = 'NavigationMenuTrigger'

// \u2500\u2500\u2500 NavigationMenuContent \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

export interface NavigationMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const NavigationMenuContent = React.forwardRef<HTMLDivElement, NavigationMenuContentProps>(
  ({ className, children, ...props }, ref) => {
    const { orientation, collapsed, radius } = useNavigationMenuContext()

    if (orientation === 'horizontal') {
      return (
        <ContentLevelContext.Provider value={true}>
          <NavigationMenuPrimitive.Content
            ref={ref}
            className={cn(
              'absolute left-0 top-full z-dropdown pt-1',
              'data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out',
              className
            )}
            {...props}
          >
            <div className={cn('min-w-[180px] border border-border bg-background shadow-lg p-1.5 grid gap-0.5', contentRadiusMap[radius])}>
              {children}
            </div>
          </NavigationMenuPrimitive.Content>
        </ContentLevelContext.Provider>
      )
    }

    // Vertical: Collapsible content (hidden when collapsed)
    if (collapsed) return null

    return (
      <ContentLevelContext.Provider value={true}>
        <CollapsiblePrimitive.Content
          ref={ref}
          className={cn(
            'overflow-hidden',
            'data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up',
          )}
          {...props}
        >
          <div className={cn(
            'flex flex-col gap-0.5 py-1',
            className
          )}>
            {children}
          </div>
        </CollapsiblePrimitive.Content>
      </ContentLevelContext.Provider>
    )
  }
)
NavigationMenuContent.displayName = 'NavigationMenuContent'

// \u2500\u2500\u2500 NavigationMenuLink \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

export interface NavigationMenuLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Whether the link represents the current page */
  active?: boolean
  /** Compose with custom link component (Radix Slot) */
  asChild?: boolean
  /** Icon displayed before the label */
  icon?: React.ReactNode
}

const NavigationMenuLink = React.forwardRef<HTMLAnchorElement, NavigationMenuLinkProps>(
  ({ className, active, asChild, icon, children, ...props }, ref) => {
    const { orientation, size, collapsed, radius, fontWeight: fw } = useNavigationMenuContext()
    const s = navigationMenuSizeMap[size]
    const fwClass = fw === 'semibold' ? 'font-semibold' : 'font-normal'
    const inContent = React.useContext(ContentLevelContext)

    if (orientation === 'horizontal') {
      // Exclude onSelect to avoid React vs Radix type conflict
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { onSelect, ...radixSafeProps } = props as any

      // Content-level links (inside dropdown): block style with hover bg
      if (inContent) {
        return (
          <NavigationMenuPrimitive.Link
            ref={ref}
            className={cn(
              'flex items-center w-full',
              s.dropdownLink,
              itemRadiusMap[radius],
              'text-text-muted transition-colors duration-fast',
              'hover:text-foreground hover:bg-background-muted',
              active && 'text-foreground bg-background-muted font-semibold',
              'focus-visible:focus-ring',
              className
            )}
            active={active}
            asChild={asChild}
            onSelect={onSelect}
            {...radixSafeProps}
          >
            {asChild ? children : (
              <>
                {icon && <span className={cn('shrink-0', s.icon)}>{icon}</span>}
                {children}
              </>
            )}
          </NavigationMenuPrimitive.Link>
        )
      }

      // Top-level horizontal links: text only, no hover bg
      return (
        <NavigationMenuPrimitive.Link
          ref={ref}
          className={cn(
            'inline-flex items-center justify-center',
            s.link,
            fwClass, 'text-text-muted',
            'transition-colors duration-fast',
            'hover:text-foreground',
            active && 'text-foreground font-semibold',
            'focus-visible:focus-ring',
            className
          )}
          active={active}
          asChild={asChild}
          onSelect={onSelect}
          {...radixSafeProps}
        >
          {asChild ? children : (
            <>
              {icon && <span className={cn('shrink-0', s.icon)}>{icon}</span>}
              {children}
            </>
          )}
        </NavigationMenuPrimitive.Link>
      )
    }

    // \u2500\u2500 Vertical mode \u2500\u2500

    const Comp = asChild ? Slot : 'a'

    // Content-level links (sub-menu items): compact, indented
    if (inContent) {
      return (
        <Comp
          ref={ref}
          className={cn(
            'flex items-center w-full cursor-pointer',
            contentRadiusMap[radius],
            s.subLink,
            'text-text-muted transition-colors duration-fast',
            'hover:text-foreground hover:bg-background-muted',
            active && 'text-foreground bg-background-muted font-semibold',
            'focus-visible:focus-ring',
            className
          )}
          {...(active ? { 'aria-current': 'page' as const } : {})}
          {...props}
        >
          {icon && <span className={cn('shrink-0', s.icon)}>{icon}</span>}
          {!collapsed && children}
        </Comp>
      )
    }

    // Top-level vertical links
    return (
      <Comp
        ref={ref}
        className={cn(
          'relative flex items-center cursor-pointer',
          contentRadiusMap[radius],
          collapsed
            ? [s.collapsedSquare, 'justify-center mx-auto']
            : ['w-full', s.link],
          'text-text-muted transition-colors duration-fast',
          'hover:text-foreground hover:bg-background-muted',
          active && 'text-foreground bg-background-muted font-semibold',
          'focus-visible:focus-ring',
          className
        )}
        {...(active ? { 'aria-current': 'page' as const } : {})}
        {...(collapsed && typeof children === 'string' ? { title: children } : {})}
        {...props}
      >
        {icon && <span className={cn('shrink-0', s.icon)}>{icon}</span>}
        {!collapsed && <span className="truncate">{children}</span>}
      </Comp>
    )
  }
)
NavigationMenuLink.displayName = 'NavigationMenuLink'

// \u2500\u2500\u2500 NavigationMenuGroup (vertical only) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

export interface NavigationMenuGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Group header label */
  label?: string
}

const NavigationMenuGroup = React.forwardRef<HTMLDivElement, NavigationMenuGroupProps>(
  ({ className, label, children, ...props }, ref) => {
    const { size, collapsed } = useNavigationMenuContext()
    const s = navigationMenuSizeMap[size]

    return (
      <div ref={ref} role="group" className={cn(label && !collapsed && s.groupMargin, className)} {...props}>
        {label && !collapsed && (
          <div className={cn(
            'font-semibold text-text-subtle uppercase tracking-wider select-none',
            s.groupLabel,
          )}>
            {label}
          </div>
        )}
        <ul className="flex flex-col gap-0.5">
          {children}
        </ul>
      </div>
    )
  }
)
NavigationMenuGroup.displayName = 'NavigationMenuGroup'

// \u2500\u2500\u2500 NavigationMenuIndicator \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

export interface NavigationMenuIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Active indicator dot color (default: dark/foreground, primary: brand color) */
  color?: 'default' | 'primary'
}

const NavigationMenuIndicator = React.forwardRef<HTMLDivElement, NavigationMenuIndicatorProps>(
  ({ className, color = 'default', ...props }, ref) => {
    const { orientation } = useNavigationMenuContext()

    // Vertical: active indicator is built into NavigationMenuLink styling
    if (orientation === 'vertical') return null

    return (
      <NavigationMenuPrimitive.Indicator
        ref={ref}
        className={cn(
          'z-10 flex h-[3px] items-end justify-center overflow-hidden',
          'transition-[width,transform] duration-normal ease-out',
          'data-[state=visible]:animate-fade-in data-[state=hidden]:animate-fade-out',
          className
        )}
        {...props}
      >
        <div className={cn(
          'relative h-full w-full rounded-full',
          color === 'default' ? 'bg-foreground' : 'bg-primary'
        )} />
      </NavigationMenuPrimitive.Indicator>
    )
  }
)
NavigationMenuIndicator.displayName = 'NavigationMenuIndicator'

// \u2500\u2500\u2500 NavigationMenuViewport \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

export interface NavigationMenuViewportProps extends React.HTMLAttributes<HTMLDivElement> {}

const NavigationMenuViewport = React.forwardRef<HTMLDivElement, NavigationMenuViewportProps>(
  ({ className, ...props }, ref) => {
    const { orientation } = useNavigationMenuContext()

    // Vertical mode does not use a viewport
    if (orientation === 'vertical') return null

    return (
      <div className="absolute left-0 top-full z-dropdown w-auto pt-1">
        <NavigationMenuPrimitive.Viewport
          ref={ref}
          className={cn(
            'relative overflow-hidden',
            'border border-border bg-background rounded-xl shadow-lg',
            'h-[var(--radix-navigation-menu-viewport-height)]',
            'w-[var(--radix-navigation-menu-viewport-width)]',
            'transition-[width,height] duration-fast ease-out',
            'data-[state=open]:animate-nav-viewport-enter',
            'data-[state=closed]:animate-nav-viewport-exit',
            className
          )}
          {...props}
        />
      </div>
    )
  }
)
NavigationMenuViewport.displayName = 'NavigationMenuViewport'

// \u2500\u2500\u2500 Exports \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

// \u2500\u2500\u2500 Namespace \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const NavigationMenu = Object.assign(NavigationMenuRoot, {
  List: NavigationMenuList,
  Item: NavigationMenuItem,
  Trigger: NavigationMenuTrigger,
  Content: NavigationMenuContent,
  Link: NavigationMenuLink,
  Group: NavigationMenuGroup,
  Indicator: NavigationMenuIndicator,
  Viewport: NavigationMenuViewport,
})

// eslint-disable-next-line @typescript-eslint/no-namespace
namespace NavigationMenu {
  export type ListProps = NavigationMenuListProps
  export type ItemProps = NavigationMenuItemProps
  export type TriggerProps = NavigationMenuTriggerProps
  export type ContentProps = NavigationMenuContentProps
  export type LinkProps = NavigationMenuLinkProps
  export type GroupProps = NavigationMenuGroupProps
  export type IndicatorProps = NavigationMenuIndicatorProps
  export type ViewportProps = NavigationMenuViewportProps
}

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
  NavigationMenuGroup,
  NavigationMenuIndicator,
  NavigationMenuViewport,
  navigationMenuSizeMap,
  type NavigationMenuRadius,
}
`,
      type: "ui"
    }]
  },
  "pagination": {
    name: "pagination",
    dependencies: [],
    registryDependencies: [],
    reverseDependencies: [],
    namespace: true,
    description: "",
    files: [{
      path: "pagination.tsx",
      content: `'use client'

import * as React from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// \u2500\u2500\u2500 Built-in Icons \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  )
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  )
}

function ChevronsLeftIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 17l-5-5 5-5M18 17l-5-5 5-5" />
    </svg>
  )
}

function ChevronsRightIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5-5 5M6 7l5 5-5 5" />
    </svg>
  )
}

function EllipsisIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <circle cx="6" cy="12" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="18" cy="12" r="1.5" />
    </svg>
  )
}

// \u2500\u2500\u2500 usePagination Hook \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

export type PaginationRange = (number | 'dots')[]

export interface UsePaginationProps {
  /** Total number of pages */
  total: number
  /** Number of siblings on each side of current page */
  siblings?: number
  /** Number of boundary pages at start/end */
  boundaries?: number
  /** Current active page (1-based) */
  page: number
}

function range(start: number, end: number): number[] {
  const result: number[] = []
  for (let i = start; i <= end; i++) result.push(i)
  return result
}

export function usePagination({
  total,
  siblings = 1,
  boundaries = 1,
  page,
}: UsePaginationProps): PaginationRange {
  if (total <= 0) return []

  const totalPageNumbers = siblings * 2 + 3 + boundaries * 2
  if (totalPageNumbers >= total) {
    return range(1, total)
  }

  const leftSiblingIndex = Math.max(page - siblings, boundaries + 1)
  const rightSiblingIndex = Math.min(page + siblings, total - boundaries)

  const showLeftDots = leftSiblingIndex > boundaries + 2
  const showRightDots = rightSiblingIndex < total - boundaries - 1

  if (!showLeftDots && showRightDots) {
    const leftItemCount = 3 + 2 * siblings + boundaries
    const leftRange = range(1, leftItemCount)
    return [...leftRange, 'dots' as const, ...range(total - boundaries + 1, total)]
  }

  if (showLeftDots && !showRightDots) {
    const rightItemCount = 3 + 2 * siblings + boundaries
    const rightRange = range(total - rightItemCount + 1, total)
    return [...range(1, boundaries), 'dots' as const, ...rightRange]
  }

  return [
    ...range(1, boundaries),
    'dots' as const,
    ...range(leftSiblingIndex, rightSiblingIndex),
    'dots' as const,
    ...range(total - boundaries + 1, total),
  ]
}

// \u2500\u2500\u2500 Context \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

export type PaginationSize = 'xs' | 'sm' | 'default' | 'lg' | 'xl'
export type PaginationVariant = 'default' | 'outline' | 'ghost'
export type PaginationColor = 'default' | 'primary'
export type PaginationRadius = 'sm' | 'base' | 'md' | 'lg' | 'xl' | 'full'

type PaginationContextValue = {
  page: number
  total: number
  siblings: number
  boundaries: number
  size: PaginationSize
  variant: PaginationVariant
  color: PaginationColor
  radius: PaginationRadius
  disabled: boolean
  loop: boolean
  onPageChange: (page: number) => void
  paginationRange: PaginationRange
}

const PaginationContext = React.createContext<PaginationContextValue | null>(null)

function usePaginationContext() {
  const ctx = React.useContext(PaginationContext)
  if (!ctx) throw new Error('Pagination components must be used within <Pagination>')
  return ctx
}

// \u2500\u2500\u2500 Size Map \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

const paginationSizeMap = {
  xs: { item: 'h-7 min-w-7 text-xs', icon: 'icon-xs', gap: 'gap-1' },
  sm: { item: 'h-8 min-w-8 text-sm', icon: 'icon-xs', gap: 'gap-1' },
  default: { item: 'h-9 min-w-9 text-md', icon: 'icon-sm', gap: 'gap-1' },
  lg: { item: 'h-10 min-w-10 text-md', icon: 'icon-sm', gap: 'gap-1.5' },
  xl: { item: 'h-12 min-w-12 text-base', icon: 'icon-sm', gap: 'gap-1.5' },
} as const

// \u2500\u2500\u2500 Item Variants (CVA) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

const paginationItemVariants = cva(
  'inline-flex items-center justify-center select-none transition-colors duration-fast font-semibold focus-visible:focus-ring',
  {
    variants: {
      radius: {
        sm: 'rounded-sm',
        base: 'rounded',
        md: 'rounded-md',
        lg: 'rounded-lg',
        xl: 'rounded-xl',
        full: 'rounded-full',
      },
    },
    defaultVariants: {
      radius: 'md',
    },
  }
)

// \u2500\u2500\u2500 Variant Style Helpers \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

// Active color maps
const activeColorMap = {
  default: 'bg-foreground text-background',
  primary: 'bg-primary text-primary-foreground',
} as const

const ghostActiveColorMap = {
  default: 'bg-background-muted text-foreground font-bold',
  primary: 'bg-background-muted text-primary',
} as const

function getItemClasses(variant: PaginationVariant, color: PaginationColor, isActive: boolean, disabled: boolean) {
  if (disabled) {
    return variant === 'outline'
      ? 'border border-border text-disabled-foreground pointer-events-none opacity-50'
      : 'border border-transparent text-disabled-foreground pointer-events-none opacity-50'
  }
  if (isActive) {
    switch (variant) {
      case 'outline':
        return \`border \${color === 'default' ? 'border-foreground' : 'border-primary'} \${activeColorMap[color]}\`
      case 'ghost':
        return \`border border-transparent \${ghostActiveColorMap[color]}\`
      case 'default':
      default:
        return \`border border-transparent \${activeColorMap[color]}\`
    }
  }
  switch (variant) {
    case 'outline':
      return 'border border-border text-text-muted hover:bg-background-muted hover:text-foreground'
    case 'ghost':
      return 'border border-transparent text-text-muted hover:bg-background-muted hover:text-foreground'
    case 'default':
    default:
      return 'border border-transparent text-text-muted hover:bg-background-muted hover:text-foreground'
  }
}

// \u2500\u2500\u2500 Pagination (Root) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

export interface PaginationProps extends Omit<React.ComponentPropsWithoutRef<'nav'>, 'onChange'> {
  /** Total number of pages */
  total?: number
  /** Controlled active page (1-based) */
  value?: number
  /** Initial page for uncontrolled mode */
  defaultValue?: number
  /** Page change callback */
  onChange?: (page: number) => void
  /** Number of siblings on each side of current page */
  siblings?: number
  /** Number of boundary pages at start/end */
  boundaries?: number
  /** Component size */
  size?: PaginationSize
  /** Visual variant */
  variant?: PaginationVariant
  /** Active page color */
  color?: PaginationColor
  /** Border radius */
  radius?: PaginationRadius
  /** Disable all interactions */
  disabled?: boolean
  /** Show previous/next controls */
  withControls?: boolean
  /** Show first/last controls */
  withEdges?: boolean
  /** Loop from last to first and vice versa */
  loop?: boolean
}

const PaginationRoot = React.forwardRef<HTMLElement, PaginationProps>(
  ({
    className,
    total = 1,
    value,
    defaultValue = 1,
    onChange,
    siblings = 1,
    boundaries = 1,
    size = 'default',
    variant = 'default',
    color = 'default',
    radius = 'md',
    disabled = false,
    withControls = true, // eslint-disable-line @typescript-eslint/no-unused-vars
    withEdges = false, // eslint-disable-line @typescript-eslint/no-unused-vars
    loop = false,
    children,
    ...props
  }, ref) => {
    // Controlled / Uncontrolled
    const [internalPage, setInternalPage] = React.useState(defaultValue)
    const isControlled = value !== undefined
    const page = isControlled ? value : internalPage

    const handlePageChange = React.useCallback((newPage: number) => {
      if (disabled) return
      const clamped = Math.max(1, Math.min(total, newPage))
      if (!isControlled) setInternalPage(clamped)
      onChange?.(clamped)
    }, [disabled, total, isControlled, onChange])

    const paginationRange = usePagination({ total, siblings, boundaries, page })

    const contextValue = React.useMemo<PaginationContextValue>(() => ({
      page,
      total,
      siblings,
      boundaries,
      size,
      variant,
      color,
      radius,
      disabled,
      loop,
      onPageChange: handlePageChange,
      paginationRange,
    }), [page, total, siblings, boundaries, size, variant, color, radius, disabled, loop, handlePageChange, paginationRange])

    return (
      <PaginationContext.Provider value={contextValue}>
        <nav
          ref={ref}
          role="navigation"
          aria-label="pagination"
          className={cn('', className)}
          {...props}
        >
          {children}
        </nav>
      </PaginationContext.Provider>
    )
  }
)
PaginationRoot.displayName = 'Pagination'

// \u2500\u2500\u2500 PaginationContent \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

const PaginationContent = React.forwardRef<HTMLUListElement, React.ComponentPropsWithoutRef<'ul'>>(
  ({ className, ...props }, ref) => {
    const { size } = usePaginationContext()
    const sizeClass = paginationSizeMap[size]
    return (
      <ul
        ref={ref}
        className={cn('flex flex-wrap items-center', sizeClass.gap, className)}
        {...props}
      />
    )
  }
)
PaginationContent.displayName = 'PaginationContent'

// \u2500\u2500\u2500 PaginationItem \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

const PaginationItem = React.forwardRef<HTMLLIElement, React.ComponentPropsWithoutRef<'li'>>(
  ({ className, ...props }, ref) => (
    <li ref={ref} className={cn('', className)} {...props} />
  )
)
PaginationItem.displayName = 'PaginationItem'

// \u2500\u2500\u2500 PaginationLink \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

export interface PaginationLinkProps extends React.ComponentPropsWithoutRef<'button'> {
  /** Page number this link navigates to */
  page: number
  /** Whether this page is currently active (auto-detected from context if omitted) */
  isActive?: boolean
}

const PaginationLink = React.forwardRef<HTMLButtonElement, PaginationLinkProps>(
  ({ className, page: targetPage, isActive: isActiveProp, ...props }, ref) => {
    const ctx = usePaginationContext()
    const isActive = isActiveProp ?? (ctx.page === targetPage)
    const sizeClass = paginationSizeMap[ctx.size]

    return (
      <button
        ref={ref}
        type="button"
        aria-current={isActive ? 'page' : undefined}
        aria-label={\`Go to page \${targetPage}\`}
        disabled={ctx.disabled}
        onClick={() => ctx.onPageChange(targetPage)}
        className={cn(
          paginationItemVariants({ radius: ctx.radius }),
          sizeClass.item,
          getItemClasses(ctx.variant, ctx.color, isActive, ctx.disabled),
          className
        )}
        {...props}
      >
        {targetPage}
      </button>
    )
  }
)
PaginationLink.displayName = 'PaginationLink'

// \u2500\u2500\u2500 PaginationPrevious \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

export interface PaginationPreviousProps extends React.ComponentPropsWithoutRef<'button'> {
  /** Custom icon */
  icon?: React.ReactNode
}

const PaginationPrevious = React.forwardRef<HTMLButtonElement, PaginationPreviousProps>(
  ({ className, icon, ...props }, ref) => {
    const ctx = usePaginationContext()
    const sizeClass = paginationSizeMap[ctx.size]
    const isDisabled = ctx.disabled || (!ctx.loop && ctx.page <= 1)

    const handleClick = () => {
      if (ctx.page <= 1) {
        if (ctx.loop) ctx.onPageChange(ctx.total)
      } else {
        ctx.onPageChange(ctx.page - 1)
      }
    }

    return (
      <button
        ref={ref}
        type="button"
        aria-label="Go to previous page"
        disabled={isDisabled}
        onClick={handleClick}
        className={cn(
          paginationItemVariants({ radius: ctx.radius }),
          sizeClass.item,
          getItemClasses(ctx.variant, ctx.color, false, isDisabled),
          className
        )}
        {...props}
      >
        {icon ?? <ChevronLeftIcon className={sizeClass.icon} />}
      </button>
    )
  }
)
PaginationPrevious.displayName = 'PaginationPrevious'

// \u2500\u2500\u2500 PaginationNext \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

export interface PaginationNextProps extends React.ComponentPropsWithoutRef<'button'> {
  /** Custom icon */
  icon?: React.ReactNode
}

const PaginationNext = React.forwardRef<HTMLButtonElement, PaginationNextProps>(
  ({ className, icon, ...props }, ref) => {
    const ctx = usePaginationContext()
    const sizeClass = paginationSizeMap[ctx.size]
    const isDisabled = ctx.disabled || (!ctx.loop && ctx.page >= ctx.total)

    const handleClick = () => {
      if (ctx.page >= ctx.total) {
        if (ctx.loop) ctx.onPageChange(1)
      } else {
        ctx.onPageChange(ctx.page + 1)
      }
    }

    return (
      <button
        ref={ref}
        type="button"
        aria-label="Go to next page"
        disabled={isDisabled}
        onClick={handleClick}
        className={cn(
          paginationItemVariants({ radius: ctx.radius }),
          sizeClass.item,
          getItemClasses(ctx.variant, ctx.color, false, isDisabled),
          className
        )}
        {...props}
      >
        {icon ?? <ChevronRightIcon className={sizeClass.icon} />}
      </button>
    )
  }
)
PaginationNext.displayName = 'PaginationNext'

// \u2500\u2500\u2500 PaginationFirst \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

export interface PaginationFirstProps extends React.ComponentPropsWithoutRef<'button'> {
  /** Custom icon */
  icon?: React.ReactNode
}

const PaginationFirst = React.forwardRef<HTMLButtonElement, PaginationFirstProps>(
  ({ className, icon, ...props }, ref) => {
    const ctx = usePaginationContext()
    const sizeClass = paginationSizeMap[ctx.size]
    const isDisabled = ctx.disabled || ctx.page <= 1

    return (
      <button
        ref={ref}
        type="button"
        aria-label="Go to first page"
        disabled={isDisabled}
        onClick={() => ctx.onPageChange(1)}
        className={cn(
          paginationItemVariants({ radius: ctx.radius }),
          sizeClass.item,
          getItemClasses(ctx.variant, ctx.color, false, isDisabled),
          className
        )}
        {...props}
      >
        {icon ?? <ChevronsLeftIcon className={sizeClass.icon} />}
      </button>
    )
  }
)
PaginationFirst.displayName = 'PaginationFirst'

// \u2500\u2500\u2500 PaginationLast \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

export interface PaginationLastProps extends React.ComponentPropsWithoutRef<'button'> {
  /** Custom icon */
  icon?: React.ReactNode
}

const PaginationLast = React.forwardRef<HTMLButtonElement, PaginationLastProps>(
  ({ className, icon, ...props }, ref) => {
    const ctx = usePaginationContext()
    const sizeClass = paginationSizeMap[ctx.size]
    const isDisabled = ctx.disabled || ctx.page >= ctx.total

    return (
      <button
        ref={ref}
        type="button"
        aria-label="Go to last page"
        disabled={isDisabled}
        onClick={() => ctx.onPageChange(ctx.total)}
        className={cn(
          paginationItemVariants({ radius: ctx.radius }),
          sizeClass.item,
          getItemClasses(ctx.variant, ctx.color, false, isDisabled),
          className
        )}
        {...props}
      >
        {icon ?? <ChevronsRightIcon className={sizeClass.icon} />}
      </button>
    )
  }
)
PaginationLast.displayName = 'PaginationLast'

// \u2500\u2500\u2500 PaginationEllipsis \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

const PaginationEllipsis = React.forwardRef<HTMLSpanElement, React.ComponentPropsWithoutRef<'span'>>(
  ({ className, ...props }, ref) => {
    const ctx = usePaginationContext()
    const sizeClass = paginationSizeMap[ctx.size]
    return (
      <span
        ref={ref}
        aria-hidden="true"
        className={cn(
          'inline-flex items-center justify-center text-text-muted',
          sizeClass.item,
          className
        )}
        {...props}
      >
        <EllipsisIcon className={sizeClass.icon} />
        <span className="sr-only">More pages</span>
      </span>
    )
  }
)
PaginationEllipsis.displayName = 'PaginationEllipsis'

// \u2500\u2500\u2500 PaginationItems (Convenience) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

const PaginationItems = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(
  ({ className, ...props }, ref) => {
    const ctx = usePaginationContext()
    return (
      <div ref={ref} className={cn('contents', className)} {...props}>
        {ctx.paginationRange.map((item, index) => (
          <PaginationItem key={\`\${item}-\${index}\`}>
            {item === 'dots' ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink page={item} />
            )}
          </PaginationItem>
        ))}
      </div>
    )
  }
)
PaginationItems.displayName = 'PaginationItems'

// \u2500\u2500\u2500 Exports \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

// \u2500\u2500\u2500 Namespace \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const Pagination = Object.assign(PaginationRoot, {
  Content: PaginationContent,
  Item: PaginationItem,
  Link: PaginationLink,
  Previous: PaginationPrevious,
  Next: PaginationNext,
  First: PaginationFirst,
  Last: PaginationLast,
  Ellipsis: PaginationEllipsis,
  Items: PaginationItems,
})

// eslint-disable-next-line @typescript-eslint/no-namespace
namespace Pagination {
  export type LinkProps = PaginationLinkProps
  export type PreviousProps = PaginationPreviousProps
  export type NextProps = PaginationNextProps
  export type FirstProps = PaginationFirstProps
  export type LastProps = PaginationLastProps
}

export {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationFirst,
  PaginationLast,
  PaginationEllipsis,
  PaginationItems,
  paginationItemVariants,
  paginationSizeMap,
}
`,
      type: "ui"
    }]
  },
  "popover": {
    name: "popover",
    dependencies: ["@radix-ui/react-popover"],
    registryDependencies: [],
    reverseDependencies: [],
    namespace: true,
    description: "",
    files: [{
      path: "popover.tsx",
      content: `'use client'

import * as React from 'react'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// \u2500\u2500\u2500 Default Close Icon (built-in, no external dependency) \u2500\u2500
const DefaultCloseIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
)

// \u2500\u2500\u2500 Types \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
export type PopoverSide = 'top' | 'right' | 'bottom' | 'left'

// \u2500\u2500\u2500 Animation class mapping (static strings for Tailwind scanner) \u2500\u2500
const ANIMATION_CLASSES: Record<PopoverSide, string> = {
  top:    'data-[state=open]:animate-popover-top-enter data-[state=closed]:animate-popover-top-exit',
  bottom: 'data-[state=open]:animate-popover-bottom-enter data-[state=closed]:animate-popover-bottom-exit',
  left:   'data-[state=open]:animate-popover-left-enter data-[state=closed]:animate-popover-left-exit',
  right:  'data-[state=open]:animate-popover-right-enter data-[state=closed]:animate-popover-right-exit',
}

// \u2500\u2500\u2500 Content variants \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const popoverContentVariants = cva(
  'relative z-popover font-normal select-none w-auto max-w-[calc(100vw-16px)] outline-none',
  {
    variants: {
      variant: {
        default: 'bg-background-paper border border-border shadow-lg',
        elevated: 'bg-background-paper/95 border border-border-subtle shadow-xl backdrop-blur-sm',
      },
      size: {
        sm: 'text-sm p-3 rounded-lg',
        default: 'text-sm p-4 rounded-xl',
        lg: 'text-md p-5 rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

// \u2500\u2500\u2500 Arrow styles \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
// default: CSS rotated square with 2-side border (seamless connection)
// elevated: Radix SVG arrow with drop-shadow (glassmorphism, subtle border)
const CSS_ARROW_CLASSES: Record<PopoverSide, string> = {
  bottom: '-top-[5px] left-1/2 -translate-x-1/2 border-t border-l border-border',
  top: '-bottom-[5px] left-1/2 -translate-x-1/2 border-b border-r border-border',
  right: '-left-[5px] top-1/2 -translate-y-1/2 border-b border-l border-border',
  left: '-right-[5px] top-1/2 -translate-y-1/2 border-t border-r border-border',
}

const ARROW_ELEVATED = 'fill-background-paper drop-shadow-sm'

// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
// Popover
// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550

// \u2500\u2500\u2500 PopoverRoot \u2014 wrapper to avoid Object.assign mutating Radix primitive \u2500\u2500
export interface PopoverRootProps extends React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Root> {}

function PopoverRoot(props: PopoverRootProps) {
  return <PopoverPrimitive.Root {...props} />
}

// \u2500\u2500\u2500 PopoverTrigger \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const PopoverTrigger = PopoverPrimitive.Trigger

// \u2500\u2500\u2500 PopoverPortal \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const PopoverPortal = PopoverPrimitive.Portal

// \u2500\u2500\u2500 PopoverAnchor \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const PopoverAnchor = PopoverPrimitive.Anchor

// \u2500\u2500\u2500 PopoverClose \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const PopoverClose = PopoverPrimitive.Close

// \u2500\u2500\u2500 PopoverContent \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
export interface PopoverContentProps
  extends React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>,
    VariantProps<typeof popoverContentVariants> {
  /** Show arrow pointing to trigger */
  showArrow?: boolean
  /** Show built-in close button */
  showClose?: boolean
  /** Custom close icon (replaces default X icon) */
  closeIcon?: React.ReactNode
}

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  PopoverContentProps
>(({ className, variant = 'default', size, side = 'bottom', sideOffset, showArrow = true, showClose = false, closeIcon, children, ...props }, ref) => {
  const resolvedSide = side as PopoverSide
  // CSS arrow (default) needs more gap since it doesn't occupy layout space
  const resolvedOffset = sideOffset ?? (variant === 'default' && showArrow ? 12 : 6)

  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={ref}
        side={side}
        sideOffset={resolvedOffset}
        className={cn(
          popoverContentVariants({ variant, size }),
          ANIMATION_CLASSES[resolvedSide],
          className,
        )}
        {...props}
      >
        {showClose && (
          <PopoverPrimitive.Close
            className="absolute top-3 right-3 rounded-md p-1 text-text-muted hover:text-foreground hover:bg-background-muted transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
            aria-label="Close"
          >
            {closeIcon || <DefaultCloseIcon className="icon-sm" />}
          </PopoverPrimitive.Close>
        )}
        {children}
        {showArrow && variant === 'default' && (
          <div
            className={cn(
              'absolute w-2.5 h-2.5 rotate-45 bg-background-paper',
              CSS_ARROW_CLASSES[resolvedSide],
            )}
          />
        )}
        {showArrow && variant === 'elevated' && (
          <PopoverPrimitive.Arrow
            className={ARROW_ELEVATED}
            width={12}
            height={6}
          />
        )}
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  )
})
PopoverContent.displayName = 'PopoverContent'

// \u2500\u2500\u2500 PopoverArrow (standalone, for manual placement outside Content) \u2500\u2500
const PopoverArrow = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Arrow>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Arrow>
>(({ className, ...props }, ref) => (
  <PopoverPrimitive.Arrow
    ref={ref}
    className={cn('fill-background-paper', className)}
    width={10}
    height={5}
    {...props}
  />
))
PopoverArrow.displayName = 'PopoverArrow'

// \u2500\u2500\u2500 Namespace: Popover \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const Popover = Object.assign(PopoverRoot, {
  Trigger: PopoverTrigger,
  Content: PopoverContent,
  Arrow: PopoverArrow,
  Close: PopoverClose,
  Anchor: PopoverAnchor,
  Portal: PopoverPortal,
})

// eslint-disable-next-line @typescript-eslint/no-namespace
namespace Popover {
  export type ContentProps = PopoverContentProps
  export type RootProps = PopoverRootProps
}

// \u2500\u2500\u2500 Exports \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
export {
  Popover,
  PopoverRoot,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverClose,
  PopoverAnchor,
  PopoverPortal,
  popoverContentVariants,
}
`,
      type: "ui"
    }]
  },
  "progress": {
    name: "progress",
    dependencies: ["@radix-ui/react-progress"],
    registryDependencies: [],
    reverseDependencies: [],
    namespace: false,
    description: "",
    files: [{
      path: "progress.tsx",
      content: `'use client'

import * as React from 'react'
import * as ProgressPrimitive from '@radix-ui/react-progress'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// ============================================================================
// Constants
// ============================================================================

/** Circular SVG viewBox size */
const CIRCULAR_VIEWBOX = 100
/** Circular center point */
const CIRCULAR_CENTER = 50

/** Circular sizes (diameter in px) */
const CIRCULAR_SIZES = {
  sm: 32,
  default: 48,
  lg: 64,
} as const

/** Circular stroke thickness per size */
const CIRCULAR_THICKNESS = {
  sm: 4,
  default: 5,
  lg: 6,
} as const

/** Circular value font sizes */
const CIRCULAR_FONT_SIZES = {
  sm: 'text-2xs',
  default: 'text-xs',
  lg: 'text-sm',
} as const

// ============================================================================
// Linear Progress
// ============================================================================

const linearTrackVariants = cva(
  'relative w-full overflow-hidden bg-border rounded-full',
  {
    variants: {
      size: {
        sm: 'h-1',
        default: 'h-2',
        lg: 'h-3',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
)

const colorMap = {
  default: 'bg-foreground',
  primary: 'bg-primary',
} as const

const circularColorMap = {
  default: 'stroke-foreground',
  primary: 'stroke-primary',
} as const

const valueFontSizes = {
  sm: 'text-xs',
  default: 'text-sm',
  lg: 'text-base',
} as const

// ============================================================================
// Types
// ============================================================================

export interface ProgressProps
  extends Omit<React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>, 'children'>,
    VariantProps<typeof linearTrackVariants> {
  /** Progress type */
  type?: 'linear' | 'circular'
  /** Current value (0 to max) */
  value?: number
  /** Maximum value */
  max?: number
  /** Visual variant (linear only) */
  variant?: 'default' | 'striped'
  /** Indicator color */
  color?: 'default' | 'primary'
  /** Custom indicator class (overrides color) */
  indicatorClassName?: string
  /** Show percentage value */
  showValue?: boolean
  /** Custom label formatter */
  formatLabel?: (value: number, max: number) => string
  /** Animate striped variant */
  animated?: boolean
  /** Circular stroke thickness override */
  thickness?: number
  /** Accessibility label */
  label?: string
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({
  className,
  type = 'linear',
  value = 0,
  max = 100,
  size,
  variant = 'default',
  color = 'default',
  indicatorClassName,
  showValue = false,
  formatLabel,
  animated = false,
  thickness,
  label,
  ...props
}, ref) => {
  const resolvedSize = size || 'default'
  const clampedValue = Math.min(Math.max(value, 0), max)
  const percentage = (clampedValue / max) * 100

  const valueLabel = formatLabel
    ? formatLabel(clampedValue, max)
    : \`\${Math.round(percentage)}%\`

  // \u2500\u2500 Circular \u2500\u2500
  if (type === 'circular') {
    const diameter = CIRCULAR_SIZES[resolvedSize]
    const strokeWidth = thickness ?? CIRCULAR_THICKNESS[resolvedSize]
    const r = (CIRCULAR_VIEWBOX - strokeWidth) / 2
    const circumference = 2 * Math.PI * r
    const offset = circumference * (1 - percentage / 100)

    return (
      <div
        className={cn('inline-flex items-center gap-2', className)}
        role="progressbar"
        aria-valuenow={clampedValue}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
      >
        <div className="relative" style={{ width: diameter, height: diameter }}>
          <svg
            viewBox={\`0 0 \${CIRCULAR_VIEWBOX} \${CIRCULAR_VIEWBOX}\`}
            className="transform -rotate-90"
            width={diameter}
            height={diameter}
          >
            {/* Track */}
            <circle
              cx={CIRCULAR_CENTER}
              cy={CIRCULAR_CENTER}
              r={r}
              fill="none"
              className="stroke-border"
              strokeWidth={strokeWidth}
            />
            {/* Indicator */}
            <circle
              cx={CIRCULAR_CENTER}
              cy={CIRCULAR_CENTER}
              r={r}
              fill="none"
              className={cn(indicatorClassName || circularColorMap[color], 'transition-[stroke-dashoffset] duration-normal ease-out')}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
            />
          </svg>
          {/* Center value */}
          {showValue && resolvedSize !== 'sm' && (
            <div className={cn(
              'absolute inset-0 flex items-center justify-center font-semibold font-mono tabular-nums text-foreground',
              CIRCULAR_FONT_SIZES[resolvedSize]
            )}>
              {valueLabel}
            </div>
          )}
        </div>
      </div>
    )
  }

  // \u2500\u2500 Linear \u2500\u2500
  const stripedBg = variant === 'striped'
    ? 'bg-[length:1rem_1rem] bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)]'
    : ''

  return (
    <div className={cn('flex items-center gap-3', showValue && 'w-full', className)}>
      <ProgressPrimitive.Root
        ref={ref}
        className={cn(linearTrackVariants({ size }))}
        value={clampedValue}
        max={max}
        aria-label={label}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className={cn(
            'h-full transition-[width] duration-normal ease-out rounded-full',
            indicatorClassName || colorMap[color],
            stripedBg,
            animated && variant === 'striped' && 'animate-progress-stripe',
          )}
          style={{ width: \`\${percentage}%\` }}
        />
      </ProgressPrimitive.Root>
      {showValue && (
        <span className={cn(
          'shrink-0 font-semibold font-mono tabular-nums text-foreground',
          valueFontSizes[resolvedSize]
        )}>
          {valueLabel}
        </span>
      )}
    </div>
  )
})
Progress.displayName = 'Progress'

export { Progress, linearTrackVariants }
`,
      type: "ui"
    }]
  },
  "radio-group": {
    name: "radio-group",
    dependencies: ["@radix-ui/react-radio-group"],
    registryDependencies: ["field"],
    reverseDependencies: [],
    namespace: true,
    description: "",
    files: [{
      path: "radio-group.tsx",
      content: `'use client'

import * as React from 'react'
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { useFieldContext } from './field'

// Color maps for checked state
const radioColorMap = {
  default: {
    border: 'data-[state=checked]:border-foreground',
    dot: 'bg-foreground',
  },
  primary: {
    border: 'data-[state=checked]:border-primary',
    dot: 'bg-primary',
  },
} as const

export type RadioColor = keyof typeof radioColorMap

// Context to pass size, weight, color from RadioGroup to RadioGroupItem
type RadioGroupContextValue = {
  size: 'sm' | 'default' | 'lg'
  weight: 'thin' | 'bold'
  color: RadioColor
  disabled?: boolean
}
const RadioGroupContext = React.createContext<RadioGroupContextValue>({ size: 'default', weight: 'bold', color: 'default' })

// RadioGroup container
const radioGroupVariants = cva('grid gap-3', {
  variants: {
    orientation: {
      vertical: 'grid-cols-1',
      horizontal: 'grid-flow-col auto-cols-max gap-4',
    },
  },
  defaultVariants: {
    orientation: 'vertical',
  },
})

export interface RadioGroupProps
  extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root> {
  size?: 'sm' | 'default' | 'lg'
  weight?: 'thin' | 'bold'
  /** Checked state color */
  color?: RadioColor
}

const RadioGroupRoot = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  RadioGroupProps
>(({ className, orientation, size = 'default', weight = 'bold', color = 'default', disabled, ...props }, ref) => {
  const fieldContext = useFieldContext()
  const resolvedDisabled = disabled ?? fieldContext?.disabled

  return (
    <RadioGroupContext.Provider value={{ size, weight, color, disabled: resolvedDisabled }}>
      <RadioGroupPrimitive.Root
        ref={ref}
        className={cn(radioGroupVariants({ orientation }), className)}
        orientation={orientation || undefined}
        disabled={resolvedDisabled}
        {...props}
      />
    </RadioGroupContext.Provider>
  )
})
RadioGroupRoot.displayName = 'RadioGroup'

// RadioGroupItem circle variants
const radioItemVariants = cva(
  [
    'relative shrink-0 rounded-full border-border hover:border-border-strong transition-all duration-micro ease-out',
    'focus-visible:focus-ring',
    'disabled:cursor-not-allowed disabled:opacity-50',
    // Transparent hit area expansion via ::after
    "after:absolute after:content-['']",
  ].join(' '),
  {
    variants: {
      size: {
        sm: 'w-3.5 h-3.5 after:-inset-[5px]',     // 14px circle \u2192 24px click
        default: 'w-4 h-4 after:-inset-2',          // 16px circle \u2192 32px click
        lg: 'w-5 h-5 after:-inset-2',               // 20px circle \u2192 36px click
      },
      weight: {
        thin: 'border',   // 1px
        bold: 'border-2', // 2px
      },
    },
    defaultVariants: {
      size: 'default',
      weight: 'bold',
    },
  }
)

// Dot sizes per radio size
const dotSizes = {
  sm: 'w-1.5 h-1.5',       // 6px
  default: 'w-2 h-2',      // 8px
  lg: 'w-2.5 h-2.5',       // 10px
}

// Label font sizes
const labelSizes = {
  sm: 'text-xs',       // 12px
  default: 'text-md',  // 14px
  lg: 'text-base',     // 16px
}

// Gap between radio and label
const gapSizes = {
  sm: 'gap-1.5',
  default: 'gap-2',
  lg: 'gap-2.5',
}

export interface RadioGroupItemProps
  extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> {
  label?: string
}

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  RadioGroupItemProps
>(({ className, label, disabled, ...props }, ref) => {
  const { size, weight, color, disabled: groupDisabled } = React.useContext(RadioGroupContext)
  const resolvedDisabled = disabled ?? groupDisabled
  const itemId = React.useId()

  const radio = (
    <RadioGroupPrimitive.Item
      ref={ref}
      id={label ? itemId : undefined}
      disabled={resolvedDisabled}
      className={cn(
        radioItemVariants({ size, weight }),
        radioColorMap[color].border,
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center animate-radio-enter">
        <div className={cn('rounded-full', radioColorMap[color].dot, dotSizes[size])} />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )

  if (!label) return radio

  return (
    <div className={cn('group flex items-center', gapSizes[size])}>
      <div className="flex items-center">
        {radio}
      </div>
      <label
        htmlFor={itemId}
        className={cn(
          labelSizes[size],
          'text-text-muted cursor-pointer select-none transition-colors duration-micro',
          'group-hover:text-foreground',
          resolvedDisabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        {label}
      </label>
    </div>
  )
})
RadioGroupItem.displayName = 'RadioGroupItem'

// \u2500\u2500\u2500 Namespace \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const RadioGroup = Object.assign(RadioGroupRoot, {
  Item: RadioGroupItem,
})

// eslint-disable-next-line @typescript-eslint/no-namespace
namespace RadioGroup {
  export type ItemProps = RadioGroupItemProps
}

export { RadioGroup, RadioGroupItem, radioGroupVariants, radioItemVariants }
`,
      type: "ui"
    }]
  },
  "segmented": {
    name: "segmented",
    dependencies: ["@radix-ui/react-radio-group"],
    registryDependencies: [],
    reverseDependencies: [],
    namespace: true,
    description: "",
    files: [{
      path: "segmented.tsx",
      content: `'use client'

import * as React from 'react'
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// Context to pass variant and size from Segmented to SegmentedItem
type SegmentedContextValue = {
  variant?: 'default' | 'outline' | 'underline' | 'ghost'
  size?: 'sm' | 'md' | 'default' | 'lg'
  radius?: 'none' | 'sm' | 'base' | 'default' | 'lg' | 'xl' | '2xl' | '3xl' | 'full'
}
const SegmentedContext = React.createContext<SegmentedContextValue>({})
const useSegmentedContext = () => React.useContext(SegmentedContext)

const segmentedVariants = cva(
  'inline-flex items-center text-text-subtle',
  {
    variants: {
      variant: {
        default: 'bg-background-muted gap-1',
        outline: 'bg-background border border-border gap-1',
        underline: 'bg-transparent border-b border-border gap-0',
        ghost: 'bg-transparent gap-1',
      },
      size: {
        sm: 'h-8',        // 32px height
        md: 'h-9',        // 36px height
        default: 'h-10',  // 40px height
        lg: 'h-12',       // 48px height
      },
      radius: {
        none: 'rounded-none',
        sm: 'rounded-sm',
        base: 'rounded',
        default: 'rounded-md',
        lg: 'rounded-lg',
        xl: 'rounded-xl',
        '2xl': 'rounded-2xl',
        '3xl': 'rounded-3xl',
        full: 'rounded-full',
      },
      fontWeight: {
        normal: '[&>*]:font-normal',
        semibold: '[&>*]:font-semibold',
      },
    },
    compoundVariants: [
      // Padding for default/outline/ghost variants
      { variant: 'default', className: 'p-1' },
      { variant: 'outline', className: 'p-1' },
      { variant: 'ghost', className: 'p-1' },
      // Underline has no padding
      { variant: 'underline', className: 'p-0' },
    ],
    defaultVariants: {
      variant: 'default',
      size: 'default',
      radius: 'default',
      fontWeight: 'normal',
    },
  }
)

const segmentedItemVariants = cva(
  [
    'inline-flex items-center justify-center whitespace-nowrap h-full',
    'transition-all duration-micro ease-out',
    'focus-visible:focus-ring',
    'disabled:pointer-events-none disabled:opacity-50',
  ].join(' '),
  {
    variants: {
      variant: {
        // Default: light background when selected, text emphasis on hover
        default: [
          'hover:text-foreground',
          'data-[state=checked]:bg-background data-[state=checked]:text-foreground',
          'data-[state=checked]:shadow-sm',
        ].join(' '),
        // Outline: gray background when selected
        outline: [
          'data-[state=checked]:bg-background-muted data-[state=checked]:text-foreground',
          'hover:text-foreground hover:bg-background-muted',
        ].join(' '),
        // Underline: bottom border indicator (Stripe/GitHub style)
        underline: [
          'border-b-2 border-transparent -mb-px',
          'hover:text-foreground hover:border-border',
          'data-[state=checked]:text-foreground data-[state=checked]:border-foreground',
        ].join(' '),
        // Ghost: pill background only on selected (Notion/Figma style)
        ghost: [
          'hover:text-foreground hover:bg-background-muted',
          'data-[state=checked]:bg-background-muted data-[state=checked]:text-foreground',
        ].join(' '),
      },
      size: {
        sm: 'text-xs',      // 12px
        md: 'text-sm',      // 13px
        default: 'text-sm', // 13px
        lg: 'text-md',      // 14px
      },
      radius: {
        none: 'rounded-none',
        sm: 'rounded-sm',
        base: 'rounded',
        default: 'rounded-md',
        lg: 'rounded-md',
        xl: 'rounded-lg',
        '2xl': 'rounded-xl',
        '3xl': 'rounded-2xl',
        full: 'rounded-full',
      },
      // Content type determines padding and aspect ratio
      contentType: {
        // Icon only: square aspect ratio like IconButton
        icon: 'aspect-square',
        // Icon + text: rectangular (gap is set via compoundVariants)
        'icon-text': '',
        // Text only: standard button padding
        text: '',
      },
    },
    compoundVariants: [
      // Icon + text - same padding rules as Button/Toggle
      { contentType: 'icon-text', size: 'sm', className: 'px-3 gap-2' },      // 12px padding, 8px gap
      { contentType: 'icon-text', size: 'md', className: 'px-3.5 gap-2' },   // 14px padding, 8px gap
      { contentType: 'icon-text', size: 'default', className: 'px-4 gap-2' }, // 16px padding, 8px gap
      { contentType: 'icon-text', size: 'lg', className: 'px-6 gap-2' },      // 24px padding, 8px gap
      // Text only - same padding rules as Button/Toggle
      { contentType: 'text', size: 'sm', className: 'px-3.5' },    // 14px
      { contentType: 'text', size: 'md', className: 'px-3.5' },    // 14px
      { contentType: 'text', size: 'default', className: 'px-4' }, // 16px
      { contentType: 'text', size: 'lg', className: 'px-6' },      // 24px
      // Underline variant has no rounded corners
      { variant: 'underline', className: 'rounded-none' },
    ],
    defaultVariants: {
      variant: 'default',
      size: 'default',
      radius: 'default',
      contentType: 'text',
    },
  }
)

export interface SegmentedProps
  extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>,
    VariantProps<typeof segmentedVariants> {}

const SegmentedRoot = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  SegmentedProps
>(({ className, variant, size, radius, fontWeight, ...props }, ref) => {
  // All variants default to normal font weight
  const resolvedFontWeight = fontWeight ?? 'normal'

  return (
    <SegmentedContext.Provider value={{ variant: variant || 'default', size: size || 'default', radius: radius || 'default' }}>
      <RadioGroupPrimitive.Root
        className={cn(segmentedVariants({ variant, size, radius, fontWeight: resolvedFontWeight }), className)}
        {...props}
        ref={ref}
      />
    </SegmentedContext.Provider>
  )
})
SegmentedRoot.displayName = 'Segmented'

// Icon size for segmented control (4-step scale, Icon+Text mode)
// sm: 14px, md~default~lg: 16px
const iconSizeClasses = {
  sm: '[&>svg]:icon-xs',      // 14px
  md: '[&>svg]:icon-sm',      // 16px
  default: '[&>svg]:icon-sm', // 16px
  lg: '[&>svg]:icon-sm',      // 16px
}

export interface SegmentedItemProps
  extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>,
    Omit<VariantProps<typeof segmentedItemVariants>, 'variant'> {}

const SegmentedItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  SegmentedItemProps
>(({ className, children, size, radius, contentType, ...props }, ref) => {
  const { variant, size: contextSize, radius: contextRadius } = useSegmentedContext()
  const resolvedSize = size || contextSize || 'default'
  const resolvedRadius = radius || contextRadius || 'default'

  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        segmentedItemVariants({ variant, size: resolvedSize, radius: resolvedRadius, contentType }),
        iconSizeClasses[resolvedSize],
        className
      )}
      {...props}
    >
      {children}
    </RadioGroupPrimitive.Item>
  )
})
SegmentedItem.displayName = 'SegmentedItem'

// \u2500\u2500\u2500 Namespace \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const Segmented = Object.assign(SegmentedRoot, {
  Item: SegmentedItem,
})

// eslint-disable-next-line @typescript-eslint/no-namespace
namespace Segmented {
  export type ItemProps = SegmentedItemProps
}

export { Segmented, SegmentedItem, segmentedVariants, segmentedItemVariants }
`,
      type: "ui"
    }]
  },
  "select": {
    name: "select",
    dependencies: ["@radix-ui/react-select"],
    registryDependencies: [],
    reverseDependencies: [],
    namespace: true,
    description: "",
    files: [{
      path: "select.tsx",
      content: `'use client'

import * as React from 'react'
import * as SelectPrimitive from '@radix-ui/react-select'
import { cn } from '@/lib/utils'

// Radius (matches Input \u2014 set at Root, propagates to Trigger and Content)
type SelectRadius = 'none' | 'sm' | 'base' | 'default' | 'lg' | 'xl' | '2xl' | '3xl' | 'full'

const triggerRadiusMap: Record<SelectRadius, string> = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  base: 'rounded',
  default: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  '3xl': 'rounded-3xl',
  full: 'rounded-full',
}

// Auto-mapping: root radius \u2192 content radius (3 levels)
type SelectContentRadius = 'md' | 'lg' | 'xl'

const contentRadiusFromRoot: Record<SelectRadius, SelectContentRadius> = {
  none: 'md',
  sm: 'md',
  base: 'md',
  default: 'md',
  lg: 'lg',
  xl: 'xl',
  '2xl': 'xl',
  '3xl': 'xl',
  full: 'xl',
}

const contentRadiusMap: Record<SelectContentRadius, string> = {
  md: 'rounded-md',     // 6px
  lg: 'rounded-lg',     // 8px
  xl: 'rounded-xl',     // 12px
}

const itemRadiusMap: Record<SelectContentRadius, string> = {
  md: 'rounded',        // 4px \u2014 perceptual balance (67%)
  lg: 'rounded-md',     // 6px \u2014 perceptual balance (75%)
  xl: 'rounded-lg',     // 8px \u2014 perceptual balance (67%)
}

// Size variants (matches Input component)
type SelectSize = 'xs' | 'sm' | 'default' | 'lg' | 'xl'

// Trigger sizes (identical to Input)
const triggerSizeMap: Record<SelectSize, string> = {
  xs: 'h-9 px-3 text-sm',          // 36px
  sm: 'h-10 px-3 text-md',         // 40px
  default: 'h-11 px-4 text-base',  // 44px
  lg: 'h-12 px-4 text-base',       // 48px
  xl: 'h-14 px-4 text-base',       // 56px
}

// Trigger icon sizes (matches Input icon pattern)
const triggerIconSizeMap: Record<SelectSize, string> = {
  xs: 'icon-xs',      // 14px
  sm: 'icon-xs',      // 14px
  default: 'icon-sm', // 16px
  lg: 'icon-sm',      // 16px
  xl: 'icon-sm',      // 16px
}

// Auto-mapping: trigger size \u2192 content item size (3 levels)
type SelectItemSize = 'sm' | 'md' | 'lg'

const itemSizeFromTrigger: Record<SelectSize, SelectItemSize> = {
  xs: 'sm',
  sm: 'sm',
  default: 'md',
  lg: 'md',
  xl: 'lg',
}

// Item sizes (font matches Trigger for seamless selection, padding controls density)
const itemSizeMap: Record<SelectItemSize, string> = {
  sm: 'pl-2 pr-6 py-1.5 text-sm',
  md: 'pl-3 pr-8 py-1.5 text-base',
  lg: 'pl-3 pr-10 py-2.5 text-base',
}

// Item indicator (check mark) \u2014 right-aligned
const indicatorSizeMap: Record<SelectItemSize, string> = {
  sm: 'right-2 h-3 w-3',
  md: 'right-2 h-3.5 w-3.5',
  lg: 'right-3 h-4 w-4',
}

// Label sizes
const labelSizeMap: Record<SelectItemSize, string> = {
  sm: 'px-2 py-1.5 text-xs',
  md: 'px-2 py-1.5 text-xs',
  lg: 'px-3 py-2.5 text-xs',
}

// Flush mode \u2014 items span full width, no inner radius
const flushItemPaddingMap: Record<SelectItemSize, string> = {
  sm: 'pl-3 pr-7',
  md: 'pl-4 pr-9',
  lg: 'pl-4 pr-11',
}

const flushIndicatorSizeMap: Record<SelectItemSize, string> = {
  sm: 'right-3 h-3 w-3',
  md: 'right-3 h-3.5 w-3.5',
  lg: 'right-4 h-4 w-4',
}

const flushLabelPaddingMap: Record<SelectItemSize, string> = {
  sm: 'px-3',
  md: 'px-3',
  lg: 'px-4',
}

// Root context \u2014 set at Root, consumed by Trigger and Content
const SelectRootContext = React.createContext<{
  size: SelectSize
  radius: SelectRadius
}>({ size: 'default', radius: 'default' })

// Style context \u2014 set at Content, consumed by Item/Label
const SelectStyleContext = React.createContext<{
  contentRadius: SelectContentRadius
  itemSize: SelectItemSize
  flush: boolean
}>({ contentRadius: 'xl', itemSize: 'md', flush: false })

// Root \u2014 state management + size/radius context
const SelectRoot = ({
  size = 'default',
  radius = 'default',
  ...props
}: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Root> & {
  size?: SelectSize
  radius?: SelectRadius
}) => (
  <SelectRootContext.Provider value={{ size, radius }}>
    <SelectPrimitive.Root {...props} />
  </SelectRootContext.Provider>
)

// Value \u2014 displays selected value or placeholder
const SelectValue = SelectPrimitive.Value

// Group \u2014 groups related items
const SelectGroup = SelectPrimitive.Group

// Trigger \u2014 the element that opens the select (reads size + radius from context)
const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => {
  const { size, radius } = React.useContext(SelectRootContext)
  return (
    <SelectPrimitive.Trigger
      ref={ref}
      className={cn(
        'flex w-full items-center justify-between bg-background text-foreground hover:bg-background-muted',
        'border border-border',
        triggerRadiusMap[radius],
        'transition-colors duration-micro',
        'focus-visible:shadow-[0_0_0_2px_var(--color-focus-ring)] focus:[outline:2px_solid_transparent]',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'data-[placeholder]:text-foreground/30',
        triggerSizeMap[size],
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <svg
          className={cn('ml-2 shrink-0 text-text-muted', triggerIconSizeMap[size])}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
})
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

// ScrollUpButton \u2014 scroll indicator at top
const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn('flex items-center justify-center py-1 cursor-default', className)}
    {...props}
  >
    <svg className="icon-xs" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
    </svg>
  </SelectPrimitive.ScrollUpButton>
))
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName

// ScrollDownButton \u2014 scroll indicator at bottom
const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn('flex items-center justify-center py-1 cursor-default', className)}
    {...props}
  >
    <svg className="icon-xs" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  </SelectPrimitive.ScrollDownButton>
))
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName

// Content \u2014 the floating panel (reads size + radius from context, auto-maps both)
const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content> & {
    flush?: boolean
  }
>(({ className, children, position = 'popper', sideOffset = 1, flush = false, onCloseAutoFocus, ...props }, ref) => {
  const { size, radius } = React.useContext(SelectRootContext)
  const itemSize = itemSizeFromTrigger[size]
  const contentRadius = contentRadiusFromRoot[radius]
  return (
    <SelectPrimitive.Portal>
      <SelectStyleContext.Provider value={{ contentRadius, itemSize, flush }}>
        <SelectPrimitive.Content
          ref={ref}
          onCloseAutoFocus={(e) => {
            e.preventDefault()
            onCloseAutoFocus?.(e)
          }}
          className={cn(
            'relative z-dropdown min-w-[var(--radix-select-trigger-width)] overflow-hidden border border-border bg-background shadow-lg',
            flush ? 'py-1' : 'p-1',
            contentRadiusMap[contentRadius],
            position === 'popper' &&
              'max-h-[var(--radix-select-content-available-height)]',
            className
          )}
          position={position}
          sideOffset={sideOffset}
          {...props}
        >
          <SelectScrollUpButton />
          <SelectPrimitive.Viewport
            className={cn(
              position === 'popper' &&
                'h-[var(--radix-select-content-available-height)] w-full'
            )}
          >
            {children}
          </SelectPrimitive.Viewport>
          <SelectScrollDownButton />
        </SelectPrimitive.Content>
      </SelectStyleContext.Provider>
    </SelectPrimitive.Portal>
  )
})
SelectContent.displayName = SelectPrimitive.Content.displayName

// Item \u2014 a single selectable item (with right-aligned check indicator)
const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => {
  const { contentRadius, itemSize, flush } = React.useContext(SelectStyleContext)
  return (
    <SelectPrimitive.Item
      ref={ref}
      className={cn(
        'relative flex w-full cursor-default select-none items-center outline-none',
        itemSizeMap[itemSize],
        !flush && itemRadiusMap[contentRadius],
        flush && flushItemPaddingMap[itemSize],
        'transition-colors duration-fast',
        'focus:bg-background-muted',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className
      )}
      {...props}
    >
      <SelectPrimitive.ItemText className="truncate">{children}</SelectPrimitive.ItemText>
      <span className={cn('absolute flex items-center justify-center', flush ? flushIndicatorSizeMap[itemSize] : indicatorSizeMap[itemSize])}>
        <SelectPrimitive.ItemIndicator>
          <svg className="icon-xs" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </SelectPrimitive.ItemIndicator>
      </span>
    </SelectPrimitive.Item>
  )
})
SelectItem.displayName = SelectPrimitive.Item.displayName

// Label \u2014 non-interactive group heading
const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => {
  const { itemSize, flush } = React.useContext(SelectStyleContext)
  return (
    <SelectPrimitive.Label
      ref={ref}
      className={cn(
        'font-semibold text-text-muted',
        labelSizeMap[itemSize],
        flush && flushLabelPaddingMap[itemSize],
        className
      )}
      {...props}
    />
  )
})
SelectLabel.displayName = SelectPrimitive.Label.displayName

// Separator \u2014 visual divider between groups
const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => {
  const { flush } = React.useContext(SelectStyleContext)
  return (
    <SelectPrimitive.Separator
      ref={ref}
      className={cn('h-px bg-border my-1', !flush && '-mx-1', className)}
      {...props}
    />
  )
})
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

export type { SelectRadius, SelectSize }

// \u2500\u2500\u2500 Namespace \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const Select = Object.assign(SelectRoot, {
  Trigger: SelectTrigger,
  Value: SelectValue,
  Content: SelectContent,
  Item: SelectItem,
  Group: SelectGroup,
  Label: SelectLabel,
  Separator: SelectSeparator,
})

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
}
`,
      type: "ui"
    }]
  },
  "skeleton": {
    name: "skeleton",
    dependencies: [],
    registryDependencies: [],
    reverseDependencies: [],
    namespace: false,
    description: "",
    files: [{
      path: "skeleton.tsx",
      content: `'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// ============================================================================
// Constants
// ============================================================================

/** Pulse animation duration in ms (slower = more premium) */
const PULSE_DURATION_MS = 2000
/** Wave animation duration in ms */
const WAVE_DURATION_MS = 1800

/**
 * Wave shimmer gradient \u2014 wide sweep with soft edges.
 * 5 gradient stops create a broader, smoother light band.
 */
const WAVE_GRADIENT = [
  'transparent 0%',
  'transparent 30%',
  'var(--color-background-elevated) 50%',
  'transparent 70%',
  'transparent 100%',
].join(', ')

/**
 * Multi-line text width pattern.
 * Last line is always shorter for natural appearance.
 */
const MULTI_LINE_WIDTHS = ['100%', '92%', '100%', '85%', '75%'] as const

// ============================================================================
// Variants (CVA)
// ============================================================================

const skeletonVariants = cva(
  'bg-background-muted',
  {
    variants: {
      variant: {
        text: 'rounded-md h-4 w-full',
        circular: 'rounded-full w-10 h-10',
        rectangular: 'rounded-xl w-full h-24',
      },
    },
    defaultVariants: {
      variant: 'text',
    },
  }
)

// ============================================================================
// Types
// ============================================================================

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {
  /** Animation style */
  animation?: 'pulse' | 'wave' | false
  /** Custom width */
  width?: string | number
  /** Custom height */
  height?: string | number
  /** Custom border radius */
  radius?: string | number
  /** Number of text lines (text variant only, generates stacked lines) */
  count?: number
  /** Conditional loading \u2014 true: show skeleton, false: render children */
  loading?: boolean
  /** Children to render when loading=false */
  children?: React.ReactNode
}

// ============================================================================
// Component
// ============================================================================

const SkeletonBlock = React.forwardRef<HTMLDivElement, Omit<SkeletonProps, 'count' | 'loading' | 'children'>>(
  ({
    className,
    variant = 'text',
    animation = 'pulse',
    width,
    height,
    radius,
    style,
    ...props
  }, ref) => {
    return (
      <div
        ref={ref}
        aria-hidden="true"
        className={cn(
          skeletonVariants({ variant }),
          animation === 'pulse' && 'animate-skeleton-pulse',
          animation === 'wave' && 'relative overflow-hidden',
          className,
        )}
        style={{
          ...style,
          ...(width != null ? { width } : {}),
          ...(height != null ? { height } : {}),
          ...(radius != null ? { borderRadius: radius } : {}),
          ...(animation === 'pulse' ? { animationDuration: \`\${PULSE_DURATION_MS}ms\` } : {}),
        }}
        {...props}
      >
        {animation === 'wave' && (
          <div
            className="absolute inset-0 animate-skeleton-wave"
            style={{
              animationDuration: \`\${WAVE_DURATION_MS}ms\`,
              background: \`linear-gradient(90deg, \${WAVE_GRADIENT})\`,
            }}
          />
        )}
      </div>
    )
  }
)
SkeletonBlock.displayName = 'SkeletonBlock'

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({
    count,
    loading,
    children,
    variant = 'text',
    ...rest
  }, ref) => {
    // loading mode \u2014 show skeleton or children
    if (loading !== undefined) {
      if (!loading) return <>{children}</>
      // When loading, fall through to render skeleton
    }

    // count mode \u2014 render multiple text lines
    if (count != null && count > 1 && variant === 'text') {
      return (
        <div ref={ref} className="space-y-2.5" aria-hidden="true">
          {Array.from({ length: count }, (_, i) => {
            const widthPattern = MULTI_LINE_WIDTHS[i % MULTI_LINE_WIDTHS.length]
            const isLast = i === count - 1
            return (
              <SkeletonBlock
                key={i}
                variant="text"
                style={{ width: isLast ? '60%' : widthPattern }}
                {...rest}
              />
            )
          })}
        </div>
      )
    }

    return <SkeletonBlock ref={ref} variant={variant} {...rest} />
  }
)
Skeleton.displayName = 'Skeleton'

export { Skeleton, skeletonVariants }
`,
      type: "ui"
    }]
  },
  "slider": {
    name: "slider",
    dependencies: ["@radix-ui/react-slider"],
    registryDependencies: [],
    reverseDependencies: [],
    namespace: false,
    description: "",
    files: [{
      path: "slider.tsx",
      content: `'use client'

import * as React from 'react'
import * as SliderPrimitive from '@radix-ui/react-slider'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// Slider root variants
const sliderVariants = cva(
  'relative flex touch-none select-none',
  {
    variants: {
      size: {
        sm: '',
        default: '',
        lg: '',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
)

// Track sizes per orientation
const trackSizes = {
  sm: 'h-1 data-[orientation=vertical]:h-auto data-[orientation=vertical]:w-1',
  default: 'h-1.5 data-[orientation=vertical]:h-auto data-[orientation=vertical]:w-1.5',
  lg: 'h-2 data-[orientation=vertical]:h-auto data-[orientation=vertical]:w-2',
}

// Thumb sizes
const thumbSizes = {
  sm: 'w-[var(--component-slider-thumb-sm)] h-[var(--component-slider-thumb-sm)]',
  default: 'w-[var(--component-slider-thumb-default)] h-[var(--component-slider-thumb-default)]',
  lg: 'w-[var(--component-slider-thumb-lg)] h-[var(--component-slider-thumb-lg)]',
}

// Content font sizes (for startContent / endContent)
const contentSizes = {
  sm: 'text-xs',
  default: 'text-sm',
  lg: 'text-base',
}

// Color maps for range and thumb
const sliderColorMap = {
  default: {
    range: 'bg-foreground',
    thumb: 'bg-background border-foreground',
    thumbHover: 'hover:shadow-[0_0_0_4px_color-mix(in_srgb,var(--color-text)_16%,transparent)] hover:border-foreground',
    thumbActive: 'active:shadow-[0_0_0_6px_color-mix(in_srgb,var(--color-text)_16%,transparent)]',
  },
  primary: {
    range: 'bg-primary',
    thumb: 'bg-primary-foreground border-primary',
    thumbHover: 'hover:shadow-primary-glow hover:border-primary-hover',
    thumbActive: 'active:shadow-[0_0_0_6px_color-mix(in_srgb,var(--color-primary)_16%,transparent)]',
  },
} as const

export type SliderColor = keyof typeof sliderColorMap

export interface SliderProps
  extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>,
    VariantProps<typeof sliderVariants> {
  /** Track and thumb color */
  color?: SliderColor
  /** Tooltip display mode: auto (hover/drag), always, never */
  showTooltip?: 'auto' | 'always' | 'never'
  /** Custom formatter for tooltip value */
  formatLabel?: (value: number) => string
  /** Content to display before the slider (icon, label, etc.) */
  startContent?: React.ReactNode
  /** Content to display after the slider */
  endContent?: React.ReactNode
}

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, size, color = 'default', value, defaultValue, onValueChange, showTooltip = 'never', formatLabel, startContent, endContent, orientation, ...props }, ref) => {
  const resolvedSize = size || 'default'
  const thumbCount = value?.length ?? defaultValue?.length ?? 1
  const hasTooltip = showTooltip !== 'never'
  const hasWrapper = !!(startContent || endContent)
  const isVertical = orientation === 'vertical'

  // Track value internally for tooltip display
  const [internalValue, setInternalValue] = React.useState(
    () => value ?? defaultValue ?? Array(thumbCount).fill(props.min ?? 0)
  )
  const displayValues = value ?? internalValue

  const handleValueChange = React.useCallback((newValue: number[]) => {
    setInternalValue(newValue)
    onValueChange?.(newValue)
  }, [onValueChange])

  const sliderRoot = (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        sliderVariants({ size }),
        isVertical
          ? 'h-full w-auto flex-col items-center'
          : 'w-full items-center',
        hasWrapper && (isVertical ? 'flex-1 min-h-0' : 'flex-1 min-w-0'),
        !hasWrapper && className
      )}
      value={value}
      defaultValue={defaultValue}
      onValueChange={hasTooltip ? handleValueChange : onValueChange}
      orientation={orientation}
      {...props}
    >
      <SliderPrimitive.Track
        className={cn(
          'relative grow overflow-hidden rounded-full bg-border',
          isVertical ? 'h-full' : 'w-full',
          trackSizes[resolvedSize]
        )}
      >
        <SliderPrimitive.Range
          className={cn(
            'absolute rounded-full', sliderColorMap[color].range,
            isVertical
              ? 'w-full transition-[top,bottom] duration-fast ease-out'
              : 'h-full transition-[left,right] duration-fast ease-out'
          )}
        />
      </SliderPrimitive.Track>
      {Array.from({ length: thumbCount }).map((_, i) => (
        <SliderPrimitive.Thumb
          key={i}
          className={cn(
            'group/thumb block rounded-full border-2 shadow-sm', sliderColorMap[color].thumb,
            isVertical
              ? 'transition-[top,box-shadow,border-color] duration-fast ease-out'
              : 'transition-[left,box-shadow,border-color] duration-fast ease-out',
            sliderColorMap[color].thumbHover,
            sliderColorMap[color].thumbActive,
            'focus-visible:focus-ring',
            'disabled:pointer-events-none disabled:opacity-50',
            thumbSizes[resolvedSize]
          )}
        >
          {hasTooltip && (
            <div
              className={cn(
                'absolute pointer-events-none',
                'transition-all duration-fast ease-out',
                isVertical
                  ? 'right-full top-1/2 -translate-y-1/2 mr-2 origin-right'
                  : 'bottom-full left-1/2 -translate-x-1/2 mb-2 origin-bottom',
                showTooltip === 'always'
                  ? 'opacity-100 scale-100'
                  : [
                      'opacity-0 scale-95',
                      'group-hover/thumb:opacity-100 group-hover/thumb:scale-100',
                      'group-active/thumb:opacity-100 group-active/thumb:scale-100',
                      'group-focus-visible/thumb:opacity-100 group-focus-visible/thumb:scale-100',
                    ]
              )}
            >
              <div className="relative bg-foreground text-background text-xs font-semibold font-mono tabular-nums px-2.5 py-1 rounded-md shadow-lg whitespace-nowrap">
                {formatLabel ? formatLabel(displayValues[i]) : displayValues[i]}
                {/* Arrow */}
                {isVertical ? (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-foreground" />
                ) : (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-foreground" />
                )}
              </div>
            </div>
          )}
        </SliderPrimitive.Thumb>
      ))}
    </SliderPrimitive.Root>
  )

  if (!hasWrapper) return sliderRoot

  return (
    <div className={cn(
      isVertical ? 'inline-flex flex-col items-center gap-2 h-full' : 'flex items-center gap-3',
      className
    )}>
      {startContent && (
        <span className={cn('shrink-0 text-text-muted select-none', contentSizes[resolvedSize], props.disabled && 'opacity-50')}>
          {startContent}
        </span>
      )}
      {sliderRoot}
      {endContent && (
        <span className={cn('shrink-0 text-text-muted select-none', contentSizes[resolvedSize], props.disabled && 'opacity-50')}>
          {endContent}
        </span>
      )}
    </div>
  )
})
Slider.displayName = 'Slider'

export { Slider, sliderVariants }
`,
      type: "ui"
    }]
  },
  "spinner": {
    name: "spinner",
    dependencies: [],
    registryDependencies: [],
    reverseDependencies: [],
    namespace: false,
    description: "",
    files: [{
      path: "spinner.tsx",
      content: `'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// ============================================================================
// Constants
// ============================================================================

/** Ring SVG sizes per size variant (diameter in px) */
const RING_SIZES = {
  sm: 16,
  default: 24,
  lg: 32,
} as const

/** Ring stroke widths per size */
const RING_STROKE = {
  sm: 2,
  default: 2.5,
  lg: 3,
} as const

/** Dot sizes (diameter in px) */
const DOT_SIZES = {
  sm: 4,
  default: 6,
  lg: 8,
} as const

/** Dot container gap per size */
const DOT_GAP = {
  sm: 3,
  default: 4,
  lg: 5,
} as const

/** Bar widths per size */
const BAR_WIDTHS = {
  sm: 2,
  default: 3,
  lg: 4,
} as const

/** Bar heights per size */
const BAR_HEIGHTS = {
  sm: 12,
  default: 16,
  lg: 24,
} as const

/** Bar gap per size */
const BAR_GAP = {
  sm: 2,
  default: 3,
  lg: 4,
} as const

/** Orbit sizes (diameter in px) */
const ORBIT_SIZES = {
  sm: 22,
  default: 32,
  lg: 44,
} as const

/** Orbit ring stroke widths per size */
const ORBIT_STROKE = {
  sm: 2.5,
  default: 3,
  lg: 3.5,
} as const


/** Number of dots in dots variant */
const DOT_COUNT = 3

/** Number of bars in bars variant */
const BAR_COUNT = 4

/** SVG viewBox for ring spinner */
const RING_VIEWBOX = 24

/** SVG center for ring spinner */
const RING_CENTER = 12

// ============================================================================
// Color mapping
// ============================================================================

const strokeColorMap = {
  default: 'stroke-foreground',
  primary: 'stroke-primary',
  current: 'stroke-current',
} as const

const bgColorMap = {
  default: 'bg-foreground',
  primary: 'bg-primary',
  current: 'bg-current',
} as const

// ============================================================================
// Speed mapping
// ============================================================================

/** Speed durations in ms for ring/dots/bars */
const SPEED_MS = { slow: 1500, default: 1000, fast: 750 } as const
/** Speed durations in ms for orbit (slower) */
const ORBIT_SPEED_MS = { slow: 2000, default: 1500, fast: 1000 } as const

// ============================================================================
// Variants (CVA)
// ============================================================================

const spinnerVariants = cva(
  'inline-flex items-center justify-center shrink-0',
  {
    variants: {
      size: {
        sm: '',
        default: '',
        lg: '',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
)

// ============================================================================
// Types
// ============================================================================

export type OrbitStyle = 'ring' | 'dots' | 'cube' | 'flip' | 'morph'

export interface SpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  /** Visual variant */
  variant?: 'ring' | 'dots' | 'bars' | 'orbit'
  /** Orbit sub-style (only when variant="orbit") */
  orbitStyle?: OrbitStyle
  /** Spinner color */
  color?: 'default' | 'primary' | 'current'
  /** Animation speed */
  speed?: 'slow' | 'default' | 'fast'
  /** Accessibility label */
  label?: string
}

// ============================================================================
// Component
// ============================================================================

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({
    className,
    variant = 'ring',
    orbitStyle = 'ring',
    size,
    color = 'default',
    speed = 'default',
    label,
    ...props
  }, ref) => {
    const resolvedSize = size || 'default'

    const orbitMap = {
      ring: OrbitSpinner,
      dots: OrbitDotsSpinner,
      cube: OrbitCubeSpinner,
      flip: OrbitFlipSpinner,
      morph: OrbitMorphSpinner,
    } as const

    return (
      <div
        ref={ref}
        role="status"
        aria-label={label || 'Loading'}
        className={cn(spinnerVariants({ size }), className)}
        {...props}
      >
        {variant === 'ring' && (
          <RingSpinner size={resolvedSize} color={color} speed={speed} />
        )}
        {variant === 'dots' && (
          <DotsSpinner size={resolvedSize} color={color} speed={speed} />
        )}
        {variant === 'bars' && (
          <BarsSpinner size={resolvedSize} color={color} speed={speed} />
        )}
        {variant === 'orbit' && (() => {
          const OrbitComponent = orbitMap[orbitStyle]
          return <OrbitComponent size={resolvedSize} color={color} speed={speed} />
        })()}
      </div>
    )
  }
)
Spinner.displayName = 'Spinner'

// ============================================================================
// Ring Spinner (SVG circle with animate-spin)
// ============================================================================

function RingSpinner({ size, color, speed }: {
  size: 'sm' | 'default' | 'lg'
  color: 'default' | 'primary' | 'current'
  speed: 'slow' | 'default' | 'fast'
}) {
  const diameter = RING_SIZES[size]
  const stroke = RING_STROKE[size]
  const r = (RING_VIEWBOX - stroke) / 2
  const circumference = 2 * Math.PI * r

  return (
    <svg
      viewBox={\`0 0 \${RING_VIEWBOX} \${RING_VIEWBOX}\`}
      width={diameter}
      height={diameter}
      fill="none"
      className="animate-spin"
      style={{ animationDuration: \`\${SPEED_MS[speed]}ms\` }}
    >
      {/* Track */}
      <circle
        cx={RING_CENTER}
        cy={RING_CENTER}
        r={r}
        className="stroke-border"
        strokeWidth={stroke}
      />
      {/* Indicator */}
      <circle
        cx={RING_CENTER}
        cy={RING_CENTER}
        r={r}
        className={strokeColorMap[color]}
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={circumference * 0.75}
        strokeLinecap="round"
      />
    </svg>
  )
}

// ============================================================================
// Dots Spinner (3 pulsing dots)
// ============================================================================

function DotsSpinner({ size, color, speed }: {
  size: 'sm' | 'default' | 'lg'
  color: 'default' | 'primary' | 'current'
  speed: 'slow' | 'default' | 'fast'
}) {
  const dotSize = DOT_SIZES[size]
  const gap = DOT_GAP[size]

  return (
    <div className="inline-flex items-center" style={{ gap }}>
      {Array.from({ length: DOT_COUNT }, (_, i) => (
        <div
          key={i}
          className={cn(
            'rounded-full animate-spinner-dot',
            bgColorMap[color],
          )}
          style={{
            width: dotSize,
            height: dotSize,
            animationDuration: \`\${SPEED_MS[speed]}ms\`,
            animationDelay: \`\${i * (SPEED_MS[speed] / DOT_COUNT / 1.5)}ms\`,
          }}
        />
      ))}
    </div>
  )
}

// ============================================================================
// Bars Spinner (4 pulsing bars)
// ============================================================================

function BarsSpinner({ size, color, speed }: {
  size: 'sm' | 'default' | 'lg'
  color: 'default' | 'primary' | 'current'
  speed: 'slow' | 'default' | 'fast'
}) {
  const barWidth = BAR_WIDTHS[size]
  const barHeight = BAR_HEIGHTS[size]
  const gap = BAR_GAP[size]

  return (
    <div className="inline-flex items-center" style={{ gap, height: barHeight }}>
      {Array.from({ length: BAR_COUNT }, (_, i) => (
        <div
          key={i}
          className={cn(
            'rounded-full animate-spinner-bar origin-center',
            bgColorMap[color],
          )}
          style={{
            width: barWidth,
            height: barHeight,
            animationDuration: \`\${SPEED_MS[speed]}ms\`,
            animationDelay: \`\${i * (SPEED_MS[speed] / BAR_COUNT / 1.5)}ms\`,
          }}
        />
      ))}
    </div>
  )
}

// ============================================================================
// Orbit Spinner (3D rotating ring)
// ============================================================================

const orbitTextColorMap = {
  default: 'text-foreground',
  primary: 'text-primary',
  current: '',
} as const

function OrbitSpinner({ size, color, speed }: {
  size: 'sm' | 'default' | 'lg'
  color: 'default' | 'primary' | 'current'
  speed: 'slow' | 'default' | 'fast'
}) {
  const diameter = ORBIT_SIZES[size]
  const stroke = ORBIT_STROKE[size]
  const r = (RING_VIEWBOX - stroke * 2) / 2

  return (
    <div
      className={cn(orbitTextColorMap[color])}
      style={{
        width: diameter,
        height: diameter,
        perspective: diameter * 3,
        position: 'relative',
      }}
    >
      {/* Ring 1 \u2014 solid, Y-axis rotation */}
      <svg
        viewBox={\`0 0 \${RING_VIEWBOX} \${RING_VIEWBOX}\`}
        width={diameter}
        height={diameter}
        fill="none"
        className="absolute inset-0 animate-spinner-orbit"
        style={{ animationDuration: \`\${ORBIT_SPEED_MS[speed]}ms\` }}
      >
        <circle
          cx={RING_CENTER}
          cy={RING_CENTER}
          r={r}
          stroke="currentColor"
          strokeWidth={stroke}
        />
      </svg>
      {/* Ring 2 \u2014 solid, perpendicular, reverse direction */}
      <svg
        viewBox={\`0 0 \${RING_VIEWBOX} \${RING_VIEWBOX}\`}
        width={diameter}
        height={diameter}
        fill="none"
        className="absolute inset-0 animate-spinner-orbit"
        style={{
          animationDuration: \`\${ORBIT_SPEED_MS[speed]}ms\`,
          transform: 'rotateZ(90deg)',
          animationDirection: 'reverse',
          animationDelay: '-0.4s',
          opacity: 0.35,
        }}
      >
        <circle
          cx={RING_CENTER}
          cy={RING_CENTER}
          r={r}
          stroke="currentColor"
          strokeWidth={stroke}
        />
      </svg>
    </div>
  )
}

// ============================================================================
// Orbit Dots \u2014 3 dots orbiting in 3D path
// ============================================================================

/** Orbit dot size per spinner size */
const ORBIT_DOT_SIZE = { sm: 3, default: 4, lg: 6 } as const

function OrbitDotsSpinner({ size, color, speed }: {
  size: 'sm' | 'default' | 'lg'
  color: 'default' | 'primary' | 'current'
  speed: 'slow' | 'default' | 'fast'
}) {
  const diameter = ORBIT_SIZES[size]
  const dotSize = ORBIT_DOT_SIZE[size]
  const orbitRadius = (diameter - dotSize) / 2

  return (
    <div
      className={cn(orbitTextColorMap[color])}
      style={{
        width: diameter,
        height: diameter,
        perspective: diameter * 3,
        position: 'relative',
      }}
    >
      <div
        className="animate-spinner-orbit"
        style={{
          animationDuration: \`\${ORBIT_SPEED_MS[speed]}ms\`,
          width: '100%',
          height: '100%',
          position: 'relative',
          transformStyle: 'preserve-3d',
        }}
      >
        {[0, 120, 240].map((angle) => (
          <div
            key={angle}
            className="absolute rounded-full"
            style={{
              width: dotSize,
              height: dotSize,
              backgroundColor: 'currentColor',
              left: '50%',
              top: '50%',
              transform: \`translate(-50%, -50%) rotate(\${angle}deg) translateX(\${orbitRadius}px)\`,
            }}
          />
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// Orbit Cube \u2014 wireframe cube rotating in 3D
// ============================================================================

/** Cube face sizes per spinner size */
const CUBE_SIZES = { sm: 12, default: 18, lg: 26 } as const

function OrbitCubeSpinner({ size, color, speed }: {
  size: 'sm' | 'default' | 'lg'
  color: 'default' | 'primary' | 'current'
  speed: 'slow' | 'default' | 'fast'
}) {
  const cubeSize = CUBE_SIZES[size]
  const half = cubeSize / 2
  const radius = Math.round(cubeSize * 0.15)

  const overlap = 1
  const faceBase: React.CSSProperties = {
    position: 'absolute',
    width: cubeSize + overlap * 2,
    height: cubeSize + overlap * 2,
    backgroundColor: 'currentColor',
    borderRadius: radius,
    top: -overlap,
    left: -overlap,
  }

  return (
    <div
      className={cn(orbitTextColorMap[color])}
      style={{
        width: cubeSize,
        height: cubeSize,
        perspective: cubeSize * 6,
      }}
    >
      {/* Diagonal tilt \u2014 shows top + corner for depth */}
      <div
        style={{
          width: cubeSize,
          height: cubeSize,
          transform: 'rotateX(-25deg) rotateZ(15deg)',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Y-axis rotation */}
        <div
          className="animate-spinner-orbit"
          style={{
            animationDuration: \`\${ORBIT_SPEED_MS[speed]}ms\`,
            width: cubeSize,
            height: cubeSize,
            position: 'relative',
            transformStyle: 'preserve-3d',
          }}
        >
          <div style={{ ...faceBase, transform: \`translateZ(\${half}px)\`, opacity: 0.25 }} />
          <div style={{ ...faceBase, transform: \`translateZ(\${-half}px)\`, opacity: 0.1 }} />
          <div style={{ ...faceBase, transform: \`rotateY(-90deg) translateZ(\${half}px)\`, opacity: 0.2 }} />
          <div style={{ ...faceBase, transform: \`rotateY(90deg) translateZ(\${half}px)\`, opacity: 0.2 }} />
          <div style={{ ...faceBase, transform: \`rotateX(90deg) translateZ(\${half}px)\`, opacity: 0.15 }} />
          <div style={{ ...faceBase, transform: \`rotateX(-90deg) translateZ(\${half}px)\`, opacity: 0.08 }} />
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Orbit Flip \u2014 rounded square tumbling in 3D
// ============================================================================

/** Flip square sizes per spinner size */
const FLIP_SIZES = { sm: 14, default: 20, lg: 28 } as const

function OrbitFlipSpinner({ size, color, speed }: {
  size: 'sm' | 'default' | 'lg'
  color: 'default' | 'primary' | 'current'
  speed: 'slow' | 'default' | 'fast'
}) {
  const sqSize = FLIP_SIZES[size]

  return (
    <div
      className={cn(orbitTextColorMap[color])}
      style={{
        width: sqSize,
        height: sqSize,
        perspective: sqSize * 4,
      }}
    >
      <div style={{ transform: 'rotateX(25deg)', transformStyle: 'preserve-3d', width: '100%', height: '100%' }}>
        <div
          className="animate-spinner-orbit"
          style={{
            animationDuration: \`\${ORBIT_SPEED_MS[speed]}ms\`,
            width: '100%',
            height: '100%',
            borderRadius: '25%',
            backgroundColor: 'currentColor',
            opacity: 0.85,
          }}
        />
      </div>
    </div>
  )
}

// ============================================================================
// Orbit Morph \u2014 organic shape morphing + 3D rotation
// ============================================================================

/** Morph sizes per spinner size */
const MORPH_SIZES = { sm: 16, default: 24, lg: 34 } as const

function OrbitMorphSpinner({ size, color, speed }: {
  size: 'sm' | 'default' | 'lg'
  color: 'default' | 'primary' | 'current'
  speed: 'slow' | 'default' | 'fast'
}) {
  const morphSize = MORPH_SIZES[size]

  return (
    <div
      className={cn(orbitTextColorMap[color])}
      style={{
        width: morphSize,
        height: morphSize,
        perspective: morphSize * 3,
      }}
    >
      <div
        className="animate-spinner-morph"
        style={{
          animationDuration: \`\${ORBIT_SPEED_MS[speed]}ms\`,
          width: '100%',
          height: '100%',
          backgroundColor: 'currentColor',
          opacity: 0.85,
        }}
      />
    </div>
  )
}

export { Spinner, spinnerVariants }
`,
      type: "ui"
    }]
  },
  "switch": {
    name: "switch",
    dependencies: ["@radix-ui/react-switch"],
    registryDependencies: ["field"],
    reverseDependencies: [],
    namespace: false,
    description: "",
    files: [{
      path: "switch.tsx",
      content: `'use client'

import * as React from 'react'
import * as SwitchPrimitive from '@radix-ui/react-switch'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { useFieldContext } from './field'

// Switch track variants
const switchVariants = cva(
  [
    'group peer inline-flex shrink-0 cursor-pointer items-center rounded-full',
    'border border-transparent transition-all duration-normal ease-out',
    'focus-visible:focus-ring',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'data-[state=unchecked]:bg-border',
  ].join(' '),
  {
    variants: {
      size: {
        sm: 'w-[var(--component-switch-track-sm-width)] h-[var(--component-switch-track-sm-height)]',
        default: 'w-[var(--component-switch-track-default-width)] h-[var(--component-switch-track-default-height)]',
        lg: 'w-[var(--component-switch-track-lg-width)] h-[var(--component-switch-track-lg-height)]',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
)

// Thumb sizes
const thumbSizes = {
  sm: 'w-[var(--component-switch-thumb-sm)] h-[var(--component-switch-thumb-sm)]',
  default: 'w-[var(--component-switch-thumb-default)] h-[var(--component-switch-thumb-default)]',
  lg: 'w-[var(--component-switch-thumb-lg)] h-[var(--component-switch-thumb-lg)]',
}

// Thumb translate when checked: track_width - thumb_size - 2px (border 1px \xD7 2)
const thumbTranslate = {
  sm: 'data-[state=checked]:translate-x-[calc(var(--component-switch-track-sm-width)_-_var(--component-switch-thumb-sm)_-_2px)]',
  default: 'data-[state=checked]:translate-x-[calc(var(--component-switch-track-default-width)_-_var(--component-switch-thumb-default)_-_2px)]',
  lg: 'data-[state=checked]:translate-x-[calc(var(--component-switch-track-lg-width)_-_var(--component-switch-thumb-lg)_-_2px)]',
}

// Gap between switch and label
const gapSizes = {
  sm: 'gap-2',      // 8px
  default: 'gap-2.5', // 10px
  lg: 'gap-3',      // 12px
}

// Label font sizes
const labelSizes = {
  sm: 'text-xs',      // 12px
  default: 'text-md',  // 14px
  lg: 'text-base',    // 16px
}

export type SwitchLabelPosition = 'start' | 'end' | 'top' | 'bottom'
export type SwitchColor = 'default' | 'primary' | 'success' | 'warning' | 'error'

// Checked track color per color variant
const checkedTrackColors: Record<SwitchColor, string> = {
  default: 'data-[state=checked]:bg-foreground',
  primary: 'data-[state=checked]:bg-primary',
  success: 'data-[state=checked]:bg-success',
  warning: 'data-[state=checked]:bg-warning',
  error: 'data-[state=checked]:bg-error',
}

// Checked icon color per color variant
const checkedIconColors: Record<SwitchColor, string> = {
  default: 'text-foreground',
  primary: 'text-primary',
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-error',
}

// Icon sizes per thumb size
const iconSizes = {
  sm: 'hidden',            // 12px thumb \u2014 too small for icons
  default: 'w-2.5 h-2.5', // 10px icon in 16px thumb
  lg: 'w-3.5 h-3.5',      // 14px icon in 20px thumb
}

export interface SwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>,
    VariantProps<typeof switchVariants> {
  label?: string
  labelPosition?: SwitchLabelPosition
  startLabel?: string
  endLabel?: string
  checkedIcon?: React.ReactNode
  uncheckedIcon?: React.ReactNode
  color?: SwitchColor
}

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  SwitchProps
>(({ className, size, label, labelPosition = 'end', startLabel, endLabel, checkedIcon, uncheckedIcon, color = 'default', disabled, id, ...props }, ref) => {
  const fieldContext = useFieldContext()
  const resolvedSize = size || 'default'
  const resolvedDisabled = disabled ?? fieldContext?.disabled
  const generatedId = React.useId()
  const switchId = id ?? fieldContext?.id ?? generatedId

  const switchEl = (
    <SwitchPrimitive.Root
      ref={ref}
      id={switchId}
      disabled={resolvedDisabled}
      className={cn(switchVariants({ size }), checkedTrackColors[color], className)}
      {...props}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          'group/thumb pointer-events-none flex items-center justify-center rounded-full shadow-sm ring-0',
          color === 'default' ? 'bg-background' : 'bg-primary-foreground',
          'transition-transform duration-normal ease-out',
          'data-[state=unchecked]:translate-x-0',
          thumbSizes[resolvedSize],
          thumbTranslate[resolvedSize]
        )}
      >
        {(checkedIcon || uncheckedIcon) && resolvedSize !== 'sm' && (
          <>
            {checkedIcon && (
              <span className={cn(
                iconSizes[resolvedSize],
                checkedIconColors[color],
                'hidden group-data-[state=checked]/thumb:block',
              )}>
                {checkedIcon}
              </span>
            )}
            {uncheckedIcon && (
              <span className={cn(
                iconSizes[resolvedSize],
                'text-text-muted',
                'hidden group-data-[state=unchecked]/thumb:block',
              )}>
                {uncheckedIcon}
              </span>
            )}
          </>
        )}
      </SwitchPrimitive.Thumb>
    </SwitchPrimitive.Root>
  )

  const labelClassName = cn(
    labelSizes[resolvedSize],
    'text-text-muted cursor-pointer select-none transition-colors duration-micro',
    'group-hover/switch:text-foreground',
    resolvedDisabled && 'opacity-50 cursor-not-allowed'
  )

  // Sides mode: startLabel / endLabel
  if (startLabel || endLabel) {
    return (
      <div className={cn('group/switch flex items-center', gapSizes[resolvedSize])}>
        {startLabel && (
          <label htmlFor={switchId} className={labelClassName}>
            {startLabel}
          </label>
        )}
        <div className="flex items-center">
          {switchEl}
        </div>
        {endLabel && (
          <label htmlFor={switchId} className={labelClassName}>
            {endLabel}
          </label>
        )}
      </div>
    )
  }

  if (!label) return switchEl

  const isVertical = labelPosition === 'top' || labelPosition === 'bottom'
  const isReversed = labelPosition === 'start' || labelPosition === 'top'

  return (
    <div className={cn(
      'group/switch flex',
      isVertical ? 'flex-col items-start gap-1.5' : 'items-center',
      isReversed && (isVertical ? 'flex-col-reverse' : 'flex-row-reverse'),
      !isVertical && gapSizes[resolvedSize],
    )}>
      <div className="flex items-center">
        {switchEl}
      </div>
      <label htmlFor={switchId} className={labelClassName}>
        {label}
      </label>
    </div>
  )
})
Switch.displayName = 'Switch'

export { Switch, switchVariants }
`,
      type: "ui"
    }]
  },
  "table": {
    name: "table",
    dependencies: [],
    registryDependencies: [],
    reverseDependencies: [],
    namespace: true,
    description: "",
    files: [{
      path: "table.tsx",
      content: `'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// Size variants for table density
type TableSize = 'sm' | 'default' | 'lg'

// Visual style variants
type TableVariant = 'default' | 'bordered' | 'striped'

// Root context \u2014 set at Root, consumed by children
const TableContext = React.createContext<{
  size: TableSize
  variant: TableVariant
  stickyHeader: boolean
}>({ size: 'default', variant: 'default', stickyHeader: false })

// Cell padding per size
const cellPaddingMap: Record<TableSize, string> = {
  sm: 'px-3 py-2 text-sm',
  default: 'px-4 py-3 text-sm',
  lg: 'px-6 py-4 text-base',
}

// Head cell padding per size
const headPaddingMap: Record<TableSize, string> = {
  sm: 'px-3 py-2 text-xs',
  default: 'px-4 py-3 text-xs',
  lg: 'px-6 py-3.5 text-sm',
}

// Checkbox column padding override per size (right padding removed \u2014 next column's left padding handles the gap)
const checkboxPaddingMap: Record<TableSize, string> = {
  sm: '[&:has([role=checkbox])]:pl-1 [&:has([role=checkbox])]:pr-0',
  default: '[&:has([role=checkbox])]:pl-2 [&:has([role=checkbox])]:pr-0',
  lg: '[&:has([role=checkbox])]:pl-3 [&:has([role=checkbox])]:pr-0',
}

const tableVariants = cva(
  'w-full caption-bottom text-sm',
  {
    variants: {
      variant: {
        default: '',
        bordered: 'border border-border',
        striped: '',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

// \u2500\u2500\u2500 Root \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
export interface TableProps
  extends React.HTMLAttributes<HTMLTableElement>,
    VariantProps<typeof tableVariants> {
  /** Table density */
  size?: TableSize
  /** Visual style */
  variant?: TableVariant
  /** Sticky header when scrolling */
  stickyHeader?: boolean
  /** Additional className for the scroll wrapper (e.g. max-h-[400px]) */
  wrapperClassName?: string
}

const TableRoot = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, size = 'default', variant = 'default', stickyHeader = false, wrapperClassName, ...props }, ref) => (
    <TableContext.Provider value={{ size, variant, stickyHeader }}>
      <div className={cn('relative w-full overflow-auto', wrapperClassName)}>
        <table
          ref={ref}
          className={cn(tableVariants({ variant }), className)}
          {...props}
        />
      </div>
    </TableContext.Provider>
  )
)
TableRoot.displayName = 'Table'

// \u2500\u2500\u2500 Header \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => {
  const { stickyHeader } = React.useContext(TableContext)
  return (
    <thead
      ref={ref}
      className={cn(
        '[&_tr]:border-b [&_tr]:border-border',
        stickyHeader && 'sticky top-0 z-10 bg-background',
        className
      )}
      {...props}
    />
  )
})
TableHeader.displayName = 'TableHeader'

// \u2500\u2500\u2500 Body \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => {
  const { variant } = React.useContext(TableContext)
  return (
    <tbody
      ref={ref}
      className={cn(
        '[&_tr:last-child]:border-b-0',
        variant === 'striped' && '[&_tr:nth-child(even)]:bg-background-muted',
        className
      )}
      {...props}
    />
  )
})
TableBody.displayName = 'TableBody'

// \u2500\u2500\u2500 Footer \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      'border-t border-border bg-background-muted/50 font-normal [&>tr]:last:border-b-0',
      className
    )}
    {...props}
  />
))
TableFooter.displayName = 'TableFooter'

// \u2500\u2500\u2500 Row \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  /** Enable hover highlight */
  interactive?: boolean
  /** Selected state background */
  selected?: boolean
}

const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, interactive = false, selected = false, ...props }, ref) => (
    <tr
      ref={ref}
      data-selected={selected || undefined}
      className={cn(
        'border-b border-border transition-colors duration-fast',
        interactive && 'hover:bg-background-muted/50 cursor-pointer',
        className
      )}
      {...props}
    />
  )
)
TableRow.displayName = 'TableRow'

// \u2500\u2500\u2500 Head Cell \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
type SortDirection = 'asc' | 'desc' | null

// Default sort icons
const defaultSortIcons = {
  asc: (
    <svg className="icon-xs" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
    </svg>
  ),
  desc: (
    <svg className="icon-xs" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  ),
  default: (
    <svg className="icon-xs" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
    </svg>
  ),
}

export interface SortIconSet {
  /** Icon for ascending state */
  asc?: React.ReactNode
  /** Icon for descending state */
  desc?: React.ReactNode
  /** Icon for unsorted (default) state */
  default?: React.ReactNode
}

export interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  /** Text alignment */
  align?: 'left' | 'center' | 'right'
  /** Enable sort indicator */
  sortable?: boolean
  /** Current sort direction */
  sortDirection?: SortDirection
  /** Sort click handler */
  onSort?: () => void
  /** Custom sort icons (overrides built-in icons) */
  sortIcon?: SortIconSet
}

const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, align = 'left', sortable = false, sortDirection = null, onSort, sortIcon, children, ...props }, ref) => {
    const { size } = React.useContext(TableContext)
    const icons = { ...defaultSortIcons, ...sortIcon }

    const content = sortable ? (
      <button
        type="button"
        className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors duration-fast group"
        onClick={onSort}
      >
        {children}
        <span className={cn(
          'shrink-0 transition-colors duration-fast',
          sortDirection ? 'text-foreground' : 'text-text-muted'
        )}>
          {sortDirection === 'asc' ? icons.asc
            : sortDirection === 'desc' ? icons.desc
            : icons.default}
        </span>
      </button>
    ) : children

    return (
      <th
        ref={ref}
        className={cn(
          'text-left align-middle font-semibold text-text-muted whitespace-nowrap',
          headPaddingMap[size],
          checkboxPaddingMap[size],
          align === 'center' && 'text-center',
          align === 'right' && 'text-right',
          sortable && 'select-none',
          className
        )}
        aria-sort={sortDirection === 'asc' ? 'ascending' : sortDirection === 'desc' ? 'descending' : undefined}
        {...props}
      >
        {content}
      </th>
    )
  }
)
TableHead.displayName = 'TableHead'

// \u2500\u2500\u2500 Data Cell \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
export interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  /** Text alignment */
  align?: 'left' | 'center' | 'right'
}

const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, align = 'left', ...props }, ref) => {
    const { size } = React.useContext(TableContext)
    return (
      <td
        ref={ref}
        className={cn(
          'text-foreground align-middle',
          cellPaddingMap[size],
          checkboxPaddingMap[size],
          align === 'center' && 'text-center',
          align === 'right' && 'text-right',
          className
        )}
        {...props}
      />
    )
  }
)
TableCell.displayName = 'TableCell'

// \u2500\u2500\u2500 Caption \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn('mt-4 text-sm text-text-muted', className)}
    {...props}
  />
))
TableCaption.displayName = 'TableCaption'

export type { TableSize, TableVariant, SortDirection }

// \u2500\u2500\u2500 Namespace \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const Table = Object.assign(TableRoot, {
  Header: TableHeader,
  Body: TableBody,
  Footer: TableFooter,
  Row: TableRow,
  Head: TableHead,
  Cell: TableCell,
  Caption: TableCaption,
})

// eslint-disable-next-line @typescript-eslint/no-namespace
namespace Table {
  export type RowProps = TableRowProps
  export type HeadProps = TableHeadProps
  export type CellProps = TableCellProps
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
}
`,
      type: "ui"
    }]
  },
  "tabs": {
    name: "tabs",
    dependencies: ["@radix-ui/react-tabs"],
    registryDependencies: [],
    reverseDependencies: [],
    namespace: true,
    description: "",
    files: [{
      path: "tabs.tsx",
      content: `'use client'

import * as React from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// Context to pass style props from TabsList to TabsTrigger
type TabsStyleContextValue = {
  variant?: 'line' | 'enclosed' | 'pill'
  size?: 'sm' | 'md' | 'default' | 'lg'
  fitted?: boolean
  color?: 'default' | 'primary'
  radius?: 'none' | 'sm' | 'base' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full'
}
const TabsStyleContext = React.createContext<TabsStyleContextValue>({})
const useTabsStyleContext = () => React.useContext(TabsStyleContext)

// \u2500\u2500\u2500 TabsList \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

const tabsListVariants = cva(
  'inline-flex items-center text-text-subtle',
  {
    variants: {
      variant: {
        line: 'border-b border-border bg-transparent gap-0',
        enclosed: 'border-b border-border bg-transparent gap-0',
        pill: 'bg-background-muted p-1 gap-1',
      },
      fitted: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'line',
      fitted: false,
    },
  }
)

export interface TabsListProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>,
    VariantProps<typeof tabsListVariants> {
  size?: 'sm' | 'md' | 'default' | 'lg'
  /** Indicator color for line variant */
  color?: 'default' | 'primary'
  /** Top border-radius for enclosed variant, container radius for pill variant */
  radius?: 'none' | 'sm' | 'base' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full'
}

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  TabsListProps
>(({ className, variant, size, fitted, color, radius, ...props }, ref) => {
  const resolvedVariant = variant || 'line'
  return (
    <TabsStyleContext.Provider value={{ variant: resolvedVariant, size: size || 'default', fitted: fitted ?? false, color: color || 'default', radius: radius || 'md' }}>
      <TabsPrimitive.List
        ref={ref}
        className={cn(
          tabsListVariants({ variant, fitted }),
          resolvedVariant === 'pill' && pillListRadiusClasses[radius || 'md'],
          className
        )}
        {...props}
      />
    </TabsStyleContext.Provider>
  )
})
TabsList.displayName = 'TabsList'

// \u2500\u2500\u2500 TabsTrigger \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

const tabsTriggerVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap',
    'transition-all duration-micro ease-out cursor-pointer',
    'focus-visible:focus-ring',
    'disabled:pointer-events-none disabled:text-text-subtle disabled:opacity-50',
  ].join(' '),
  {
    variants: {
      variant: {
        line: [
          'border-b-2 border-transparent -mb-px',
          'hover:text-foreground hover:border-border',
          'data-[state=active]:text-foreground data-[state=active]:font-semibold',
        ].join(' '),
        enclosed: [
          'border border-transparent -mb-px',
          'hover:text-foreground',
          'data-[state=active]:text-foreground data-[state=active]:font-semibold data-[state=active]:bg-background',
          'data-[state=active]:border-border data-[state=active]:border-b-background',
        ].join(' '),
        pill: [
          'hover:text-foreground',
          'data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:font-semibold data-[state=active]:shadow-sm',
        ].join(' '),
      },
      size: {
        sm: 'h-8 text-sm',       // 32px, 13px
        md: 'h-9 text-sm',       // 36px, 13px
        default: 'h-10 text-md', // 40px, 14px
        lg: 'h-12 text-base',    // 48px, 16px
      },
      fitted: {
        true: 'flex-1',
        false: '',
      },
    },
    compoundVariants: [
      // Padding per variant \xD7 size
      { variant: 'line', size: 'sm', className: 'px-3' },
      { variant: 'line', size: 'md', className: 'px-3.5' },
      { variant: 'line', size: 'default', className: 'px-4' },
      { variant: 'line', size: 'lg', className: 'px-6' },
      { variant: 'enclosed', size: 'sm', className: 'px-3' },
      { variant: 'enclosed', size: 'md', className: 'px-3.5' },
      { variant: 'enclosed', size: 'default', className: 'px-4' },
      { variant: 'enclosed', size: 'lg', className: 'px-6' },
      // Pill: reduced height + Segmented-matching font/padding
      { variant: 'pill', size: 'sm', className: 'h-6 text-xs px-3.5' },
      { variant: 'pill', size: 'md', className: 'h-7 text-sm px-3.5' },
      { variant: 'pill', size: 'default', className: 'h-8 text-sm px-4' },
      { variant: 'pill', size: 'lg', className: 'h-10 text-md px-6' },
    ],
    defaultVariants: {
      variant: 'line',
      size: 'default',
      fitted: false,
    },
  }
)

// Icon size mapping for tabs (same as Button icon+text pattern)
const triggerIconSizeClasses = {
  sm: '[&>svg]:icon-xs',      // 14px
  md: '[&>svg]:icon-sm',      // 16px
  default: '[&>svg]:icon-sm', // 16px
  lg: '[&>svg]:icon-sm',      // 16px
} as const

export interface TabsTriggerProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>,
    Omit<VariantProps<typeof tabsTriggerVariants>, 'variant' | 'size' | 'fitted'> {}

// Line variant: active indicator color
const lineColorClasses = {
  default: 'data-[state=active]:border-foreground',
  primary: 'data-[state=active]:border-primary',
} as const

// Enclosed variant: top border-radius
const enclosedRadiusClasses = {
  none: 'rounded-t-none',
  sm: 'rounded-t-sm',
  base: 'rounded-t',
  md: 'rounded-t-md',
  lg: 'rounded-t-lg',
  xl: 'rounded-t-xl',
} as const

// Pill variant: container radius (applied to TabsList, matches Segmented scale)
const pillListRadiusClasses = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  base: 'rounded',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  '3xl': 'rounded-3xl',
  full: 'rounded-full',
} as const

// Pill variant: item radius (one step smaller than container, matches Segmented item scale)
const pillItemRadiusClasses = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  base: 'rounded',
  md: 'rounded-md',
  lg: 'rounded-md',
  xl: 'rounded-lg',
  '2xl': 'rounded-xl',
  '3xl': 'rounded-2xl',
  full: 'rounded-full',
} as const

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  TabsTriggerProps
>(({ className, children, ...props }, ref) => {
  const { variant, size, fitted, color, radius } = useTabsStyleContext()
  const resolvedSize = size || 'default'

  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        tabsTriggerVariants({ variant, size: resolvedSize, fitted }),
        triggerIconSizeClasses[resolvedSize],
        variant === 'line' && lineColorClasses[color || 'default'],
        variant === 'enclosed' && enclosedRadiusClasses[(radius || 'md') as keyof typeof enclosedRadiusClasses],
        variant === 'pill' && pillItemRadiusClasses[radius || 'md'],
        className
      )}
      {...props}
    >
      {children}
    </TabsPrimitive.Trigger>
  )
})
TabsTrigger.displayName = 'TabsTrigger'

// \u2500\u2500\u2500 TabsContent \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

export interface TabsContentProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content> {}

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  TabsContentProps
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'mt-4 focus-visible:focus-ring',
      className
    )}
    {...props}
  />
))
TabsContent.displayName = 'TabsContent'

// \u2500\u2500\u2500 Tabs (Root) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

const TabsRoot = TabsPrimitive.Root

// \u2500\u2500\u2500 Namespace \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const Tabs = Object.assign(TabsRoot, {
  List: TabsList,
  Trigger: TabsTrigger,
  Content: TabsContent,
})

// eslint-disable-next-line @typescript-eslint/no-namespace
namespace Tabs {
  export type ListProps = TabsListProps
  export type TriggerProps = TabsTriggerProps
  export type ContentProps = TabsContentProps
}

export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  tabsListVariants,
  tabsTriggerVariants,
}
`,
      type: "ui"
    }]
  },
  "textarea": {
    name: "textarea",
    dependencies: [],
    registryDependencies: ["field"],
    reverseDependencies: [],
    namespace: false,
    description: "",
    files: [{
      path: "textarea.tsx",
      content: `'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { useFieldContext } from './field'

const textareaVariants = cva(
  [
    'flex w-full bg-background text-foreground placeholder:text-foreground/30',
    'border transition-colors duration-micro',
    'focus:[outline:2px_solid_transparent]',
    'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-background-muted',
  ].join(' '),
  {
    variants: {
      variant: {
        default: 'border-border hover:border-border-strong',
        filled: 'border-transparent bg-background-muted',
      },
      focusRing: {
        true: '',
        false: '',
      },
      size: {
        compact: 'px-3 py-2 text-md',   // 12px padding / 14px font - compact spaces
        default: 'px-4 py-3 text-base', // 16px padding / 16px font - standard
      },
      radius: {
        none: 'rounded-none',
        sm: 'rounded-sm',
        base: 'rounded',
        default: 'rounded-md',
        lg: 'rounded-lg',
        xl: 'rounded-xl',
        '2xl': 'rounded-2xl',
        '3xl': 'rounded-3xl',
        full: 'rounded-3xl', // rounded-full looks unnatural on textarea, using 3xl instead
      },
      resize: {
        none: 'resize-none',
        vertical: 'resize-y',
        horizontal: 'resize-x',
        both: 'resize',
      },
      state: {
        default: '',
        error: 'border-error hover:border-error focus:border-error shadow-[0_0_0_2px_var(--color-focus-ring-error)]',
      },
    },
    compoundVariants: [
      // focusRing: true \u2192 show custom focus ring
      { focusRing: true, className: 'focus-visible:shadow-[0_0_0_2px_var(--color-focus-ring)]' },
      // focusRing: false \u2192 keep same state as hover
      { variant: 'default', focusRing: false, className: 'focus:border-border-strong' },
      // filled + error
      {
        variant: 'filled',
        state: 'error',
        className: 'border-transparent hover:border-transparent focus:border-transparent bg-[var(--color-error-bg)] hover:bg-[var(--color-error-bg)] focus:bg-[var(--color-error-bg)] shadow-none',
      },
    ],
    defaultVariants: {
      variant: 'default',
      size: 'default',
      radius: 'default',
      resize: 'vertical',
      state: 'default',
      focusRing: false,
    },
  }
)

export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'>,
    VariantProps<typeof textareaVariants> {
  error?: boolean
  focusRing?: boolean
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant, size, radius, resize, state, error, focusRing, id, rows = 4, onPointerDown, onFocus, onBlur, ...props }, ref) => {
    const fieldContext = useFieldContext()
    const resolvedError = error ?? fieldContext?.error
    const resolvedState = resolvedError ? 'error' : state
    const textareaId = id ?? fieldContext?.id
    const isDisabled = props.disabled ?? fieldContext?.disabled

    // Keyboard focus detection (when focusRing: false, auto-show ring on Tab navigation)
    const pointerRef = React.useRef(false)
    const windowBlurredRef = React.useRef(false)
    const [keyboardFocus, setKeyboardFocus] = React.useState(false)

    // Track window blur/focus to distinguish Tab navigation from window re-activation
    React.useEffect(() => {
      const onBlur = () => { windowBlurredRef.current = true }
      const onFocus = () => { requestAnimationFrame(() => { windowBlurredRef.current = false }) }
      window.addEventListener('blur', onBlur)
      window.addEventListener('focus', onFocus)
      return () => { window.removeEventListener('blur', onBlur); window.removeEventListener('focus', onFocus) }
    }, [])

    const handlePointerDown = React.useCallback((e: React.PointerEvent<HTMLTextAreaElement>) => {
      pointerRef.current = true
      onPointerDown?.(e)
    }, [onPointerDown])

    const handleFocus = React.useCallback((e: React.FocusEvent<HTMLTextAreaElement>) => {
      if (!pointerRef.current && !focusRing && !windowBlurredRef.current) {
        setKeyboardFocus(true)
      }
      pointerRef.current = false
      onFocus?.(e)
    }, [focusRing, onFocus])

    const handleBlur = React.useCallback((e: React.FocusEvent<HTMLTextAreaElement>) => {
      setKeyboardFocus(false)
      pointerRef.current = false
      onBlur?.(e)
    }, [onBlur])

    // Build aria-describedby from context
    const ariaDescribedBy = fieldContext
      ? [
          resolvedError ? \`\${fieldContext.id}-error\` : null,
        ]
          .filter(Boolean)
          .join(' ') || undefined
      : undefined

    return (
      <textarea
        id={textareaId}
        rows={rows}
        className={cn(
          textareaVariants({ variant, size, radius, resize, state: resolvedState, focusRing }),
          keyboardFocus && 'shadow-[0_0_0_2px_var(--color-focus-ring)]',
          className
        )}
        aria-invalid={resolvedError || undefined}
        aria-describedby={ariaDescribedBy}
        disabled={isDisabled}
        ref={ref}
        onPointerDown={handlePointerDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...props}
      />
    )
  }
)
Textarea.displayName = 'Textarea'

export { Textarea, textareaVariants }
`,
      type: "ui"
    }]
  },
  "toast": {
    name: "toast",
    dependencies: [],
    registryDependencies: [],
    reverseDependencies: [],
    namespace: false,
    description: "",
    files: [{
      path: "toast.tsx",
      content: `'use client'

import * as React from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// \u2500\u2500\u2500 Built-in status icons (shared with Alert \u2014 no external dependency) \u2500\u2500\u2500\u2500\u2500\u2500
// All icons: Lucide-compatible 24\xD724 viewBox, strokeWidth=2, rounded caps/joins
const InfoIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </svg>
)

const SuccessIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <path d="m9 12 2 2 4-4" />
  </svg>
)

const WarningIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </svg>
)

const ErrorIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 8v5" />
    <path d="M12 16h.01" />
  </svg>
)

const DefaultCloseIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
)

const LoadingIcon = ({ className }: { className?: string }) => (
  <svg className={cn('animate-spin', className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
  </svg>
)

// \u2500\u2500\u2500 Status icon mapping \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const STATUS_ICONS: Record<ToastType, React.FC<{ className?: string }>> = {
  default: InfoIcon,
  success: SuccessIcon,
  warning: WarningIcon,
  error: ErrorIcon,
  info: InfoIcon,
  loading: LoadingIcon,
}

// \u2500\u2500\u2500 Color \xD7 Type class mapping \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const colorMap: Record<ToastType, string> = {
  default: 'bg-background-paper text-foreground border-border shadow-lg',
  success: 'bg-success-tint text-text-success border-success/20 shadow-lg',
  error: 'bg-error-tint text-text-error border-error/20 shadow-lg',
  warning: 'bg-warning-tint text-text-warning border-warning/20 shadow-lg',
  info: 'bg-info-tint text-text-info border-info/20 shadow-lg',
  loading: 'bg-background-paper text-foreground border-border shadow-lg',
}

const richColorMap: Record<ToastType, string> = {
  default: 'bg-foreground text-background border-transparent shadow-lg',
  success: 'bg-success text-success-foreground border-transparent shadow-lg',
  error: 'bg-error text-error-foreground border-transparent shadow-lg',
  warning: 'bg-warning text-warning-foreground border-transparent shadow-lg',
  info: 'bg-info text-info-foreground border-transparent shadow-lg',
  loading: 'bg-foreground text-background border-transparent shadow-lg',
}

// \u2500\u2500\u2500 Constants (JS cannot read CSS variables at runtime) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const TOAST_EXIT_DURATION = 200    // --duration-normal (200ms)
const TOAST_MIN_RESUME_MS = 500    // --duration-slowest (500ms) \u2014 minimum time after hover resume
const TOAST_WIDTH = 360            // fixed toast width \u2014 smallest mobile viewport baseline
const TOAST_VIEWPORT_MARGIN = 48   // 2 \xD7 offset default (24px) \u2014 viewport safe area
const TOAST_STACK_OFFSET = 8       // --spacing-2 (8px) \u2014 vertical gap between stacked toasts
const TOAST_STACK_SCALE_STEP = 0.05  // scale reduction per stack level (0.95, 0.90, ...)
const TOAST_STACK_OPACITY_STEP = 0.15 // opacity reduction per stack level (0.85, 0.70, ...)
const TOAST_STACK_VISIBLE_LAYERS = 3  // max visible stacked layers before hidden

// \u2500\u2500\u2500 Toast variants (CVA) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const toastVariants = cva(
  'group pointer-events-auto relative flex items-center gap-2.5 border w-full overflow-hidden transition-all',
  {
    variants: {
      size: {
        sm: 'p-3 text-sm rounded-md',
        default: 'p-4 text-md rounded-lg',
        lg: 'p-5 text-md rounded-lg',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
)

// \u2500\u2500\u2500 Types \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
export type ToastType = 'default' | 'success' | 'error' | 'warning' | 'info' | 'loading'
export type ToastPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
export type ToastSize = 'sm' | 'default' | 'lg'

export interface ToastAction {
  label: string
  onClick: () => void
}

export interface ToastData {
  id: string
  type: ToastType
  message: React.ReactNode
  description?: React.ReactNode
  duration?: number
  dismissible?: boolean
  closeButton?: boolean
  icon?: React.ReactNode
  action?: ToastAction
  cancel?: ToastAction
  onDismiss?: (toast: ToastData) => void
  onAutoClose?: (toast: ToastData) => void
  className?: string
  /** Promise state \u2014 managed internally */
  _promiseState?: 'loading' | 'success' | 'error'
}

// \u2500\u2500\u2500 Global toast store \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
type ToastListener = () => void

interface ToastStore {
  toasts: ToastData[]
  listeners: Set<ToastListener>
  addToast: (toast: ToastData) => void
  removeToast: (id: string) => void
  updateToast: (id: string, updates: Partial<ToastData>) => void
  removeAll: () => void
  subscribe: (listener: ToastListener) => () => void
}

function createToastStore(): ToastStore {
  const store: ToastStore = {
    toasts: [],
    listeners: new Set(),
    addToast(toast) {
      store.toasts = [toast, ...store.toasts]
      store.listeners.forEach((l) => l())
    },
    removeToast(id) {
      store.toasts = store.toasts.filter((t) => t.id !== id)
      store.listeners.forEach((l) => l())
    },
    updateToast(id, updates) {
      store.toasts = store.toasts.map((t) => (t.id === id ? { ...t, ...updates } : t))
      store.listeners.forEach((l) => l())
    },
    removeAll() {
      store.toasts = []
      store.listeners.forEach((l) => l())
    },
    subscribe(listener) {
      store.listeners.add(listener)
      return () => { store.listeners.delete(listener) }
    },
  }
  return store
}

const globalStore = createToastStore()

function useToastStore() {
  const [, forceUpdate] = React.useState(0)
  React.useEffect(() => {
    return globalStore.subscribe(() => forceUpdate((n) => n + 1))
  }, [])
  return globalStore.toasts
}

// \u2500\u2500\u2500 Toast ID generator \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
let toastCounter = 0
function genId() {
  toastCounter += 1
  return \`toast-\${toastCounter}-\${Date.now()}\`
}

// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
// Imperative API: toast()
// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550

interface ToastOptions {
  id?: string
  description?: React.ReactNode
  duration?: number
  dismissible?: boolean
  closeButton?: boolean
  icon?: React.ReactNode
  action?: ToastAction
  cancel?: ToastAction
  onDismiss?: (toast: ToastData) => void
  onAutoClose?: (toast: ToastData) => void
  className?: string
}

interface PromiseOptions<T> {
  loading: React.ReactNode
  success: React.ReactNode | ((data: T) => React.ReactNode)
  error: React.ReactNode | ((err: unknown) => React.ReactNode)
  finally?: () => void
  description?: {
    loading?: React.ReactNode
    success?: React.ReactNode | ((data: T) => React.ReactNode)
    error?: React.ReactNode | ((err: unknown) => React.ReactNode)
  }
}

function createToast(message: React.ReactNode, type: ToastType, opts?: ToastOptions): string {
  const id = opts?.id ?? genId()

  // If updating existing toast, just update
  const existing = globalStore.toasts.find((t) => t.id === id)
  if (existing) {
    globalStore.updateToast(id, { message, type, ...opts })
    return id
  }

  globalStore.addToast({
    id,
    type,
    message,
    description: opts?.description,
    duration: opts?.duration,
    dismissible: opts?.dismissible,
    closeButton: opts?.closeButton,
    icon: opts?.icon,
    action: opts?.action,
    cancel: opts?.cancel,
    onDismiss: opts?.onDismiss,
    onAutoClose: opts?.onAutoClose,
    className: opts?.className,
  })
  return id
}

function toast(message: React.ReactNode, opts?: ToastOptions): string {
  return createToast(message, 'default', opts)
}

toast.success = (message: React.ReactNode, opts?: ToastOptions) =>
  createToast(message, 'success', opts)

toast.error = (message: React.ReactNode, opts?: ToastOptions) =>
  createToast(message, 'error', opts)

toast.warning = (message: React.ReactNode, opts?: ToastOptions) =>
  createToast(message, 'warning', opts)

toast.info = (message: React.ReactNode, opts?: ToastOptions) =>
  createToast(message, 'info', opts)

toast.loading = (message: React.ReactNode, opts?: ToastOptions) =>
  createToast(message, 'loading', { ...opts, duration: 0 })

toast.promise = <T,>(
  promise: Promise<T>,
  opts: PromiseOptions<T>,
  toastOpts?: ToastOptions
): Promise<T> => {
  const id = createToast(opts.loading, 'loading', {
    ...toastOpts,
    duration: 0,
  })

  promise
    .then((data) => {
      const msg = typeof opts.success === 'function' ? opts.success(data) : opts.success
      const desc = typeof opts.description?.success === 'function'
        ? opts.description.success(data)
        : opts.description?.success
      globalStore.updateToast(id, {
        type: 'success',
        message: msg,
        description: desc,
        duration: toastOpts?.duration,
        _promiseState: 'success',
      })
    })
    .catch((err) => {
      const msg = typeof opts.error === 'function' ? opts.error(err) : opts.error
      const desc = typeof opts.description?.error === 'function'
        ? opts.description.error(err)
        : opts.description?.error
      globalStore.updateToast(id, {
        type: 'error',
        message: msg,
        description: desc,
        duration: toastOpts?.duration,
        _promiseState: 'error',
      })
    })
    .finally(() => {
      opts.finally?.()
    })

  return promise
}

toast.dismiss = (id?: string) => {
  if (id) {
    globalStore.removeToast(id)
  } else {
    globalStore.removeAll()
  }
}

toast.custom = (render: (t: ToastData) => React.ReactNode, opts?: ToastOptions): string => {
  const id = opts?.id ?? genId()
  globalStore.addToast({
    id,
    type: 'default',
    message: render as unknown as React.ReactNode,
    duration: opts?.duration,
    dismissible: opts?.dismissible,
    className: opts?.className,
    onDismiss: opts?.onDismiss,
    onAutoClose: opts?.onAutoClose,
    _promiseState: undefined,
  })
  return id
}

// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
// ToastItem \u2014 individual toast renderer
// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550

interface ToastItemProps {
  data: ToastData
  position: ToastPosition
  size: ToastSize
  closeButton: boolean
  richColors: boolean
  defaultDuration: number
  onRemove: (id: string) => void
}

const ToastItem = React.memo(function ToastItem({
  data,
  position,
  size,
  closeButton: globalCloseButton,
  richColors,
  defaultDuration,
  onRemove,
}: ToastItemProps) {
  const [isExiting, setIsExiting] = React.useState(false)
  const [isEntered, setIsEntered] = React.useState(false)
  const [isPaused, setIsPaused] = React.useState(false) // eslint-disable-line @typescript-eslint/no-unused-vars
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const remainingRef = React.useRef<number>(0)
  const startTimeRef = React.useRef<number>(0)

  // Enter animation \u2014 play once on mount, then remove class
  React.useEffect(() => {
    const timer = setTimeout(() => setIsEntered(true), TOAST_EXIT_DURATION)
    return () => clearTimeout(timer)
  }, [])

  const showClose = data.closeButton ?? globalCloseButton
  const dismissible = data.dismissible !== false
  const duration = data.type === 'loading' ? 0 : (data.duration ?? defaultDuration)

  // ARIA \u2014 error/warning use assertive, others polite
  const role = data.type === 'error' || data.type === 'warning' ? 'alert' : 'status'
  const ariaLive = data.type === 'error' || data.type === 'warning' ? 'assertive' : 'polite'

  const colors = richColors ? richColorMap[data.type] : colorMap[data.type]
  const StatusIcon = STATUS_ICONS[data.type]

  // Animation classes based on position
  const enterAnim = position.includes('right')
    ? 'animate-toast-slide-in-right'
    : position.includes('left')
      ? 'animate-toast-slide-in-left'
      : position.includes('top')
        ? 'animate-toast-slide-in-top'
        : 'animate-toast-slide-in-bottom'

  const exitAnim = position.includes('right')
    ? 'animate-toast-slide-out-right'
    : position.includes('left')
      ? 'animate-toast-slide-out-left'
      : position.includes('top')
        ? 'animate-toast-slide-out-top'
        : 'animate-toast-slide-out-bottom'

  const handleDismiss = React.useCallback(() => {
    if (!dismissible) return
    setIsExiting(true)
    data.onDismiss?.(data)
    // Wait for exit animation then remove
    setTimeout(() => onRemove(data.id), TOAST_EXIT_DURATION)
  }, [data, dismissible, onRemove])

  const handleAutoClose = React.useCallback(() => {
    setIsExiting(true)
    data.onAutoClose?.(data)
    setTimeout(() => onRemove(data.id), TOAST_EXIT_DURATION)
  }, [data, onRemove])

  // Auto-dismiss timer with pause support
  React.useEffect(() => {
    if (duration <= 0) return

    remainingRef.current = duration
    startTimeRef.current = Date.now()

    timerRef.current = setTimeout(handleAutoClose, duration)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [duration, handleAutoClose])

  // Pause/resume on hover
  const handleMouseEnter = React.useCallback(() => {
    if (duration <= 0) return
    setIsPaused(true)
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      remainingRef.current -= Date.now() - startTimeRef.current
    }
  }, [duration])

  const handleMouseLeave = React.useCallback(() => {
    if (duration <= 0) return
    setIsPaused(false)
    startTimeRef.current = Date.now()
    timerRef.current = setTimeout(handleAutoClose, Math.max(remainingRef.current, TOAST_MIN_RESUME_MS))
  }, [duration, handleAutoClose])

  // Reset timer when toast updates (promise resolve)
  React.useEffect(() => {
    if (data._promiseState === 'success' || data._promiseState === 'error') {
      const newDuration = data.duration ?? defaultDuration
      if (newDuration > 0) {
        if (timerRef.current) clearTimeout(timerRef.current)
        remainingRef.current = newDuration
        startTimeRef.current = Date.now()
        timerRef.current = setTimeout(handleAutoClose, newDuration)
      }
    }
  }, [data._promiseState, data.duration, defaultDuration, handleAutoClose])

  return (
    <div
      role={role}
      aria-live={ariaLive}
      aria-atomic="true"
      className={cn(
        toastVariants({ size }),
        colors,
        isExiting ? exitAnim : !isEntered ? enterAnim : undefined,
        isExiting && 'pointer-events-none',
        data.className,
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Icon */}
      {data.icon !== undefined ? (
        data.icon && <span className="shrink-0">{data.icon}</span>
      ) : (
        data.type !== 'default' && (
          <span className="shrink-0">
            <StatusIcon className="icon-sm" />
          </span>
        )
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="font-semibold">{data.message}</div>
        {data.description && (
          <div className={cn('mt-1 opacity-80', size === 'sm' ? 'text-xs' : 'text-sm')}>
            {data.description}
          </div>
        )}
      </div>

      {/* Actions */}
      {(data.action || data.cancel) && (
        <div className="flex items-center gap-1.5 shrink-0">
          {data.cancel && (
            <button
              type="button"
              className="px-2.5 py-1.5 text-xs font-semibold rounded-md opacity-70 hover:opacity-100 transition-opacity"
              onClick={() => {
                data.cancel!.onClick()
                handleDismiss()
              }}
            >
              {data.cancel.label}
            </button>
          )}
          {data.action && (
            <button
              type="button"
              className="px-2.5 py-1.5 text-xs font-semibold rounded-md bg-foreground/5 hover:bg-foreground/15 transition-colors"
              onClick={() => {
                data.action!.onClick()
                handleDismiss()
              }}
            >
              {data.action.label}
            </button>
          )}
        </div>
      )}

      {/* Close button */}
      {showClose && dismissible && (
        <button
          type="button"
          className="shrink-0 rounded-md p-1 opacity-70 hover:opacity-100 transition-opacity focus-visible:focus-ring"
          onClick={handleDismiss}
          aria-label="Close"
        >
          <DefaultCloseIcon className="icon-sm" />
        </button>
      )}

    </div>
  )
})

// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
// Toaster \u2014 renders all toasts
// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550

export interface ToasterProps {
  /** Position on screen */
  position?: ToastPosition
  /** Default auto-dismiss duration in ms (0 = persistent) */
  duration?: number
  /** Max visible toasts */
  visibleToasts?: number
  /** Show close button on all toasts */
  closeButton?: boolean
  /** Use rich (filled) colors for status toasts \u2014 default: true */
  richColors?: boolean
  /** Expand all toasts (no stacking) */
  expand?: boolean
  /** Offset from screen edge in px */
  offset?: number
  /** Gap between toasts in px */
  gap?: number
  /** Toast size */
  size?: ToastSize
  /** Additional className for container */
  className?: string
}

function Toaster({
  position = 'bottom-right',
  duration = 4000,
  visibleToasts = 5,
  closeButton = false,
  richColors = true,
  expand = false,
  offset = 24,
  gap = 8,
  size = 'default',
  className,
}: ToasterProps) {
  const toasts = useToastStore()
  const [expanded, setExpanded] = React.useState(false)

  const handleRemove = React.useCallback((id: string) => {
    globalStore.removeToast(id)
  }, [])

  const visible = toasts.slice(0, visibleToasts)

  const isTop = position.startsWith('top')
  const isCenter = position.includes('center')
  const isRight = position.includes('right')

  // Position styles
  const positionClasses = cn(
    'fixed z-toast flex flex-col pointer-events-none',
    isTop ? 'top-0' : 'bottom-0',
    isCenter ? 'left-1/2 -translate-x-1/2' : isRight ? 'right-0' : 'left-0',
  )

  return (
    <section
      aria-label="Notifications"
      className={cn(positionClasses, className)}
      style={{
        padding: offset,
        gap,
        width: isCenter ? 'auto' : undefined,
        maxWidth: isCenter ? \`calc(100vw - \${TOAST_VIEWPORT_MARGIN}px)\` : undefined,
      }}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      {visible.map((t, index) => {
        const isStacked = !expand && !expanded && index > 0
        return (
          <div
            key={t.id}
            className="transition-[transform,opacity] duration-normal ease-out"
            style={{
              width: TOAST_WIDTH,
              maxWidth: \`calc(100vw - \${TOAST_VIEWPORT_MARGIN}px)\`,
              ...(isStacked
                ? {
                    position: 'absolute' as const,
                    ...(isTop ? { top: offset + index * TOAST_STACK_OFFSET } : { bottom: offset + index * TOAST_STACK_OFFSET }),
                    ...(isCenter
                      ? { left: '50%', transform: \`translateX(-50%) scale(\${1 - index * TOAST_STACK_SCALE_STEP})\` }
                      : isRight
                        ? { right: offset, transform: \`scale(\${1 - index * TOAST_STACK_SCALE_STEP})\` }
                        : { left: offset, transform: \`scale(\${1 - index * TOAST_STACK_SCALE_STEP})\` }),
                    opacity: index < TOAST_STACK_VISIBLE_LAYERS ? 1 - index * TOAST_STACK_OPACITY_STEP : 0,
                    zIndex: visibleToasts - index,
                    pointerEvents: 'none' as const,
                  }
                : { zIndex: visibleToasts - index }),
            }}
          >
            <ToastItem
              data={t}
              position={position}
              size={size}
              closeButton={closeButton}
              richColors={richColors}
              defaultDuration={duration}
              onRemove={handleRemove}
            />
          </div>
        )
      })}
    </section>
  )
}
Toaster.displayName = 'Toaster'

// \u2500\u2500\u2500 Exports \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
export {
  toast,
  Toaster,
  toastVariants,
}

export type {
  ToastOptions,
  PromiseOptions,
}
`,
      type: "ui"
    }]
  },
  "toggle-group": {
    name: "toggle-group",
    dependencies: ["@radix-ui/react-toggle-group"],
    registryDependencies: [],
    reverseDependencies: [],
    namespace: true,
    description: "",
    files: [{
      path: "toggle-group.tsx",
      content: `'use client'

import * as React from 'react'
import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const toggleGroupVariants = cva(
  'inline-flex items-center justify-center',
  {
    variants: {
      orientation: {
        horizontal: 'flex-row',
        vertical: 'flex-col',
      },
    },
    defaultVariants: {
      orientation: 'horizontal',
    },
  }
)

const toggleGroupItemVariants = cva(
  'inline-flex items-center justify-center text-sm text-text-muted transition-all duration-micro focus-visible:focus-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-transparent hover:bg-background-muted hover:text-foreground data-[state=on]:bg-background-muted data-[state=on]:text-foreground',
        outline: 'border border-border bg-transparent hover:bg-background-muted hover:text-foreground data-[state=on]:bg-background-muted data-[state=on]:text-foreground',
      },
      fontWeight: {
        normal: 'font-normal',
        semibold: 'font-semibold',
      },
      size: {
        xs: 'h-7 px-2.5 text-xs gap-1',      // 28px height, 10px paddingX, 12px font
        sm: 'h-8 px-3 text-sm gap-2',        // 32px height, 12px paddingX, 13px font
        md: 'h-9 px-3.5 text-md gap-2',      // 36px height, 14px paddingX, 14px font
        default: 'h-10 px-4 text-md gap-2',  // 40px height, 16px paddingX, 14px font
        lg: 'h-12 px-6 text-base gap-2',     // 48px height, 24px paddingX, 16px font
      },
      radius: {
        none: 'rounded-none',
        sm: 'rounded-sm',
        base: 'rounded',
        default: 'rounded-md',
        lg: 'rounded-lg',
        xl: 'rounded-xl',
        '2xl': 'rounded-2xl',
        '3xl': 'rounded-3xl',
        full: 'rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      radius: 'default',
      fontWeight: 'normal',
    },
  }
)

const ToggleGroupContext = React.createContext<
  VariantProps<typeof toggleGroupItemVariants>
>({
  variant: 'default',
  size: 'default',
  radius: 'default',
  fontWeight: 'normal',
})

type ToggleGroupSingleProps = {
  type: 'single'
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
}

type ToggleGroupMultipleProps = {
  type: 'multiple'
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
}

type ToggleGroupBaseProps = Omit<
  React.ComponentPropsWithoutRef<'div'>,
  'defaultValue' | 'dir'
> & {
  disabled?: boolean
  rovingFocus?: boolean
  orientation?: 'horizontal' | 'vertical'
  dir?: 'ltr' | 'rtl'
  loop?: boolean
  children?: React.ReactNode
}

export type ToggleGroupProps = ToggleGroupBaseProps &
  VariantProps<typeof toggleGroupVariants> &
  VariantProps<typeof toggleGroupItemVariants> &
  (ToggleGroupSingleProps | ToggleGroupMultipleProps)

const ToggleGroupRoot = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Root>,
  ToggleGroupProps
>(({ className, orientation, variant, size, radius, fontWeight, children, ...props }, ref) => (
  <ToggleGroupPrimitive.Root
    ref={ref}
    className={cn(
      toggleGroupVariants({ orientation }),
      // Attached style for horizontal
      orientation !== 'vertical' && [
        '[&>*:not(:first-child)]:rounded-l-none',
        '[&>*:not(:last-child)]:rounded-r-none',
        '[&>*:not(:first-child)]:-ml-px',
        '[&>*]:relative',
        '[&>*:hover]:z-10',
        '[&>*:focus-visible]:z-10',
        '[&>*:active]:scale-none',
      ],
      // Attached style for vertical
      orientation === 'vertical' && [
        '[&>*:not(:first-child)]:rounded-t-none',
        '[&>*:not(:last-child)]:rounded-b-none',
        '[&>*:not(:first-child)]:-mt-px',
        '[&>*]:relative',
        '[&>*]:w-full',
        '[&>*:hover]:z-10',
        '[&>*:focus-visible]:z-10',
        '[&>*:active]:scale-none',
      ],
      className
    )}
    orientation={orientation}
    {...(props as React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root>)}
  >
    <ToggleGroupContext.Provider value={{ variant, size, radius, fontWeight }}>
      {children}
    </ToggleGroupContext.Provider>
  </ToggleGroupPrimitive.Root>
))
ToggleGroupRoot.displayName = ToggleGroupPrimitive.Root.displayName

export interface ToggleGroupItemProps
  extends React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item>,
    Omit<VariantProps<typeof toggleGroupItemVariants>, 'fontWeight'> {
  fontWeight?: 'normal' | 'semibold'
}

// Icon size for toggle group (5-step scale, Icon+Text mode)
// xs~sm: 14px, md~default~lg: 16px
const iconSizeClasses = {
  xs: '[&>svg]:icon-xs',      // 14px
  sm: '[&>svg]:icon-xs',      // 14px
  md: '[&>svg]:icon-sm',      // 16px
  default: '[&>svg]:icon-sm', // 16px
  lg: '[&>svg]:icon-sm',      // 16px
}

const ToggleGroupItem = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Item>,
  ToggleGroupItemProps
>(({ className, variant, size, radius, fontWeight, children, ...props }, ref) => {
  const context = React.useContext(ToggleGroupContext)
  const resolvedSize = size || context.size || 'default'

  return (
    <ToggleGroupPrimitive.Item
      ref={ref}
      className={cn(
        toggleGroupItemVariants({
          variant: variant || context.variant,
          size: resolvedSize,
          radius: radius || context.radius,
          fontWeight: fontWeight || context.fontWeight,
        }),
        iconSizeClasses[resolvedSize],
        className
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  )
})
ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName

// \u2500\u2500\u2500 Namespace \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const ToggleGroup = Object.assign(ToggleGroupRoot, {
  Item: ToggleGroupItem,
})

// eslint-disable-next-line @typescript-eslint/no-namespace
namespace ToggleGroup {
  export type ItemProps = ToggleGroupItemProps
}

export { ToggleGroup, ToggleGroupItem, toggleGroupVariants, toggleGroupItemVariants }
`,
      type: "ui"
    }]
  },
  "toggle": {
    name: "toggle",
    dependencies: ["@radix-ui/react-toggle"],
    registryDependencies: [],
    reverseDependencies: [],
    namespace: false,
    description: "",
    files: [{
      path: "toggle.tsx",
      content: `'use client'

import * as React from 'react'
import * as TogglePrimitive from '@radix-ui/react-toggle'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// Base styles without size (for iconOnly mode)
const toggleBaseStyles = 'inline-flex items-center justify-center text-text-muted transition-all duration-micro focus-visible:focus-ring disabled:pointer-events-none disabled:opacity-50'

const toggleVariants = cva(
  toggleBaseStyles,
  {
    variants: {
      variant: {
        default: 'bg-transparent hover:bg-background-muted hover:text-foreground data-[state=on]:bg-background-muted data-[state=on]:text-foreground',
        outline: 'border border-border bg-transparent hover:bg-background-muted hover:text-foreground data-[state=on]:bg-background-muted data-[state=on]:text-foreground',
        ghost: 'bg-transparent hover:text-foreground data-[state=on]:bg-transparent data-[state=on]:text-foreground',
        'outline-ghost': 'border border-border bg-transparent hover:text-foreground data-[state=on]:bg-transparent data-[state=on]:text-foreground data-[state=on]:border-border',
      },
      fontWeight: {
        normal: 'font-normal',
        semibold: 'font-semibold',
      },
      size: {
        xs: 'h-7 px-2.5 text-xs gap-1',     // 28px height, 10px paddingX, 12px font
        sm: 'h-8 px-3 text-sm gap-2',       // 32px height, 12px paddingX, 13px font
        md: 'h-9 px-3.5 text-md gap-2',     // 36px height, 14px paddingX, 14px font
        default: 'h-10 px-4 text-md gap-2', // 40px height, 16px paddingX, 14px font
        lg: 'h-12 px-6 text-base gap-2',    // 48px height, 24px paddingX, 16px font
      },
      radius: {
        none: 'rounded-none',      // 0px - primitive.borderRadius.none
        sm: 'rounded-sm',          // 2px - primitive.borderRadius.sm
        base: 'rounded',           // 4px - primitive.borderRadius.base
        default: 'rounded-md',     // 6px - primitive.borderRadius.md
        lg: 'rounded-lg',          // 8px - primitive.borderRadius.lg
        xl: 'rounded-xl',          // 12px - primitive.borderRadius.xl
        '2xl': 'rounded-2xl',      // 16px - primitive.borderRadius.2xl
        '3xl': 'rounded-3xl',      // 24px - primitive.borderRadius.3xl
        full: 'rounded-full',      // 9999px - primitive.borderRadius.full
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      radius: 'default',  // 6px - primitive.borderRadius.md (Figma button default)
      fontWeight: 'normal',
    },
  }
)

// iconOnly sizes - square like IconButton (same width and height, no padding)
const iconOnlySizes = {
  xs: 'h-7 w-7',      // 28px \xD7 28px - spacing.7
  sm: 'h-8 w-8',      // 32px \xD7 32px - spacing.8
  md: 'h-9 w-9',      // 36px \xD7 36px - spacing.9
  default: 'h-10 w-10', // 40px \xD7 40px - spacing.10
  lg: 'h-12 w-12',    // 48px \xD7 48px - spacing.12
}

// Radius classes for iconOnly mode
const radiusClasses = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  base: 'rounded',
  default: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  '3xl': 'rounded-3xl',
  full: 'rounded-full',
}

// Variant classes for iconOnly mode
const variantClasses = {
  default: 'bg-transparent hover:bg-background-muted hover:text-foreground data-[state=on]:bg-background-muted data-[state=on]:text-foreground',
  outline: 'border border-border bg-transparent hover:bg-background-muted hover:text-foreground data-[state=on]:bg-background-muted data-[state=on]:text-foreground',
  ghost: 'bg-transparent hover:text-foreground data-[state=on]:bg-transparent data-[state=on]:text-foreground',
  'outline-ghost': 'border border-border bg-transparent hover:text-foreground data-[state=on]:bg-transparent data-[state=on]:text-foreground data-[state=on]:border-border',
}

export interface ToggleProps
  extends React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root>,
    Omit<VariantProps<typeof toggleVariants>, 'fontWeight'> {
  iconOnly?: boolean
  fontWeight?: 'normal' | 'semibold'
  pressEffect?: boolean
}

// Icon size for text+icon mode (5-step scale)
// xs~sm: 14px, md~default~lg: 16px
const iconSizeClasses = {
  xs: '[&>svg]:icon-xs',      // 14px
  sm: '[&>svg]:icon-xs',      // 14px
  md: '[&>svg]:icon-sm',      // 16px
  default: '[&>svg]:icon-sm', // 16px
  lg: '[&>svg]:icon-sm',      // 16px
}

const Toggle = React.forwardRef<
  React.ElementRef<typeof TogglePrimitive.Root>,
  ToggleProps
>(({ className, variant, size, radius, fontWeight, iconOnly, pressEffect, ...props }, ref) => {
  const sizeKey = size || 'default'
  const radiusKey = radius || 'default'
  const variantKey = variant || 'default'
  const fontWeightClass = fontWeight === 'normal' ? 'font-normal' : fontWeight === 'semibold' ? 'font-semibold' : 'font-normal'

  // When iconOnly, build classes manually without padding
  if (iconOnly) {
    // Icon only uses larger icon sizes (like IconButton, 5-step scale)
    // XS: 14px, SM~MD: 16px, Default: 20px, LG: 24px
    const iconOnlyIconSize = {
      xs: '[&>svg]:icon-xs',      // 14px
      sm: '[&>svg]:icon-sm',      // 16px
      md: '[&>svg]:icon-sm',      // 16px
      default: '[&>svg]:icon-md', // 20px
      lg: '[&>svg]:icon-lg',      // 24px
    }[sizeKey]

    return (
      <TogglePrimitive.Root
        ref={ref}
        className={cn(
          toggleBaseStyles,
          pressEffect !== false && 'active:scale-pressed',
          fontWeightClass,
          variantClasses[variantKey],
          iconOnlySizes[sizeKey],
          radiusClasses[radiusKey],
          iconOnlyIconSize,
          className
        )}
        {...props}
      />
    )
  }

  // Normal mode with padding
  return (
    <TogglePrimitive.Root
      ref={ref}
      className={cn(
        toggleVariants({ variant, size, radius, fontWeight }),
        pressEffect !== false && 'active:scale-pressed',
        iconSizeClasses[sizeKey],
        className
      )}
      {...props}
    />
  )
})

Toggle.displayName = TogglePrimitive.Root.displayName

export { Toggle, toggleVariants }
`,
      type: "ui"
    }]
  },
  "tooltip": {
    name: "tooltip",
    dependencies: ["@radix-ui/react-tooltip"],
    registryDependencies: [],
    reverseDependencies: [],
    namespace: true,
    description: "",
    files: [{
      path: "tooltip.tsx",
      content: `'use client'

import * as React from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// \u2500\u2500\u2500 Types \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
export type TooltipSide = 'top' | 'right' | 'bottom' | 'left'

// \u2500\u2500\u2500 Animation class mapping (static strings for Tailwind scanner) \u2500\u2500
const ANIMATION_CLASSES: Record<TooltipSide, string> = {
  top:    'data-[state=delayed-open]:animate-tooltip-top-enter data-[state=instant-open]:animate-tooltip-top-enter data-[state=closed]:animate-tooltip-top-exit',
  bottom: 'data-[state=delayed-open]:animate-tooltip-bottom-enter data-[state=instant-open]:animate-tooltip-bottom-enter data-[state=closed]:animate-tooltip-bottom-exit',
  left:   'data-[state=delayed-open]:animate-tooltip-left-enter data-[state=instant-open]:animate-tooltip-left-enter data-[state=closed]:animate-tooltip-left-exit',
  right:  'data-[state=delayed-open]:animate-tooltip-right-enter data-[state=instant-open]:animate-tooltip-right-enter data-[state=closed]:animate-tooltip-right-exit',
}

// \u2500\u2500\u2500 Content variants \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const tooltipContentVariants = cva(
  'z-tooltip rounded-lg font-normal select-none max-w-72',
  {
    variants: {
      variant: {
        default: 'bg-foreground text-background shadow-lg',
        inverted: 'bg-background-paper/95 text-foreground border border-border-subtle shadow-lg backdrop-blur-sm',
      },
      size: {
        sm: 'text-xs px-2.5 py-1',
        default: 'text-sm px-3 py-1.5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

// \u2500\u2500\u2500 Arrow fill mapping (matches content variant background) \u2500\u2500
const ARROW_FILL: Record<string, string> = {
  default: 'fill-foreground drop-shadow-sm',
  inverted: 'fill-background-paper drop-shadow-sm',
}

// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
// Tooltip
// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550

// \u2500\u2500\u2500 TooltipProvider \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const TooltipProvider = TooltipPrimitive.Provider

// \u2500\u2500\u2500 Tooltip (Root) \u2014 wrapper to avoid Object.assign mutating Radix primitive \u2500\u2500
export interface TooltipRootProps extends React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Root> {
  /** Delay in ms before tooltip appears */
  delayDuration?: number
}

function TooltipRoot({ delayDuration = 200, ...props }: TooltipRootProps) {
  return <TooltipPrimitive.Root delayDuration={delayDuration} {...props} />
}

// \u2500\u2500\u2500 TooltipTrigger \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const TooltipTrigger = TooltipPrimitive.Trigger

// \u2500\u2500\u2500 TooltipPortal \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const TooltipPortal = TooltipPrimitive.Portal

// \u2500\u2500\u2500 TooltipContent \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
export interface TooltipContentProps
  extends React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>,
    VariantProps<typeof tooltipContentVariants> {
  /** Show arrow pointing to trigger */
  showArrow?: boolean
}

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  TooltipContentProps
>(({ className, variant = 'default', size, side = 'top', sideOffset = 6, showArrow = true, children, ...props }, ref) => {
  const resolvedSide = side as TooltipSide

  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        ref={ref}
        side={side}
        sideOffset={sideOffset}
        className={cn(
          tooltipContentVariants({ variant, size }),
          ANIMATION_CLASSES[resolvedSide],
          className,
        )}
        {...props}
      >
        {children}
        {showArrow && (
          <TooltipPrimitive.Arrow
            className={ARROW_FILL[variant || 'default']}
            width={10}
            height={5}
          />
        )}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
})
TooltipContent.displayName = 'TooltipContent'

// \u2500\u2500\u2500 TooltipArrow (standalone, for manual placement outside Content) \u2500\u2500
const TooltipArrow = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Arrow>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Arrow>
>(({ className, ...props }, ref) => (
  <TooltipPrimitive.Arrow
    ref={ref}
    className={cn('fill-foreground', className)}
    width={8}
    height={4}
    {...props}
  />
))
TooltipArrow.displayName = 'TooltipArrow'

// \u2500\u2500\u2500 Namespace: Tooltip \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const Tooltip = Object.assign(TooltipRoot, {
  Trigger: TooltipTrigger,
  Content: TooltipContent,
  Arrow: TooltipArrow,
  Portal: TooltipPortal,
  Provider: TooltipProvider,
})

// eslint-disable-next-line @typescript-eslint/no-namespace
namespace Tooltip {
  export type ContentProps = TooltipContentProps
  export type RootProps = TooltipRootProps
}

// \u2500\u2500\u2500 Exports \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
export {
  Tooltip,
  TooltipRoot,
  TooltipTrigger,
  TooltipContent,
  TooltipArrow,
  TooltipPortal,
  TooltipProvider,
  tooltipContentVariants,
}
`,
      type: "ui"
    }]
  }
};
var COMPONENT_ALIASES = {
  // Chart aliases
  "bar-chart": "chart",
  "line-chart": "chart",
  "area-chart": "chart",
  "pie-chart": "chart",
  // Convenience aliases
  "radio": "radio-group",
  "nav": "navigation-menu",
  "dropdown-menu": "dropdown"
};
var INSTALLABLE_COMPONENTS = [
  "accordion",
  "alert",
  "avatar",
  "badge",
  "breadcrumb",
  "button-group",
  "button",
  "card",
  "chart",
  "checkbox",
  "divider",
  "drawer",
  "dropdown",
  "icon-button",
  "input",
  "metric-card",
  "modal",
  "navigation-menu",
  "pagination",
  "popover",
  "progress",
  "radio-group",
  "segmented",
  "select",
  "skeleton",
  "slider",
  "spinner",
  "switch",
  "table",
  "tabs",
  "textarea",
  "toast",
  "toggle-group",
  "toggle",
  "tooltip"
];

// cli/src/commands/add.ts
async function add(args) {
  const cwd = process.cwd();
  const projectRoot = findProjectRoot(cwd);
  if (!projectRoot) {
    logger.error("No package.json found.");
    process.exit(1);
  }
  const config = readConfig(projectRoot);
  if (!config) {
    logger.error("No 7onic.json found. Run " + import_picocolors3.default.cyan("npx 7onic init") + " first.");
    process.exit(1);
  }
  const flagAll = args.includes("--all");
  const flagOverwrite = args.includes("--overwrite");
  const flagYes = args.includes("--yes") || args.includes("-y");
  const componentArgs = args.filter((a) => !a.startsWith("-"));
  if (!flagAll && componentArgs.length === 0) {
    logger.error("No components specified. Usage: " + import_picocolors3.default.cyan("npx 7onic add <component...>"));
    logger.info("Available: " + INSTALLABLE_COMPONENTS.join(", "));
    process.exit(1);
  }
  let requestedNames;
  if (flagAll) {
    requestedNames = [...INSTALLABLE_COMPONENTS];
  } else {
    requestedNames = [];
    for (const arg of componentArgs) {
      const resolved = COMPONENT_ALIASES[arg] || arg;
      if (!registry[resolved]) {
        const suggestion = findSimilar(resolved, [...INSTALLABLE_COMPONENTS]);
        logger.error(
          `Unknown component: ${arg}` + (suggestion ? `. Did you mean ${import_picocolors3.default.cyan(suggestion)}?` : "")
        );
        process.exit(1);
      }
      if (!INSTALLABLE_COMPONENTS.includes(resolved)) {
        logger.error(`${arg} is an internal component and cannot be added directly.`);
        process.exit(1);
      }
      if (!requestedNames.includes(resolved)) {
        requestedNames.push(resolved);
      }
    }
  }
  let allComponents = resolveDependencies(requestedNames);
  if (flagAll && !flagYes) {
    const hasRecharts = allComponents.some((n) => registry[n].dependencies.includes("recharts"));
    if (hasRecharts) {
      const proceed = await ot2({
        message: "Chart components require recharts (~200KB). Include them?"
      });
      if (q(proceed) || !proceed) {
        allComponents = allComponents.filter((n) => n !== "chart");
      }
    }
  }
  const componentsDir = resolveAliasToDir(projectRoot, config.aliases.components);
  const toAdd = [];
  for (const name of allComponents) {
    const item = registry[name];
    for (const file of item.files) {
      const filePath = import_node_path5.default.join(componentsDir, file.path);
      toAdd.push({ name, fileName: file.path, content: file.content, filePath, exists: import_node_fs5.default.existsSync(filePath) });
    }
  }
  const newFiles = toAdd.filter((f) => !f.exists || flagOverwrite);
  const skippedFiles = toAdd.filter((f) => f.exists && !flagOverwrite);
  if (newFiles.length === 0) {
    logger.info("All components already exist. Use --overwrite to replace.");
    process.exit(0);
  }
  const allNpmDeps = /* @__PURE__ */ new Set();
  for (const name of allComponents) {
    for (const dep of registry[name].dependencies) {
      allNpmDeps.add(dep);
    }
  }
  const pkgJsonPath = import_node_path5.default.join(projectRoot, "package.json");
  const pkgJson = JSON.parse(import_node_fs5.default.readFileSync(pkgJsonPath, "utf-8"));
  const installedDeps = { ...pkgJson.dependencies, ...pkgJson.devDependencies };
  const depsToInstall = [...allNpmDeps].filter((d3) => !installedDeps[d3]);
  if (!flagYes) {
    const uniqueNew = [...new Set(newFiles.map((f) => f.name))];
    const summary = [
      import_picocolors3.default.bold("Components to add:"),
      ...uniqueNew.map((n) => `  ${import_picocolors3.default.green("+")} ${n}.tsx`)
    ];
    if (skippedFiles.length > 0) {
      const uniqueSkipped = [...new Set(skippedFiles.map((f) => f.name))];
      summary.push(
        "",
        import_picocolors3.default.dim("Skipped (already exist):"),
        ...uniqueSkipped.map((n) => `  ${import_picocolors3.default.dim("-")} ${n}.tsx`)
      );
    }
    if (depsToInstall.length > 0) {
      summary.push("", import_picocolors3.default.bold("Dependencies to install:"), `  ${depsToInstall.join(", ")}`);
    }
    wt(summary.join("\n"), "Summary");
    const confirmed = await ot2({
      message: "Proceed?"
    });
    if (q(confirmed) || !confirmed) {
      pt("Cancelled.");
      process.exit(0);
    }
  }
  if (!import_node_fs5.default.existsSync(componentsDir)) {
    import_node_fs5.default.mkdirSync(componentsDir, { recursive: true });
  }
  let addedCount = 0;
  for (const entry of toAdd) {
    if (entry.exists && !flagOverwrite) continue;
    const content = rewriteImports(entry.content, config.aliases.utils);
    import_node_fs5.default.writeFileSync(entry.filePath, content, "utf-8");
    addedCount++;
    logger.success(`${entry.exists ? "Overwrote" : "Added"} ${entry.fileName}`);
  }
  if (depsToInstall.length > 0) {
    const pm = detectPackageManager(projectRoot);
    const s = fe();
    s.start(`Installing ${depsToInstall.length} dependencies (${pm})...`);
    try {
      installDeps(depsToInstall, { cwd: projectRoot, pm });
      s.stop("Dependencies installed");
    } catch (err) {
      s.stop("Failed to install dependencies");
      logger.error(String(err));
    }
  }
  const addedNames = [...new Set(newFiles.map((f) => f.name))];
  showSetupHints(addedNames);
  if (skippedFiles.length > 0) {
    logger.info(`${skippedFiles.length} file(s) skipped (already exist)`);
  }
  logger.break();
  logger.success(`Done! ${addedCount} component(s) added.`);
}
function resolveDependencies(names) {
  const resolved = /* @__PURE__ */ new Set();
  const visited = /* @__PURE__ */ new Set();
  function visit(name) {
    if (visited.has(name)) return;
    visited.add(name);
    const item = registry[name];
    if (!item) return;
    for (const dep of item.registryDependencies) {
      visit(dep);
    }
    for (const dep of item.reverseDependencies) {
      visit(dep);
    }
    resolved.add(name);
  }
  for (const name of names) {
    visit(name);
  }
  return [...resolved];
}
function resolveAliasToDir(projectRoot, alias) {
  if (!alias.startsWith("@/")) {
    return import_node_path5.default.join(projectRoot, alias);
  }
  const relative = alias.slice(2);
  for (const srcDir of ["src", "app", "."]) {
    const candidate = import_node_path5.default.join(projectRoot, srcDir, relative);
    if (import_node_fs5.default.existsSync(candidate)) return candidate;
  }
  return import_node_path5.default.join(projectRoot, "src", relative);
}
function findSimilar(input, candidates) {
  let best = null;
  let bestScore = 0;
  for (const name of candidates) {
    const score = similarity(input.toLowerCase(), name.toLowerCase());
    if (score > bestScore && score > 0.4) {
      bestScore = score;
      best = name;
    }
  }
  return best;
}
function similarity(a, b) {
  if (a === b) return 1;
  if (a.length < 2 || b.length < 2) return 0;
  const bigrams = /* @__PURE__ */ new Set();
  for (let i = 0; i < a.length - 1; i++) bigrams.add(a.slice(i, i + 2));
  let matches = 0;
  for (let i = 0; i < b.length - 1; i++) {
    if (bigrams.has(b.slice(i, i + 2))) matches++;
  }
  return 2 * matches / (a.length - 1 + b.length - 1);
}
function showSetupHints(names) {
  if (names.includes("toast")) {
    wt(
      `Add ${import_picocolors3.default.cyan("<Toaster />")} to your root layout:

` + import_picocolors3.default.dim(`  import { Toaster } from '${import_picocolors3.default.reset("@/components/ui/toast")}'

`) + import_picocolors3.default.dim(`  export default function Layout({ children }) {
`) + import_picocolors3.default.dim(`    return (
`) + import_picocolors3.default.dim(`      <>
`) + import_picocolors3.default.dim(`        {children}
`) + import_picocolors3.default.green(`        <Toaster />
`) + import_picocolors3.default.dim(`      </>
`) + import_picocolors3.default.dim(`    )
`) + import_picocolors3.default.dim(`  }`),
      "Toast Setup"
    );
  }
  if (names.includes("tooltip")) {
    wt(
      `Wrap your app with ${import_picocolors3.default.cyan("<Tooltip.Provider>")}:

` + import_picocolors3.default.dim(`  import { Tooltip } from '${import_picocolors3.default.reset("@/components/ui/tooltip")}'

`) + import_picocolors3.default.dim(`  export default function Layout({ children }) {
`) + import_picocolors3.default.dim(`    return (
`) + import_picocolors3.default.green(`      <Tooltip.Provider>
`) + import_picocolors3.default.dim(`        {children}
`) + import_picocolors3.default.green(`      </Tooltip.Provider>
`) + import_picocolors3.default.dim(`    )
`) + import_picocolors3.default.dim(`  }`),
      "Tooltip Setup"
    );
  }
}

// cli/src/index.ts
var import_picocolors4 = __toESM(require_picocolors());
var VERSION = "0.1.2";
var HELP = `
${import_picocolors4.default.bold("7onic")} \u2014 Add 7onic design system components to your project

${import_picocolors4.default.bold("Usage:")}
  npx 7onic <command> [options]

${import_picocolors4.default.bold("Commands:")}
  init                  Initialize 7onic in your project
  add <component...>    Add components to your project

${import_picocolors4.default.bold("Init options:")}
  --tailwind v3|v4      Set Tailwind version (default: auto-detect)
  --yes, -y             Skip prompts, use defaults

${import_picocolors4.default.bold("Add options:")}
  --all                 Add all components
  --overwrite           Overwrite existing files
  --yes, -y             Skip prompts

${import_picocolors4.default.bold("Global options:")}
  --version, -v         Show version
  --help, -h            Show this help message

${import_picocolors4.default.bold("Examples:")}
  npx 7onic init
  npx 7onic init --tailwind v3 --yes
  npx 7onic add button card input
  npx 7onic add --all
`;
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  if (!command || command === "help" || command === "--help" || command === "-h") {
    console.log(HELP);
    return;
  }
  if (command === "--version" || command === "-v") {
    console.log(VERSION);
    return;
  }
  switch (command) {
    case "init":
      await init(args.slice(1));
      break;
    case "add":
      await add(args.slice(1));
      break;
    default:
      logger.error(`Unknown command: ${command}`);
      console.log(HELP);
      process.exit(1);
  }
}
main().catch((err) => {
  logger.error(err.message || String(err));
  process.exit(1);
});
