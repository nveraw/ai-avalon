import { roleList } from "@/constants/playerRoles";
import { getGameState, setGameState } from "@/lib/game/serverState";
import {
  AssassinationResponse,
  ChatResponse,
  InitGameResponse,
  QuestResponse,
  TeamSelectionResponse,
  VoteResponse,
} from "@/types/api.types";
import { ChatMessage } from "@/types/chat.types";
import { CompletedQuestStatus, VotedStatus } from "@/types/quest.types";
import { buildKnowledge } from "@/utils/knowledge";
import { randomRoleToAssign } from "@/utils/shuffle";
import { ChatMistralAI } from "@langchain/mistralai";
import { createLlmModel } from "../agents/factory";
import { runAssassination } from "../agents/phases/assassin";
import { runQuestCards } from "../agents/phases/quest";
import { runTeamSelection } from "../agents/phases/team";
import { runVoting } from "../agents/phases/vote";
import { runActionResponses, runChatResponses } from "../agents/runner";
import { triggerSummarization } from "../agents/summarizer";

export const initGame = (playerNames: string[]): InitGameResponse => {
  const activeRoles = roleList.slice(0, playerNames.length);
  const shuffled = randomRoleToAssign(activeRoles);
  const humanRole = shuffled[0];

  const players = createLlmModel(playerNames, shuffled);
  const leaderIndex = Math.floor(Math.random() * playerNames.length);

  setGameState({
    players,
    leaderIndex,
    round: 1,
    rejectCount: 0,
    questResults: [],
    selectedTeam: [],
    summary: "",
    summarizerModel: new ChatMistralAI({
      model: "mistral-small-latest",
    }),
  });

  return {
    humanRole,
    playerRevelation: buildKnowledge(
      humanRole,
      [...players].map((agent) => ({ name: agent.name, role: agent.role })),
    ).map((player) => player.name),
    leader: playerNames[leaderIndex],
  };
};

export const addChat = async (message: ChatMessage): Promise<ChatResponse> => {
  const state = getGameState();
  const defaultOutput = {
    messages: [],
  };
  if (!state) return defaultOutput;

  const messages = await runChatResponses(state, message);

  return { messages };
};

export const setTeam = async (
  names: string[],
): Promise<TeamSelectionResponse> => {
  const state = getGameState();
  const defaultOutput = {
    proposedTeam: names,
    messages: [],
  };
  if (!state) return defaultOutput;

  const output: TeamSelectionResponse =
    (await runTeamSelection(names, state)) ?? defaultOutput;
  if (names.length) {
    setGameState({
      ...state,
      selectedTeam: names,
    });
  }

  return output;
};

export const addVote = async (
  humanVote: VotedStatus,
): Promise<VoteResponse> => {
  const state = getGameState();
  const defaultOutput: VoteResponse = {
    nextLeader: "",
    rejectCount: 0,
    result: "approve",
    votes: {},
  };
  if (!state) return defaultOutput;

  const votes = await runVoting(state);

  const allVotes = { [state.players[0].name]: humanVote, ...votes };

  const approves = Object.values(allVotes).filter(
    (v) => v === "approve",
  ).length;

  const result: VotedStatus =
    approves > state.players.length / 2 ? "approve" : "reject";

  if (result === "reject") {
    const newState = {
      rejectCount: state.rejectCount + 1, // 5 -> evil wins
      leaderIndex: (state.leaderIndex + 1) % state.players.length,
      selectedTeam: [],
    };
    setGameState({
      ...state,
      ...newState,
    });
  } else {
    setGameState({
      ...state,
      rejectCount: 0, // reset after approve
    });
  }
  const newState = getGameState() ?? state;
  const output: VoteResponse = {
    nextLeader: newState.players[newState.leaderIndex].name,
    rejectCount: newState.rejectCount,
    result,
    votes: allVotes,
  };
  if (newState.rejectCount >= 5) {
    output["winner"] = {
      players: [...newState.players].map((player) => ({
        name: player.name,
        role: player.role,
      })),
      team: "evil",
    };
  }
  return output;
};

export const setQuest = async (
  humanCard: CompletedQuestStatus | null,
): Promise<QuestResponse> => {
  const state = getGameState();
  const defaultOutput: QuestResponse = {
    cards: [],
    nextLeader: "",
    result: "success",
    messages: [],
    winner: {
      team: "good",
      players: [],
    },
  };
  if (!state) return defaultOutput;

  const { cards, messages } = await runQuestCards(state, humanCard);
  const result = cards.includes("fail") ? "fail" : "success";
  setGameState({
    ...state,
    leaderIndex: (state.leaderIndex + 1) % state.players.length,
    questResults: [...state.questResults, result],
    round: state.round + 1,
  });
  const newState = getGameState() ?? state;
  triggerSummarization(newState, messages);

  const output: QuestResponse = {
    cards,
    nextLeader: newState.players[newState.leaderIndex].name,
    result,
    messages,
  };

  if (newState.questResults.filter((r) => r === "success").length >= 3) {
    output["winner"] = {
      players: [...newState.players].map((player) => ({
        name: player.name,
        role: player.role,
      })),
      team: "good",
    };
  } else if (newState.questResults.filter((r) => r === "fail").length >= 3) {
    output["winner"] = {
      players: [...newState.players].map((player) => ({
        name: player.name,
        role: player.role,
      })),
      team: "evil",
    };
  }
  return output;
};

export const assassinate = async (
  name: string,
): Promise<AssassinationResponse> => {
  const state = getGameState();
  const defaultOutput: AssassinationResponse = {
    targetName: "",
    messages: [],
    team: "good",
    players: [],
  };
  if (!state) return defaultOutput;

  const target = (await runAssassination(state)) ?? name;
  const isCorrect =
    state.players.find((p) => p.name === target)?.role === "merlin";

  const nonAssassinPlayers = state.players.filter(
    (player) => player.role !== "assassin",
  );
  const messages = await runActionResponses(
    nonAssassinPlayers,
    state,
    `The assassin had marked ${target}. The target is ${isCorrect ? "" : "not"} Merlin.`,
  );
  const filtered = messages.filter((msg) => !!msg);

  return {
    targetName: target,
    team: isCorrect ? "evil" : "good",
    players: [...state.players].map((player) => ({
      name: player.name,
      role: player.role,
    })),
    messages: filtered,
  };
};
