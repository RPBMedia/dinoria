/**
 * Dinoria art sourcing helper — finds free-licensed dinosaur *life
 * reconstruction* art on Wikimedia Commons, ranks candidates, and (optionally)
 * downloads the chosen one into public/dinos.
 *
 * Usage:
 *   node scripts/source-art.mjs shortlist "Stegosaurus" "Triceratops"
 *   node scripts/source-art.mjs fetch <id> "<search term>"   # downloads best pick
 *
 * We only accept genuinely free licenses (CC BY / CC BY-SA / CC0 / Public
 * domain) and record attribution (artist + license) for the credit line.
 */
import fs from "node:fs";
import path from "node:path";

const UA = "DinoriaBot/1.0 (educational dinosaur quiz; contact rui.palma.baiao@gmail.com)";
const API = "https://commons.wikimedia.org/w/api.php";

const FREE_LICENSE = /^(cc[ -]?by([ -]sa)?([ -][0-9.]+)?|cc0|public domain|pd)/i;
const GOOD = /(restoration|reconstruction|life|paleoart|palaeoart|in life|artwork|illustration)/i;
const BAD = /(skeleton|skeletal|muscle|musculature|myolog|skull|bones?|fossil|mount|museum|size|scale|chart|diagram|map|footprint|track|teeth|tooth|claw|specimen|holotype|cast|silhouette|\bNT\b)/i;

function stripHtml(s = "") {
  return s.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

async function search(term) {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    generator: "search",
    gsrsearch: `${term} dinosaur`,
    gsrnamespace: "6", // File:
    gsrlimit: "25",
    prop: "imageinfo",
    iiprop: "url|extmetadata|mime|size|user",
    iiurlwidth: "900",
  });
  const res = await fetch(`${API}?${params}`, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`search ${term}: HTTP ${res.status}`);
  const data = await res.json();
  const pages = data?.query?.pages ?? {};
  return Object.values(pages).map((p) => {
    const ii = (p.imageinfo ?? [])[0] ?? {};
    const meta = ii.extmetadata ?? {};
    const license = stripHtml(meta.LicenseShortName?.value ?? "");
    const artist = stripHtml(meta.Artist?.value ?? "") || ii.user || "Unknown";
    return {
      title: p.title,
      mime: ii.mime,
      width: ii.width,
      height: ii.height,
      url: ii.url,
      thumb: ii.thumburl,
      descUrl: ii.descriptionurl,
      license,
      artist,
    };
  });
}

function score(c) {
  if (!c.mime || !/image\/(jpeg|png)/.test(c.mime)) return -1e9;
  if (!FREE_LICENSE.test(c.license)) return -1e9;
  let s = 0;
  const t = `${c.title}`;
  if (GOOD.test(t)) s += 5;
  if (BAD.test(t)) s -= 8;
  if ((c.width ?? 0) >= 800) s += 2;
  if ((c.width ?? 0) < 400) s -= 3;
  return s;
}

async function shortlist(terms) {
  for (const term of terms) {
    const cands = (await search(term))
      .map((c) => ({ ...c, s: score(c) }))
      .filter((c) => c.s > -1e8)
      .sort((a, b) => b.s - a.s)
      .slice(0, 5);
    console.log(`\n=== ${term} — ${cands.length} free candidates ===`);
    for (const c of cands) {
      console.log(
        `  [${c.s}] ${c.license} | ${c.width}x${c.height} | ${c.artist.slice(0, 40)}\n       ${c.title}\n       ${c.thumb}`,
      );
    }
  }
}

async function fetchBest(id, term) {
  const cands = (await search(term))
    .map((c) => ({ ...c, s: score(c) }))
    .filter((c) => c.s > -1e8)
    .sort((a, b) => b.s - a.s);
  if (!cands.length) throw new Error(`no free candidate for ${term}`);
  const best = cands[0];
  const ext = best.mime === "image/png" ? "png" : "jpg";
  const outDir = path.join(process.cwd(), "public", "dinos");
  fs.mkdirSync(outDir, { recursive: true });
  const out = path.join(outDir, `${id}.${ext}`);
  const img = await fetch(best.thumb ?? best.url, { headers: { "User-Agent": UA } });
  const buf = Buffer.from(await img.arrayBuffer());
  fs.writeFileSync(out, buf);
  console.log(
    JSON.stringify(
      {
        id,
        image: `/dinos/${id}.${ext}`,
        imageAttribution: `${best.artist}, Wikimedia Commons, ${best.license}`,
        bytes: buf.length,
        source: best.descUrl,
      },
      null,
      2,
    ),
  );
}

/** Download one explicit Commons File: into public/dinos/<id>, printing the
 * attribution line. Used after visually vetting a shortlist. */
async function fetchFile(id, title, destDir = "public/dinos") {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    titles: title,
    prop: "imageinfo",
    iiprop: "url|extmetadata|mime|size",
    iiurlwidth: "900",
  });
  const res = await fetch(`${API}?${params}`, { headers: { "User-Agent": UA } });
  const data = await res.json();
  const page = Object.values(data?.query?.pages ?? {})[0];
  const ii = (page?.imageinfo ?? [])[0];
  if (!ii) throw new Error(`no imageinfo for ${title}`);
  const meta = ii.extmetadata ?? {};
  const license = stripHtml(meta.LicenseShortName?.value ?? "");
  const artist = stripHtml(meta.Artist?.value ?? "") || "Unknown";
  const ext = ii.mime === "image/png" ? "png" : "jpg";
  const outDir = path.join(process.cwd(), destDir);
  fs.mkdirSync(outDir, { recursive: true });
  const out = path.join(outDir, `${id}.${ext}`);
  const img = await fetch(ii.thumburl ?? ii.url, { headers: { "User-Agent": UA } });
  fs.writeFileSync(out, Buffer.from(await img.arrayBuffer()));
  console.log(
    JSON.stringify({
      id,
      image: `/dinos/${id}.${ext}`,
      imageAttribution: `${artist}, Wikimedia Commons, ${license}`,
      source: ii.descriptionurl,
    }),
  );
}

const [cmd, ...args] = process.argv.slice(2);
if (cmd === "shortlist") await shortlist(args);
else if (cmd === "fetch") await fetchBest(args[0], args.slice(1).join(" "));
else if (cmd === "fetchfile") await fetchFile(args[0], args.slice(1).join(" "));
else console.error("usage: shortlist <terms...> | fetch <id> <term> | fetchfile <id> <File:title>");
