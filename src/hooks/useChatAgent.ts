import { useCallback, useEffect, useRef, useState } from 'react';
import {
  runTurn,
  extractText,
  type ChatMessage as AgentMessage,
} from '../lib/chat/agent';
import {
  buildConfirmationPreview,
  type ConfirmationPreview,
} from '../lib/chat/confirmationPreview';
import { useProcessingContext } from '../lib/processingContext';
import { useActiveEntity } from '../lib/activeEntityContext';
import { useChatActivity } from '../lib/chat/chatActivityContext';
import { getTimezone } from '../lib/timezone';

const STORAGE_KEY = 'logbook.chatHistory.v1';
// Separate from STORAGE_KEY so a per-tab race between the always-mounted
// desktop panel and a freshly-opened mobile sheet can't both fire the
// opener — whichever instance claims this key first is the one that runs.
const BOOTSTRAPPED_KEY = 'logbook.chatBootstrapped.v1';
const BOOTSTRAP_INSTRUCTION =
  '[Session Bootstrap: This is the first turn of a new session — nobody has typed anything yet. Check current state for something worth surfacing, per your own instructions for how to open a session. Do not greet or offer to help.]';

// UI-facing shape — this is what ChatPanel and the rest of the app render.
// Kept separate from AgentMessage, whose content is Anthropic's own
// text/tool_use/tool_result content-block union, not plain display text.
export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}

export interface PendingWrite {
  name: string;
  args: Record<string, unknown>;
  preview: ConfirmationPreview;
  resolve: (approved: boolean) => void;
}

function loadHistory(): AgentMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function useChatAgent() {
  const [messages, setMessages] = useState<AgentMessage[]>(loadHistory);
  const [pending, setPending] = useState<PendingWrite | null>(null);
  const [isSending, setIsSending] = useState(false);
  const { setAssistantProcessing } = useProcessingContext();
  const { activeEntity } = useActiveEntity();
  const { markOpenerUnseen } = useChatActivity();
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-100)));
    } catch {
      // storage full or unavailable
    }
  }, [messages]);

  const requestConfirmation = useCallback(
    async (name: string, args: Record<string, unknown>) => {
      const preview = await buildConfirmationPreview(name, args);
      return new Promise<boolean>((resolve) =>
        setPending({ name, args, preview, resolve })
      );
    },
    []
  );

  const resolvePending = useCallback(
    (approved: boolean) => {
      pending?.resolve(approved);
      setPending(null);
    },
    [pending]
  );

  // Shared by sendMessage and the session-opening bootstrap turn below —
  // both are "push a user-role message, run the agent loop, record the
  // result," differing only in what that message contains and whether a
  // real person is waiting on it.
  const runWithUserContent = useCallback(
    async (content: string, { silent }: { silent?: boolean } = {}) => {
      setIsSending(true);
      if (!silent) setAssistantProcessing(true);

      const newUserAgentMessage: AgentMessage = { role: 'user', content };
      setMessages((prev) => [...prev, newUserAgentMessage]);

      try {
        const { updatedHistory } = await runTurn(
          [...messagesRef.current, newUserAgentMessage],
          {
            onPendingWrite: (name, args) => requestConfirmation(name, args),
          }
        );
        setMessages(updatedHistory);
        return updatedHistory;
      } catch (err) {
        console.error(err);
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `Something went wrong: ${(err as Error).message}`,
            isError: true,
          },
        ]);
        return null;
      } finally {
        setIsSending(false);
        if (!silent) setAssistantProcessing(false);
      }
    },
    [requestConfirmation, setAssistantProcessing]
  );

  const sendMessage = useCallback(
    async (inputText: string) => {
      if (!inputText.trim() || isSending) return;

      const activeCtx = activeEntity
        ? `[UI Context: user is currently looking at ${activeEntity.type} ${activeEntity.id}]\n`
        : '';
      const timeCtx = `[Temporal Context: current_time is ${new Date().toISOString()}, timezone is ${getTimezone()}]\n`;
      await runWithUserContent(`${timeCtx}${activeCtx}${inputText}`);
    },
    [activeEntity, isSending, runWithUserContent]
  );

  // Fires once per browser session (guarded by BOOTSTRAPPED_KEY, not just a
  // ref, since the desktop chat panel is always mounted — even hidden on
  // mobile — and could otherwise race a freshly-opened mobile sheet). Skips
  // entirely if there's already history: a session here means "since the
  // history was last empty," not "since this component mounted."
  useEffect(() => {
    if (messagesRef.current.length > 0) return;
    if (localStorage.getItem(BOOTSTRAPPED_KEY)) return;
    localStorage.setItem(BOOTSTRAPPED_KEY, '1');

    const timeCtx = `[Temporal Context: current_time is ${new Date().toISOString()}, timezone is ${getTimezone()}]\n`;
    runWithUserContent(`${timeCtx}${BOOTSTRAP_INSTRUCTION}`, {
      silent: true,
    }).then((updatedHistory) => {
      const last = updatedHistory?.[updatedHistory.length - 1];
      if (last?.role === 'assistant' && extractText(last.content)) {
        markOpenerUnseen();
      }
    });
    // Runs once on mount, using messagesRef to read the initial history
    // rather than reacting to it — see the comment above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearHistory = useCallback(() => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
    // A cleared history is a new session — let the next mount open again.
    localStorage.removeItem(BOOTSTRAPPED_KEY);
  }, []);

  const uiMessages: ChatMessage[] = messages
    .map((m, index) => ({ m, index }))
    .filter(({ m }) => m.role === 'user' || m.role === 'assistant')
    .map(({ m, index }) => ({
      id: `${m.role}-${index}`,
      role: m.role === 'assistant' ? ('model' as const) : ('user' as const),
      // extractText reads only text blocks — a user turn that's actually a
      // tool_result continuation, or an assistant turn that's purely a
      // tool_use with no accompanying text, both collapse to '' here and
      // get filtered out below, same as a falsy `content` did before.
      text: extractText(m.content),
      isError: m.isError,
    }))
    .filter(({ text }) => Boolean(text))
    .map(({ id, role, text, isError }) => {
      let textToShow = text;
      if (role === 'user') {
        textToShow = textToShow.replace(
          /^\[Temporal Context:[\s\S]*?\]\s*/g,
          ''
        );
        textToShow = textToShow.replace(/^\[UI Context:[\s\S]*?\]\s*/g, '');
        textToShow = textToShow.replace(
          /^\[Session Bootstrap:[\s\S]*?\]\s*/g,
          ''
        );
        textToShow = textToShow.replace(/^\[Context:[\s\S]*?\]\s*/g, '');
      }
      return { id, role, text: textToShow, isError };
    });

  return {
    messages: uiMessages,
    sendMessage,
    isSending,
    pending,
    resolvePending,
    clearHistory,
  };
}
