import { PlayerRole } from "@/types/game.types";
import { ChatMistralAI } from "@langchain/mistralai";
import { AgentPlayer } from "../game/serverState";
import { roleDescription } from "./prompts/role";

export const createLlmModel = (
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
      model: new ChatMistralAI({ model: "mistral-small-latest" }),
      privateMemory: [roleCtx.knowledge],
    };
  });
