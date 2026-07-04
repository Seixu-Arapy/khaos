import { useEffect, useRef, useState } from 'react';
import { Bot, Send, Trash2, ShieldAlert, User, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { useChatAgent } from '../hooks/useChatAgent';
import { describeAction } from '../lib/gemini/tools';
import { Button } from '../components/common/ui';

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
          'max-w-[75%] rounded-lg px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap',
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
    <div className="border-copper-500/40 bg-ink-800 ml-9 max-w-[75%] rounded-lg border p-3.5">
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

export default function AssistantPage() {
  const {
    messages,
    sendMessage,
    isSending,
    pending,
    resolvePending,
    clearHistory,
  } = useChatAgent();

  const [input, setInput] = useState('');
  const scrollRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages, pending]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';

      if (textarea.scrollHeight > 0) {
        textarea.style.height = `${textarea.scrollHeight}px`;
      }

      if (textarea.scrollHeight > 200) {
        textarea.style.overflowY = 'auto';
      } else {
        textarea.style.overflowY = 'hidden';
      }
    }
  }, [input]);

  function handleSend() {
    if (!input.trim() || isSending) return;
    sendMessage(input);
    setInput('');
  }

  function handleSubmit(e) {
    e.preventDefault();
    handleSend();
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div
      className="mx-auto flex max-w-3xl flex-col px-4 py-5 sm:px-6"
      style={{ height: 'calc(100% - 0px)' }}
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="font-display text-ink-100 text-2xl">Assistant</h1>
          <p className="text-ink-500 text-sm">
            Ask it to look things up or make changes — it reads your live schema
            and asks before writing anything.
          </p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearHistory}
            className="text-ink-500 hover:text-rust-500 flex items-center gap-1.5 rounded text-xs"
          >
            <Trash2 size={13} /> Clear chat
          </button>
        )}
      </div>

      <div
        ref={scrollRef}
        className="border-ink-700 bg-ink-900 min-h-0 flex-1 space-y-4 overflow-y-auto rounded-lg border p-4"
      >
        {!messages.length && (
          <div className="text-ink-600 flex h-full flex-col items-center justify-center gap-2 text-center">
            <Bot size={26} />
            <p className="text-sm">
              Try: &ldquo;What&lsquo;s overdue?&rdquo; or &ldquo;Move the API
              redesign task to next Friday and mark it high priority.&rdquo;
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

      <form onSubmit={handleSubmit} className="mt-3 flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask the assistant… (Cmd+Enter to send)"
          disabled={isSending}
          rows={1}
          className="border-ink-700 bg-ink-800 text-ink-100 placeholder:text-ink-500 focus:border-copper-400 max-h-50 min-h-10 flex-1 resize-none overflow-hidden rounded-xl border px-4 py-2.5 text-sm focus:outline-hidden disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={isSending || !input.trim()}
          className="bg-copper-500 text-ink-900 hover:bg-copper-400 mb-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full disabled:opacity-40"
          aria-label="Send"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
