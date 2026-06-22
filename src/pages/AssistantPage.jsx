import { useEffect, useRef, useState } from 'react'
import { Bot, Send, Trash2, ShieldAlert, User, Loader2 } from 'lucide-react'
import clsx from 'clsx'
import { useChatAgent } from '../hooks/useChatAgent'
import { describeAction } from '../lib/gemini/tools'
import { Button } from '../components/common/ui'

function MessageBubble({ message }) {
  const isUser = message.role === 'user'
  return (
    <div className={clsx('flex gap-2.5', isUser && 'flex-row-reverse')}>
      <div
        className={clsx(
          'flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
          isUser ? 'bg-ink-700 text-ink-200' : 'bg-copper-500/15 text-copper-400'
        )}
      >
        {isUser ? <User size={14} /> : <Bot size={14} />}
      </div>
      <div
        className={clsx(
          'max-w-[75%] whitespace-pre-wrap rounded-lg px-3.5 py-2.5 text-sm leading-relaxed',
          isUser ? 'bg-ink-700 text-ink-100' : 'bg-ink-800 text-ink-200',
          message.isError && 'border border-rust-500/40 bg-rust-500/10 text-rust-400'
        )}
      >
        {message.text}
      </div>
    </div>
  )
}

function ConfirmCard({ pending, onResolve }) {
  if (!pending) return null
  const description = describeAction(pending.name, pending.args)
  const isDelete = pending.name === 'delete_rows'
  return (
    <div className="ml-9 max-w-[75%] rounded-lg border border-copper-500/40 bg-ink-800 p-3.5">
      <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-copper-400">
        <ShieldAlert size={13} />
        Confirm before running
      </div>
      <p className="mb-3 font-mono text-xs leading-relaxed text-ink-300">{description}</p>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={() => onResolve(false)}>
          Cancel
        </Button>
        <Button variant={isDelete ? 'danger' : 'default'} size="sm" onClick={() => onResolve(true)}>
          {isDelete ? 'Delete' : 'Confirm'}
        </Button>
      </div>
    </div>
  )
}

export default function AssistantPage() {
  const { messages, sendMessage, isSending, pending, resolvePending, clearHistory } = useChatAgent()
  const [input, setInput] = useState('')
  const scrollRef = useRef(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, pending])

  function handleSubmit(e) {
    e.preventDefault()
    if (!input.trim() || isSending) return
    sendMessage(input)
    setInput('')
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col px-4 py-5 sm:px-6" style={{ height: 'calc(100% - 0px)' }}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-ink-100">Assistant</h1>
          <p className="text-sm text-ink-500">
            Ask it to look things up or make changes — it reads your live schema and asks before writing anything.
          </p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearHistory}
            className="flex items-center gap-1.5 rounded text-xs text-ink-500 hover:text-rust-500"
          >
            <Trash2 size={13} /> Clear chat
          </button>
        )}
      </div>

      <div ref={scrollRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto rounded-lg border border-ink-700 bg-ink-900 p-4">
        {!messages.length && (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-ink-600">
            <Bot size={26} />
            <p className="text-sm">
              Try: "What's overdue?" or "Move the API redesign task to next Friday and mark it high priority."
            </p>
          </div>
        )}
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
        {pending && <ConfirmCard pending={pending} onResolve={resolvePending} />}
        {isSending && !pending && (
          <div className="flex items-center gap-2 pl-9 text-xs text-ink-500">
            <Loader2 size={13} className="animate-spin" /> Thinking…
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-3 flex items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask the assistant…"
          disabled={isSending}
          className="flex-1 rounded-full border border-ink-700 bg-ink-800 px-4 py-2.5 text-sm text-ink-100 placeholder:text-ink-500 focus:border-copper-400 focus:outline-none disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={isSending || !input.trim()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-copper-500 text-ink-900 hover:bg-copper-400 disabled:opacity-40"
          aria-label="Send"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  )
}
