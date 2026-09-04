"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Spiral, type SpiralProps } from "@paper-design/shaders-react";
import { asset } from "@/lib/asset";
import BgmPlayer, { type BgmHandle } from "@/components/BgmPlayer";
import {
  BANGLADESH_LIMITS,
  GUESTBOOK_LIMITS,
  addBangladeshEntry,
  addGuestbookEntry,
  deleteEntry,
  isCounterEnabled,
  isFirebaseConfigured,
  isGuestbookEnabled,
  recordVisit,
  subscribeBangladesh,
  subscribeGuestbook,
  updateEntryText,
  type RemoteEntry,
  type VisitCounts
} from "@/lib/firebase";
import { translateMessage, translateTo, type TargetLang, type TranslationResult } from "@/lib/translate";
import {
  aiedapIntro,
  aiedapItems,
  boardPosts,
  episodes,
  guestbook,
  photos,
  profile,
  profileSections,
  waveLinks
} from "@/config/linktree";
import { theme } from "@/config/theme";
import { EditBar, EditableText, SiteEditorProvider, useSiteEditor } from "@/components/SiteEditor";

const ALL_TABS = ["home", "profile", "aiedap", "story", "board", "photo", "guestbook", "bangladesh"] as const;
type TabName = (typeof ALL_TABS)[number];

/* 연재물이 하나도 없으면 탭 자체를 숨깁니다. */
const TABS: TabName[] = ALL_TABS.filter(tab => tab !== "story" || episodes.length > 0);

/* 탭 버튼과 오른쪽 위 제목에 쓰는 이름표입니다. profile.ts 값을 따릅니다. */
const NAV_LABELS: Record<TabName, string> = {
  home: "홈",
  profile: "프로필",
  aiedap: "AIEDAP",
  story: profile.storyLabel,
  board: profile.boardLabel,
  photo: profile.photoLabel,
  guestbook: "방명록",
  bangladesh: "방글라"
};

/* 진입 화면 셰이더 배경 설정입니다. 색은 theme.ts 를 따릅니다. */
const spiralProps = {
  fit: "none",
  scale: 1.3,
  rotation: 0,
  offsetX: 0,
  offsetY: 0,
  originX: 0.5,
  originY: 0.5,
  worldWidth: 0,
  worldHeight: 0,
  density: 0.5,
  colorBack: theme.colors.cream,
  colorFront: theme.colors.spiralFront,
  distortion: 0,
  strokeWidth: 0.5,
  strokeTaper: 0,
  strokeCap: 0,
  noise: 1,
  noiseFrequency: 0.25,
  softness: 0,
  speed: 0.75,
  frame: 0,
  maxPixelCount: 1_500_000
} satisfies Partial<SpiralProps>;

const introStyle = {
  "--cream": theme.colors.cream,
  "--ink": theme.colors.ink,
  "--brown": theme.colors.brown,
  "--display": "'Pretendard', 'Noto Sans KR', system-ui, sans-serif",
  "--body": "'Pretendard', 'Noto Sans KR', system-ui, sans-serif"
} as React.CSSProperties;

/* 메인 화면 프레임 모서리에 걸쳐지는 연보라 하트 장식입니다.
   style="jelly" (투명 젤리) 또는 "brush" (붓터치) 중에서 그립니다. */
const HEART_PATH =
  "M100 164C60 138 33 113 27 83C21 53 42 31 66 34C85 36 96 49 100 61C104 49 115 36 134 34C158 31 179 53 173 83C167 113 140 138 100 164Z";

function HeartBrushSvg() {
  return (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="heartBrushA" x="-30%" y="-30%" width="160%" height="160%">
          <feTurbulence type="fractalNoise" baseFrequency="0.017 0.024" numOctaves="3" seed="11" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="16" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id="heartBrushB" x="-30%" y="-30%" width="160%" height="160%">
          <feTurbulence type="fractalNoise" baseFrequency="0.03 0.02" numOctaves="2" seed="29" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="9" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <linearGradient id="heartFill" x1="0" y1="0" x2="0.2" y2="1">
          <stop offset="0" stopColor="#DED0F6" />
          <stop offset="0.55" stopColor="#C3A6EC" />
          <stop offset="1" stopColor="#AE8AE1" />
        </linearGradient>
      </defs>
      <path
        d={HEART_PATH}
        filter="url(#heartBrushA)"
        transform="translate(100 100) scale(1.06) rotate(-7) translate(-100 -100)"
        fill="#E7DCF8"
        opacity="0.5"
      />
      <path d={HEART_PATH} filter="url(#heartBrushA)" fill="url(#heartFill)" opacity="0.92" />
      <path d={HEART_PATH} filter="url(#heartBrushB)" fill="none" stroke="#9E7BD6" strokeWidth="3.5" opacity="0.55" />
      <path
        d="M64 46C52 55 47 69 49 82C58 62 71 52 86 51C80 46 72 43 64 46Z"
        filter="url(#heartBrushB)"
        fill="#F3ECFB"
        opacity="0.55"
      />
    </svg>
  );
}

function HeartJellySvg() {
  return (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="jellyFill" cx="40%" cy="32%" r="80%">
          <stop offset="0" stopColor="#EFE6FB" stopOpacity="0.82" />
          <stop offset="50%" stopColor="#BE97EA" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#8A61C6" stopOpacity="0.38" />
        </radialGradient>
        <linearGradient id="jellyRim" x1="0" y1="0" x2="0.15" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.12" />
          <stop offset="1" stopColor="#B98FE6" stopOpacity="0.55" />
        </linearGradient>
        <filter id="jellyGel" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="b" />
          <feSpecularLighting in="b" surfaceScale="5" specularConstant="0.9" specularExponent="16" lightingColor="#ffffff" result="s">
            <fePointLight x="62" y="34" z="120" />
          </feSpecularLighting>
          <feComposite in="s" in2="SourceAlpha" operator="in" result="sc" />
          <feComposite in="SourceGraphic" in2="sc" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" />
        </filter>
        <filter id="jellyBlur" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>
      <path d={HEART_PATH} fill="url(#jellyFill)" stroke="url(#jellyRim)" strokeWidth="2.5" filter="url(#jellyGel)" />
      <path
        d="M70 40C51 51 43 71 48 90C65 66 85 54 106 52C97 41 84 35 70 40Z"
        fill="#ffffff"
        opacity="0.4"
        filter="url(#jellyBlur)"
      />
      <ellipse cx="72" cy="52" rx="13" ry="8" fill="#ffffff" opacity="0.85" transform="rotate(-28 72 52)" />
      <ellipse cx="122" cy="58" rx="5" ry="3.5" fill="#ffffff" opacity="0.6" transform="rotate(-18 122 58)" />
    </svg>
  );
}

function HeartCloudSvg() {
  const puffs: [number, number, number][] = [
    [66, 60, 30], [52, 74, 23], [82, 52, 26],
    [134, 60, 30], [148, 74, 23], [118, 52, 26],
    [100, 74, 33], [100, 102, 30],
    [80, 112, 24], [120, 112, 24],
    [100, 130, 22], [100, 151, 13]
  ];
  return (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="cloudFill" cx="45%" cy="36%" r="78%">
          <stop offset="0" stopColor="#FCF9FF" />
          <stop offset="55%" stopColor="#EEE4FA" />
          <stop offset="100%" stopColor="#D6C4F0" />
        </radialGradient>
        <filter id="cloudGoo" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="blur" />
          <feColorMatrix
            in="blur"
            type="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -10"
            result="goo"
          />
          <feGaussianBlur in="goo" stdDeviation="1.6" />
        </filter>
        <filter id="cloudSoft" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>
      <g filter="url(#cloudGoo)" fill="url(#cloudFill)">
        {puffs.map(([cx, cy, r], i) => (
          <circle key={i} cx={cx} cy={cy} r={r} />
        ))}
      </g>
      <ellipse cx="76" cy="60" rx="20" ry="14" fill="#ffffff" opacity="0.6" filter="url(#cloudSoft)" />
      <ellipse cx="122" cy="66" rx="13" ry="9" fill="#ffffff" opacity="0.42" filter="url(#cloudSoft)" />
    </svg>
  );
}

/* 사랑스럽고 bold한 스티커 하트 */
function HeartPopSvg() {
  return (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="popFill" x1="0" y1="0" x2="0.28" y2="1">
          <stop offset="0" stopColor="#C77BEC" />
          <stop offset="0.5" stopColor="#8B5CF0" />
          <stop offset="1" stopColor="#6636CC" />
        </linearGradient>
        <linearGradient id="popShine" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={HEART_PATH} transform="translate(7 10)" fill="#3F2680" opacity="0.35" />
      <path d={HEART_PATH} fill="none" stroke="#3F2680" strokeWidth="17" strokeLinejoin="round" />
      <path d={HEART_PATH} fill="none" stroke="#ffffff" strokeWidth="10" strokeLinejoin="round" />
      <path d={HEART_PATH} fill="url(#popFill)" />
      <path
        d="M60 44C48 55 44 72 48 87C71 61 98 51 122 54C110 41 82 33 60 44Z"
        fill="url(#popShine)"
        opacity="0.7"
      />
      <ellipse cx="70" cy="52" rx="11" ry="6.5" fill="#ffffff" opacity="0.92" transform="rotate(-24 70 52)" />
      <path d="M151 30l4.5 13 13 4.5-13 4.5-4.5 13-4.5-13-13-4.5 13-4.5z" fill="#FFDE85" />
      <circle cx="42" cy="120" r="4.5" fill="#FFDE85" opacity="0.9" />
    </svg>
  );
}

const HEART_STYLES = ["bd", "bd2", "bd3", "pop", "jelly", "brush", "cloud"] as const;
type HeartStyle = (typeof HEART_STYLES)[number];

function HeartDeco() {
  const { text } = useSiteEditor();
  const raw = text("heartStyle", "bd");
  const style: HeartStyle = (HEART_STYLES as readonly string[]).includes(raw) ? (raw as HeartStyle) : "bd";
  return (
    <span className={`cy-heart-brush cy-heart-${style}`} aria-hidden="true">
      {style === "brush" ? (
        <HeartBrushSvg />
      ) : style === "jelly" ? (
        <HeartJellySvg />
      ) : style === "cloud" ? (
        <HeartCloudSvg />
      ) : style === "bd" ? (
        <img src={asset("/assets/heart-bd.png")} alt="" />
      ) : style === "bd2" ? (
        <img src={asset("/assets/heart-bd2.png")} alt="" />
      ) : style === "bd3" ? (
        <img src={asset("/assets/heart-bd3.png")} alt="" />
      ) : (
        <HeartPopSvg />
      )}
    </span>
  );
}

function ChevronDown({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

/* 방글라데시 국기를 이모지 크기의 작은 아이콘으로 그립니다. (윈도우는 🇧🇩 이모지를 지원하지 않음) */
function BdFlag({ className = "cy-bd-flag" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 12" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="방글라데시 국기">
      <rect width="20" height="12" fill="#006A4E" />
      <circle cx="9" cy="6" r="3.6" fill="#F42A41" />
    </svg>
  );
}

function IntroOverlay({ onBrowse }: { onBrowse: () => void }) {
  const { text } = useSiteEditor();
  return (
    <div className="lt-intro" style={introStyle}>
      <Spiral className="lt-intro-spiral" {...spiralProps} />
      <div className="lt-intro-card">
        <span className="lt-intro-title">{text("introTitle", profile.introTitle)}</span>
        <p className="lt-intro-copy">{text("introDescription", profile.introDescription)}</p>
        <button type="button" className="lt-intro-cta" onClick={onBrowse}>
          모든 활동 구경하기
          <ChevronDown size={18} />
        </button>
      </div>
    </div>
  );
}

const TAB_TITLES: Record<TabName, string> = {
  home: profile.catalogTitle,
  profile: "프로필",
  aiedap: "AIEDAP 심화연수",
  story: profile.storyLabel,
  board: profile.boardLabel,
  photo: profile.photoLabel,
  guestbook: "방명록",
  bangladesh: "방글라데시 코너"
};

function SectionTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="cy-section-title">
      {title}
      {sub ? <span className="cy-sub-text">{sub}</span> : null}
    </div>
  );
}

/* 미니룸 위를 방향키로 걸어다니는 캐릭터입니다. 기본은 꺼져 있고, 버튼으로 켜고 끕니다.
   켬 여부와 위치는 이 브라우저(localStorage)에만 저장됩니다. */
const ARROWS = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];

function MiniRoomCharacter() {
  const [on, setOn] = useState(false);
  const [pos, setPos] = useState({ x: 50, y: 72 });
  const [face, setFace] = useState(1);

  useEffect(() => {
    try {
      setOn(localStorage.getItem("acm_miniroom_char") === "on");
      const raw = localStorage.getItem("acm_miniroom_pos");
      if (raw) {
        const p = JSON.parse(raw);
        if (typeof p?.x === "number" && typeof p?.y === "number") setPos({ x: p.x, y: p.y });
      }
    } catch {
      /* 저장소를 못 읽어도 기본값으로 동작 */
    }
  }, []);

  useEffect(() => {
    if (!on) return;
    const onKey = (e: KeyboardEvent) => {
      if (!ARROWS.includes(e.key)) return;
      const ae = document.activeElement as HTMLElement | null;
      if (ae && (ae.tagName === "INPUT" || ae.tagName === "TEXTAREA" || ae.isContentEditable)) return;
      e.preventDefault();
      setPos(p => {
        const step = 5;
        let x = p.x;
        let y = p.y;
        if (e.key === "ArrowLeft") {
          x -= step;
          setFace(-1);
        } else if (e.key === "ArrowRight") {
          x += step;
          setFace(1);
        } else if (e.key === "ArrowUp") {
          y -= step;
        } else {
          y += step;
        }
        x = Math.max(4, Math.min(96, x));
        y = Math.max(8, Math.min(94, y));
        const np = { x, y };
        try {
          localStorage.setItem("acm_miniroom_pos", JSON.stringify(np));
        } catch {
          /* 저장 실패는 무시 */
        }
        return np;
      });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [on]);

  const toggle = () => {
    setOn(v => {
      const nv = !v;
      try {
        localStorage.setItem("acm_miniroom_char", nv ? "on" : "off");
      } catch {
        /* 무시 */
      }
      return nv;
    });
  };

  return (
    <>
      <button type="button" className="cy-miniroom-toy" onClick={toggle}>
        {on ? "🕹️ 끄기" : "🕹️ 캐릭터 놀기"}
      </button>
      {on ? (
        <>
          <div className="cy-miniroom-hint">방향키 ↑ ↓ ← → 로 이동</div>
          <div className="cy-miniroom-char" style={{ left: `${pos.x}%`, top: `${pos.y}%` }}>
            <span style={{ display: "inline-block", transform: `scaleX(${face})` }}>🚶‍♀️</span>
          </div>
        </>
      ) : null}
    </>
  );
}

function HomeTab() {
  return (
    <>
      <div className="cy-content-box cy-miniroom-box">
        <div className="cy-section-title">
          <EditableText textKey="miniroomTitle" fallback="Mini Room" />
          <EditableText as="span" className="cy-sub-text" textKey="miniroomSub" fallback="미니룸" />
        </div>
        <div className="cy-miniroom-inner">
          <img src={asset(profile.miniroom.src)} alt={profile.miniroom.alt} />
          <MiniRoomCharacter />
        </div>
      </div>

      <div className="cy-content-box">
        <SectionTitle title="What friends say" sub="한마디로 표현한다면~" />
        <GuestbookList />
      </div>
    </>
  );
}

/* 프로필 섹션의 번역 가능한 모든 문자열을 한 번 모읍니다. */
function collectProfileStrings(): string[] {
  const set = new Set<string>();
  const add = (s?: string) => {
    if (s && s.trim()) set.add(s.trim());
  };
  for (const section of profileSections) {
    add(section.title);
    add(section.subtitle);
    for (const block of section.blocks) {
      if (block.kind === "text") block.lines.forEach(add);
      else if (block.kind === "list") {
        add(block.heading);
        block.items.forEach(add);
      } else if (block.kind === "image") add(block.caption);
      else block.items.forEach(it => {
        add(it.label);
        add(it.value);
      });
    }
  }
  return [...set];
}

type ProfileLang = "ko" | "en" | "bn";
const PROFILE_LANGS: { id: ProfileLang; label: string }[] = [
  { id: "ko", label: "한국어" },
  { id: "en", label: "English" },
  { id: "bn", label: "বাংলা" }
];

function ProfileTab() {
  const [lang, setLang] = useState<ProfileLang>("ko");
  const [dict, setDict] = useState<Record<string, Record<string, string>>>({});
  const [loading, setLoading] = useState(false);
  const strings = useMemo(collectProfileStrings, []);

  useEffect(() => {
    if (lang === "ko" || dict[lang]) return;
    let alive = true;
    setLoading(true);
    Promise.all(strings.map(s => translateTo(s, lang).then(t => [s, t] as const))).then(pairs => {
      if (!alive) return;
      setDict(d => ({ ...d, [lang]: Object.fromEntries(pairs) }));
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, [lang, strings, dict]);

  const T = (s?: string) => {
    if (!s) return s;
    if (lang === "ko") return s;
    return dict[lang]?.[s.trim()] ?? s;
  };

  return (
    <>
      <div className="cy-lang-bar">
        {PROFILE_LANGS.map(l => (
          <button
            key={l.id}
            type="button"
            className={`cy-lang-btn${lang === l.id ? " is-active" : ""}`}
            onClick={() => setLang(l.id)}
          >
            {l.label}
          </button>
        ))}
        {loading ? <span className="cy-lang-loading">번역 중… · translating…</span> : null}
      </div>

      {profileSections.map(section => (
        <div key={section.id} className="cy-content-box">
          <SectionTitle title={T(section.title)!} sub={T(section.subtitle)} />
          {section.blocks.map((block, bi) => {
            if (block.kind === "text") {
              return (
                <div key={bi} className="cy-text-block">
                  {block.lines.map((line, i) => (
                    <p key={i}>{T(line)}</p>
                  ))}
                </div>
              );
            }
            if (block.kind === "list") {
              return (
                <div key={bi} className="cy-profile-list-box">
                  <div className="cy-profile-list-heading">{T(block.heading)}</div>
                  <ul className="cy-profile-list">
                    {block.items.map((item, i) => (
                      <li key={i}>{T(item)}</li>
                    ))}
                  </ul>
                </div>
              );
            }
            if (block.kind === "image") {
              const img = <img src={asset(block.src)} alt={block.alt} loading="lazy" />;
              return (
                <figure key={bi} className="cy-profile-image">
                  {block.href ? (
                    <a href={block.href} target="_blank" rel="noopener noreferrer">
                      {img}
                    </a>
                  ) : (
                    img
                  )}
                  {block.caption ? <figcaption>{T(block.caption)}</figcaption> : null}
                </figure>
              );
            }
            return (
              <ul key={bi} className="cy-contact-list">
                {block.items.map(item => (
                  <li key={item.href}>
                    <span className="cy-contact-label">{T(item.label)}</span>
                    <a
                      href={item.href}
                      target={item.href.startsWith("mailto:") ? undefined : "_blank"}
                      rel="noopener noreferrer"
                    >
                      {T(item.value)}
                    </a>
                  </li>
                ))}
              </ul>
            );
          })}
        </div>
      ))}
    </>
  );
}

function StoryTab() {
  const [openId, setOpenId] = useState<string | null>(null);
  const open = episodes.find(e => e.id === openId);

  if (open) {
    return (
      <div className="cy-content-box">
        <SectionTitle
          title={open.title ? `${open.label} ${open.title}` : open.label}
          sub={`${open.cuts.length}컷`}
        />
        <button className="cy-back-btn" onClick={() => setOpenId(null)}>
          목록으로
        </button>
        <div className="cy-cut-list">
          {open.cuts.map((cut, i) => (
            <img key={cut} src={asset(cut)} alt={`${open.label} ${i + 1}컷`} loading="lazy" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="cy-content-box">
      <SectionTitle title={profile.storyLabel} sub={`전체 ${episodes.length}화`} />
      <ul className="cy-episode-grid">
        {episodes.map(episode => (
          <li key={episode.id}>
            <button className="cy-episode-card" onClick={() => setOpenId(episode.id)}>
              <span className="cy-episode-thumb">
                <img src={asset(episode.thumb)} alt={episode.label} loading="lazy" />
              </span>
              <span className="cy-episode-label">{episode.label}</span>
              {episode.title ? (
                <span className="cy-episode-title">{episode.title}</span>
              ) : null}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function BoardTab() {
  return (
    <div className="cy-content-box">
      <SectionTitle title={profile.boardLabel} sub={profile.boardSubtitle} />
      {boardPosts.length === 0 ? (
        <div className="cy-empty-box">
          {profile.boardEmptyText}
        </div>
      ) : (
        <ul className="cy-board-list">
          {boardPosts.map(post => (
            <li key={post.id} className="cy-board-item">
              <a className="cy-board-link" href={post.href} target="_blank" rel="noopener noreferrer">
                {post.preview ? (
                  <span className="cy-board-preview">
                    <img src={asset(post.preview.src)} alt={post.preview.alt} loading="lazy" />
                  </span>
                ) : null}
                <span className="cy-board-text">
                  <span className="cy-board-head">
                    <span className="cy-board-category">{post.category}</span>
                    <span className="cy-board-title">{post.title}</span>
                  </span>
                  {post.summary ? <span className="cy-board-summary">{post.summary}</span> : null}
                  <span className="cy-board-date">{post.date}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* 편집 모드에서 소유자에게만 보이는 글 수정·삭제 컨트롤입니다. */
function OwnerControls({ coll, id, text }: { coll: "guestbook" | "bangladesh"; id: string; text: string }) {
  const { editing, owner } = useSiteEditor();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(text);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setDraft(text);
  }, [text]);

  if (!editing || !owner?.isOwner) return null;

  const save = async () => {
    setBusy(true);
    try {
      await updateEntryText(coll, id, draft);
      setOpen(false);
    } catch {
      /* 무시 */
    } finally {
      setBusy(false);
    }
  };
  const remove = async () => {
    if (!window.confirm("이 글을 삭제할까요?")) return;
    setBusy(true);
    try {
      await deleteEntry(coll, id);
    } catch {
      /* 무시 */
    } finally {
      setBusy(false);
    }
  };

  if (open) {
    return (
      <div className="cy-mod-edit">
        <textarea value={draft} rows={2} onChange={e => setDraft(e.target.value)} />
        <button className="cy-mod-btn" onClick={save} disabled={busy}>저장</button>
        <button
          className="cy-mod-btn"
          onClick={() => {
            setDraft(text);
            setOpen(false);
          }}
        >
          취소
        </button>
      </div>
    );
  }
  return (
    <div className="cy-mod-row">
      <button className="cy-mod-btn" onClick={() => setOpen(true)}>✏️ 수정</button>
      <button className="cy-mod-btn is-danger" onClick={remove} disabled={busy}>🗑 삭제</button>
    </div>
  );
}

function GuestbookForm() {
  const [author, setAuthor] = useState("");
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (sending) return;
    setSending(true);
    setMessage(null);
    try {
      await addGuestbookEntry(author, text);
      setAuthor("");
      setText("");
      setMessage({ kind: "ok", text: "한줄평을 남겼어요. 고맙습니다!" });
    } catch (error) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "남기지 못했어요. 잠시 뒤 다시 시도해 주세요." });
    } finally {
      setSending(false);
    }
  };

  return (
    <form className="cy-guestbook-form" onSubmit={submit}>
      <div className="cy-gb-row">
        <input
          className="cy-gb-author"
          value={author}
          onChange={e => setAuthor(e.target.value)}
          placeholder="이름"
          maxLength={GUESTBOOK_LIMITS.author}
          aria-label="이름"
        />
        <input
          className="cy-gb-text"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="한줄평을 남겨주세요"
          maxLength={GUESTBOOK_LIMITS.text}
          aria-label="한줄평"
        />
      </div>
      <button className="cy-gb-submit" type="submit" disabled={sending}>
        {sending ? "전송중" : "남기기"}
      </button>
      {message ? (
        <span className={`cy-gb-message${message.kind === "error" ? " is-error" : ""}`}>{message.text}</span>
      ) : null}
    </form>
  );
}

const GUESTBOOK_FETCH_LIMIT = 30;
const GUESTBOOK_PAGE_SIZE = 5;

function GuestbookList() {
  /* Firestore 가 설정되어 있으면 실시간 목록을, 아니면 linktree.ts 의 예시를 보여줍니다. */
  const [remote, setRemote] = useState<RemoteEntry[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [page, setPage] = useState(0);

  useEffect(() => {
    if (!isGuestbookEnabled) return;
    return subscribeGuestbook(GUESTBOOK_FETCH_LIMIT, setRemote, () => setFailed(true));
  }, []);

  const live = isGuestbookEnabled && !failed;
  const entries = live && remote
    ? remote.map(e => ({ key: e.id, ...e }))
    : guestbook.map(e => ({ key: String(e.id), ...e }));

  const pageCount = Math.max(1, Math.ceil(entries.length / GUESTBOOK_PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);
  const pageEntries = entries.slice(
    currentPage * GUESTBOOK_PAGE_SIZE,
    currentPage * GUESTBOOK_PAGE_SIZE + GUESTBOOK_PAGE_SIZE
  );

  return (
    <>
      {live && remote === null ? <div className="cy-gb-loading">한줄평을 불러오는 중…</div> : null}

      <div className="cy-guestbook-list">
        {entries.length === 0 ? (
          <div className="cy-gb-loading">아직 한줄평이 없어요. 첫 줄을 남겨 주세요!</div>
        ) : (
          pageEntries.map(c => (
            <div key={c.key} className="cy-guestbook-item">
              <span className="cg-author">
                <span className="cy-name-heart" aria-hidden="true">💜</span> {c.author} <span className="cg-colon">:</span>{" "}
              </span>
              <span className="cg-text">{c.text}</span>
              <span className="cg-date">({c.date})</span>
              {live ? <OwnerControls coll="guestbook" id={c.key} text={c.text} /> : null}
            </div>
          ))
        )}
      </div>

      {pageCount > 1 ? (
        <div className="cy-gb-pagination">
          {Array.from({ length: pageCount }, (_, i) => (
            <button
              key={i}
              type="button"
              className={`cy-gb-page${i === currentPage ? " is-active" : ""}`}
              onClick={() => setPage(i)}
              aria-current={i === currentPage ? "page" : undefined}
            >
              {i + 1}
            </button>
          ))}
        </div>
      ) : null}

      {live ? <GuestbookForm /> : null}
    </>
  );
}

function GuestbookTab() {
  return (
    <div className="cy-content-box">
      <SectionTitle title="방명록" sub="한마디 남기고 가기" />
      {!isGuestbookEnabled ? (
        <div className="cy-empty-box">방명록은 준비 중입니다.</div>
      ) : (
        <GuestbookList />
      )}
    </div>
  );
}

/* 방글라데시 코너: 메시지를 남기면 읽을 때 자동 번역합니다.
   영어·벵골어 → 한국어, 한국어 → 영어 + 벵골어 */
const TRANS_TAG: Record<TargetLang, string> = { ko: "🌐 한국어", en: "🌐 English", bn: "🌐 বাংলা" };

function TranslatedMessage({ text }: { text: string }) {
  const [res, setRes] = useState<TranslationResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setRes(null);
    translateMessage(text).then(result => {
      if (!alive) return;
      setRes(result);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, [text]);

  return (
    <>
      <div className="cy-bd-original">{text}</div>
      {loading ? (
        <div className="cy-bd-trans is-loading">번역 중… · translating… · অনুবাদ হচ্ছে…</div>
      ) : (
        res?.items.map(item => (
          <div className="cy-bd-trans" key={item.target}>
            <span className="cy-bd-trans-tag">{TRANS_TAG[item.target]}</span> {item.text}
          </div>
        )) ?? null
      )}
    </>
  );
}

function BangladeshForm() {
  const [author, setAuthor] = useState("");
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (sending) return;
    setSending(true);
    setMessage(null);
    try {
      await addBangladeshEntry(author, text);
      setAuthor("");
      setText("");
      setMessage({ kind: "ok", text: "메시지를 남겼어요! · Thank you!" });
    } catch (error) {
      setMessage({
        kind: "error",
        text: error instanceof Error ? error.message : "남기지 못했어요 · Could not send."
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <form className="cy-bd-form" onSubmit={submit}>
      <input
        className="cy-gb-author"
        value={author}
        onChange={e => setAuthor(e.target.value)}
        placeholder="Name · 이름"
        maxLength={BANGLADESH_LIMITS.author}
        aria-label="Name"
      />
      <textarea
        className="cy-bd-textarea"
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Write in English or Bengali… · 영어나 벵골어로 남겨 주세요…"
        maxLength={BANGLADESH_LIMITS.text}
        rows={3}
        aria-label="Message"
      />
      <button className="cy-gb-submit" type="submit" disabled={sending}>
        {sending ? "…" : "Send · 남기기"}
      </button>
      {message ? (
        <span className={`cy-gb-message${message.kind === "error" ? " is-error" : ""}`}>{message.text}</span>
      ) : null}
    </form>
  );
}

function AiedapTab() {
  return (
    <div className="cy-content-box">
      <SectionTitle title="AIEDAP 심화연수" sub="AIEDAP Advanced Teacher Training · AIEDAP উন্নত শিক্ষক প্রশিক্ষণ" />
      <div className="cy-bd-intro">
        {aiedapIntro.map(row => (
          <p key={row.lang}><span className="cy-bd-lang">{row.lang}</span> {row.text}</p>
        ))}
      </div>
      {aiedapItems.length === 0 ? (
        <div className="cy-empty-box">아직 올린 자료가 없습니다.</div>
      ) : (
        <ul className="cy-board-list">
          {aiedapItems.map(post => (
            <li key={post.id} className="cy-board-item">
              <a className="cy-board-link" href={post.href} target="_blank" rel="noopener noreferrer">
                {post.preview ? (
                  <span className="cy-board-preview">
                    <img src={asset(post.preview.src)} alt={post.preview.alt} loading="lazy" />
                  </span>
                ) : null}
                <span className="cy-board-text">
                  <span className="cy-board-head">
                    <span className="cy-board-category">{post.category}</span>
                    <span className="cy-board-title">{post.title}</span>
                  </span>
                  {post.summary ? <span className="cy-board-summary">{post.summary}</span> : null}
                  <span className="cy-board-date">{post.date}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function BangladeshTab() {
  const [remote, setRemote] = useState<RemoteEntry[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    return subscribeBangladesh(30, setRemote, () => setFailed(true));
  }, []);

  const live = isFirebaseConfigured && !failed;

  return (
    <div className="cy-content-box">
      <div className="cy-section-title">
        <BdFlag /> 방글라데시 코너
        <span className="cy-sub-text">Bangladesh Corner · বাংলাদেশ কর্নার</span>
      </div>
      <div className="cy-bd-intro">
        <p><span className="cy-bd-lang">한국어</span> 방글라데시 선생님들과 인사를 나누는 임시 코너입니다. 영어나 벵골어로 남겨 주세요 — 자동으로 번역됩니다.</p>
        <p><span className="cy-bd-lang">English</span> A temporary corner to greet teachers from Bangladesh. Write in English or Bengali — messages are auto-translated.</p>
        <p><BdFlag className="cy-bd-flag" /> <span className="cy-bd-lang">বাংলা</span> বাংলাদেশের শিক্ষকদের সঙ্গে শুভেচ্ছা বিনিময়ের অস্থায়ী কর্নার। ইংরেজি বা বাংলায় লিখুন — বার্তা স্বয়ংক্রিয়ভাবে অনূদিত হবে।</p>
      </div>

      {!live ? (
        <div className="cy-empty-box">방글라데시 코너는 준비 중입니다. · Coming soon.</div>
      ) : remote === null ? (
        <div className="cy-gb-loading">불러오는 중… · loading…</div>
      ) : remote.length === 0 ? (
        <div className="cy-gb-loading">첫 메시지를 남겨 주세요! · Be the first to write!</div>
      ) : (
        <div className="cy-bd-list">
          {remote.map(entry => (
            <div key={entry.id} className="cy-bd-item">
              <div className="cy-bd-head">
                <b><span className="cy-name-heart" aria-hidden="true">💜</span> {entry.author}</b>{" "}
                <span className="cg-date">({entry.date})</span>
              </div>
              <TranslatedMessage text={entry.text} />
              <OwnerControls coll="bangladesh" id={entry.id} text={entry.text} />
            </div>
          ))}
        </div>
      )}

      {live ? <BangladeshForm /> : null}
    </div>
  );
}

/* 미니홈피 왼쪽 위 방문 수입니다. 들어올 때마다 한 번 기록하고 그 결과를 보여 줍니다.
   Firestore 가 설정되지 않았거나 아직 못 받았으면 숫자 자리를 - 로 둡니다. */
function VisitCounter() {
  const [counts, setCounts] = useState<VisitCounts | null>(null);
  /* 개발 모드에서 효과가 두 번 실행돼 2씩 오르는 것을 막습니다. */
  const sentRef = useRef(false);

  useEffect(() => {
    if (!isCounterEnabled || sentRef.current) return;
    sentRef.current = true;
    recordVisit()
      .then(setCounts)
      .catch(() => setCounts(null));
  }, []);

  const show = (value: number | undefined) =>
    typeof value === "number" ? value.toLocaleString() : "-";

  return (
    <span className="cy-today-count">
      TODAY <span className="text-orange">{show(counts?.today)}</span>
      {" | "}
      TOTAL <span className="text-black">{show(counts?.total)}</span>
    </span>
  );
}

function PhotoTab() {
  const [index, setIndex] = useState(0);
  const total = photos.length;
  const current = photos[index];

  /* 사진을 클릭하면 이전 사진으로 넘어갑니다. (뒤로 넘기기) */
  const goPrev = () => setIndex(i => (i - 1 + total) % total);

  return (
    <div className="cy-content-box">
      <SectionTitle title={profile.photoLabel} sub={`${profile.photoSubtitlePrefix} ${total}컷`} />
      {current && (
        <div className="cy-photo-carousel">
          <button
            type="button"
            className="cy-photo-frame cy-photo-frame-button"
            onClick={goPrev}
            aria-label="이전 사진 보기"
          >
            <img src={asset(current.src)} alt={current.name} loading="lazy" />
          </button>
          <div className="cy-photo-caption">
            <span className="cy-photo-name">{current.name}</span>
            <span className="cy-photo-count">{index + 1} / {total}</span>
          </div>
          {total > 1 && (
            <div className="cy-photo-dots">
              {photos.map((photo, i) => (
                <button
                  key={photo.id}
                  type="button"
                  className={`cy-photo-dot${i === index ? " is-active" : ""}`}
                  onClick={() => setIndex(i)}
                  aria-label={`${i + 1}번째 사진 보기`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function LinkTree() {
  return (
    <SiteEditorProvider>
      <LinkTreeInner />
    </SiteEditorProvider>
  );
}

function LinkTreeInner() {
  const [activeTab, setActiveTab] = useState<TabName>("home");
  const [introSkipped, setIntroSkipped] = useState(false);
  const bgmRef = useRef<BgmHandle>(null);

  /* ?tab=프로필 처럼 탭 딥링크로 들어오면 진입 화면을 건너뜁니다.
     정적 배포에서도 동작하도록 브라우저에서 읽습니다. */
  useEffect(() => {
    const tab = new URLSearchParams(window.location.search).get("tab");
    const found = TABS.find(t => t === tab);
    if (found) {
      setActiveTab(found);
      setIntroSkipped(true);
    }
  }, []);

  /* 인트로가 떠 있는 동안에는 뒤쪽이 스크롤되지 않게 막습니다. */
  useEffect(() => {
    if (introSkipped) return;
    document.body.classList.add("lt-intro-open");
    return () => document.body.classList.remove("lt-intro-open");
  }, [introSkipped]);

  /* 본문을 항상 그려 두고 인트로를 그 위에 덮습니다. (.lt-intro 는 position: fixed 입니다)
     BGM 플레이어가 미리 준비되어 있어야 인트로 클릭 한 번으로 재생이 시작됩니다. */
  return (
    <div className="cy-root">
      <div className="cy-background-pattern"></div>
      <EditBar />

      <div className="cy-book-wrapper">
        <div className="cy-book-outer">

          {/* 바인더 링 */}
          <div className="cy-bindings">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="cy-ring"></div>
            ))}
          </div>

          <div className="cy-book-inner">
            {/* 좌측 패널 */}
            <div className="cy-left-panel">
              <div className="cy-left-header">
                <VisitCounter />
              </div>
              <div className="cy-left-content">
                <div className="cy-today-is">TODAY IS.. <span className="text-orange">맑음 ☀️</span></div>

                <div className="cy-profile-pic">
                  <img src={asset(profile.photo.src)} alt={profile.photo.alt} />
                </div>

                <EditableText
                  as="div"
                  className="cy-intro-text"
                  textKey="introDescription"
                  fallback={profile.introDescription}
                  multiline
                />

                <BgmPlayer ref={bgmRef} />

                <div className="cy-profile-name">
                  <EditableText as="div" className="name-bold" textKey="teacherName" fallback={profile.teacherName} />
                  <EditableText as="div" className="title-sub" textKey="catalogDescription" fallback={profile.catalogDescription} />
                </div>

                <div className="cy-left-dropdown">
                  <select
                    value=""
                    onChange={event => {
                      const target = waveLinks.find(w => w.id === event.target.value);
                      if (target) {
                        window.open(target.href, "_blank", "noopener,noreferrer");
                      }
                    }}
                  >
                    <option value="" disabled>파도타기</option>
                    {waveLinks.map(wave => (
                      <option key={wave.id} value={wave.id}>{wave.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 우측 패널 */}
            <div className="cy-right-panel">
              <div className="cy-right-header">
                <span className="cy-title">{TAB_TITLES[activeTab]}</span>
                <span className="cy-url-box">
                  <span className="cy-url-icon" aria-hidden="true">💜</span>
                  <EditableText as="span" className="cy-url" textKey="displayUrl" fallback={profile.displayUrl} />
                </span>
              </div>

              <div className="cy-right-content">
                {activeTab === "home" && <HomeTab />}
                {activeTab === "profile" && <ProfileTab />}
                {activeTab === "aiedap" && <AiedapTab />}
                {activeTab === "story" && <StoryTab />}
                {activeTab === "board" && <BoardTab />}
                {activeTab === "photo" && <PhotoTab />}
                {activeTab === "guestbook" && <GuestbookTab />}
                {activeTab === "bangladesh" && <BangladeshTab />}
              </div>
            </div>

            {/* 탭 영역 */}
            <div className="cy-tabs">
              {TABS.map(tab => (
                <button
                  key={tab}
                  className={"cy-tab-btn " + (activeTab === tab ? "active" : "")}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === "bangladesh" ? <BdFlag className="cy-tab-flag" /> : null}
                  <span className="cy-tab-line">{NAV_LABELS[tab]}</span>
                </button>
              ))}
            </div>

          </div>
        </div>
        <HeartDeco />
      </div>

      {!introSkipped ? (
        <IntroOverlay
          onBrowse={() => {
            /* 클릭 안에서 재생을 걸어야 브라우저가 소리를 허용합니다. */
            bgmRef.current?.start();
            setIntroSkipped(true);
          }}
        />
      ) : null}
    </div>
  );
}
