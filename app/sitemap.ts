import type { MetadataRoute } from "next";
import { SITE_ORIGIN } from "@/lib/site";
import { preinscripcionConfig } from "@/lib/preinscripcion/config";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${SITE_ORIGIN}/`,
    },
    {
      url: `${SITE_ORIGIN}${preinscripcionConfig.path}`,
    },
  ];
}
