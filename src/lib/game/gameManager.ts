import { roleList } from "@/constants/playerRoles";
import { getGameState, setGameState } from "@/lib/game/gameStore";
import { ChatMessage } from "@/store/chat";
import {
  AssassinationResponse,
  ChatResponse,
  InitGameResponse,
  QuestResponse,
  TeamSelectionResponse,
  VoteResponse,
} from "@/types/api.types";
import { CompletedQuestStatus } from "@/types/quest.types";
import { VotedStatus, VotingStatus } from "@/types/vote.types";
import { buildKnowledge } from "@/utils/knowledge";
import { randomRoleToAssign } from "@/utils/shuffle";
import { ChatMistralAI } from "@langchain/mistralai";
import {
  createLlmModel,
  runActionResponses,
  runAssassination,
  runChatResponses,
  runQuestCards,
  runTeamSelection,
  runVoting,
  triggerSummarization,
} from "../agents/agentManager";

export const initGame = (playerNames: string[]): InitGameResponse => {
  const activeRoles = roleList.slice(0, playerNames.length);
  const shuffled = randomRoleToAssign(activeRoles);
  const humanRole = shuffled[0];

  const players = createLlmModel(playerNames.slice(1), shuffled.slice(1));
  const leaderIndex = Math.floor(Math.random() * playerNames.length);

  setGameState({
    players: [{ name: playerNames[0], role: humanRole }, ...players],
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
    playerRevelation:
      buildKnowledge(
        humanRole,
        [...players].map((agent) => ({ name: agent.name, role: agent.role })),
      ).map((player) => player.name) || [],
    leader: playerNames[leaderIndex],
  };
};

export const addChat = async (message: ChatMessage): Promise<ChatResponse> => {
  const state = getGameState();
  console.log("state", state);
  const defaultOutput = {
    messages: [],
  };
  if (!state) return defaultOutput;

  const chats = state.players.map(async (player) => {
    return await runChatResponses(player, state, message);
  });
  const messages = await Promise.all(chats);
  const filtered = messages.filter((msg) => !!msg);

  return { messages: filtered };
};

export const setTeam = async (
  names: string[],
): Promise<TeamSelectionResponse> => {
  const state = getGameState();
  console.log("state", state);
  const defaultOutput = {
    proposedTeam: names,
    messages: [],
  };
  if (!state) return defaultOutput;

  const output: TeamSelectionResponse =
    (await runTeamSelection(state)) ?? defaultOutput;
  const newState = getGameState() ?? state;
  const teamNames = newState.selectedTeam.join(", ");
  const leaderName = newState.players[newState.leaderIndex].name;

  const nonLeaderPlayers = newState.players.filter(
    (player) => names.length > 0 || player.name !== leaderName,
  );
  console.log("nonLeaderPlayers", nonLeaderPlayers);
  const chats = nonLeaderPlayers.map(async (player) => {
    return await runActionResponses(
      player,
      newState,
      `The leader ${leaderName} has proposed this team: ${teamNames}}`,
    );
  });
  const messages = await Promise.all(chats);
  console.log("messages", messages);
  output.messages = messages.filter((msg) => !!msg);
  console.log("output.messages", output.messages);

  triggerSummarization(newState, output.messages);

  return output;
};

export const addVote = async (
  humanVote: VotedStatus,
): Promise<VoteResponse> => {
  const state = getGameState();
  console.log("state", state);
  const defaultOutput: VoteResponse = {
    nextLeader: "",
    rejectCount: 0,
    result: "approve",
    votes: {},
  };
  if (!state) return defaultOutput;

  const votes = await runVoting(state);
  console.log("votes", votes);

  const allVotes = { [state.players[0].name]: humanVote, ...votes };
  console.log("allVotes", allVotes);

  const approves = Object.values(allVotes).filter(
    (v) => v === "approve",
  ).length;
  console.log("approves", approves);

  const result: VotingStatus =
    approves > state.players.length / 2 ? "approve" : "reject";
  console.log("result", result);

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
  console.log("output", output);
  return output;
};

export const setQuest = async (
  humanCard: CompletedQuestStatus | null,
): Promise<QuestResponse> => {
  const state = getGameState();
  console.log("state", state);
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
  console.log("cards", cards);
  const result = cards.includes("fail") ? "fail" : "success";
  console.log("result", result);
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
  console.log("output", output);
  return output;
};

export const assassinate = async (
  name: string,
): Promise<AssassinationResponse> => {
  const state = getGameState();
  console.log("state", state);
  const defaultOutput: AssassinationResponse = {
    targetName: "",
    messages: [],
    team: "good",
    players: [],
  };
  if (!state) return defaultOutput;

  const target = (await runAssassination(state)) ?? name;
  console.log("target", target);
  const isCorrect =
    state.players.find((p) => p.name === name)?.role === "merlin";
  console.log("isCorrect", isCorrect);

  const nonAssassinPlayers = state.players.filter(
    (player) => player.role !== "assassin",
  );
  const chats = nonAssassinPlayers.map(async (player) => {
    return await runActionResponses(
      player,
      state,
      `The assassin had marked ${target}. The target is ${isCorrect ? "" : "not"} Merlin.`,
    );
  });
  const messages = await Promise.all(chats);
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
