"use client";

import { usePathname } from "next/navigation";
import Link from "@/components/SiteLink";
import { TRACK_LINKS, useTrack } from "@/lib/track";

// Phone tab bar: the four places people go every day, for the track chosen on
// the home screen. Hidden on computers (the header has the same links) and
// while answering or playing, where the bottom of the screen belongs to the
// answer bar and the game.
const HIDDEN_ON = [/^\/quiz/, /^\/study/, /^\/results/, /^\/games\/.+/];

export const NAV_ITEMS = [
  { key: "home", icon: "🏠", label: "ホーム", match: (p: string) => p === "/" },
  { key: "study", icon: "📖", label: "学習", match: (p: string) => p.startsWith("/study") },
  { key: "quiz", icon: "✏️", label: "クイズ", match: (p: string) => p.startsWith("/quiz") },
  { key: "glossary", icon: "🔤", label: "用語集", match: (p: string) => p.startsWith("/glossary") },
  { key: "history", icon: "📊", label: "履歴", match: (p: string) => p.startsWith("/history") },
] as const;

export function navHref(key: (typeof NAV_ITEMS)[number]["key"], links: (typeof TRACK_LINKS)[keyof typeof TRACK_LINKS]): string {
  if (key === "home") return "/";
  if (key === "history") return "/history";
  return links[key];
}

export default function BottomNav() {
  const pathname = usePathname();
  const track = useTrack();
  if (HIDDEN_ON.some((re) => re.test(pathname))) return null;
  const links = TRACK_LINKS[track];
  return (
    <>
      <div className="h-20 md:hidden" aria-hidden />
      <nav
        aria-label="メインメニュー"
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-[var(--card-border)] bg-[color:color-mix(in_srgb,var(--card)_94%,transparent)] px-1 pt-1.5 backdrop-blur-md md:hidden"
        style={{ paddingBottom: "calc(6px + env(safe-area-inset-bottom))" }}
      >
        {NAV_ITEMS.map((item) => {
          const active = item.match(pathname);
          return (
            <Link
              key={item.key}
              href={navHref(item.key, links)}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl text-[11px] transition-colors ${
                active ? "font-bold text-[var(--primary)]" : "font-medium text-[var(--muted)]"
              }`}
            >
              <span className={`text-xl leading-none ${active ? "" : "opacity-70 grayscale-[.5]"}`} aria-hidden>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
