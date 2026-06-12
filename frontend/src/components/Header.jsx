import { Bars2Icon, XMarkIcon } from "@heroicons/react/16/solid"

import AppIcon from "../AppIcon"
import ChaoticText from "../ChaoticText"
import Timer from "./Timer"

export default function Header({
  onToggleSidebar,
  isSidebarOpen,
  isChatLoading,
  activeTimer
}) {
  return (
    <header className="z-20 flex h-14 shrink-0 items-center justify-between gap-2 border-b border-app-border bg-app-surface px-6 select-none">
      <div className="flex flex-1 items-center gap-2">
        <ChaoticText
          text="Khaos"
          className="w-20 justify-around text-xl text-brand-primary uppercase"
        />
        <span
          aria-hidden="true"
          className={`flex items-center justify-center text-lg ${
            isChatLoading ? "animate-spin" : ""
          }`}
        >
          <AppIcon />
        </span>
        <span className="font-mono text-xs font-medium text-app-muted">
          v1.0.0
        </span>
      </div>

      <div className="flex items-center gap-4">
        <Timer activeTimer={activeTimer} />
      </div>

      <button
        type="button"
        onClick={onToggleSidebar}
        aria-label={
          isSidebarOpen
            ? "Ocultar painel utilitário"
            : "Abrir painel utilitário"
        }
        aria-expanded={isSidebarOpen}
        className={`flex h-7.5 w-7.5 cursor-pointer items-center justify-center rounded-lg border p-0 text-base font-medium transition-all outline-none ${
          isSidebarOpen
            ? "border-brand-primary/30 bg-brand-primary/10 text-brand-primary shadow-inner"
            : "border-app-border bg-app-surface text-app-muted hover:border-gray-700 hover:bg-app-card hover:text-gray-200"
        }`}
      >
        {isSidebarOpen ? (
          <XMarkIcon className="h-3.5 w-3.5" />
        ) : (
          <Bars2Icon className="h-3.5 w-3.5" />
        )}
      </button>
    </header>
  )
}
