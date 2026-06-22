import { useCallback, useEffect, useRef, useState } from 'react'
import { genAI, GEMINI_MODEL, SYSTEM_INSTRUCTION } from '../lib/gemini/client'
import { functionDeclarations } from '../lib/gemini/tools'
import { runTurn } from '../lib/gemini/agent'
import { useProcessingContext } from '../lib/processingContext'

const STORAGE_KEY = 'logbook.chatHistory.v1'

function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function newId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function useChatAgent() {
  const [messages, setMessages] = useState(loadHistory)
  const [pending, setPending] = useState(null) // { name, args, resolve }
  const [isSending, setIsSending] = useState(false)
  const { setAssistantProcessing } = useProcessingContext()
  const chatRef = useRef(null)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-200)))
    } catch {
      // storage full or unavailable — chat still works, just won't persist
    }
  }, [messages])

  function getChat() {
    if (!chatRef.current) {
      chatRef.current = genAI.chats.create({
        model: GEMINI_MODEL,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          tools: [{ functionDeclarations }],
        },
        history: messages
          .filter((m) => !m.isError)
          .map((m) => ({ role: m.role, parts: [{ text: m.text }] })),
      })
    }
    return chatRef.current
  }

  const requestConfirmation = useCallback(
    (name, args) => new Promise((resolve) => setPending({ name, args, resolve })),
    []
  )

  const resolvePending = useCallback(
    (approved) => {
      pending?.resolve(approved)
      setPending(null)
    },
    [pending]
  )

  const sendMessage = useCallback(async (text) => {
    const trimmed = text.trim()
    if (!trimmed) return
    setMessages((m) => [...m, { id: newId(), role: 'user', text: trimmed }])
    setIsSending(true)
    setAssistantProcessing(true)
    try {
      const chat = getChat()
      const replyText = await runTurn(chat, trimmed, { onPendingWrite: requestConfirmation })
      setMessages((m) => [...m, { id: newId(), role: 'model', text: replyText || "(No response — try rephrasing.)" }])
    } catch (err) {
      setMessages((m) => [
        ...m,
        { id: newId(), role: 'model', text: `Something went wrong: ${err.message}`, isError: true },
      ])
    } finally {
      setIsSending(false)
      setAssistantProcessing(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestConfirmation])

  const clearHistory = useCallback(() => {
    setMessages([])
    chatRef.current = null
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return { messages, sendMessage, isSending, pending, resolvePending, clearHistory }
}
