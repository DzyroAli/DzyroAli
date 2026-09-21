import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "YaRato",
    short_name: "YaRato",
    description:
      "The launchpad for Uzbekistan's startups, AI assistants and Telegram bots",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f8fb",
    theme_color: "#1769e0",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
