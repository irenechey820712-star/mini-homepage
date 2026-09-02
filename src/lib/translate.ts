/* 무료 MyMemory API 로 즉석 번역합니다. 키가 필요 없고 브라우저에서 바로 호출합니다.
   벵골어·한글 스크립트를 감지해 방향을 정합니다:
   - 벵골어/영어 → 한국어
   - 한국어 → 영어
   결과는 메모리에 캐시해서 같은 문장을 다시 번역하지 않습니다. */

const cache = new Map<string, string>();

export type SourceLang = "bn" | "ko" | "en";

export function detectLang(text: string): SourceLang {
  if (/[ঀ-৿]/.test(text)) return "bn";
  if (/[가-힣㄰-㆏ᄀ-ᇿ]/.test(text)) return "ko";
  return "en";
}

export type Translation = { source: SourceLang; target: "ko" | "en"; text: string };

export async function translateMessage(text: string): Promise<Translation | null> {
  const trimmed = text.trim();
  if (!trimmed) return null;
  const source = detectLang(trimmed);
  const target: "ko" | "en" = source === "ko" ? "en" : "ko";
  const key = `${source}|${target}:${trimmed}`;
  if (cache.has(key)) return { source, target, text: cache.get(key)! };

  try {
    const url =
      "https://api.mymemory.translated.net/get?q=" +
      encodeURIComponent(trimmed) +
      "&langpair=" +
      source +
      "|" +
      target;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const out: unknown = data?.responseData?.translatedText;
    if (typeof out === "string" && out.trim() && out.trim().toLowerCase() !== trimmed.toLowerCase()) {
      cache.set(key, out.trim());
      return { source, target, text: out.trim() };
    }
  } catch {
    /* 네트워크 실패 시 조용히 원문만 보여줍니다. */
  }
  return null;
}
