export const i18n = {
  // 支持的语言列表
  locales: ["zh", "en"] as const,

  // 默认语言
  defaultLocale: "zh" as const,

  // Cookie 名称
  cookieName: "NEXT_LOCALE",
} as const;

export type Locale = (typeof i18n.locales)[number];

// 语言名称映射
export const localeNames: Record<Locale, string> = {
  zh: "中文",
  en: "English",
};
