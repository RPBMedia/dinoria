import Image from "next/image";
import type { Dinosaur } from "@/types/dinosaur";
import { DIET_EMOJI, formatLength, formatWeight, TIER_LABEL } from "@/lib/format";

/** Presentational profile of a single dinosaur — every field from the record.
 * Pure/server-friendly so it can back both the Collection modal and the
 * per-dinosaur SEO pages. */
export function DinoDetail({ dino }: { dino: Dinosaur }) {
  return (
    <article>
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-3xl bg-gradient-to-b from-canopy-800/70 to-canopy-950/90 ring-1 ring-cream/10">
        <Image
          src={dino.image}
          alt={`${dino.displayName} — illustration`}
          fill
          sizes="(max-width: 640px) 100vw, 640px"
          className="object-contain p-4 drop-shadow-[0_10px_24px_rgba(0,0,0,0.55)]"
        />
        <span className="absolute left-3 top-3 rounded-full bg-canopy-950/70 px-3 py-1 text-xs font-600 text-sun-300 ring-1 ring-sun-400/30 backdrop-blur">
          {TIER_LABEL[dino.difficulty]}
        </span>
      </div>

      <header className="mt-5">
        <h1 className="font-[family-name:var(--font-fredoka)] text-3xl font-700 text-cream">
          {dino.displayName}
        </h1>
        <p className="mt-1 italic text-cream-dim">{dino.scientificName}</p>
        <p className="mt-1 text-sm text-cream-faint">
          <span className="text-cream-dim">{dino.pronunciation}</span> · &ldquo;
          {dino.meaning}&rdquo;
        </p>
      </header>

      <div className="mt-4 flex flex-wrap gap-2 text-sm">
        <Chip>🕰️ {dino.period}</Chip>
        <Chip>
          {DIET_EMOJI[dino.diet]} {dino.diet}
        </Chip>
        <Chip>🦴 {dino.family}</Chip>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <Metric label="Length" value={formatLength(dino.lengthMeters)} />
        <Metric label="Height" value={formatLength(dino.heightMeters)} />
        <Metric label="Weight" value={formatWeight(dino.weightKg)} />
      </div>

      <p className="mt-5 leading-relaxed text-cream-dim">{dino.description}</p>

      <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <Fact label="When">{dino.periodDetail}</Fact>
        <Fact label="Found in">{dino.country}</Fact>
        <Fact label="Discovered">
          {dino.discoverer}, {dino.discoveryYear}
        </Fact>
      </div>

      <div className="mt-5">
        <h2 className="font-[family-name:var(--font-fredoka)] text-lg font-700 text-cream">
          Did you know?
        </h2>
        <ul className="mt-2 space-y-2">
          {dino.interestingFacts.map((fact, i) => (
            <li key={i} className="flex gap-2 text-cream-dim">
              <span aria-hidden className="text-sun-400">
                ✦
              </span>
              <span>{fact}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-5 text-xs text-cream-faint">
        Artwork: {dino.imageAttribution}.
      </p>
    </article>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-canopy-950/50 px-3 py-1.5 capitalize text-cream ring-1 ring-cream/10">
      {children}
    </span>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-canopy-950/50 px-3 py-3 text-center ring-1 ring-cream/10">
      <div className="font-[family-name:var(--font-fredoka)] text-xl font-700 tabular-nums text-leaf-400">
        {value}
      </div>
      <div className="mt-0.5 text-xs uppercase tracking-wider text-cream-faint">
        {label}
      </div>
    </div>
  );
}

function Fact({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-canopy-950/40 px-4 py-3 ring-1 ring-cream/10">
      <div className="text-xs uppercase tracking-wider text-cream-faint">
        {label}
      </div>
      <div className="mt-0.5 text-sm text-cream">{children}</div>
    </div>
  );
}
