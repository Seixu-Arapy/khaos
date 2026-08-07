// Fade curve for settled (done/cancelled) tasks inside an infinite section.
// Keeps the normal 0.38 dim for the first few days, then linearly fades
// toward invisible, at which point the task is hidden entirely — so an
// ongoing/never-ending section doesn't accumulate settled items forever.
const DIM_OPACITY = 0.38;
const FADE_START_DAYS = 3;
const HIDE_AFTER_DAYS = 14;

// null return means "hide this task".
export function infiniteFadeOpacity(daysSinceSettled: number): number | null {
  if (daysSinceSettled < FADE_START_DAYS) return DIM_OPACITY;
  if (daysSinceSettled >= HIDE_AFTER_DAYS) return null;
  const progress =
    (daysSinceSettled - FADE_START_DAYS) / (HIDE_AFTER_DAYS - FADE_START_DAYS);
  return DIM_OPACITY * (1 - progress);
}

export function daysSince(isoDate: string): number {
  return (Date.now() - new Date(isoDate).getTime()) / (1000 * 60 * 60 * 24);
}
