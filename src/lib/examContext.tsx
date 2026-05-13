"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Exam, exams } from "./types";

const STORAGE_KEY = "it-passport-current-exam";
const DEFAULT_EXAM: Exam = "it-passport";

type ExamContextValue = {
  exam: Exam;
  setExam: (e: Exam) => void;
  hydrated: boolean;
};

const ExamContext = createContext<ExamContextValue>({
  exam: DEFAULT_EXAM,
  setExam: () => {},
  hydrated: false,
});

export function ExamProvider({ children }: { children: React.ReactNode }) {
  const [exam, setExamState] = useState<Exam>(DEFAULT_EXAM);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored && (exams as string[]).includes(stored)) {
        setExamState(stored as Exam);
      }
    } catch {}
    setHydrated(true);
  }, []);

  const setExam = (e: Exam) => {
    setExamState(e);
    try {
      window.localStorage.setItem(STORAGE_KEY, e);
    } catch {}
  };

  return <ExamContext.Provider value={{ exam, setExam, hydrated }}>{children}</ExamContext.Provider>;
}

export function useExam() {
  return useContext(ExamContext);
}
