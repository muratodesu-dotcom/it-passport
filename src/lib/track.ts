"use client";

// The track the learner last chose on the home screen. The home tabs set it,
// and the bottom bar and header links follow it, so "クイズ" opens the quiz
// for the track you're studying.
import { useSyncExternalStore } from "react";
import type { ExamType } from "./types";
import { safeGet, safeSet } from "./storage";

const KEY = "it-passport-home-track";
const EVENT = "home-track-change";

function read(): ExamType {
  const v = safeGet(KEY);
  return v === "chizai" || v === "dev" ? v : "it-passport";
}

export function setTrack(track: ExamType): void {
  safeSet(KEY, track);
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** The remembered track; ITパスポート on the server and first paint. */
export function useTrack(): ExamType {
  return useSyncExternalStore(subscribe, read, () => "it-passport");
}

/** Where the shared navigation goes for each track. */
export const TRACK_LINKS: Record<ExamType, { study: string; quiz: string; glossary: string }> = {
  "it-passport": { study: "/study?category=strategy", quiz: "/quiz?category=all", glossary: "/glossary?exam=it-passport" },
  chizai: { study: "/study?exam=chizai&category=patent", quiz: "/quiz?mode=practice&exam=chizai&field=all", glossary: "/glossary?exam=chizai" },
  dev: { study: "/study?exam=dev&category=git", quiz: "/quiz?exam=dev&field=all", glossary: "/glossary?exam=dev" },
};
