import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DINOSAURS, getDinosaur } from "@/lib/dinosaurs";
import { DinoDetail } from "@/components/DinoDetail";
import { JungleScene } from "@/components/JungleScene";
import { SiteHeader } from "@/components/SiteHeader";
import { ButtonLink } from "@/components/ui";
import { SITE_URL } from "@/lib/site";

type Params = { params: Promise<{ id: string }> };

/** Pre-render one static page per dinosaur (great for SEO + shareable links). */
export function generateStaticParams() {
  return DINOSAURS.map((d) => ({ id: d.id }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const dino = getDinosaur(id);
  if (!dino) return {};
  const title = `${dino.displayName} facts for kids — size, diet & pictures`;
  const description = `${dino.displayName} (${dino.pronunciation}), a ${dino.period} ${dino.diet}: ${dino.description}`;
  const url = `${SITE_URL}/dinosaurs/${dino.id}`;
  const image = `${SITE_URL}${dino.image}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      images: [{ url: image, alt: dino.displayName }],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function DinosaurPage({ params }: Params) {
  const { id } = await params;
  const dino = getDinosaur(id);
  if (!dino) notFound();

  // Structured data helps search engines understand the page.
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: `${dino.displayName} — facts, size and pictures`,
        about: dino.scientificName,
        image: `${SITE_URL}${dino.image}`,
        description: dino.description,
        articleSection: "Dinosaurs",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Dinoria", item: `${SITE_URL}/` },
          {
            "@type": "ListItem",
            position: 2,
            name: "Dinosaurs",
            item: `${SITE_URL}/dinosaurs`,
          },
          { "@type": "ListItem", position: 3, name: dino.displayName },
        ],
      },
    ],
  };

  return (
    <div className="relative flex flex-1 flex-col">
      <JungleScene />
      <SiteHeader />
      <main className="relative z-10 mx-auto w-full max-w-lg flex-1 px-4 pb-16">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <nav className="mt-4 text-sm text-cream-faint">
          <Link href="/dinosaurs" className="hover:text-cream">
            ← All dinosaurs
          </Link>
        </nav>
        <div className="mt-4 rounded-3xl bg-canopy-900/70 p-5 ring-1 ring-cream/10 shadow-chunky backdrop-blur-md sm:p-6">
          <DinoDetail dino={dino} />
          <div className="mt-6">
            <ButtonLink variant="leaf" size="lg" href="/#play" className="w-full">
              ▶ Play the dinosaur quiz
            </ButtonLink>
          </div>
        </div>
      </main>
    </div>
  );
}
