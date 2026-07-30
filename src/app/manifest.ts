import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Dinoria — The Dinosaur Quiz Adventure",
    short_name: "Dinoria",
    description:
      "Name that dinosaur! A beautiful prehistoric quiz adventure for kids and dinosaur fans.",
    start_url: "/",
    display: "standalone",
    background_color: "#071f15",
    theme_color: "#0b2e1f",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
