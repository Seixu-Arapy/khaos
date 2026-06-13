import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import ReactMarkdown from "react-markdown"

import AppIcon from "../AppIcon"
import ChaoticText from "../ChaoticText"
import api from "../services/api"
import PriorityBadge from "./badges/PriorityBadge"
import StatusBadge from "./badges/StatusBadge"
import Field from "./entities/Field"
import Project from "./entities/Project"
import Section from "./entities/Section"
import Task from "./entities/Task"

const MODELS = ["claude", "gemini", "deepseek"]
const CONTEXT_PROJECT_REGEX = /\[CONTEXT_PROJECT_ID:\s*(\d+)\]/

function parseContextFromContent(content) {
  if (!content || typeof content !== "string") {
    return { projectId: null, cleanContent: content || "" }
  }

  const match = content.match(CONTEXT_PROJECT_REGEX)
  if (!match) return { projectId: null, cleanContent: content }

  return {
    projectId: match[1],
    cleanContent: content.replace(CONTEXT_PROJECT_REGEX, "").trim()
  }
}

async function postChat({ model, messages }) {
  const sanitizedMessages = messages.map(msg => {
    if (Array.isArray(msg.content)) {
      const textContent = msg.content
        .filter(b => b.type === "text" && b.content)
        .map(b => b.content)
        .join("\n")
      return { ...msg, content: textContent }
    }
    if (typeof msg.content === "object" && msg.content !== null) {
      return { ...msg, content: JSON.stringify(msg.content) }
    }
    return msg
  })

  try {
    // Verified aligned endpoint routing mapped against the Core FastAPI Core router layer
    const response = await api.post("/chat/execution", {
      model,
      messages: sanitizedMessages
    })

    if (response.data && Array.isArray(response.data.blocks)) {
      return response.data.blocks
    }
    if (
      response.data &&
      response.data.blocks &&
      typeof response.data.blocks === "object"
    ) {
      return response.data.blocks.blocks || []
    }
    return []
  } catch (error) {
    if (error.response && error.response.data) {
      const mensagemErro =
        typeof error.response.data === "object"
          ? JSON.stringify(error.response.data)
          : error.response.data
      throw new Error(mensagemErro, { cause: error })
    }
    throw new Error(error.message, { cause: error })
  }
}

export default function Chat({
  onContextDetected,
  onTimerTrigger,
  onSidebarOpen,
  onTimerChange,
  onLoadingChange
}) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [model, setModel] = useState("gemini")
  const [isLoading, setIsLoading] = useState(false)

  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    onLoadingChange(isLoading)
  }, [isLoading, onLoadingChange])

  const processAssistantBlocks = useCallback(
    blocks => {
      if (!Array.isArray(blocks)) return []

      let detectedProjectId = null

      // Map through all blocks to find and sanitize text content
      const sanitizedBlocks = blocks.map(block => {
        if (block.type === "text" && block.content) {
          const { projectId, cleanContent } = parseContextFromContent(
            block.content
          )

          if (projectId) {
            detectedProjectId = projectId
          }

          return { ...block, content: cleanContent }
        }
        return block
      })

      // Trigger side-effects if a context project ID was captured
      if (detectedProjectId) {
        onContextDetected(detectedProjectId)
        onTimerTrigger()
        onSidebarOpen(true)
      }

      return sanitizedBlocks
    },
    [onContextDetected, onTimerTrigger, onSidebarOpen]
  )

  const sendMessage = useCallback(async () => {
    if (!input.trim()) return

    const userMessage = { role: "user", content: input }
    const newMessages = [...messages, userMessage]

    setMessages(newMessages)
    setInput("")
    setIsLoading(true)

    try {
      const blocks = await postChat({ model, messages: newMessages })

      // Fix: The state now receives the sanitized blocks array (without the context tag string)
      const assistantContent = processAssistantBlocks(blocks)

      setMessages([
        ...newMessages,
        { role: "assistant", content: assistantContent }
      ])
    } catch (error) {
      // ... seu bloco de tratamento de erro e retry (catch) permanece idêntico
    } finally {
      setIsLoading(false)
      onTimerChange()
    }
  }, [input, messages, model, processAssistantBlocks, onTimerChange])

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const markdownComponents = useMemo(
    () => ({
      table: props => (
        <table
          className="my-2 w-full border-collapse text-xs sm:text-sm"
          {...props}
        />
      ),
      th: props => (
        <th
          className="border border-app-border bg-app-surface px-3 py-1 text-left font-semibold text-brand-primary"
          {...props}
        />
      ),
      td: props => (
        <td
          className="border border-app-border bg-app-surface/50 px-3 py-1"
          {...props}
        />
      ),
      ul: props => (
        <ul
          className="my-2 list-inside list-disc space-y-1 text-gray-300"
          {...props}
        />
      ),
      ol: props => (
        <ol
          className="my-2 list-inside list-decimal space-y-1 text-gray-300"
          {...props}
        />
      ),
      li: props => <li className="ml-1" {...props} />,
      code: ({ children, ...props }) => {
        const text = String(children).trim()

        const safeJsonParse = raw => {
          try {
            return JSON.parse(raw)
          } catch (e) {
            try {
              const cleaned = raw.replace(/\\"/g, '"').replace(/'/g, '"')
              return JSON.parse(cleaned)
            } catch (innerError) {
              console.error("Erro ao analisar dados do componente:", raw)
              return null
            }
          }
        }

        if (text.startsWith("field:")) {
          const field = safeJsonParse(text.replace("field:", ""))
          return (
            <Field
              id={field?.id}
              name={field?.name}
              variant={field?.variant ?? "inline"}
            />
          )
        }
        if (text.startsWith("project:")) {
          const project = safeJsonParse(text.replace("project:", ""))
          return (
            <Project
              id={project?.id}
              name={project?.name}
              project={project}
              variant={project?.variant ?? "inline"}
            />
          )
        }
        if (text.startsWith("section:")) {
          const section = safeJsonParse(text.replace("section:", ""))
          return (
            <Section
              id={section?.id}
              name={section?.name}
              section={section}
              variant={section?.variant ?? "inline"}
            />
          )
        }
        if (text.startsWith("task:")) {
          const task = safeJsonParse(text.replace("task:", ""))
          return (
            <Task
              variant={task?.variant ?? "inline"}
              task={task}
              id={task?.id}
              name={task?.name}
            />
          )
        }
        if (text.startsWith("status:"))
          return (
            <StatusBadge
              status={text.replace("status:", "").trim()}
              className="mx-0.5 my-0.5"
            />
          )
        if (text.startsWith("priority:"))
          return (
            <PriorityBadge priority={text.replace("priority:", "").trim()} />
          )

        return (
          <code
            className="rounded border border-app-card bg-app-bg px-1.5 py-0.5 font-mono text-xs text-brand-primary"
            {...props}
          >
            {children}
          </code>
        )
      }
    }),
    []
  )

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col bg-app-bg">
      <div className="flex items-center justify-end border-b border-app-border bg-app-bg px-6 py-4">
        <select
          value={model}
          onChange={e => setModel(e.target.value)}
          className="cursor-pointer rounded-lg border border-app-border bg-app-surface px-3 py-1 font-mono text-sm text-gray-200 outline-none"
        >
          {MODELS.map(m => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      <div className="relative flex-1 overflow-hidden">
        <div
          className={`pointer-events-none absolute inset-0 z-0 flex flex-col items-center justify-center transition-all select-none ${
            messages.length > 0 ? "opacity-25" : "opacity-100"
          }`}
        >
          <AppIcon className="text-[196px] leading-none font-black text-transparent" />
          <ChaoticText
            text="Do caos, a ordem."
            family="sans"
            className="bg-linear-0 from-gray-400 via-brand-primary to-gray-500 bg-clip-text text-3xl tracking-widest text-transparent select-none md:text-4xl lg:text-5xl"
          />
        </div>

        <div className="relative z-10 flex h-full flex-col space-y-4 overflow-y-auto px-6 py-4 select-none">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {message.role === "user" ? (
                <div className="max-w-2xl rounded-2xl bg-brand-primary px-4 py-3 text-base font-thin tracking-wider text-gray-100 shadow-sm">
                  <ReactMarkdown components={markdownComponents}>
                    {typeof message.content === "string" ? message.content : ""}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="flex w-full max-w-2xl flex-col gap-3">
                  {Array.isArray(message.content) ? (
                    message.content.map((block, bIndex) => {
                      if (block.type === "internal_timeout") {
                        return (
                          <div key={bIndex} className="flex justify-start">
                            <div className="animate-pulse rounded-2xl border border-red-900/30 bg-app-surface px-4 py-3 text-sm text-red-400">
                              <ChaoticText
                                text="ZzZzZ..."
                                className="gap-0.5 text-red-400/80"
                              />
                            </div>
                          </div>
                        )
                      }

                      if (block.type === "text" && block.content) {
                        return (
                          <div
                            key={bIndex}
                            className="rounded-2xl border border-app-card bg-app-surface px-4 py-3 text-base font-thin tracking-wider text-gray-100 shadow-sm"
                          >
                            <ReactMarkdown components={markdownComponents}>
                              {block.content}
                            </ReactMarkdown>
                          </div>
                        )
                      }

                      if (block.type === "tool_use" && block.name) {
                        return (
                          <div
                            key={bIndex}
                            className="flex items-center gap-2 rounded-xl border border-dashed border-app-border bg-app-bg/40 px-4 py-2 font-mono text-xs text-brand-accent/80"
                          >
                            <span className="animate-spin">⚙️</span>
                            <span>
                              Executando automação:{" "}
                              <strong className="text-gray-200">
                                {block.name}
                              </strong>
                            </span>
                          </div>
                        )
                      }

                      if (block.type === "terminal" && block.content) {
                        try {
                          const parsedTerminal =
                            typeof block.content === "string" &&
                            block.content.startsWith("{")
                              ? JSON.parse(
                                  block.content
                                    .replace(/'/g, '"')
                                    .replace(/None/g, "null")
                                )
                              : null

                          if (
                            parsedTerminal &&
                            parsedTerminal.error === "TimeoutError"
                          ) {
                            return (
                              <div key={bIndex} className="flex justify-start">
                                <div className="rounded-2xl border border-red-900/30 bg-app-surface px-4 py-3 text-sm text-red-400">
                                  <ChaoticText
                                    text="A automação estourou o tempo limite de execução..."
                                    className="gap-0.5 text-red-400/80"
                                    family="serif"
                                  />
                                </div>
                              </div>
                            )
                          }
                        } catch (e) {}

                        return (
                          <div
                            key={bIndex}
                            className="overflow-x-auto rounded-xl border border-gray-800 bg-black/90 p-3 font-mono text-xs text-emerald-400 shadow-inner"
                          >
                            <div className="mb-1 border-b border-gray-900 pb-1 text-[10px] tracking-widest text-gray-500 uppercase">
                              Terminal Output
                            </div>
                            <pre className="whitespace-pre-wrap">
                              {block.content}
                            </pre>
                          </div>
                        )
                      }

                      return null
                    })
                  ) : (
                    <div className="rounded-2xl border border-app-card bg-app-surface px-4 py-3 text-base font-thin tracking-wider text-gray-100 shadow-sm">
                      <ReactMarkdown components={markdownComponents}>
                        {typeof message.content === "string"
                          ? message.content
                          : ""}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="animate-pulse rounded-2xl border border-brand-accent/20 bg-app-surface px-4 py-3 text-sm text-brand-accent">
                <ChaoticText
                  text="Khaos se produzindo..."
                  className="gap-0.5"
                  family="serif"
                />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t border-app-border bg-app-bg px-6 py-4">
        <div className="flex items-end gap-3">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escreva para o Khaos..."
            rows={1}
            className="font-base wider field-sizing-content flex-1 resize-none rounded-xl border border-app-border bg-app-surface px-4 py-3 font-serif text-base font-thin tracking-wider text-gray-100 placeholder-gray-600 transition-colors outline-none focus:border-gray-700"
          />
          <button
            type="button"
            onClick={sendMessage}
            disabled={isLoading}
            className="h-12 w-12 shrink-0 cursor-pointer rounded-full bg-brand-primary text-4xl font-medium transition-colors select-none hover:bg-brand-primary/80 disabled:animate-pulse disabled:bg-brand-accent disabled:opacity-50"
          >
            <AppIcon
              className="from-app-bg! via-app-border! to-app-surface!"
              aria-label="Enviar"
            />
          </button>
        </div>
        <p className="mt-2 text-[10px] font-medium text-app-muted">
          <code>Enter</code> para enviar · <code>Shift</code> +{" "}
          <code>Enter</code> para nova linha
        </p>
      </div>
    </div>
  )
}
