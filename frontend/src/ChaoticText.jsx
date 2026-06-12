import { useEffect, useState } from "react"

const FAMILIES = ["sans", "serif", "mono"]
const WEIGHTS = [
  "thin",
  "extralight",
  "light",
  "normal",
  "medium",
  "semibold",
  "bold",
  "extrabold",
  "black"
]
const STRETCHES = [
  "ultra-condensed",
  "extra-condensed",
  "condensed",
  "semi-condensed",
  "normal",
  "semi-expanded",
  "expanded",
  "extra-expanded",
  "ultra-expanded"
]

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function generateStyles(length, family) {
  return Array.from(
    { length },
    () =>
      `font-${family ?? pick(FAMILIES)} font-${pick(WEIGHTS)} font-stretch-${pick(STRETCHES)}`
  )
}

export default function ChaoticText({ text, className = "", family = "" }) {
  const [styles, setStyles] = useState(() =>
    generateStyles(text?.length ?? 0, family)
  )

  useEffect(() => {
    if (!text) return

    const interval = setInterval(() => {
      setStyles(generateStyles(text.length, family))
    }, 1500)

    return () => clearInterval(interval)
  }, [text, family])

  if (!text) return null

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      {text.split("").map((char, index) => {
        if (char === " ") return <span key={index} className="w-2" />

        return (
          <span
            key={`${char}-${index}`}
            className={`${styles[index] ?? ""} inline-block text-center transition-all duration-500`}
          >
            {char}
          </span>
        )
      })}
    </div>
  )
}
