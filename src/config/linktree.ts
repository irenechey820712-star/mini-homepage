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
  miniroom: { src: "/assets/room4.png", alt: "아이링쌤의 데이터실험실 미니룸" },
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
  | { kind: "contact"; items: { label: string; value: string; href: string }[] }
  /* 이미지 한 장입니다. src 는 public/assets/ 기준 경로, href 를 주면 이미지를 링크로 감쌉니다. */
  | { kind: "image"; src: string; alt: string; href?: string; caption?: string };

export type ProfileSection = {
  id: string;
  title: string;
  /* 제목 옆 작은 글씨입니다. 생략하면 제목만 나옵니다. */
  subtitle?: string;
  blocks: ProfileBlock[];
};

export const profileSections: ProfileSection[] = [
  {
    id: "aiedap-card",
    title: "AIEDAP 마스터교원 카드",
    blocks: [
      {
        kind: "image",
        src: "/assets/aiedap-card.png",
        alt: "AIEDAP 마스터교원 프로필 카드",
        href: "https://www.aiedap.or.kr/portfolios/7617",
        caption: "AIEDAP(AI 교육 융합 지원 플랫폼) 포트폴리오 · 눌러서 자세히 보기"
      }
    ]
  },
  {
    id: "intro",
    title: "소개",
    blocks: [
      { kind: "text", lines: ["영어교육 연구자, 데이터 실험랩 운영자, 작가 및 교사"] },
      {
        kind: "contact",
        items: [
          { label: "블로그", value: "blog.naver.com/irenechey", href: "https://blog.naver.com/irenechey" }
        ]
      }
    ]
  },
  {
    id: "works",
    title: "하고 있는 일들",
    blocks: [
      {
        kind: "text",
        lines: [
          "학남고등학교 영어교사 · 공적 분야: 수업 혁신",
          "AI·IB·데이터 리터러시를 융합한 영어 읽기·쓰기 수업 설계와 평가 혁신, 교원 연수·자료 개발, 사례 확산."
        ]
      },
      {
        kind: "list",
        heading: "표창 · 수상",
        items: [
          "부총리 겸 교육부장관 표창 — 인성교육 활성화 (2023)",
          "TOUCH 교사단 우수사례 교육혁신 장려상 — 홍보콘텐츠 부문 (2026)",
          "NE능률 다다익선 공모전 입상 — AI 코스웨어 활용 영미문학읽기 융합수업 (2024)"
        ]
      },
      {
        kind: "list",
        heading: "전국 단위 위촉 · 선도교사",
        items: [
          "AIEDAP 마스터교원 전문성 강화 연수 주강사 (2026)",
          "AIEDAP 마스터교원 — 전국연수 '데이터 과학의 이해' 강의 (2025)",
          "한국교육개발원(KEDI) 교육정책네트워크 교육현장 자문단 (2026)",
          "서·논술형 평가 AI 학습데이터 협력교사 (한국교육과정평가원)",
          "KERIS AI·디지털 선도학교 컨설팅단 · 교육부 마이크로디그리 · TOUCH 교사단 (2026)",
          "글로벌 LEAD 교사단 — 방글라데시 교원 초청·국제교류 (대구창의융합교육원, 2026)",
          "교실혁명 선도교사·강사요원 (2024)"
        ]
      },
      {
        kind: "list",
        heading: "연구 · 집필",
        items: [
          "IB 석사(2026~) · TESOL 석사(2022) — AI 기반 영어 읽기·쓰기 수업 설계 연구",
          "공공데이터 학술대회(KERIS) 논문 — 교육취약성 지수(EVI) 기반 학업성취 유형화·지역 맥락 분석 (2026)",
          "「생성형 AI 시대의 수행평가」·「학습을 설계하는 교사로」 원고 집필 (한국교총)",
          "데이터로 본 지역 맞춤형 기초학력·사교육 대책 연구",
          "G-AID AI융합수업 설계 및 평가자료 개발"
        ]
      },
      {
        kind: "list",
        heading: "수업 혁신 확산",
        items: [
          "전국 4천여 명 교사 융합교육 연구모임 DoRms 참여 · 2027 교육부 융합교육 공동체 운영 예정",
          "방글라데시 교원초청 디지털 세계화 연수 교재 개발",
          "교사 제작 온라인 모의고사 시스템 + 성적분석 대시보드 기반 수업·평가 혁신",
          "영미문학읽기 수업 사례 YBM 교사 리소스북 · 교육부 「수업의 숲」 등록"
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
    id: "canva-materials",
    category: "글",
    title: "나만의 AI 영상 만들기 · Create Your Own AI Video · নিজের AI ভিডিও তৈরি করুন",
    summary: "AI 영상 제작 안내 자료 (Canva) · A Canva guide to making your own AI video · নিজের AI ভিডিও তৈরির ক্যানভা গাইড",
    date: "2026",
    href: "https://canva.link/yuczzd3dcuhzf89"
  },
  {
    id: "english-challenge-s2",
    category: "앱",
    title: "아이린쌤 영어 챌린지 시즌 2 · Irene's English Challenge S2 · আইরিন ম্যামের ইংরেজি চ্যালেঞ্জ সিজন ২",
    summary: "인터랙티브 영어 학습 챌린지 · An interactive English learning challenge · একটি ইন্টারেক্টিভ ইংরেজি শেখার চ্যালেঞ্জ",
    date: "2026",
    href: "https://script.google.com/macros/s/AKfycbwltlu2OSnlw6sa_7y1QwKo2vUbN51uL6K2U1jdHDjEfe3XMQiRh60IHI6KbHuAxOrZrA/exec"
  },
  {
    id: "fan-story-mini-zine",
    category: "앱",
    title: "마이 팬 스토리 미니진 · My Fan Story Mini Zine · মাই ফ্যান স্টোরি মিনি জিন",
    summary: "나만의 팬픽을 미니 진(zine)으로 만들기 · Turn your fan fiction into a mini zine · নিজের ফ্যান ফিকশনকে মিনি জিনে রূপ দিন",
    date: "2026",
    href: "https://script.google.com/macros/s/AKfycbwiKYywdYYo52BGJ8qnUTii7VkKjOrMYC_hr3QiEkPAJM7ls2A4ITKTDF9TOM5GfnRU/exec"
  },
  {
    id: "first-fishing-ai",
    category: "앱",
    title: "첫낚시 AI · First Fishing AI · প্রথম মাছ ধরা AI",
    summary: "공공데이터 기반 초보자 바다낚시 안전 출조 안내 · Public-data-based safe sea-fishing guide for beginners · সরকারি তথ্যভিত্তিক নতুনদের নিরাপদ সমুদ্রে মাছ ধরার গাইড",
    date: "2026",
    href: "https://irenechey820712-star.github.io/myfirstfishing/"
  },
  {
    id: "ai-creative-mission",
    category: "앱",
    title: "AI 창작 미션 — 방글라데시 교원 연수 · AI Creative Mission — Bangladesh Teacher Training · AI ক্রিয়েটিভ মিশন — বাংলাদেশ শিক্ষক প্রশিক্ষণ",
    summary: "캐릭터 → 포스터 → 스토리보드 → 30초 영상 제작 플랫폼 · Character → poster → storyboard → 30-second video platform · চরিত্র → পোস্টার → স্টোরিবোর্ড → ৩০ সেকেন্ডের ভিডিও প্ল্যাটফর্ম",
    date: "2026.08",
    href: "https://irenechey820712-star.github.io/ai-creative-mission/"
  },
  {
    id: "english-teacher-harness-lab",
    category: "앱",
    title: "영어교사 하네스 엔지니어링 랩 · English Teacher Harness Engineering Lab · ইংরেজি শিক্ষকদের হারনেস ইঞ্জিনিয়ারিং ল্যাব",
    summary: "단순 프롬프트를 넘어 평가·피드백·복구가 내장된 AI 시스템을 설계하는 교사 훈련 앱 · A training app for teachers to build reliable AI systems with built-in evaluation, feedback, and recovery beyond single prompts · একক প্রম্পটের বাইরে গিয়ে মূল্যায়ন, ফিডব্যাক ও পুনরুদ্ধারসহ নির্ভরযোগ্য AI সিস্টেম তৈরিতে শিক্ষকদের প্রশিক্ষণ অ্যাপ",
    date: "2026",
    href: "https://irenechey820712-star.github.io/english-teacher-harness-lab/"
  },
  {
    id: "english-terminology-deck",
    category: "앱",
    title: "AI×영어교육 전문용어 덱 · AI × English Education Terminology Deck · AI × ইংরেজি শিক্ষা পরিভাষা ডেক",
    summary: "AI와 영어교육 전문용어를 카드로 익히는 플래시카드 덱 · A flashcard deck for learning AI and English-education terminology · AI ও ইংরেজি শিক্ষার পরিভাষা শেখার ফ্ল্যাশকার্ড ডেক",
    date: "2026",
    href: "https://irenechey820712-star.github.io/english-terminology-deck/"
  },
  {
    id: "efl-reading-graph",
    category: "앱",
    title: "EFL 리딩 그래프 · EFL Reading Graph · EFL রিডিং গ্রাফ",
    summary: "영어 지문에서 문제를 만들고 근거를 찾아 답을 검증하는 읽기 학습 도구 · A reading tool that generates questions from English passages, finds textual evidence, and verifies answers · ইংরেজি অনুচ্ছেদ থেকে প্রশ্ন তৈরি করে, পাঠ্যপ্রমাণ খুঁজে উত্তর যাচাই করার রিডিং টুল",
    date: "2026",
    href: "https://irenechey820712-star.github.io/efl-reading-graph/"
  }
];

/* 사진첩 탭입니다. */
export type PhotoItem = {
  id: string;
  name: string;
  src: string;
};

export const photos: PhotoItem[] = [
  { id: "photo-1", name: "아이링쌤의 데이터실험실", src: "/assets/photo.png" },
  { id: "photo-2", name: "아이링쌤의 데이터실험실 2", src: "/assets/photo2.png" }
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
  { id: "pinball", title: "Pinball", artist: "리센느", videoId: "B8JJ8RNM-60" },
  { id: "newjeans-playlist", title: "뉴진스 플레이리스트", artist: "NewJeans", videoId: "f1WuPpDA5fo" },
  { id: "tuide-playlist", title: "튜이드 노래모음 (신곡 포함)", artist: "TUIDE", videoId: "krcxcaucdaY" },
  { id: "rescene-playlist", title: "리센느 노래모음 (신곡 포함)", artist: "RESCENE", videoId: "GkI610V-7mo" }
];

/* 홈 탭 아래쪽 한마디입니다. */
export type GuestbookEntry = {
  id: number;
  author: string;
  text: string;
  date: string;
};

export const guestbook: GuestbookEntry[] = [];
