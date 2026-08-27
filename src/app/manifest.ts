import type { MetadataRoute } from "next";

// Web app manifest — díky němu jde appka na mobilu "Přidat na plochu" a
// chová se jako instalovaná appka (bez app store, bez nativního kódu).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Coffee Log & Brew Calculator",
    short_name: "Coffee Log",
    description: "Osobní deník ochutnávek kávy a kalkulačka poměrů/extrakce.",
    start_url: "/",
    display: "standalone",
    background_color: "#0c0a09",
    theme_color: "#1c1917",
    icons: [{ src: "/icon", sizes: "512x512", type: "image/png" }],
  };
}
