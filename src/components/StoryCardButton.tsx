import { useEffect, useRef, useState } from "react";
import type { ClubPlayer } from "../data/playerDirectory";
import type { PlayerStats } from "../data/playerStats";
import { useLang, useT } from "../i18n/lang";
import { profile as dict } from "../i18n/profile";
import { drawStoryCard } from "./storyCard";
import { storyCardData } from "./storyCardData";
import "./StoryCardButton.css";

/** "Story card" button: draws a 1080×1920 picture in the browser, shows it, and lets the player save or share it. */
export default function StoryCardButton({ player, stats }: { player: ClubPlayer; stats: PlayerStats | undefined }) {
  const t = useT(dict).story;
  const { lang } = useLang();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [state, setState] = useState<{ status: "idle" | "drawing" | "failed" } | { status: "ready"; url: string; blob: Blob }>({
    status: "idle",
  });
  const fileName = `mirage-${player.slug}.png`;

  // Free the picture's memory when it is replaced or the page closes.
  useEffect(() => {
    const url = state.status === "ready" ? state.url : null;
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [state]);

  async function open() {
    dialogRef.current?.showModal();
    setState({ status: "drawing" });
    try {
      const canvas = document.createElement("canvas");
      await drawStoryCard(canvas, storyCardData(player, stats, lang));
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) throw new Error("empty");
      setState({ status: "ready", url: URL.createObjectURL(blob), blob });
    } catch {
      setState({ status: "failed" });
    }
  }

  const file = state.status === "ready" ? new File([state.blob], fileName, { type: "image/png" }) : null;
  const canShare = Boolean(file && typeof navigator !== "undefined" && navigator.canShare?.({ files: [file] }));

  return (
    <>
      <button type="button" className="page__btn story__open" onClick={open}>
        {t.button}
      </button>
      <dialog className="story" ref={dialogRef} aria-labelledby="story-title" onClose={() => setState({ status: "idle" })}>
        <div className="story__inner">
          <h2 className="story__title" id="story-title">
            {t.title}
          </h2>
          <div className="story__preview">
            {state.status === "ready" ? (
              <img src={state.url} alt={`${player.nick} — ${t.title}`} width={1080} height={1920} />
            ) : (
              <p role="status">{state.status === "failed" ? t.failed : t.preparing}</p>
            )}
          </div>
          <div className="page__actions story__actions">
            {state.status === "ready" && (
              <a className="page__btn page__btn--primary" href={state.url} download={fileName}>
                {t.download} <span aria-hidden="true">↓</span>
              </a>
            )}
            {canShare && file && (
              <button
                type="button"
                className="page__btn"
                onClick={() => navigator.share({ files: [file] }).catch(() => undefined)}
              >
                {t.share}
              </button>
            )}
            <button type="button" className="page__btn" onClick={() => dialogRef.current?.close()}>
              {t.close}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
