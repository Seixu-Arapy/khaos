import { useEffect, useRef, useState } from 'react';

type Family = 'display' | 'serif' | 'mono';

// Only 'display' (Roboto Flex Variable) ships a width axis, so
// font-stretch-* is a no-op on 'serif'/'mono'. Italic still shows on all
// three -- real on 'display' (has a slnt axis) and 'mono' (has a real
// ital axis), browser-synthesized ("faux") slant on 'serif', which has
// neither. Chaotic either way, just a narrower range off 'display'.
const WEIGHTS = [
  'thin',
  'extralight',
  'light',
  'normal',
  'medium',
  'semibold',
  'bold',
  'extrabold',
  'black',
];
const STRETCHES = [
  'ultra-condensed',
  'extra-condensed',
  'condensed',
  'semi-condensed',
  'normal',
  'semi-expanded',
  'expanded',
  'extra-expanded',
  'ultra-expanded',
];
// Weighted so italic is the occasional accent, not half of every title —
// a 50/50 split read as constant flicker across pages with several
// KhaoticText titles on screen at once.
const STYLES = ['italic', 'not-italic', 'not-italic', 'not-italic'];

// Per-character restyle interval is randomized in this range, so
// characters drift out of sync with each other instead of the whole
// word flipping in one synchronized batch every tick.
const MIN_DELAY = 900;
const MAX_DELAY = 3000;

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDelay(): number {
  return MIN_DELAY + Math.random() * (MAX_DELAY - MIN_DELAY);
}

function generateStyle(family: Family | Family[], style?: string): string {
  const f = Array.isArray(family) ? pick(family) : family;
  return `font-${f} font-${pick(WEIGHTS)} font-stretch-${pick(STRETCHES)} ${style ?? pick(STYLES)}`;
}

function generateStyles(
  length: number,
  family: Family | Family[],
  style?: string
): string[] {
  return Array.from({ length }, () => generateStyle(family, style));
}

interface KhaoticTextProps {
  text?: string;
  className?: string;
  family?: Family | Family[];
  style?: string;
  // Adds the moving gradient-fill treatment (see .vortex-text-gradient in
  // index.css). Applied per-character, not on the wrapping span --
  // background-image doesn't inherit, so each character's own text box
  // needs the class for background-clip: text to have anything to clip.
  shimmer?: boolean;
}

export default function KhaoticText({
  text,
  className = '',
  family = 'display',
  style = '',
  shimmer = false,
}: KhaoticTextProps) {
  const [styles, setStyles] = useState(() =>
    generateStyles(text?.length ?? 0, family, style)
  );
  // Same identity-vs-content issue as the effect below: callers pass a
  // stable family/style choice in practice, so reading the latest value
  // via a ref (rather than putting it in effect deps) avoids restarting
  // every character's timer whenever an inline array literal re-renders.
  const familyRef = useRef(family);
  const styleRef = useRef(style);

  useEffect(() => {
    familyRef.current = family;
    styleRef.current = style;
  });

  useEffect(() => {
    if (!text) return;

    const timers: number[] = [];

    [...text].forEach((char, index) => {
      if (char === ' ') return;

      const tick = () => {
        setStyles((prev) => {
          const next = [...prev];
          next[index] = generateStyle(familyRef.current, styleRef.current);
          return next;
        });
        timers[index] = window.setTimeout(tick, randomDelay());
      };

      timers[index] = window.setTimeout(tick, randomDelay());
    });

    return () => timers.forEach((t) => clearTimeout(t));
  }, [text]);

  if (!text) return null;

  return (
    <span className={`select-none ${className}`}>
      {text.split('').map((char, index) => {
        if (char === ' ') return <span key={index}>&nbsp;</span>;

        return (
          <span
            key={`${char}-${index}`}
            className={`${styles[index] ?? ''} transition-all duration-500${shimmer ? ' vortex-text-gradient' : ''}`}
          >
            {char}
          </span>
        );
      })}
    </span>
  );
}
