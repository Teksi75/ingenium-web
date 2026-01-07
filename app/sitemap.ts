import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://ingenium-web.vercel.app/",
      lastModified: new Date(),
    },
  ];
}
