export const APP_SETTINGS_STORAGE_KEY = "it-passport-ai-settings";

export type AiSettings = {
  apiKey: string;
  model: string;
};

export const defaultAiSettings: AiSettings = {
  apiKey: "",
  model: "gpt-4.1-mini",
};

export function loadAiSettings(): AiSettings {
  if (typeof window === "undefined") {
    return defaultAiSettings;
  }

  try {
    const raw = window.localStorage.getItem(APP_SETTINGS_STORAGE_KEY);
    if (!raw) {
      return defaultAiSettings;
    }

    const parsed = JSON.parse(raw) as Partial<AiSettings>;
    return {
      apiKey: typeof parsed.apiKey === "string" ? parsed.apiKey : defaultAiSettings.apiKey,
      model: typeof parsed.model === "string" && parsed.model.trim().length > 0
        ? parsed.model.trim()
        : defaultAiSettings.model,
    };
  } catch {
    return defaultAiSettings;
  }
}

export function saveAiSettings(settings: AiSettings) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(APP_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}
