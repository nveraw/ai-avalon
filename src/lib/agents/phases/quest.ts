import { PLAYER_ROLES } from "@/constants/playerRoles";
import { GameState, setGameState } from "@/lib/game/serverState";
import { ChatMessage } from "@/types/chat.types";
import { CompletedQuestStatus } from "@/types/quest.types";
import { randomised } from "@/utils/shuffle";
import { HumanMessage, SystemMessage } from "langchain";
import { runActionResponses } from "../chatResponse";
import { QuestCardOutput, QuestCardSchema } from "../output.schema";
import { buildAgentSystemPrompt } from "../prompts/builder";

export async function runQuestCards(
  state: GameState,
  humanCard: CompletedQuestStatus | null,
): Promise<{ cards: Array<CompletedQuestStatus>; messages: ChatMessage[] }> {
  const teamPlayers = state.players.filter((p) =>
    state.selectedTeam.includes(p.name),
  );

  const cardPromises = teamPlayers.map(
    async (player): Promise<CompletedQuestStatus | undefined> => {
      if (!player.model) return;
      // Good players MUST play success — enforce the rule hard here
      if (PLAYER_ROLES[player.role].team === "good") {
        if (player.privateMemory) {
          player.privateMemory.push(
            `Round ${state.round}: played success card (loyal player has no choice).`,
          );
        }
        return "success";
      }

      const systemPrompt = buildAgentSystemPrompt(player.role, state);
      const userPrompt = `You are on the quest team. Choose your card: SUCCESS or FAIL.
As an evil player, failing helps your team — but failing too often makes you suspicious.
Consider the current score and whether now is the right moment to betray.`;

      const model = player.model;
      const structured = model.withStructuredOutput(QuestCardSchema);
      const output: QuestCardOutput = await structured.invoke([
        new SystemMessage(systemPrompt),
        new HumanMessage(userPrompt),
      ]);

      if (player.privateMemory) {
        player.privateMemory.push(
          `Round ${state.round} quest card: ${output.card}. Reasoning: ${output.privateReasoning}`,
        );
        console.log("reason", "runQuestCards evil", {
          name: player.name,
          role: player.role,
          privateMemory: player.privateMemory,
        });
        state.players = [
          ...state.players.map((p) =>
            p.name === player.name ? { ...player } : p,
          ),
        ];
      }

      return output.card;
    },
  );

  const cards = await Promise.all(cardPromises);
  setGameState(state);

  // Add human card if they were on the team
  const allCards: CompletedQuestStatus[] = cards.filter((c) => !!c);
  if (!!humanCard) {
    allCards.push(humanCard);
  }
  const shuffled = randomised(allCards);

  // Post-quest chat from non-participating AI players reacting to result
  const questResult = shuffled.includes("fail") ? "fail" : "success";
  const observers = state.players.filter(
    (p) => !state.selectedTeam.includes(p.name),
  );

  const messages = await runActionResponses(
    observers,
    state,
    `The quest has just ${questResult === "fail" ? "FAILED" : "SUCCEEDED"}. Team on the quest: ${state.selectedTeam} picked by leader: ${state.players[state.leaderIndex].name}
React briefly in character (1–2 sentences). Be strategic — your reaction reveals information.`,
  );
  const filtered = messages.filter((msg) => !!msg);

  return { cards: shuffled, messages: filtered };
}
