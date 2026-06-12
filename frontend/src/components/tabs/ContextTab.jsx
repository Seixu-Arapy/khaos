import Project from "../entities/Project"
import Section from "../entities/Section"

export default function ContextTab({ activeContext }) {
  if (!activeContext) {
    return (
      <div className="py-16 text-center text-app-muted">
        <div className="mx-auto mb-3 flex h-8 w-8 items-center justify-center rounded-lg border border-brand-primary/20 bg-brand-primary/5">
          <span className="text-sm text-brand-primary">✷</span>
        </div>
        <p className="text-xs font-medium text-gray-400">Nenhum foco ativo</p>
        <p className="mx-auto mt-1 max-w-50 text-[11px] text-app-muted">
          Converse com o Khaos para focar em algum projeto ou tarefa.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-4 pt-1">
          <Project
            id={activeContext.id}
            name={activeContext.name}
            project={activeContext}
            variant="inline"
          />
        </div>
      </div>

      <div className="space-y-4">
        {activeContext.sections?.length > 0 ? (
          activeContext.sections.map(section => (
            <Section
              key={section.id}
              section={section}
              variant="list"
              showIcon
            />
          ))
        ) : (
          <p className="text-xs text-app-muted italic">
            Este projeto não possui seções cadastradas.
          </p>
        )}
      </div>
    </div>
  )
}
