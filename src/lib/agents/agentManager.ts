import { QUEST_SIZES } from "@/constants/questConfigs";
import { ChatMessage } from "@/types/api.types";
import { PlayerRole } from "@/types/player.types";
import { ChatMistralAI } from "@langchain/mistralai";
import { HumanMessage, SystemMessage } from "langchain";
import { AgentPlayer, GameState } from "../game/gameStore";
import { TeamSelectionOutput, TeamSelectionSchema } from "./output.schema";
import { buildAgentSystemPrompt } from "./prompts/init";

export const createLlmModel = (
  names: string[],
  roles: PlayerRole[],
): AgentPlayer[] => {
  return names.map((name, i) => ({
    name,
    role: roles[i],
    model: new ChatMistralAI({ model: "mistral-small-latest" }),
    privateMemory: [],
  }));
};

export async function runTeamSelection(
  state: GameState,
): Promise<{ proposedTeam: string[]; messages: ChatMessage[] }> {
  const leader = state.players[state.leaderIndex];
  const questSizes = QUEST_SIZES[state.players.length] ?? QUEST_SIZES[7];
  const teamSize = questSizes[state.round - 1];
  const playerNames = state.players.map((p) => p.name).join(", ");

  const systemPrompt = buildAgentSystemPrompt(leader.role, state);
  const userPrompt = `You are the current leader. Choose exactly ${teamSize} players from: ${playerNames}.
You may include yourself if you believe it helps. Return your selection now.`;

  const model = leader.model;
  const structured = model.withStructuredOutput(TeamSelectionSchema);
  const output: TeamSelectionOutput = await structured.invoke([
    new SystemMessage(systemPrompt),
    new HumanMessage(userPrompt),
  ]);

  // Validate and clamp selection to exactly teamSize
  let selected = output.selectedPlayers.filter((name) =>
    state.players.some((p) => p.name === name),
  );

  if (selected.length !== teamSize) {
    // Fallback: fill with random valid players
    const pool = state.players
      .map((p) => p.name)
      .filter((n) => !selected.includes(n));
    while (selected.length < teamSize && pool.length > 0) {
      const idx = Math.floor(Math.random() * pool.length);
      selected.push(pool.splice(idx, 1)[0]);
    }
    selected = selected.slice(0, teamSize);
  }

  leader.privateMemory.push(
    `Round ${state.round} team selection reasoning: ${output.privateReasoning}`,
  );

  return {
    proposedTeam: selected,
    messages: [{ from: leader.name, text: output.publicMessage }],
  };
}
