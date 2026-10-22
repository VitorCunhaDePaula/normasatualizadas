// Crawlers e agentes de IA conhecidos (token do User-Agent). Usado pelo proxy.ts (bloqueio 403) e pelo app/robots.ts.
export const AI_BOT_TOKENS = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "ClaudeBot",
  "Claude-Web",
  "Claude-User",
  "Claude-SearchBot",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "CCBot",
  "Bytespider",
  "Amazonbot",
  "meta-externalagent",
  "meta-externalfetcher",
  "FacebookBot",
  "cohere-ai",
  "cohere-training-data-crawler",
  "Diffbot",
  "ImagesiftBot",
  "Omgilibot",
  "YouBot",
  "Timpibot",
  "AI2Bot",
  "DuckAssistBot",
  "MistralAI-User",
  "PanguBot",
  "Kangaroo Bot",
  "Webzio-Extended",
] as const;

// Só existem como token do robots.txt (não aparecem no User-Agent das requisições).
export const AI_ROBOTS_ONLY_TOKENS = ["Google-Extended", "Applebot-Extended"] as const;

// Tokens só têm letras, hífen e espaço: não precisam de escape em regex.
// Navegadores sem interface usados para automação/raspagem.
const AUTOMATION_TOKENS = ["HeadlessChrome", "PhantomJS"];

export const BLOCKED_UA_PATTERN = new RegExp(
  [...AI_BOT_TOKENS, ...AUTOMATION_TOKENS].join("|"),
  "i",
);
