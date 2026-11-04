import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const rawUrl = process.env.NEXT_PUBLIC_APP_URL || "https://chat.classnia.id.vn";
  const baseUrl = rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`;

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/features",
          "/about",
          "/faq",
          "/pricing",
          "/terms",
          "/privacy",
          "/login",
          "/register",
        ],
        disallow: [
          "/dashboard/",
          "/admin/",
          "/api/",
          "/_next/",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: [
          "/",
          "/features",
          "/about",
          "/faq",
          "/pricing",
          "/terms",
          "/privacy",
          "/login",
          "/register",
        ],
        disallow: [
          "/dashboard/",
          "/admin/",
          "/api/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
