import { useEffect, useState } from 'react';

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

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateStyles(
  length: number,
  family: Family | Family[],
  style?: string
): string[] {
  return Array.from({ length }, () => {
    const f = Array.isArray(family) ? pick(family) : family;
    return `font-${f} font-${pick(WEIGHTS)} font-stretch-${pick(STRETCHES)} ${style ?? pick(STYLES)}`;
  });
}

interface KhaoticTextProps {
  text?: string;
  className?: string;
  family?: Family | Family[];
  style?: string;
}

export default function KhaoticText({
  text,
  className = '',
  family = 'display',
  style = '',
}: KhaoticTextProps) {
  const [styles, setStyles] = useState(() =>
    generateStyles(text?.length ?? 0, family, style)
  );

  useEffect(() => {
    if (!text) return;

    const interval = setInterval(() => {
      setStyles(generateStyles(text.length, family, style));
    }, 1500);

    return () => clearInterval(interval);
    // `family` may be a fresh array literal from the caller every render;
    // comparing by identity would restart the interval constantly.
    // Callers pass a stable family choice in practice.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, style]);

  if (!text) return null;

  return (
    <span className={`select-none ${className}`}>
      {text.split('').map((char, index) => {
        if (char === ' ') return <span key={index}>&nbsp;</span>;

        return (
          <span
            key={`${char}-${index}`}
            className={`${styles[index] ?? ''} transition-all duration-500`}
          >
            {char}
          </span>
        );
      })}
    </span>
  );
}
