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
  const match = content.match(CONTEXT_PROJECT_REGEX)
  if (!match) return { projectId: null, cleanContent: content }

  return {
    projectId: match[1],
    cleanContent: content.replace(CONTEXT_PROJECT_REGEX, "").trim()
  }
}

async function postChat({ model, messages }) {
  try {
    const response = await api.post("/chat", { model, messages })
    return response.data.response
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

  const handleContextDetected = useCallback(
    content => {
      const { projectId, cleanContent } = parseContextFromContent(content)

      if (projectId) {
        onContextDetected(projectId)
        onTimerTrigger()
        onSidebarOpen(true)
      }

      return cleanContent
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
      const rawContent = await postChat({ model, messages: newMessages })
      const assistantContent = handleContextDetected(rawContent)
      setMessages([
        ...newMessages,
        { role: "assistant", content: assistantContent }
      ])
    } catch (error) {
      const errorMessage = error.message || "Erro desconhecido"

      const errorMessages = [
        ...newMessages,
        { role: "assistant", content: `⚠️ Erro: ${errorMessage}` },
        {
          role: "user",
          content: `O seguinte erro ocorreu ao processar minha última mensagem: ${errorMessage}. O que deu errado?`
        }
      ]

      try {
        const retryContent = await postChat({ model, messages: errorMessages })
        const assistantContent = handleContextDetected(retryContent)
        setMessages([
          ...newMessages,
          { role: "assistant", content: assistantContent }
        ])
      } catch (retryError) {
        console.error("Erro na segunda tentativa de envio:", retryError)
        setMessages([
          ...newMessages,
          {
            role: "assistant",
            content: `❌ Falha crítica persistente: ${errorMessage}`
          }
        ])
      }
    } finally {
      setIsLoading(false)
      onTimerChange()
    }
  }, [input, messages, model, handleContextDetected, onTimerChange])

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

        if (text.startsWith("field:")) {
          const field = JSON.parse(text.replace("field:", ""))
          return (
            <Field
              id={field?.id}
              name={field?.name}
              variant={field?.variant ?? "inline"}
            />
          )
        }
        if (text.startsWith("project:")) {
          const project = JSON.parse(text.replace("project:", ""))
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
          const section = JSON.parse(text.replace("section:", ""))
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
          const task = JSON.parse(text.replace("task:", ""))
          return (
            <Task
              variant={task.variant ?? "inline"}
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
              <div
                className={`max-w-2xl rounded-2xl px-4 py-3 text-base font-thin tracking-wider shadow-sm ${
                  message.role === "user"
                    ? "bg-brand-primary text-gray-100"
                    : "border border-app-card bg-app-surface text-gray-100"
                }`}
              >
                <ReactMarkdown components={markdownComponents}>
                  {message.content}
                </ReactMarkdown>
              </div>
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
