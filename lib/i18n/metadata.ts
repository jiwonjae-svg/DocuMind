import type { Metadata } from "next";

export function buildPageMetadata({
  description,
  title,
}: {
  description: string;
  title: string;
}): Metadata {
  return {
    description,
    title: `${title} | DocuMind`,
  };
}
