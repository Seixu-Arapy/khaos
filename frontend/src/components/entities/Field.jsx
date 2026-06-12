import { Square3Stack3DIcon } from "@heroicons/react/24/outline"

import { FIELDS_CONFIG } from "../../config/fields.config"

function getConfig(name) {
  return (
    FIELDS_CONFIG[name] ?? {
      icon: Square3Stack3DIcon,
      classes: {
        border: "border-gray-500/20",
        bg: "bg-gray-500/10",
        text: "text-gray-400",
        muted: "text-gray-400/60"
      }
    }
  )
}

export default function Field({
  id,
  name,
  variant = "inline",
  className = ""
}) {
  const { icon: Icon, classes: c } = getConfig(name)

  if (variant === "icon") {
    return (
      <span
        title={name}
        className={`inline-flex items-center justify-center rounded border ${c.border} ${c.bg} p-1 ${className}`}
      >
        <Icon className={`h-3.5 w-3.5 ${c.text}`} />
      </span>
    )
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border ${c.border} ${c.bg} px-1.5 py-0.5 text-[11px] tracking-wider ${c.text} align-middle select-all ${className}`}
    >
      <span
        className={`inline-flex items-center gap-1 border-r ${c.border} ${c.muted}`}
      >
        <Icon className="h-3.5 w-3.5 stroke-1" />
        {id && (
          <span className="mr-1 font-mono text-[10px] font-bold">{id}</span>
        )}
      </span>
      {name && (
        <span className="font-sans font-extrabold tracking-[0.2em] uppercase">
          {name}
        </span>
      )}
    </span>
  )
}
