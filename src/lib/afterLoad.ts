/**
 * Runs `work` `wait` ms after the loaded page has painted, for things a visitor
 * doesn't need first. On a slow phone the first paint lands well after `load`,
 * so this counts from two animation frames later, not from the event. A hidden
 * page paints nothing, so there it counts from the event. Returns a canceller.
 * Browser only.
 */
export function afterLoad(work: () => void, wait = 0): () => void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let frame = 0;
  const run = () => {
    timer = setTimeout(work, wait);
  };
  const start = () => {
    if (document.hidden) run();
    else frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(run);
    });
  };
  if (document.readyState === "complete") start();
  else addEventListener("load", start, { once: true });
  return () => {
    clearTimeout(timer);
    cancelAnimationFrame(frame);
    removeEventListener("load", start);
  };
}
