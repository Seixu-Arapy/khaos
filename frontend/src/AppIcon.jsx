export default function AppIcon({ className = "" }) {
  return (
    <span
      className={`animate-[shift_20s_ease-in-out_infinite] bg-radial-[at_var(--pos)] from-brand-accent via-brand-danger via-35% to-orange-950 to-70% bg-clip-text text-transparent ${className}`}
      style={{
        "--pos": "20% 30%"
      }}
    >
      ✷
    </span>
  )
}
