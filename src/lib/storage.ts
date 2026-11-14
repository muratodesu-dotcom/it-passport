// localStorage throws, rather than returning null, when the browser blocks
// site data (Safari with "Block all cookies", some in-app browsers, storage
// quota full). Preferences are conveniences: fall back to defaults instead of
// crashing the page.

export function safeGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function safeSet(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Ignore: the choice still applies for this visit.
  }
}

export function safeRemove(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Ignore.
  }
}
