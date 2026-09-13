import en from "./en.json" with { type: "json" };

export type Locale = "zh-CN" | "en";
const storageKey = "ip-tools:locale";

export function resolveLocale(
  saved: string | null,
  languages: readonly string[],
): Locale {
  if (saved === "zh-CN" || saved === "en") return saved;
  return languages[0]?.toLowerCase().startsWith("zh") ? "zh-CN" : "en";
}

function initialLocale(): Locale {
  if (typeof window === "undefined") return "zh-CN";
  // The URL also keeps language switching usable when storage is blocked.
  const override = new URL(window.location.href).searchParams.get("lang");
  let saved: string | null = null;
  try {
    saved = localStorage.getItem(storageKey);
  } catch {
    /* Storage may be disabled. */
  }
  return resolveLocale(
    override === "en" || override === "zh-CN" ? override : saved,
    navigator.languages,
  );
}

export const locale = initialLocale();
const messages: Record<string, string> = en;

export function t(message: string, values: readonly unknown[] = []): string {
  const upstream = message.match(/^外部数据源暂不可用 \((\d{3})\)$/);
  if (upstream) return t("外部数据源暂不可用 ({0})", [upstream[1]]);
  const translated = locale === "en" ? (messages[message] ?? message) : message;
  return translated.replace(/\{(\d+)\}/g, (match, index: string) =>
    Number(index) < values.length ? String(values[Number(index)]) : match,
  );
}

export function setLocale(next: Locale) {
  if (next === locale) return;
  try {
    localStorage.setItem(storageKey, next);
  } catch {
    /* URL fallback below. */
  }
  const url = new URL(window.location.href);
  url.searchParams.set("lang", next);
  window.location.assign(url.href);
}

export function initializeLocale() {
  document.documentElement.lang = locale;
  document.title = t("一个机场 IP - 极客网络工具箱");
  const description = document.querySelector('meta[name="description"]');
  if (description)
    description.setAttribute(
      "content",
      t(
        "一个机场 IP 是一款专为网络工程师与极客打造的高性能网络与安全诊断工具箱。支持全球高精度 IPv4/IPv6 双栈查询、IP 纯净度与欺诈风险评估、多线路分流出口审计、WebRTC 与浏览器环境深度指纹排查、全球分布式 Ping 节点测速及主流 AI 服务可用性监测。",
      ),
    );
}
