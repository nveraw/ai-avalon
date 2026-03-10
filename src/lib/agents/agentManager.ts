import { PLAYER_ROLES } from "@/constants/playerRoles";
import { QUEST_SIZES } from "@/constants/questConfigs";
import { ChatMessage } from "@/store/chat";
import { PlayerRole } from "@/types/player.types";
import { ChatMistralAI } from "@langchain/mistralai";
import { HumanMessage, SystemMessage } from "langchain";
import { AgentPlayer, GameState, setGameState } from "../game/gameStore";
import {
  AssassinationOutput,
  AssassinationSchema,
  ChatResponseOutput,
  ChatResponseSchema,
  QuestCardOutput,
  QuestCardSchema,
  TeamSelectionOutput,
  TeamSelectionSchema,
  VoteOutput,
  VoteSchema,
} from "./output.schema";
import { buildAgentSystemPrompt, buildSummaryPrompt } from "./prompts/builder";
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
      names.map((n, i) => ({ name: n, role: roles[i] })),
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

export async function runChatResponses(
  state: GameState,
  humanMessage: ChatMessage,
): Promise<ChatMessage[]> {
  const chats = state.players.map(async (player) => {
    const systemPrompt = buildAgentSystemPrompt(player.role, state);
    const userPrompt = `${humanMessage.from} just said: "${humanMessage.text}"
Respond in character at the Round Table. 1–2 sentences. You may address the human or other players. Address yourself as first person to sound natural.`;

    const model = player.model;
    if (!model) return;
    const structured = model.withStructuredOutput(ChatResponseSchema);
    const output: ChatResponseOutput = await structured.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(userPrompt),
    ]);

    return { from: player.name, text: output.publicMessage };
  });
  const messages = await Promise.all(chats);
  const filtered = messages.filter((msg) => !!msg);

  triggerSummarization(state, filtered);

  return filtered;
}

export async function runActionResponses(
  player: AgentPlayer,
  state: GameState,
  actionPrompt: string,
): Promise<ChatMessage | undefined> {
  const systemPrompt = buildAgentSystemPrompt(player.role, state);
  const userPrompt = `${actionPrompt}
Respond in character at the Round Table. 1–2 sentences. You may address the human or other players.`;

  const model = player.model;
  if (!model) return;
  const structured = model.withStructuredOutput(ChatResponseSchema);
  const output: ChatResponseOutput = await structured.invoke([
    new SystemMessage(systemPrompt),
    new HumanMessage(userPrompt),
  ]);

  return { from: player.name, text: output.publicMessage };
}

export async function triggerSummarization(
  state: GameState,
  chatMessages: ChatMessage[],
) {
  const messages = chatMessages.map(({ from, text }) => `${from}: ${text}`);
  const response = await state.summarizerModel.invoke([
    new SystemMessage(buildSummaryPrompt(state)),
    new HumanMessage(
      `Previous summary: ${state.summary}\n\nNew messages:\n${messages.join("\n")}`,
    ),
  ]);

  console.log("summary", response.content as string);

  setGameState({
    ...state,
    summary: response.content as string,
  });
}

export async function runTeamSelection(
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

  return {
    proposedTeam: selectedTeam,
    messages: [{ from: leader.name, text: output.publicMessage }],
  };
}

export async function runVoting(
  state: GameState,
): Promise<Record<string, "approve" | "reject"> | undefined> {
  const teamNames = state.selectedTeam.join(", ");
  const leaderName = state.players[state.leaderIndex].name;

  const votePromises = state.players.map(
    async (
      player,
    ): Promise<
      | {
          name: string;
          vote: "approve" | "reject";
        }
      | undefined
    > => {
      const systemPrompt = buildAgentSystemPrompt(player.role, state);
      const userPrompt = `The leader ${leaderName} has proposed this team: ${teamNames}.
Vote to APPROVE or REJECT this team. Consider your role and whether this team serves your goals.
Note: the human player's vote is unknown to you.`;

      const model = player.model;
      if (!model) return;

      const structured = model.withStructuredOutput(VoteSchema);
      const output: VoteOutput = await structured.invoke([
        new SystemMessage(systemPrompt),
        new HumanMessage(userPrompt),
      ]);

      if (player.privateMemory) {
        player.privateMemory.push(
          `Round ${state.round} vote on ${leaderName}${leaderName === player.name ? " (my)" : ""} selected team [${teamNames}]: ${output.vote}. Reasoning: ${output.privateReasoning}`,
        );
        setGameState({
          ...state,
          players: [
            ...state.players.map((p) =>
              p.name === player.name ? { ...player } : p,
            ),
          ],
        });
        console.log("runVoting", {
          name: player.name,
          role: player.role,
          privateMemory: player.privateMemory,
        });
      }

      return {
        name: player.name,
        vote: output.vote,
      };
    },
  );

  const results = await Promise.all(votePromises);

  const votes: Record<string, "approve" | "reject"> = {};
  for (const r of results) {
    if (r?.name) votes[r.name] = r.vote;
  }

  return votes;
}

export async function runQuestCards(
  state: GameState,
  humanCard: "success" | "fail" | null,
): Promise<{ cards: Array<"success" | "fail">; messages: ChatMessage[] }> {
  const teamPlayers = state.players.filter((p) =>
    state.selectedTeam.includes(p.name),
  );

  const cardPromises = teamPlayers.map(
    async (player): Promise<"success" | "fail" | undefined> => {
      if (!player.model) return;
      // Good players MUST play success — enforce the rule hard here
      if (PLAYER_ROLES[player.role].team === "good") {
        if (player.privateMemory) {
          player.privateMemory.push(
            `Round ${state.round}: played success card (loyal player has no choice).`,
          );
          setGameState({
            ...state,
            players: [
              ...state.players.map((p) =>
                p.name === player.name ? { ...player } : p,
              ),
            ],
          });
          console.log("runQuestCards loyal", {
            name: player.name,
            role: player.role,
            privateMemory: player.privateMemory,
          });
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
        setGameState({
          ...state,
          players: [
            ...state.players.map((p) =>
              p.name === player.name ? { ...player } : p,
            ),
          ],
        });
        console.log("runQuestCards evil", {
          name: player.name,
          role: player.role,
          privateMemory: player.privateMemory,
        });
      }

      return output.card;
    },
  );

  const aiCards = await Promise.all(cardPromises);

  // Add human card if they were on the team
  const allCards: Array<"success" | "fail"> = [];
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

  const chatPromises = observers.map(
    async (player): Promise<ChatMessage | undefined> => {
      const userPrompt = `The quest has just ${questResult === "fail" ? "FAILED" : "SUCCEEDED"}. Team on the quest: ${state.selectedTeam} picked by leader: ${state.players[state.leaderIndex].name}
React briefly in character (1–2 sentences). Be strategic — your reaction reveals information.`;

      return await runActionResponses(player, state, userPrompt);
    },
  );
  const messages = await Promise.all(chatPromises);
  const filtered = messages.filter((msg) => !!msg);

  return { cards: allCards, messages: filtered };
}

export async function runAssassination(state: GameState): Promise<string> {
  const assassin = state.players.find((p) => p.role === "assassin")!;

  const goodPlayers = state.players
    .filter((p) => PLAYER_ROLES[p.role].team === "good")
    .map((p) => p.name)
    .join(", ");

  const systemPrompt = buildAgentSystemPrompt(assassin.role, state);
  const userPrompt = `Good has won 3 quests. As the Assassin, you must now identify and kill Merlin.
Available targets: ${goodPlayers}.
Use everything you know — their voting patterns, quest choices, and chat behaviour — to identify Merlin.
Choose wisely. If you kill Merlin, Evil wins.

MERLIN DETECTION MODEL

Track players who may be Merlin.

Signs of Merlin:

* Correctly avoids evil players on quests
* Makes accurate accusations
* Influences team selection effectively

Maintain a Merlin probability estimate.

Example:

Merlin suspicion:
Red: 0.10
Blue: 0.50
Yellow: 0.40

Use this model when making the final assassination decision.
`;

  const model = assassin.model;
  if (!model) return "";
  const structured = model.withStructuredOutput(AssassinationSchema);
  const output: AssassinationOutput = await structured.invoke([
    new SystemMessage(systemPrompt),
    new HumanMessage(userPrompt),
  ]);

  // Validate target exists
  const validTarget = state.players.find((p) => p.name === output.target);
  const finalTarget = validTarget
    ? output.target
    : state.players.find((p) => p.role !== "assassin")!.name;

  if (assassin.privateMemory) {
    assassin.privateMemory.push(
      `Assassination target: ${finalTarget}. Reasoning: ${output.privateReasoning}`,
    );
    setGameState({
      ...state,
      players: [
        ...state.players.map((p) =>
          p.name === assassin.name ? { ...assassin } : p,
        ),
      ],
    });
    console.log("runAssassination", {
      name: assassin.name,
      role: assassin.role,
      privateMemory: assassin.privateMemory,
    });
  }

  return finalTarget;
}
