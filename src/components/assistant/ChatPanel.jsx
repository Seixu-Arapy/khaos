import { useEffect, useRef, useState } from 'react';
import {
  Bot,
  Send,
  Trash2,
  ShieldAlert,
  User,
  Loader2,
  X,
  Link2,
} from 'lucide-react';
import clsx from 'clsx';
import { useChatAgent } from '../../hooks/useChatAgent';
import { describeAction } from '../../lib/gemini/tools';
import { useActiveEntity } from '../../lib/activeEntityContext';
import { Button } from '../common/ui';

function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  return (
    <div className={clsx('flex gap-2.5', isUser && 'flex-row-reverse')}>
      <div
        className={clsx(
          'flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
          isUser
            ? 'bg-ink-700 text-ink-200'
            : 'bg-copper-500/15 text-copper-400'
        )}
      >
        {isUser ? <User size={14} /> : <Bot size={14} />}
      </div>
      <div
        className={clsx(
          'max-w-[85%] rounded-lg px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap',
          isUser ? 'bg-ink-700 text-ink-100' : 'bg-ink-800 text-ink-200',
          message.isError &&
            'text-rust-400 border-rust-500/40 bg-rust-500/10 border'
        )}
      >
        {message.text}
      </div>
    </div>
  );
}

function ConfirmCard({ pending, onResolve }) {
  if (!pending) return null;
  const description = describeAction(pending.name, pending.args);
  const isDelete = pending.name === 'delete_rows';
  return (
    <div className="border-copper-500/40 bg-ink-800 ml-9 max-w-[85%] rounded-lg border p-3.5">
      <div className="text-copper-400 mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-wide uppercase">
        <ShieldAlert size={13} />
        Confirm before running
      </div>
      <p className="text-ink-300 mb-3 font-mono text-xs leading-relaxed">
        {description}
      </p>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={() => onResolve(false)}>
          Cancel
        </Button>
        <Button
          variant={isDelete ? 'danger' : 'default'}
          size="sm"
          onClick={() => onResolve(true)}
        >
          {isDelete ? 'Delete' : 'Confirm'}
        </Button>
      </div>
    </div>
  );
}

/**
 * Shared chat UI — used as the persistent desktop sidebar, the mobile
 * bottom-sheet, and the standalone /assistant route.
 */
export default function ChatPanel({ onRequestClose }) {
  const {
    messages,
    sendMessage,
    isSending,
    pending,
    resolvePending,
    clearHistory,
  } = useChatAgent();
  const { activeEntity, clearActiveEntity } = useActiveEntity();
  const [input, setInput] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages, pending]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!input.trim() || isSending) return;
    sendMessage(input);
    setInput('');
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-ink-700 flex shrink-0 items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <Bot size={16} className="text-copper-400" />
          <h2 className="font-display text-ink-100 text-sm font-semibold">
            Assistant
          </h2>
        </div>
        <div className="flex items-center gap-3">
          {messages.length > 0 && (
            <button
              onClick={clearHistory}
              className="text-ink-500 hover:text-rust-500 flex items-center gap-1 text-xs"
            >
              <Trash2 size={12} /> Clear
            </button>
          )}
          {onRequestClose && (
            <button
              onClick={onRequestClose}
              className="text-ink-500 hover:text-ink-200"
              aria-label="Close chat"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {activeEntity && (
        <div className="border-ink-700 bg-ink-800/50 flex shrink-0 items-center gap-1.5 border-b px-4 py-1.5 text-xs">
          <Link2 size={11} className="text-copper-400 shrink-0" />
          <span className="text-ink-500 shrink-0">Talking about:</span>
          <span className="text-ink-100 min-w-0 flex-1 truncate font-medium">
            {activeEntity.name}
          </span>
          <span className="text-ink-600 shrink-0 text-[10px] tracking-wide uppercase">
            {activeEntity.type}
          </span>
          <button
            onClick={() => clearActiveEntity(activeEntity.id)}
            className="text-ink-500 hover:text-rust-500 shrink-0"
            aria-label="Detach from chat"
            title="Stop referencing this in chat"
          >
            <X size={12} />
          </button>
        </div>
      )}

      <div
        ref={scrollRef}
        className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4"
      >
        {!messages.length && (
          <div className="text-ink-600 flex h-full flex-col items-center justify-center gap-2 text-center">
            <Bot size={26} />
            <p className="text-sm">
              Try: &ldquo;What&lsquo;s overdue?&lrequo; — or open a task and ask
              about it directly.
            </p>
          </div>
        )}
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
        {pending && (
          <ConfirmCard pending={pending} onResolve={resolvePending} />
        )}
        {isSending && !pending && (
          <div className="text-ink-500 flex items-center gap-2 pl-9 text-xs">
            <Loader2 size={13} className="animate-spin" /> Thinking…
          </div>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="border-ink-700 flex shrink-0 items-center gap-2 border-t p-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask the assistant…"
          disabled={isSending}
          className="border-ink-700 bg-ink-800 text-ink-100 placeholder:text-ink-500 focus:border-copper-400 flex-1 rounded-full border px-4 py-2.5 text-sm focus:outline-hidden disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={isSending || !input.trim()}
          className="bg-copper-500 text-ink-900 hover:bg-copper-400 flex h-10 w-10 shrink-0 items-center justify-center rounded-full disabled:opacity-40"
          aria-label="Send"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
