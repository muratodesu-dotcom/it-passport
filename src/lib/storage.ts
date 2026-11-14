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

/**
 * Writes and reads the value back. False when the browser refused the write
 * (blocked storage, quota full) or did not keep it, for callers that must not
 * report success they can't confirm.
 */
export function trySet(key: string, value: string): boolean {
  try {
    window.localStorage.setItem(key, value);
    return window.localStorage.getItem(key) === value;
  } catch {
    return false;
  }
}
