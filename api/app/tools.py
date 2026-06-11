from app import config
from app.http_client import client

BASE_URL = config.API_URL

# ============================================================
# TOOLS SCHEMA
# ============================================================

TOOLS_SCHEMA = [
    # --- FIELDS ---
    {
        "name": "list_fields",
        "description": "Lista todas as áreas de trabalho (fields) do usuário",
        "parameters": {},
    },
    {
        "name": "create_field",
        "description": "Cria uma nova área de trabalho (field)",
        "parameters": {
            "name": {"type": "string", "description": "Nome da área", "required": True},
            "doc_reference": {
                "type": "string",
                "description": "Link para documentação",
                "required": False,
            },
            "moment_note": {
                "type": "string",
                "description": "Contexto em linguagem natural sobre a criação",
                "required": False,
            },
        },
    },
    {
        "name": "update_field",
        "description": "Atualiza uma área de trabalho (field)",
        "parameters": {
            "field_id": {
                "type": "integer",
                "description": "ID da área",
                "required": True,
            },
            "name": {"type": "string", "description": "Novo nome", "required": False},
            "moment_note": {
                "type": "string",
                "description": "Contexto em linguagem natural sobre a atualização",
                "required": False,
            },
        },
    },
    {
        "name": "delete_field",
        "description": "Remove uma área de trabalho (field)",
        "parameters": {
            "field_id": {
                "type": "integer",
                "description": "ID da área",
                "required": True,
            }
        },
    },
    # --- PROJECTS ---
    {
        "name": "list_projects",
        "description": "Lista os projetos filtrados por área ou por propriedades exatas de estado",
        "parameters": {
            "field_id": {
                "type": "integer",
                "description": "ID da área",
                "required": False,
            },
            "status": {
                "type": "string",
                "description": "Filtrar por status exato",
                "required": False,
            },
            "priority": {
                "type": "string",
                "description": "Filtrar por prioridade exata",
                "required": False,
            },
            "due": {
                "type": "string",
                "description": "Filtrar por prazo exato YYYY-MM-DD",
                "required": False,
            },
        },
    },
    {
        "name": "search_projects",
        "description": "Busca global em projetos por correspondência parcial de texto no nome. Utilize apenas para localização de termos.",
        "parameters": {
            "query": {
                "type": "string",
                "description": "Termo de busca parcial",
                "required": True,
            },
            "status": {
                "type": "string",
                "description": "Filtrar resultados da busca por status",
                "required": False,
            },
        },
    },
    {
        "name": "create_project",
        "description": "Cria um novo projeto em uma área de trabalho",
        "parameters": {
            "name": {
                "type": "string",
                "description": "Nome do projeto",
                "required": True,
            },
            "field_id": {
                "type": "integer",
                "description": "ID da área",
                "required": True,
            },
            "due": {
                "type": "string",
                "description": "Prazo no formato YYYY-MM-DD",
                "required": False,
            },
            "priority": {
                "type": "string",
                "description": "Prioridade inicial do projeto",
                "required": False,
            },
            "moment_note": {
                "type": "string",
                "description": "Contexto em linguagem natural sobre a criação",
                "required": False,
            },
        },
    },
    {
        "name": "update_project",
        "description": "Atualiza metadados estruturais do projeto. ATENÇÃO: Proibido passar status aqui; para alterar status use estritamente update_project_status.",
        "parameters": {
            "project_id": {
                "type": "integer",
                "description": "ID do projeto",
                "required": True,
            },
            "name": {"type": "string", "description": "Novo nome", "required": False},
            "due": {
                "type": "string",
                "description": "Novo prazo YYYY-MM-DD",
                "required": False,
            },
            "priority": {
                "type": "string",
                "description": "Nova prioridade",
                "required": False,
            },
            "moment_note": {
                "type": "string",
                "description": "Contexto em linguagem natural sobre a atualização",
                "required": False,
            },
        },
    },
    {
        "name": "update_project_status",
        "description": "Atualiza o status de um projeto. Valores válidos: planning, todo, in_progress, in_review, done, paused, cancelled",
        "parameters": {
            "project_id": {
                "type": "integer",
                "description": "ID do projeto",
                "required": True,
            },
            "status": {
                "type": "string",
                "description": "Novo status",
                "required": True,
            },
            "moment_note": {
                "type": "string",
                "description": "Contexto em linguagem natural sobre a mudança de estado",
                "required": False,
            },
        },
    },
    {
        "name": "delete_project",
        "description": "Remove um projeto",
        "parameters": {
            "project_id": {
                "type": "integer",
                "description": "ID do projeto",
                "required": True,
            }
        },
    },
    # --- SECTIONS ---
    {
        "name": "list_sections",
        "description": "Lista as seções (sections) vinculadas a um projeto específico, aceitando filtros opcionais",
        "parameters": {
            "project_id": {
                "type": "integer",
                "description": "ID do projeto pai",
                "required": True,
            },
            "status": {
                "type": "string",
                "description": "Filtrar por status exato",
                "required": False,
            },
            "priority": {
                "type": "string",
                "description": "Filtrar por prioridade exata",
                "required": False,
            },
        },
    },
    {
        "name": "search_sections",
        "description": "Busca global em seções por correspondência parcial de texto no nome. Utilize apenas para localização de termos.",
        "parameters": {
            "query": {
                "type": "string",
                "description": "Termo de busca parcial",
                "required": True,
            },
            "status": {
                "type": "string",
                "description": "Filtrar resultados por status",
                "required": False,
            },
        },
    },
    {
        "name": "create_section",
        "description": "Cria uma nova section em um projeto",
        "parameters": {
            "name": {
                "type": "string",
                "description": "Nome da section",
                "required": True,
            },
            "project_id": {
                "type": "integer",
                "description": "ID do projeto",
                "required": True,
            },
            "due": {
                "type": "string",
                "description": "Prazo no formato YYYY-MM-DD",
                "required": False,
            },
            "priority": {
                "type": "string",
                "description": "Prioridade inicial da seção",
                "required": False,
            },
            "moment_note": {
                "type": "string",
                "description": "Contexto em linguagem natural sobre a criação",
                "required": False,
            },
        },
    },
    {
        "name": "update_section",
        "description": "Atualiza metadados estruturais da section. ATENÇÃO: Proibido passar status aqui; para alterar status use estritamente update_section_status.",
        "parameters": {
            "section_id": {
                "type": "integer",
                "description": "ID da section",
                "required": True,
            },
            "name": {"type": "string", "description": "Novo nome", "required": False},
            "due": {
                "type": "string",
                "description": "Novo prazo YYYY-MM-DD",
                "required": False,
            },
            "priority": {
                "type": "string",
                "description": "Nova prioridade",
                "required": False,
            },
            "moment_note": {
                "type": "string",
                "description": "Contexto em linguagem natural sobre a atualização",
                "required": False,
            },
        },
    },
    {
        "name": "update_section_status",
        "description": "Atualiza o status de uma section. Valores válidos: planning, todo, in_progress, in_review, done, paused, cancelled",
        "parameters": {
            "section_id": {
                "type": "integer",
                "description": "ID da section",
                "required": True,
            },
            "status": {
                "type": "string",
                "description": "Novo status",
                "required": True,
            },
            "moment_note": {
                "type": "string",
                "description": "Contexto em linguagem natural sobre a mudança de estado",
                "required": False,
            },
        },
    },
    {
        "name": "delete_section",
        "description": "Remove uma section",
        "parameters": {
            "section_id": {
                "type": "integer",
                "description": "ID da section",
                "required": True,
            }
        },
    },
    # --- TASKS ---
    {
        "name": "list_tasks",
        "description": "Lista as tarefas (tasks) de uma seção específica, permitindo filtros estruturais exatos",
        "parameters": {
            "section_id": {
                "type": "integer",
                "description": "ID da seção pai",
                "required": True,
            },
            "status": {
                "type": "string",
                "description": "Filtrar por status exato",
                "required": False,
            },
            "priority": {
                "type": "string",
                "description": "Filtrar por prioridade exata",
                "required": False,
            },
            "due": {
                "type": "string",
                "description": "Filtrar por prazo exato YYYY-MM-DD",
                "required": False,
            },
        },
    },
    {
        "name": "search_tasks",
        "description": "Busca global em tarefas por correspondência parcial de texto no nome, independente de seção.",
        "parameters": {
            "query": {
                "type": "string",
                "description": "Termo de busca parcial",
                "required": True,
            },
            "status": {
                "type": "string",
                "description": "Filtrar resultados por status",
                "required": False,
            },
            "priority": {
                "type": "string",
                "description": "Filtrar resultados por prioridade",
                "required": False,
            },
        },
    },
    {
        "name": "create_task",
        "description": "Cria uma nova tarefa vinculada a uma section",
        "parameters": {
            "name": {
                "type": "string",
                "description": "Nome da tarefa",
                "required": True,
            },
            "section_id": {
                "type": "integer",
                "description": "ID da section",
                "required": True,
            },
            "due": {
                "type": "string",
                "description": "Prazo no formato YYYY-MM-DD",
                "required": False,
            },
            "priority": {
                "type": "string",
                "description": "Prioridade inicial da tarefa",
                "required": False,
            },
            "estimate": {
                "type": "integer",
                "description": "Estimativa em minutos",
                "required": False,
            },
            "moment_note": {
                "type": "string",
                "description": "Contexto em linguagem natural sobre a criação",
                "required": False,
            },
        },
    },
    {
        "name": "update_task",
        "description": "Atualiza metadados estruturais da tarefa. ATENÇÃO: Proibido passar status aqui; para alterar status use estritamente update_task_status.",
        "parameters": {
            "task_id": {
                "type": "integer",
                "description": "ID da tarefa",
                "required": True,
            },
            "name": {"type": "string", "description": "Novo nome", "required": False},
            "due": {
                "type": "string",
                "description": "Novo prazo YYYY-MM-DD",
                "required": False,
            },
            "priority": {
                "type": "string",
                "description": "Nova prioridade",
                "required": False,
            },
            "estimate": {
                "type": "integer",
                "description": "Nova estimativa em minutos",
                "required": False,
            },
            "moment_note": {
                "type": "string",
                "description": "Contexto em linguagem natural sobre a atualização",
                "required": False,
            },
        },
    },
    {
        "name": "update_task_status",
        "description": "Atualiza o status de uma tarefa. Valores válidos: planning, todo, in_progress, in_review, done, paused, cancelled",
        "parameters": {
            "task_id": {
                "type": "integer",
                "description": "ID da tarefa",
                "required": True,
            },
            "status": {
                "type": "string",
                "description": "Novo status",
                "required": True,
            },
            "moment_note": {
                "type": "string",
                "description": "Contexto em linguagem natural sobre a mudança de estado",
                "required": False,
            },
        },
    },
    {
        "name": "delete_task",
        "description": "Remove uma tarefa",
        "parameters": {
            "task_id": {
                "type": "integer",
                "description": "ID da tarefa",
                "required": True,
            }
        },
    },
    # --- EVENTS ---
    {
        "name": "list_events",
        "description": "Lista eventos da agenda",
        "parameters": {
            "field_id": {
                "type": "integer",
                "description": "ID da área",
                "required": False,
            },
            "project_id": {
                "type": "integer",
                "description": "ID do projeto",
                "required": False,
            },
        },
    },
    {
        "name": "create_event",
        "description": "Cria um novo evento na agenda",
        "parameters": {
            "title": {
                "type": "string",
                "description": "Título do evento",
                "required": True,
            },
            "type": {
                "type": "string",
                "description": "Tipo: fixed ou plan",
                "required": True,
            },
            "start_at": {
                "type": "string",
                "description": "Início no formato YYYY-MM-DD HH:MM",
                "required": True,
            },
            "end_at": {
                "type": "string",
                "description": "Fim no formato YYYY-MM-DD HH:MM",
                "required": True,
            },
            "task_id": {
                "type": "integer",
                "description": "ID da tarefa relacionada",
                "required": False,
            },
            "project_id": {
                "type": "integer",
                "description": "ID do projeto relacionado",
                "required": False,
            },
            "field_id": {
                "type": "integer",
                "description": "ID da área relacionada",
                "required": False,
            },
            "moment_note": {
                "type": "string",
                "description": "Contexto em linguagem natural",
                "required": False,
            },
        },
    },
    {
        "name": "update_event",
        "description": "Atualiza um evento",
        "parameters": {
            "event_id": {
                "type": "integer",
                "description": "ID do evento",
                "required": True,
            },
            "title": {
                "type": "string",
                "description": "Novo título",
                "required": False,
            },
            "start_at": {
                "type": "string",
                "description": "Novo início YYYY-MM-DD HH:MM",
                "required": False,
            },
            "end_at": {
                "type": "string",
                "description": "Novo fim YYYY-MM-DD HH:MM",
                "required": False,
            },
            "moment_note": {
                "type": "string",
                "description": "Contexto em linguagem natural",
                "required": False,
            },
        },
    },
    {
        "name": "delete_event",
        "description": "Remove um evento",
        "parameters": {
            "event_id": {
                "type": "integer",
                "description": "ID do evento",
                "required": True,
            }
        },
    },
    # --- MOMENTS ---
    {
        "name": "register_moment",
        "description": "Registra um momento contextual humano: started, stopped, schedule, target, definition. Não use para eventos estruturais comuns.",
        "parameters": {
            "entity_type": {
                "type": "string",
                "description": "task, section, project ou event",
                "required": True,
            },
            "entity_id": {
                "type": "integer",
                "description": "ID da entidade",
                "required": True,
            },
            "event_type": {
                "type": "string",
                "description": "Tipo: started, stopped, schedule, target, definition",
                "required": True,
            },
            "value": {
                "type": "string",
                "description": "Valor associado (horário, descrição)",
                "required": False,
            },
            "moment_note": {
                "type": "string",
                "description": "Contexto em linguagem natural",
                "required": False,
            },
        },
    },
    # --- SEQUENCES ---
    {
        "name": "create_task_sequence",
        "description": "Define uma relação de dependência sequencial entre tarefas",
        "parameters": {
            "task_previous": {
                "type": "integer",
                "description": "ID da tarefa predecessora",
                "required": True,
            },
            "task_next": {
                "type": "integer",
                "description": "ID da tarefa sucessora",
                "required": True,
            },
        },
    },
    {
        "name": "delete_task_sequence",
        "description": "Remove uma dependência sequencial entre tarefas",
        "parameters": {
            "task_previous": {
                "type": "integer",
                "description": "ID da tarefa anterior",
                "required": True,
            },
            "task_next": {
                "type": "integer",
                "description": "ID da tarefa seguinte",
                "required": True,
            },
        },
    },
    {
        "name": "create_section_sequence",
        "description": "Define uma relação de dependência sequencial entre seções",
        "parameters": {
            "section_previous": {
                "type": "integer",
                "description": "ID da seção predecessora",
                "required": True,
            },
            "section_next": {
                "type": "integer",
                "description": "ID da seção sucessora",
                "required": True,
            },
        },
    },
    {
        "name": "delete_section_sequence",
        "description": "Remove uma dependência sequencial entre seções",
        "parameters": {
            "section_previous": {
                "type": "integer",
                "description": "ID da seção anterior",
                "required": True,
            },
            "section_next": {
                "type": "integer",
                "description": "ID da seção seguinte",
                "required": True,
            },
        },
    },
    # --- TIME ENTRIES ---
    {
        "name": "get_active_time_entry",
        "description": "Consulta qual tarefa está com o cronômetro (time entry) ativo no momento. Use isto para descobrir o entry_id antes de tentar parar o tempo.",
        "parameters": {},
    },
    # Substitua as definições dentro de TOOLS_SCHEMA em tools.py
    {
        "name": "start_time_entry",
        "description": "Starts a new time entry tracker for a specific task. Note: This will fail with a 400 error if there is already another active timer running in the system.",
        "parameters": {
            "task_id": {
                "type": "integer",
                "description": "The unique database ID of the task to start tracking.",
                "required": True,
            },
            "moment_note": {
                "type": "string",
                "description": "Optional note describing what will be done during this tracking session.",
                "required": False,
            },
        },
    },
    {
        "name": "stop_time_entry",
        "description": "Stops the currently active time entry tracker for a specific task. Returns a 404 error if the task does not have an active timer running.",
        "parameters": {
            "task_id": {
                "type": "integer",
                "description": "The unique database ID of the task to stop tracking.",
                "required": True,
            },
            "moment_note": {
                "type": "string",
                "description": "Optional note describing what was accomplished during this tracking session.",
                "required": False,
            },
        },
    },
    # --- WORK TAGS ---
    {
        "name": "list_work_tags",
        "description": "Lista todas as tags estruturais de trabalho (work tags)",
        "parameters": {},
    },
    {
        "name": "create_work_tag",
        "description": "Cria uma nova work tag (em minúsculas)",
        "parameters": {
            "name": {
                "type": "string",
                "description": "Nome normalizado da tag",
                "required": True,
            }
        },
    },
    {
        "name": "add_work_tag_to_entity",
        "description": "Associa uma work tag a um projeto, seção ou tarefa",
        "parameters": {
            "work_tag_id": {
                "type": "integer",
                "description": "ID da tag",
                "required": True,
            },
            "entity_type": {
                "type": "string",
                "description": "project, section ou task",
                "required": True,
            },
            "entity_id": {
                "type": "integer",
                "description": "ID da entidade alvo",
                "required": True,
            },
        },
    },
    {
        "name": "get_entity_work_tags",
        "description": "Retorna todas as work tags associadas a uma entidade",
        "parameters": {
            "entity_type": {
                "type": "string",
                "description": "project, section ou task",
                "required": True,
            },
            "entity_id": {
                "type": "integer",
                "description": "ID da entidade",
                "required": True,
            },
        },
    },
    # --- MOMENT TAGS ---
    {
        "name": "list_moment_tags",
        "description": "Lista todas as tags de contexto emocional ou situacional (moment tags)",
        "parameters": {},
    },
    {
        "name": "create_moment_tag",
        "description": "Cria uma nova moment tag (em minúsculas)",
        "parameters": {
            "name": {
                "type": "string",
                "description": "Nome normalizado da tag",
                "required": True,
            }
        },
    },
    {
        "name": "add_moment_tag_to_entity",
        "description": "Associa uma moment tag a um histórico de moment ou time entry",
        "parameters": {
            "moment_tag_id": {
                "type": "integer",
                "description": "ID da tag",
                "required": True,
            },
            "entity_type": {
                "type": "string",
                "description": "moment ou time_entry",
                "required": True,
            },
            "entity_id": {
                "type": "integer",
                "description": "ID da entidade alvo",
                "required": True,
            },
        },
    },
    {
        "name": "get_entity_moment_tags",
        "description": "Retorna as moment tags associadas a uma entidade contextual",
        "parameters": {
            "entity_type": {
                "type": "string",
                "description": "moment ou time_entry",
                "required": True,
            },
            "entity_id": {
                "type": "integer",
                "description": "ID da entidade",
                "required": True,
            },
        },
    },
]


# ============================================================
# TOOL EXECUTOR
# ============================================================


def execute_tool(name: str, inputs: dict) -> dict:

    # FIELDS
    if name == "list_fields":
        return client.get(f"{BASE_URL}/fields").json()
    elif name == "create_field":
        return client.post(f"{BASE_URL}/fields", params=inputs).json()
    elif name == "update_field":
        field_id = inputs.pop("field_id")
        return client.patch(f"{BASE_URL}/fields/{field_id}", params=inputs).json()
    elif name == "delete_field":
        return client.delete(f"{BASE_URL}/fields/{inputs['field_id']}").json()

    # PROJECTS
    elif name == "list_projects":
        return client.get(f"{BASE_URL}/projects", params=inputs).json()
    elif name == "search_projects":
        return client.get(f"{BASE_URL}/projects/search", params=inputs).json()
    elif name == "create_project":
        return client.post(f"{BASE_URL}/projects", params=inputs).json()
    elif name == "update_project":
        project_id = inputs.pop("project_id")
        return client.patch(f"{BASE_URL}/projects/{project_id}", params=inputs).json()
    elif name == "update_project_status":
        project_id = inputs.pop("project_id")
        return client.patch(
            f"{BASE_URL}/projects/{project_id}/status", params=inputs
        ).json()
    elif name == "delete_project":
        return client.delete(f"{BASE_URL}/projects/{inputs['project_id']}").json()

    # SECTIONS
    elif name == "list_sections":
        return client.get(f"{BASE_URL}/sections", params=inputs).json()
    elif name == "search_sections":
        return client.get(f"{BASE_URL}/sections/search", params=inputs).json()
    elif name == "create_section":
        return client.post(f"{BASE_URL}/sections", params=inputs).json()
    elif name == "update_section":
        section_id = inputs.pop("section_id")
        return client.patch(f"{BASE_URL}/sections/{section_id}", params=inputs).json()
    elif name == "update_section_status":
        section_id = inputs.pop("section_id")
        return client.patch(
            f"{BASE_URL}/sections/{section_id}/status", params=inputs
        ).json()
    elif name == "delete_section":
        return client.delete(f"{BASE_URL}/sections/{inputs['section_id']}").json()

    # TASKS
    elif name == "list_tasks":
        return client.get(f"{BASE_URL}/tasks", params=inputs).json()
    elif name == "search_tasks":
        return client.get(f"{BASE_URL}/tasks/search", params=inputs).json()
    elif name == "create_task":
        return client.post(f"{BASE_URL}/tasks", params=inputs).json()
    elif name == "update_task":
        task_id = inputs.pop("task_id")
        return client.patch(f"{BASE_URL}/tasks/{task_id}", params=inputs).json()
    elif name == "update_task_status":
        task_id = inputs.pop("task_id")
        return client.patch(f"{BASE_URL}/tasks/{task_id}/status", params=inputs).json()
    elif name == "delete_task":
        return client.delete(f"{BASE_URL}/tasks/{inputs['task_id']}").json()

    # EVENTS
    elif name == "list_events":
        return client.get(f"{BASE_URL}/events", params=inputs).json()
    elif name == "create_event":
        return client.post(f"{BASE_URL}/events", params=inputs).json()
    elif name == "update_event":
        event_id = inputs.pop("event_id")
        return client.patch(f"{BASE_URL}/events/{event_id}", params=inputs).json()
    elif name == "delete_event":
        return client.delete(f"{BASE_URL}/events/{inputs['event_id']}").json()

    # MOMENTS
    elif name == "register_moment":
        return client.post(f"{BASE_URL}/moments", params=inputs).json()

    # SEQUENCES
    elif name == "create_task_sequence":
        return client.post(f"{BASE_URL}/tasks-sequence", params=inputs).json()
    elif name == "delete_task_sequence":
        return client.delete(f"{BASE_URL}/tasks-sequence", params=inputs).json()
    elif name == "create_section_sequence":
        return client.post(f"{BASE_URL}/sections-sequence", params=inputs).json()
    elif name == "delete_section_sequence":
        return client.delete(f"{BASE_URL}/sections-sequence", params=inputs).json()

    # TIME ENTRIES
    elif name == "get_active_time_entry":
        return client.get(f"{BASE_URL}/time-entries?active=true").json()
    elif name == "start_time_entry":
        task_id = inputs.pop("task_id")
        return client.post(f"{BASE_URL}/tasks/{task_id}/start", params=inputs).json()
    elif name == "stop_time_entry":
        task_id = inputs.pop("task_id")
        return client.patch(f"{BASE_URL}/tasks/{task_id}/stop", params=inputs).json()

    # WORK TAGS
    elif name == "list_work_tags":
        return client.get(f"{BASE_URL}/work-tags").json()
    elif name == "create_work_tag":
        return client.post(f"{BASE_URL}/work-tags", params=inputs).json()
    elif name == "add_work_tag_to_entity":
        return client.post(f"{BASE_URL}/work-tag-entities", params=inputs).json()
    elif name == "get_entity_work_tags":
        return client.get(
            f"{BASE_URL}/work-tag-entities/{inputs['entity_type']}/{inputs['entity_id']}"
        ).json()

    # MOMENT TAGS
    elif name == "list_moment_tags":
        return client.get(f"{BASE_URL}/moment-tags").json()
    elif name == "create_moment_tag":
        return client.post(f"{BASE_URL}/moment-tags", params=inputs).json()
    elif name == "add_moment_tag_to_entity":
        return client.post(f"{BASE_URL}/moment-tag-entities", params=inputs).json()
    elif name == "get_entity_moment_tags":
        return client.get(
            f"{BASE_URL}/moment-tag-entities/{inputs['entity_type']}/{inputs['entity_id']}"
        ).json()

    return {"error": f"Tool {name} not found"}
