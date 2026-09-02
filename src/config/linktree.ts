export const profile = {
  teacherName: "아이링쌤의 데이터실험실",
  title: "아이링쌤의 데이터실험실",
  introTitle: "아이링쌤의 데이터실험실",
  introDescription: "디지털 AI로 영어를 실험하는 교사 아이링쌤",
  catalogTitle: "미니홈피",
  catalogDescription: "영어 · 데이터 · AI 수업 실험실",
  /* 왼쪽 프로필 사진입니다. public/assets/ 안에 파일을 넣고 경로를 적으세요. */
  photo: { src: "/assets/profile.png", alt: "아이링쌤 프로필" },
  /* 홈 탭 위쪽 미니룸 이미지입니다. public/assets/ 안에 파일을 넣고 경로를 적으세요. */
  miniroom: { src: "/assets/rooms2.png", alt: "아이링쌤의 데이터실험실 미니룸" },
  /* 아래는 탭 이름표입니다. 나만의 이름으로 바꿔도 되고, 안 바꾸면 기본값 그대로 나옵니다. */
  storyLabel: "연재물",
  boardLabel: "게시판",
  boardSubtitle: "앱과 활동 기록",
  boardEmptyText: "아직 올린 글이 없습니다.",
  photoLabel: "사진첩",
  photoSubtitlePrefix: "사진",
  /* 오른쪽 위, 옛날 싸이월드 주소창을 흉내 낸 문구입니다. */
  displayUrl: "ilring.lab"
};

/* 프로필 탭에 들어가는 소개 글입니다. 문구만 바꿔서 쓰세요. */
export type ProfileBlock =
  | { kind: "text"; lines: string[] }
  | { kind: "list"; heading: string; items: string[] }
  | { kind: "contact"; items: { label: string; value: string; href: string }[] };

export type ProfileSection = {
  id: string;
  title: string;
  /* 제목 옆 작은 글씨입니다. 생략하면 제목만 나옵니다. */
  subtitle?: string;
  blocks: ProfileBlock[];
};

export const profileSections: ProfileSection[] = [
  {
    id: "intro",
    title: "소개",
    blocks: [
      { kind: "text", lines: ["영어교육 연구자, 데이터 실험랩 운영자, 작가 및 교사"] }
    ]
  },
  {
    id: "works",
    title: "하고 있는 일들",
    blocks: [
      {
        kind: "list",
        heading: "연구 · 집필 · 개발",
        items: [
          "성적 분석 대시보드를 활용한 영어 수업·평가 혁신 사례 연구 (AI·디지털 수업평가 활용 지원단)",
          "「생성형 AI 시대의 수행평가, 무엇을 어떻게 평가할 것인가」 원고 집필 (한국교총)",
          "데이터로 본 지역 맞춤형 기초학력·사교육 대책 연구",
          "「디지털 도구를 잘 쓰는 교사에서 학습을 설계하는 교사로」 교원 전문성·진로 개발 가이드 집필",
          "방글라데시 교원초청 디지털 세계화 연수 교재 개발",
          "교육 공공데이터 학술대회 논문 발표"
        ]
      }
    ]
  }
];

/* 미요툰 회차는 src/config/miyotoon.ts 에 있습니다. */
export { episodes, type Episode } from "./miyotoon";

/* 미요앱 탭입니다. 앱과 게시글 링크를 여기에 추가하세요.
   preview 는 화면 미리보기 이미지입니다. public/assets/apps 에 넣고 경로를 적으세요.
   생략하면 썸네일 없이 제목만 나옵니다. */
export type BoardPost = {
  id: string;
  category: "앱" | "글";
  title: string;
  summary?: string;
  date: string;
  href: string;
  preview?: { src: string; alt: string };
};

export const boardPosts: BoardPost[] = [
  {
    id: "english-challenge-s2",
    category: "앱",
    title: "아이린쌤 영어 챌린지 Season 2",
    summary: "한국인 학습자를 위한 인터랙티브 영어 학습 챌린지 (Google Apps Script 웹앱)",
    date: "2026",
    href: "https://script.google.com/macros/s/AKfycbwltlu2OSnlw6sa_7y1QwKo2vUbN51uL6K2U1jdHDjEfe3XMQiRh60IHI6KbHuAxOrZrA/exec"
  },
  {
    id: "fan-story-mini-zine",
    category: "앱",
    title: "My Fan Story Mini Zine",
    summary: "나만의 팬픽 이야기를 미니 진(zine) 형식으로 만들고 공유하는 웹앱",
    date: "2026",
    href: "https://script.google.com/macros/s/AKfycbwiKYywdYYo52BGJ8qnUTii7VkKjOrMYC_hr3QiEkPAJM7ls2A4ITKTDF9TOM5GfnRU/exec"
  },
  {
    id: "first-fishing-ai",
    category: "앱",
    title: "첫낚시 AI",
    summary: "공공데이터 기반 초보자 바다낚시 안전 출조 안내 서비스",
    date: "2026",
    href: "https://irenechey820712-star.github.io/myfirstfishing/"
  },
  {
    id: "ai-creative-mission",
    category: "앱",
    title: "AI Creative Mission — 방글라데시 교원 연수 웹앱",
    summary: "캐릭터 시트 → 포스터 → 스토리보드 → 30초 영상까지 잇는 AI 창작 미션 플랫폼",
    date: "2026.08",
    href: "https://irenechey820712-star.github.io/ai-creative-mission/"
  }
];

/* 사진첩 탭입니다. */
export type PhotoItem = {
  id: string;
  name: string;
  src: string;
};

export const photos: PhotoItem[] = [
  { id: "photo-1", name: "아이링쌤의 데이터실험실", src: "/assets/photo.png" }
];

/* 왼쪽 아래 파도타기 목록입니다.
   고정 규칙: 첫 번째 항목은 반드시 "도름스 커뮤니티 나의 활동" 링크입니다. 지우지 마세요. */
export type WaveLink = {
  id: string;
  label: string;
  href: string;
};

export const waveLinks: WaveLink[] = [
  { id: "dorms-activity", label: "도름스 커뮤니티 나의 활동", href: "https://irenechey.vercel.app/" },
  { id: "meyo-lab", label: "미요Lab 미니홈피", href: "https://pcallpang.github.io/meyo-lab/" },
  { id: "n-lifescience", label: "n-lifescience 미니홈피", href: "https://n-lifescience.github.io/mini-homepage/" },
  { id: "ygywam", label: "ygywam 미니홈피", href: "https://ygywam.github.io/mini-homepage/" },
  { id: "sungandi", label: "sungandi 미니홈피", href: "https://sungandi86-max.github.io/sungandi-mini-homepage/" }
];

/* 미니홈피 BGM 입니다. 유튜브 영상을 음원으로 씁니다.
   videoId 는 https://www.youtube.com/watch?v=abcd1234XYZ 에서 v= 뒤에 오는 값입니다.
   배열을 비우면 플레이어가 아예 표시되지 않습니다.

   여러 곡이 이어진 플레이리스트 영상이라면, 같은 videoId 를 쓰면서 startAt 에
   각 곡이 시작하는 지점을 초 단위로 적으세요. 제목을 누르면 그 지점부터 재생됩니다.
   startAt 은 secondsAt("3:21") 처럼 적으면 편합니다. */
export type BgmTrack = {
  id: string;
  title: string;
  artist?: string;
  videoId: string;
  /* 영상 안에서 이 곡이 시작하는 지점입니다. 초 단위이고, 생략하면 처음부터입니다. */
  startAt?: number;
};

/* "3:21" 이나 "1:02:30" 을 초로 바꿔 줍니다. */
export function secondsAt(timestamp: string): number {
  return timestamp
    .split(":")
    .map(Number)
    .reduce((total, part) => total * 60 + part, 0);
}

export const bgmTracks: BgmTrack[] = [
  { id: "pinball", title: "Pinball", artist: "리센느", videoId: "B8JJ8RNM-60" }
];

/* 홈 탭 아래쪽 한마디입니다. */
export type GuestbookEntry = {
  id: number;
  author: string;
  text: string;
  date: string;
};

export const guestbook: GuestbookEntry[] = [];
