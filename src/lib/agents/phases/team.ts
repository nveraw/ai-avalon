import { QUEST_SIZES } from "@/constants/questConfigs";
import { GameState, getGameState, setGameState } from "@/lib/game/serverState";
import { ChatMessage } from "@/types/chat.types";
import { HumanMessage, SystemMessage } from "langchain";
import { TeamSelectionOutput, TeamSelectionSchema } from "../output.schema";
import { buildAgentSystemPrompt } from "../prompts/builder";
import { runActionResponses } from "../runner";
import { triggerSummarization } from "../summarizer";

export async function runTeamSelection(
  names: string[],
  state: GameState,
): Promise<{ proposedTeam: string[]; messages: ChatMessage[] } | undefined> {
  const leader = state.players[state.leaderIndex];
  const questSizes = QUEST_SIZES[state.players.length] ?? QUEST_SIZES[7];
  const teamSize = questSizes[state.round - 1];
  const playerNames = state.players.map((p) => p.name).join(", ");

  const systemPrompt = buildAgentSystemPrompt(leader.role, state);
  const userPrompt = `You are the current leader. Choose exactly ${teamSize} players from: ${playerNames}.
You may include yourself if you believe it helps. Return your selection now.`;

  const model = leader.model;
  if (!model) return;

  const structured = model.withStructuredOutput(TeamSelectionSchema);
  const output: TeamSelectionOutput = await structured.invoke([
    new SystemMessage(systemPrompt),
    new HumanMessage(userPrompt),
  ]);

  // Validate and clamp selection to exactly teamSize
  let selectedTeam = output.selectedPlayers.filter((name) =>
    state.players.some((p) => p.name === name),
  );

  if (selectedTeam.length !== teamSize) {
    // Fallback: fill with random valid players
    const pool = state.players
      .map((p) => p.name)
      .filter((n) => !selectedTeam.includes(n));
    while (selectedTeam.length < teamSize && pool.length > 0) {
      const idx = Math.floor(Math.random() * pool.length);
      selectedTeam.push(pool.splice(idx, 1)[0]);
    }
    selectedTeam = selectedTeam.slice(0, teamSize);
  }

  if (leader.privateMemory) {
    leader.privateMemory.push(
      `Round ${state.round} ${leader.name} (my) team selection: ${selectedTeam.join(", ")}. Reasoning: ${output.privateReasoning}`,
    );
    setGameState({
      ...state,
      selectedTeam,
      players: [
        ...state.players.map((player) =>
          player.name === leader.name ? { ...leader } : player,
        ),
      ],
    });
  }
  console.log("runTeamSelection", {
    name: leader.name,
    role: leader.role,
    privateMemory: leader.privateMemory,
  });

  const messages = await getTeamSelectionResponse(
    names,
    getGameState() ?? state,
  );

  return {
    proposedTeam: selectedTeam,
    messages: [{ from: leader.name, text: output.publicMessage }, ...messages],
  };
}

const getTeamSelectionResponse = async (
  names: string[],
  state: GameState,
): Promise<ChatMessage[]> => {
  const teamNames = state.selectedTeam.join(", ");
  const leaderName = state.players[state.leaderIndex].name;

  const nonLeaderPlayers = state.players.filter(
    (player) => names.length > 0 || player.name !== leaderName,
  );
  const messages = await runActionResponses(
    nonLeaderPlayers,
    state,
    `The leader ${leaderName} has proposed this team: ${teamNames}.`,
  );
  const filtered = messages.filter((msg) => !!msg);

  triggerSummarization(state, filtered);

  return filtered;
};
