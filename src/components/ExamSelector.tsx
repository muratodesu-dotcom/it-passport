"use client";

import { useEffect, useRef, useState } from "react";
import { useExam } from "@/lib/examContext";
import { Exam, examLabels, exams } from "@/lib/types";

export default function ExamSelector() {
  const { exam, setExam, hydrated } = useExam();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const choose = (e: Exam) => {
    setExam(e);
    setOpen(false);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 rounded-full border border-[var(--card-border)] bg-[var(--card)] px-3 py-1.5 text-xs font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--card-hover)]"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="text-[var(--muted)]">試験:</span>
        <span suppressHydrationWarning>{hydrated ? examLabels[exam] : examLabels["it-passport"]}</span>
        <svg width="10" height="10" viewBox="0 0 10 10" className={`transition-transform ${open ? "rotate-180" : ""}`}>
          <path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute right-0 mt-2 w-48 rounded-xl border border-[var(--card-border)] bg-[var(--card)] py-1 shadow-lg z-50"
        >
          {exams.map((e) => (
            <li key={e}>
              <button
                role="option"
                aria-selected={e === exam}
                onClick={() => choose(e)}
                className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                  e === exam
                    ? "bg-[var(--option-selected-bg)] text-[var(--primary)] font-medium"
                    : "text-[var(--foreground)] hover:bg-[var(--card-hover)]"
                }`}
              >
                {examLabels[e]}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
