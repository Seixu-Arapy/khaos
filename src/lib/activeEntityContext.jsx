import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

const Ctx = createContext({
  activeEntity: null,
  setActiveEntity: () => {},
  clearActiveEntity: () => {},
});

export function ActiveEntityProvider({ children }) {
  const [activeEntity, setActiveEntityState] = useState(null);

  const setActiveEntity = useCallback((entity) => {
    setActiveEntityState(entity);
  }, []);

  // Só limpa se ninguém mais assumiu o "foco" no meio tempo — evita que um
  // modal fechando apague o objeto que outro modal acabou de abrir.
  const clearActiveEntity = useCallback((entityId) => {
    setActiveEntityState((current) => {
      if (entityId && current?.id !== entityId) return current;
      return null;
    });
  }, []);

  return (
    <Ctx.Provider value={{ activeEntity, setActiveEntity, clearActiveEntity }}>
      {children}
    </Ctx.Provider>
  );
}

export function useActiveEntity() {
  return useContext(Ctx);
}

// Helper para páginas/modais de detalhe: registra a entidade enquanto o
// componente está montado, desanexa ao desmontar.
// type: 'task' | 'project' | 'section' | 'event'
export function useSyncActiveEntity(type, id, name) {
  const { setActiveEntity, clearActiveEntity } = useActiveEntity();
  useEffect(() => {
    if (!id) return;
    setActiveEntity({ type, id, name });
    return () => clearActiveEntity(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, id, name]);
}
