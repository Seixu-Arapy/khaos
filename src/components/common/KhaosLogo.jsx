import ChaoticText from './ChaoticText';

export function KhaosLogo({ spinning }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`text-copper-400 text-xl leading-none select-none ${spinning ? 'animate-slow' : ''}`}
        aria-hidden="true"
      >
        ✷
      </span>
      <KhaosTitle className="text-base" />
    </div>
  );
}

export function KhaosTitle({ className }) {
  return (
    <ChaoticText
      text="Khaos"
      className={`${className} text-ink-100 tracking-widest capitalize`}
    />
  );
}
