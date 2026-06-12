import { useState } from "react"

import ChaoticText from "../ChaoticText"
import ContextTab from "./tabs/ContextTab"
import TodayTab from "./tabs/TodayTab"

const TABS = [
  { id: "context", label: "Contexto" },
  { id: "agenda", label: "Agenda" }
]

export default function Sidebar({
  isOpen,
  onClose,
  activeContext,
  isLoading,
  refreshTrigger
}) {
  const [activeTab, setActiveTab] = useState("context")

  if (!isOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/60 lg:hidden"
        onClick={onClose}
      />

      <div className="top-0 right-0 z-50 flex h-full w-[85vw] flex-col border-l border-app-border bg-app-bg p-6 shadow-2xl transition-transform duration-300 ease-in-out sm:fixed sm:w-100 lg:relative lg:z-0 lg:h-full lg:w-87.5 lg:translate-x-0">
        {isLoading && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-app-bg/70 backdrop-blur-[1px]">
            <span className="animate-pulse text-sm font-medium tracking-wide text-brand-primary">
              <ChaoticText text="Sincronizando..." family="serif" />
            </span>
          </div>
        )}

        <div className="mb-6 flex shrink-0 items-center justify-between border-b border-app-border pb-2">
          <div className="flex gap-4">
            {TABS.map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`border-b-2 pb-2 text-xs font-bold tracking-wider uppercase transition-all outline-none ${
                  activeTab === tab.id
                    ? "border-brand-primary font-semibold text-brand-primary"
                    : "border-transparent text-app-muted hover:text-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar painel"
            className="p-1 text-sm text-app-muted hover:text-gray-300 lg:hidden"
          >
            ✕
          </button>
        </div>

        <div className="min-h-0 flex-1 scrollbar-none overflow-y-auto">
          {activeTab === "context" && (
            <ContextTab activeContext={activeContext} />
          )}
          {activeTab === "agenda" && (
            <TodayTab refreshTrigger={refreshTrigger} />
          )}
        </div>
      </div>
    </>
  )
}
