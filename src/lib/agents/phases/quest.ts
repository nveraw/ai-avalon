import { PLAYER_ROLES } from "@/constants/playerRoles";
import { GameState, setGameState } from "@/lib/game/serverState";
import { ChatMessage } from "@/types/chat.types";
import { CompletedQuestStatus } from "@/types/quest.types";
import { HumanMessage, SystemMessage } from "langchain";
import { QuestCardOutput, QuestCardSchema } from "../output.schema";
import { buildAgentSystemPrompt } from "../prompts/builder";
import { runActionResponses } from "../runner";

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
      }

      console.log("runQuestCards loyal", {
        name: player.name,
        role: player.role,
        privateMemory: player.privateMemory,
      });

      return output.card;
    },
  );

  const aiCards = await Promise.all(cardPromises);
  setGameState({
    ...state,
    players: [...state.players],
  });

  // Add human card if they were on the team
  const allCards: Array<CompletedQuestStatus> = [];
  for (const card of aiCards) {
    if (!card && humanCard) {
      allCards.push(humanCard);
    } else if (card) {
      allCards.push(card);
    }
  }

  // Shuffle so no one can identify who played what
  for (let i = allCards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allCards[i], allCards[j]] = [allCards[j], allCards[i]];
  }

  // Post-quest chat from non-participating AI players reacting to result
  const questResult = allCards.includes("fail") ? "fail" : "success";
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

  return { cards: allCards, messages: filtered };
}
