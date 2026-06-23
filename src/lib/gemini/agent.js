import { executeTool, WRITE_TOOLS } from './tools';

const MAX_TOOL_ROUNDS = 8;

/**
 * Sends `userMessage` (or, on later iterations, function results) to the
 * chat, executing any requested tool calls, until the model replies with
 * plain text. Write-type tools are routed through `onPendingWrite` so the
 * UI can ask for confirmation before anything touches the database.
 *
 * @param {import('@google/genai').Chat} chat
 * @param {string} userMessage
 * @param {{ onPendingWrite: (name: string, args: object) => Promise<boolean> }} opts
 * @returns {Promise<string>}
 */
export async function runTurn(chat, userMessage, { onPendingWrite }) {
  let response = await chat.sendMessage({ message: userMessage });
  let rounds = 0;

  while (response.functionCalls?.length && rounds < MAX_TOOL_ROUNDS) {
    rounds++;
    const functionResponses = [];

    for (const fc of response.functionCalls) {
      let result;
      try {
        if (WRITE_TOOLS.has(fc.name)) {
          const approved = await onPendingWrite(fc.name, fc.args);
          result = approved
            ? await executeTool(fc.name, fc.args)
            : {
                declined: true,
                message:
                  'The person chose not to run this action. Do not retry it.',
              };
        } else {
          result = await executeTool(fc.name, fc.args);
        }
      } catch (err) {
        result = { error: err.message };
      }
      functionResponses.push({
        functionResponse: { name: fc.name, id: fc.id, response: result },
      });
    }

    response = await chat.sendMessage({ message: functionResponses });
  }

  return response.text || '';
}
