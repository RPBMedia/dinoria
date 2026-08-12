/**
 * Background remover for Dinoria art — turns a solid/near-uniform background
 * (typically white) into transparency so illustrations match the dark quiz card.
 *
 * Uses an EDGE FLOOD-FILL: only background-coloured pixels *connected to the
 * image border* are cleared, so white bellies/teeth/highlights inside the
 * animal are preserved (a plain threshold would punch holes in them).
 *
 * Background = "neutral + light" pixels (white paper AND soft grey drop-shadows
 * are desaturated and bright, while the animal is either coloured or has dark
 * outlines). Tunables: satMax (max chroma to count as neutral) and lightMin
 * (min brightness). Enclosed light areas that AREN'T border-connected (a white
 * belly, teeth) are preserved by the flood-fill.
 *
 * Usage: node scripts/bg-remove.mjs <input> <output.png> [satMax=28] [lightMin=175]
 */
import sharp from "sharp";

const [input, output, satArg, lightArg] = process.argv.slice(2);
if (!input || !output) {
  console.error(
    "usage: node scripts/bg-remove.mjs <input> <output.png> [satMax] [lightMin]",
  );
  process.exit(1);
}
const SAT_MAX = Number(satArg ?? 28);
const LIGHT_MIN = Number(lightArg ?? 175);

const { data, info } = await sharp(input)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
const { width, height, channels } = info; // channels === 4

const at = (x, y) => (y * width + x) * channels;
/** A neutral (low-chroma) and light pixel — white paper or a grey shadow. */
const isBgColor = (i) => {
  const r = data[i], g = data[i + 1], b = data[i + 2];
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  return mx - mn <= SAT_MAX && mn >= LIGHT_MIN;
};

const isBg = new Uint8Array(width * height);
const stack = [];
const seed = (x, y) => {
  const p = y * width + x;
  if (!isBg[p] && isBgColor(at(x, y))) {
    isBg[p] = 1;
    stack.push(p);
  }
};
for (let x = 0; x < width; x++) {
  seed(x, 0);
  seed(x, height - 1);
}
for (let y = 0; y < height; y++) {
  seed(0, y);
  seed(width - 1, y);
}
while (stack.length) {
  const p = stack.pop();
  const x = p % width;
  const y = (p / width) | 0;
  if (x > 0) seed(x - 1, y);
  if (x < width - 1) seed(x + 1, y);
  if (y > 0) seed(x, y - 1);
  if (y < height - 1) seed(x, y + 1);
}

// Optional extra pass: clear ANY remaining near-PURE-white pixel (min channel
// >= pureWhiteMin), regardless of connectivity. Catches enclosed white gaps
// (e.g. between a quadruped's legs) that the border flood-fill can't reach,
// while sparing cream/tan bellies (which sit below the high threshold).
const PURE_WHITE_MIN = Number(process.argv[5] ?? 0); // 0 = off; ~244 to enable
if (PURE_WHITE_MIN > 0) {
  for (let p = 0; p < width * height; p++) {
    const i = p * channels;
    if (Math.min(data[i], data[i + 1], data[i + 2]) >= PURE_WHITE_MIN) isBg[p] = 1;
  }
}

let removed = 0;
for (let p = 0; p < width * height; p++) {
  if (isBg[p]) {
    data[p * channels + 3] = 0;
    removed++;
  }
}

await sharp(data, { raw: { width, height, channels } }).png().toFile(output);
console.log(
  JSON.stringify({
    output,
    satMax: SAT_MAX,
    lightMin: LIGHT_MIN,
    removedPct: ((removed / (width * height)) * 100).toFixed(1),
  }),
);
