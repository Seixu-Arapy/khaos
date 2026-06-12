import { useCallback, useEffect, useState } from "react"

import Chat from "./components/Chat"
import Header from "./components/Header"
import Sidebar from "./components/Sidebar"
import api from "./services/api"

async function fetchActiveTimerData() {
  try {
    const response = await api.get("/time-entries?active=true&expand=true")
    return response.data // O Axios já entrega o JSON mastigado em .data
  } catch (error) {
    console.error("Erro ao buscar timer ativo:", error)
    return null
  }
}

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [activeContext, setActiveContext] = useState(null)
  const [isContextLoading, setIsContextLoading] = useState(false)
  const [isChatLoading, setIsChatLoading] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [activeTimer, setActiveTimer] = useState(null)

  const fetchContext = useCallback(async projectId => {
    if (!projectId) return
    setIsContextLoading(true)

    try {
      const response = await api.get(`/projects/${projectId}?expand=true`)
      setActiveContext(response.data)
    } catch (error) {
      console.error("Erro ao buscar contexto do projeto:", error)
    } finally {
      setIsContextLoading(false)
    }
  }, [])

  const syncTimerAndContext = useCallback(async () => {
    const data = await fetchActiveTimerData()
    setActiveTimer(data)

    const projectId = data?.tasks?.sections?.projects?.id
    if (projectId) fetchContext(projectId)
  }, [fetchContext])

  useEffect(() => {
    ;(async () => {
      await syncTimerAndContext()
    })()
  }, [syncTimerAndContext])

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-app-bg text-gray-100">
      <Header
        onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
        isSidebarOpen={isSidebarOpen}
        isChatLoading={isChatLoading}
        activeTimer={activeTimer}
      />

      <div className="relative flex min-h-0 flex-1">
        <Chat
          activeTimer={activeTimer}
          onContextDetected={fetchContext}
          onTimerTrigger={() => setRefreshTrigger(prev => prev + 1)}
          onSidebarOpen={setIsSidebarOpen}
          onTimerChange={syncTimerAndContext}
          onLoadingChange={setIsChatLoading}
        />

        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          isLoading={isContextLoading}
          activeContext={activeContext}
          refreshTrigger={refreshTrigger}
        />
      </div>
    </div>
  )
}
