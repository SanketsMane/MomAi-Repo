export const EMBED_CONFIG = {
  WIDGET_URL: import.meta.env.VITE_WIDGET_URL || (import.meta.env.NODE_ENV === "production" ? "https://widget.momdigital.in" : "http://localhost:3002"),
  DEFAULT_ORG_ID: "org_35xstxe4NTEdHiQPj5ZRo3P0y03",
  DEFAULT_POSITION: "bottom-right" as const,
};
