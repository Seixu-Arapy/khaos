import clsx from 'clsx';

interface KhaosIconProps {
  /** Icon container size (e.g., 'h-6 w-6', 'h-13 w-13' or custom Tailwind utility classes) */
  size?: string;
  /** Asterisk character size (Tailwind text classes, e.g., 'text-lg', 'text-2xl') */
  fontSize?: string;
  /** Color of the asterisk character (e.g., 'text-eros-400') */
  color?: string;
  /** Background color of the circle (e.g., 'bg-nyx-700', 'bg-eros-500/15') */
  bgColor?: string;
  /** Determines whether the icon should rotate continuously */
  spin?: boolean;
  /** Extra classes */
  className?: string;
}

export default function KhaosIcon({
  size = 'h-7 w-7',
  fontSize = 'text-xl',
  color = 'text-eros-400',
  bgColor = 'bg-transparent',
  spin = false,
  className = '',
}: KhaosIconProps) {
  return (
    <div
      className={clsx(
        'flex shrink-0 items-center justify-center rounded-full select-none',
        size,
        bgColor,
        className
      )}
    >
      {/* Spin lives on this inner wrapper, not the outer div -- some
          callers also pass animate-pulse via className on the outer div
          (the Vortex hero icon spins and pulses at once), and both would
          collide fighting over the same `animation` property on one
          element. */}
      <span
        className={clsx(
          'flex items-center justify-center',
          fontSize,
          color,
          spin ? 'animate-spin-slow' : ''
        )}
      >
        {/* Same "✷" glyph as ever, but drawn via SVG text with explicit
            anchor points instead of plain inline text. A font glyph's
            baseline-based box (how CSS/flex centers text) isn't the same
            as its visual ink center -- textAnchor="middle" +
            dominantBaseline="central" pin the actual rendered shape to
            the SVG's own (50,50) coordinate, so rotating this 1em-square
            SVG (whose CSS transform-origin defaults to its true center)
            rotates around the glyph's real visual center. */}
        <svg viewBox="0 0 100 100" className="h-[1em] w-[1em]" aria-hidden="true">
          <text
            x="50"
            y="50"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="90"
            fill="currentColor"
          >
            ✷
          </text>
        </svg>
      </span>
    </div>
  );
}
