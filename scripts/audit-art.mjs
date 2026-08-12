/**
 * Art audit — scans public/dinos/* and flags images whose background is NOT
 * transparent (a JPEG, no alpha channel, or opaque border pixels), plus a
 * rough "portrait-ish" aspect flag to help spot head-only crops.
 *
 * Usage: node scripts/audit-art.mjs
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const dir = path.join(process.cwd(), "public", "dinos");
const files = fs.readdirSync(dir).filter((f) => /\.(png|jpe?g)$/i.test(f));

const nonTransparent = [];
const portraitish = [];

for (const f of files.sort()) {
  const id = f.replace(/\.(png|jpe?g)$/i, "");
  const p = path.join(dir, f);
  const ext = f.split(".").pop().toLowerCase();

  const { data, info } = await sharp(p)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  // sample border pixels' alpha
  let border = 0, transparent = 0;
  const step = Math.max(1, Math.floor(Math.min(width, height) / 60));
  const A = (x, y) => data[(y * width + x) * channels + 3];
  for (let x = 0; x < width; x += step) {
    for (const y of [0, height - 1]) { border++; if (A(x, y) < 32) transparent++; }
  }
  for (let y = 0; y < height; y += step) {
    for (const x of [0, width - 1]) { border++; if (A(x, y) < 32) transparent++; }
  }
  const transPct = Math.round((transparent / border) * 100);
  const isJpg = ext !== "png";
  if (isJpg || transPct < 60) {
    nonTransparent.push({ id, ext, transPct, size: `${width}x${height}` });
  }
  const aspect = +(width / height).toFixed(2);
  if (aspect < 1.35) portraitish.push({ id, aspect, size: `${width}x${height}` });
}

console.log(`\n=== NON-TRANSPARENT BACKGROUND (${nonTransparent.length}) ===`);
for (const x of nonTransparent) console.log(`  ${x.id}  [${x.ext}, border ${x.transPct}% transparent, ${x.size}]`);
console.log(`\n=== PORTRAIT-ISH aspect <1.35 (possible head-only) (${portraitish.length}) ===`);
for (const x of portraitish) console.log(`  ${x.id}  [aspect ${x.aspect}, ${x.size}]`);
console.log(`\ntotal images: ${files.length}`);
