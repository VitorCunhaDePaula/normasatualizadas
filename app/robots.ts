import type { MetadataRoute } from "next";
import { AI_BOT_TOKENS, AI_ROBOTS_ONLY_TOKENS } from "@/lib/ai-bots";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: [...AI_BOT_TOKENS, ...AI_ROBOTS_ONLY_TOKENS], disallow: "/" },
      { userAgent: "*", disallow: ["/dashboard", "/admin", "/api"] },
    ],
  };
}
