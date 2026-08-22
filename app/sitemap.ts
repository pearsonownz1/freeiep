import type { MetadataRoute } from "next";
import { uses } from "@/data/uses";
import { alternatives } from "@/data/alternatives";

const staticRoutes = [
  "/",
  "/pricing",
  "/privacy",
  "/terms",
  "/features/caseload",
  "/features/plan",
  "/features/progress",
  "/features/scheduling",
  "/features/family-portal",
  "/features/privacy",
  "/for/case-managers",
  "/for/co-teachers",
  "/for/service-providers",
  "/for/families",
  "/for/administrators",
  "/resources",
  "/resources/iep-timeline",
  "/resources/measurable-goals",
  "/resources/family-iep-meeting-guide",
  "/uses",
  "/alternatives",
  "/research",
  "/research/special-education-teacher-shortage-statistics",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://freeiep.netlify.app";
  const paths = [
    ...staticRoutes,
    ...uses.map((u) => `/uses/${u.slug}`),
    ...alternatives.map((a) => `/alternatives/${a.slug}`),
  ];
  return paths.map((path) => ({
    url: `${base}${path}`,
    changeFrequency: "weekly" as const,
    priority: path === "/" ? 1 : 0.6,
  }));
}
