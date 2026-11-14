"use client";

import NextLink from "next/link";
import { useState, useSyncExternalStore, type ComponentProps } from "react";
import { afterLoad } from "@/lib/afterLoad";

// How long after the page has painted links may start fetching the next pages.
const PREFETCH_WAIT = 1500;

type Connection = { saveData?: boolean; effectiveType?: string };
/** Data Saver or a slow connection: pages are fetched only when the visitor heads for a link. */
const scarce = () => {
  const connection = (navigator as Navigator & { connection?: Connection }).connection;
  return Boolean(connection?.saveData) || /2g|3g/.test(connection?.effectiveType ?? "");
};

let loaded = false;
let started = false;
const waiting = new Set<() => void>();
const subscribe = (change: () => void) => {
  waiting.add(change);
  if (!started) {
    started = true;
    if (!scarce()) {
      afterLoad(() => {
        loaded = true;
        waiting.forEach((fn) => fn());
      }, PREFETCH_WAIT);
    }
  }
  return () => {
    waiting.delete(change);
  };
};

type Props = ComponentProps<typeof NextLink> & {
  /** Fetch only when the pointer, a touch or focus reaches the link, never when it scrolls into view. */
  intent?: boolean;
};

/**
 * next/link for this app. Next fetches the page behind every link on screen as
 * the page starts, which competes with the page's own first paint on a phone
 * (the home screen alone links to ~25 routes that share the big question bank).
 * Here prefetching waits until the page has painted, and `intent` links wait
 * for the visitor. `prefetch={false}` still never prefetches.
 * Plain `next/link` is banned by ESLint outside this file.
 */
export default function Link({ intent = false, prefetch, onPointerEnter, onTouchStart, onFocus, ...props }: Props) {
  const ready = useSyncExternalStore(subscribe, () => loaded, () => false);
  const [wanted, setWanted] = useState(false);
  const allowed = wanted || (ready && !intent);
  return (
    <NextLink
      {...props}
      prefetch={prefetch === false || !allowed ? false : prefetch ?? null}
      onPointerEnter={(event) => {
        setWanted(true);
        onPointerEnter?.(event);
      }}
      onTouchStart={(event) => {
        setWanted(true);
        onTouchStart?.(event);
      }}
      onFocus={(event) => {
        setWanted(true);
        onFocus?.(event);
      }}
    />
  );
}
