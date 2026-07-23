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
      style={{ lineHeight: 0 }} // Neutralizes line height to ensure perfect geometric centering
    >
      {/* Spin lives on this inner wrapper, not the outer div -- some
          callers also pass animate-pulse via className on the outer div
          (the Vortex hero icon spins and pulses at once), and both would
          collide fighting over the same `animation` property on one
          element. */}
      <span
        className={clsx(
          'flex h-full w-full items-center justify-center',
          fontSize,
          color,
          spin ? 'animate-spin-slow' : ''
        )}
      >
        ✷
      </span>
    </div>
  );
}
