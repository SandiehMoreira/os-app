import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "OS-App · Ordens de Serviço",
    short_name: "OS-App",
    description: "Abertura e acompanhamento de Ordens de Serviço da assistência técnica.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#155DFC",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
