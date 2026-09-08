/* 브라우저에서 고른 사진을 작게 줄여 JPEG data URL 로 바꿉니다.
   Firestore 문서 한도(약 1MB) 안에 들어가도록 가로세로 크기와 화질을 낮춰 가며 인코딩합니다.
   업로드 서버(Storage) 없이 사진첩을 쓰기 위한 방법입니다. */
export async function fileToResizedDataUrl(
  file: File,
  maxSize = 1000,
  maxLength = 380_000
): Promise<string> {
  const sourceUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("사진 파일을 읽지 못했어요."));
    reader.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error("사진을 열지 못했어요. 다른 파일을 써 주세요."));
    el.src = sourceUrl;
  });

  const render = (scale: number, quality: number) => {
    const w = Math.max(1, Math.round((img.naturalWidth || img.width) * scale));
    const h = Math.max(1, Math.round((img.naturalHeight || img.height) * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("사진을 변환하지 못했어요.");
    ctx.drawImage(img, 0, 0, w, h);
    return canvas.toDataURL("image/jpeg", quality);
  };

  const baseScale = Math.min(1, maxSize / Math.max(img.naturalWidth || img.width, img.naturalHeight || img.height));

  let quality = 0.82;
  let out = render(baseScale, quality);
  while (out.length > maxLength && quality > 0.4) {
    quality -= 0.12;
    out = render(baseScale, quality);
  }

  let shrink = 0.8;
  while (out.length > maxLength && shrink > 0.3) {
    out = render(baseScale * shrink, 0.7);
    shrink -= 0.15;
  }

  return out;
}
