// Helpers puros sobre o grafo de sequência (tasks_sequence).
// Uma aresta {task_previous, task_next} significa: task_next vem depois de
// task_previous.

// Adicionar previousId -> nextId criaria um ciclo se nextId já conseguir
// alcançar previousId percorrendo as arestas existentes.
export function wouldCreateCycle(edges, previousId, nextId) {
  const adjacency = new Map();
  edges.forEach(({ task_previous, task_next }) => {
    if (!adjacency.has(task_previous)) adjacency.set(task_previous, []);
    adjacency.get(task_previous).push(task_next);
  });

  const visited = new Set();
  const stack = [nextId];
  while (stack.length) {
    const current = stack.pop();
    if (current === previousId) return true;
    if (visited.has(current)) continue;
    visited.add(current);
    (adjacency.get(current) || []).forEach((next) => stack.push(next));
  }
  return false;
}
