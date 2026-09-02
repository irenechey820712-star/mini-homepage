/* 방글라데시 코너용 즉석 번역입니다. API 키가 필요 없고 브라우저에서 바로 호출합니다.
   1순위 Google 무료 endpoint(translate_a), 실패하면 MyMemory 로 대체합니다.
   스크립트를 감지해 방향을 정합니다:
   - 벵골어/영어 → 한국어
   - 한국어 → 영어
   결과는 메모리에 캐시합니다. 둘 다 실패하면 null(원문만 표시). */

const cache = new Map<string, string>();

export type SourceLang = "bn" | "ko" | "en";

export function detectLang(text: string): SourceLang {
  if (/[ঀ-৿]/.test(text)) return "bn";
  if (/[가-힣㄰-㆏ᄀ-ᇿ]/.test(text)) return "ko";
  return "en";
}

export type Translation = { source: SourceLang; target: "ko" | "en"; text: string };

async function viaGoogle(text: string, target: "ko" | "en"): Promise<string | null> {
  const url =
    "https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=" +
    target +
    "&dt=t&q=" +
    encodeURIComponent(text);
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  const segs: unknown = data?.[0];
  if (!Array.isArray(segs)) return null;
  const out = segs
    .map(s => (Array.isArray(s) ? s[0] : ""))
    .filter(Boolean)
    .join("")
    .trim();
  return out || null;
}

async function viaMyMemory(text: string, source: SourceLang, target: "ko" | "en"): Promise<string | null> {
  const url =
    "https://api.mymemory.translated.net/get?q=" +
    encodeURIComponent(text) +
    "&langpair=" +
    source +
    "|" +
    target;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  const out: unknown = data?.responseData?.translatedText;
  return typeof out === "string" && out.trim() ? out.trim() : null;
}

export async function translateMessage(text: string): Promise<Translation | null> {
  const trimmed = text.trim();
  if (!trimmed) return null;
  const source = detectLang(trimmed);
  const target: "ko" | "en" = source === "ko" ? "en" : "ko";
  const key = `${source}|${target}:${trimmed}`;
  if (cache.has(key)) return { source, target, text: cache.get(key)! };

  for (const attempt of [() => viaGoogle(trimmed, target), () => viaMyMemory(trimmed, source, target)]) {
    try {
      const out = await attempt();
      if (out && out.toLowerCase() !== trimmed.toLowerCase()) {
        cache.set(key, out);
        return { source, target, text: out };
      }
    } catch {
      /* 다음 방법 시도 */
    }
  }
  return null;
}
