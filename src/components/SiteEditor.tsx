"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import {
  isFirebaseConfigured,
  OWNER_UID,
  saveSiteContent,
  signInOwner,
  signOutOwner,
  watchAuth,
  watchSiteContent,
  type OwnerState,
  type SiteContent
} from "@/lib/firebase";

type EditorCtx = {
  ready: boolean;
  content: SiteContent;
  owner: OwnerState;
  editing: boolean;
  setEditing: (v: boolean) => void;
  text: (key: string, fallback: string) => string;
  save: (key: string, value: string) => Promise<void>;
  status: "" | "saving" | "saved" | "error";
};

const Ctx = createContext<EditorCtx | null>(null);

export function SiteEditorProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<SiteContent>({});
  const [owner, setOwner] = useState<OwnerState>(null);
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState<EditorCtx["status"]>("");

  useEffect(() => watchSiteContent(setContent), []);
  useEffect(() => watchAuth(setOwner), []);
  useEffect(() => {
    if (!owner?.isOwner) setEditing(false);
  }, [owner]);

  const text = useCallback(
    (key: string, fallback: string) => {
      const v = content[key];
      return typeof v === "string" && v.length > 0 ? v : fallback;
    },
    [content]
  );

  const save = useCallback(async (key: string, value: string) => {
    setStatus("saving");
    try {
      await saveSiteContent({ [key]: value });
      setStatus("saved");
      setTimeout(() => setStatus(""), 1500);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus(""), 2500);
    }
  }, []);

  const value = useMemo<EditorCtx>(
    () => ({
      ready: isFirebaseConfigured,
      content,
      owner,
      editing,
      setEditing,
      text,
      save,
      status
    }),
    [content, owner, editing, text, save, status]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSiteEditor() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSiteEditor must be used inside SiteEditorProvider");
  return ctx;
}

/* 편집 모드일 때만 입력창으로 바뀌는 텍스트입니다. */
export function EditableText({
  textKey,
  fallback,
  multiline = false,
  className,
  as: Tag = "span"
}: {
  textKey: string;
  fallback: string;
  multiline?: boolean;
  className?: string;
  as?: React.ElementType;
}) {
  const { editing, owner, text, save } = useSiteEditor();
  const effective = text(textKey, fallback);
  const [draft, setDraft] = useState(effective);

  useEffect(() => {
    setDraft(effective);
  }, [effective]);

  if (!editing || !owner?.isOwner) {
    return <Tag className={className}>{effective}</Tag>;
  }

  const commit = () => {
    if (draft.trim() !== effective) save(textKey, draft.trim());
  };

  if (multiline) {
    return (
      <textarea
        className={`cy-edit-field ${className ?? ""}`}
        value={draft}
        rows={2}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
      />
    );
  }
  return (
    <input
      className={`cy-edit-field ${className ?? ""}`}
      value={draft}
      onChange={e => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={e => {
        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
      }}
    />
  );
}

/* 왼쪽 아래 고정 편집바입니다. */
export function EditBar() {
  const { ready, owner, editing, setEditing, status } = useSiteEditor();
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!ready) return null;

  const doSignIn = async () => {
    setBusy(true);
    try {
      await signInOwner();
    } catch {
      /* 팝업 닫힘 등은 조용히 무시 */
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="cy-editbar">
      {status === "saving" && <span className="cy-editbar-status">저장 중…</span>}
      {status === "saved" && <span className="cy-editbar-status is-ok">저장됨 ✓</span>}
      {status === "error" && <span className="cy-editbar-status is-err">저장 실패</span>}

      {!owner && (
        <button type="button" className="cy-editbar-btn" onClick={doSignIn} disabled={busy}>
          🔑 관리자 로그인
        </button>
      )}

      {owner && !owner.isOwner && (
        <>
          <span className="cy-editbar-uid">
            소유자 아님 · 내 UID:&nbsp;
            <code>{owner.uid}</code>
            <button
              type="button"
              className="cy-editbar-mini"
              onClick={() => {
                navigator.clipboard?.writeText(owner.uid);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
            >
              {copied ? "복사됨" : "복사"}
            </button>
            {!OWNER_UID && <em>&nbsp;(이 값을 site.ts 의 OWNER_UID 에 넣고 배포)</em>}
          </span>
          <button type="button" className="cy-editbar-mini" onClick={() => signOutOwner()}>
            로그아웃
          </button>
        </>
      )}

      {owner?.isOwner && (
        <>
          <button
            type="button"
            className={`cy-editbar-btn ${editing ? "is-on" : ""}`}
            onClick={() => setEditing(!editing)}
          >
            {editing ? "✅ 편집 완료" : "✏️ 편집"}
          </button>
          <button type="button" className="cy-editbar-mini" onClick={() => signOutOwner()}>
            로그아웃
          </button>
        </>
      )}
    </div>
  );
}
