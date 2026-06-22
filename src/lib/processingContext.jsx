import { createContext, useCallback, useContext, useState } from 'react'

const Ctx = createContext({ isAssistantProcessing: false, setAssistantProcessing: () => {} })

export function ProcessingProvider({ children }) {
  const [isAssistantProcessing, setAssistantProcessing] = useState(false)
  const set = useCallback((v) => setAssistantProcessing(v), [])
  return <Ctx.Provider value={{ isAssistantProcessing, setAssistantProcessing: set }}>{children}</Ctx.Provider>
}

export function useProcessingContext() {
  return useContext(Ctx)
}
