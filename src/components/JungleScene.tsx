/** The animated prehistoric jungle backdrop (PRD Landing Experience).
 *
 * Pure CSS/SVG — no images, no heavy libs — so it paints instantly and stays
 * crisp on any screen: layered canopy silhouettes, golden sun, drifting mist,
 * a smoking volcano, and pterosaurs gliding across the sky. Honors
 * prefers-reduced-motion via the .scene-animated guard in globals.css.
 */
export function JungleScene() {
  return (
    <div
      className="scene-animated pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      aria-hidden="true"
    >
      {/* sky gradient: dawn haze → deep canopy */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#123a52_0%,#1d4b3a_38%,#0b2e1f_72%,#071f15_100%)]" />

      {/* sun glow */}
      <div
        className="absolute left-1/2 top-[12%] h-72 w-72 -translate-x-1/2 rounded-full blur-2xl"
        style={{
          background:
            "radial-gradient(circle, rgba(255,201,94,0.55), rgba(255,183,74,0.15) 55%, transparent 72%)",
          animation: "sun-pulse 7s ease-in-out infinite",
        }}
      />
      <div className="absolute left-1/2 top-[13%] h-24 w-24 -translate-x-1/2 rounded-full bg-sun-300/80 blur-md" />

      {/* Pteranodons gliding across the sky — varied sizes/speeds for depth */}
      <Pteranodon className="top-[22%] text-canopy-950/75" scale={1.15} delay={0} dur={30} />
      <Pteranodon className="top-[31%] text-canopy-950/60" scale={0.8} delay={4} dur={34} />
      <Pteranodon className="top-[17%] text-canopy-950/45" scale={0.55} delay={9} dur={44} />
      <Pteranodon className="top-[27%] text-canopy-950/35" scale={0.4} delay={17} dur={52} />

      {/* far mountains + volcano */}
      <svg
        className="absolute bottom-[26%] left-0 w-full text-canopy-900"
        viewBox="0 0 1200 220"
        preserveAspectRatio="none"
      >
        <path
          fill="currentColor"
          d="M0 220 L0 150 L150 90 L280 150 L430 70 L560 150 L720 40 L760 70 L800 40 L980 150 L1120 90 L1200 150 L1200 220 Z"
        />
      </svg>
      {/* volcano smoke */}
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="absolute left-[63%] bottom-[44%] h-10 w-10 rounded-full bg-cream/25 blur-md"
          style={{
            animation: `smoke-rise ${5 + i}s ease-out ${i * 1.4}s infinite`,
          }}
        />
      ))}

      {/* mist band */}
      <div
        className="absolute bottom-[24%] left-0 h-28 w-[130%] bg-cream/12 blur-2xl"
        style={{ animation: "mist-drift 14s ease-in-out infinite alternate" }}
      />

      {/* jungle canopy layers */}
      <Canopy className="bottom-[16%] text-canopy-800" flip />
      <Canopy className="bottom-[6%] text-canopy-700" />
      <Canopy className="-bottom-2 text-canopy-600" dense />

      {/* foreground ferns */}
      <svg
        className="absolute -bottom-1 left-0 w-full text-canopy-950"
        viewBox="0 0 1200 160"
        preserveAspectRatio="none"
      >
        <path
          fill="currentColor"
          d="M0 160 L0 70 Q90 30 150 80 Q220 20 300 80 Q380 30 470 90 Q560 20 660 80 Q770 30 860 90 Q960 30 1060 80 Q1140 40 1200 80 L1200 160 Z"
        />
      </svg>
    </div>
  );
}

function Canopy({
  className,
  flip,
  dense,
}: {
  className: string;
  flip?: boolean;
  dense?: boolean;
}) {
  return (
    <svg
      className={`absolute left-0 w-full ${className}`}
      viewBox="0 0 1200 200"
      preserveAspectRatio="none"
      style={flip ? { transform: "scaleX(-1)" } : undefined}
    >
      <path
        fill="currentColor"
        d={
          dense
            ? "M0 200 L0 110 Q60 70 120 100 Q160 60 220 100 Q280 55 350 100 Q410 65 480 100 Q540 55 620 100 Q690 60 760 100 Q820 55 900 100 Q970 65 1040 100 Q1110 60 1200 100 L1200 200 Z"
            : "M0 200 L0 120 Q100 80 200 120 Q300 70 420 120 Q540 80 660 120 Q780 70 900 120 Q1020 85 1200 120 L1200 200 Z"
        }
      />
    </svg>
  );
}

/** A gliding Pteranodon silhouette, facing right (the direction of travel):
 * long forward beak, backward-swept head crest, and two swept membrane wings. */
function Pteranodon({
  className,
  scale,
  delay,
  dur,
}: {
  className: string;
  scale: number;
  delay: number;
  dur: number;
}) {
  return (
    <svg
      className={`absolute left-0 ${className}`}
      width={60 * scale}
      height={30 * scale}
      viewBox="0 0 100 50"
      style={{ animation: `bird-fly ${dur}s linear ${delay}s infinite` }}
    >
      <g fill="currentColor">
        <path d="M48 20 Q26 10 4 15 Q28 20 46 24 Z" />
        <path d="M52 20 Q74 10 96 15 Q72 20 54 24 Z" />
        <path d="M46 18 L50 4 L54 18 Z" />
        <path d="M47 23 L50 36 L53 23 Z" />
        <ellipse cx="50" cy="21" rx="4.2" ry="6.5" />
      </g>
    </svg>
  );
}
