import { PlayerRole } from "@/types/game.types";
import { ChatMistralAI } from "@langchain/mistralai";
import { AgentPlayer } from "../game/serverState";
import { roleDescription } from "./prompts/role";

export const createPlayerModel = (
  names: string[],
  roles: PlayerRole[],
): AgentPlayer[] =>
  names.map((name, i) => {
    if (i === 0) {
      return { name, role: roles[i] };
    }
    const role = roles[i];
    const roleCtx = roleDescription(
      role,
      names.map((n, j) => ({ name: n, role: roles[j] })),
    );
    console.log("createLLM", {
      name,
      role,
      privateMemory: [roleCtx.knowledge],
    });
    return {
      name,
      role: role,
      // model: new ChatOllama({ model: "llama3.1", temperature: 0.3 }),
      model: new ChatMistralAI({
        model: "mistral-small-latest",
        temperature: 0.3,
      }),
      privateMemory: [roleCtx.knowledge],
    };
  });

export const createSummaryModel = () => {
  // return new ChatOllama({ model: "llama3.1", temperature: 0.3 });
  return new ChatMistralAI({ model: "mistral-small-latest", temperature: 0.3 });
};
