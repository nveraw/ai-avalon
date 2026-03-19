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
import { randomised } from "@/utils/shuffle";
import {
  createPlayerModel,
  createSummaryModel,
  runActionResponses,
  runAssassination,
  runChatResponses,
  runQuestCards,
  runTeamSelection,
  runVoting,
  triggerSummarization,
} from "../agents";

export const initGame = async (
  playerNames: string[],
): Promise<InitGameResponse> => {
  const activeRoles = roleList.slice(0, playerNames.length);
  const shuffled = randomised(activeRoles);
  // comment above and uncomment below to set human as assassin for testing
  // const shuffled = [
  //   roleList[2],
  //   ...randomised(activeRoles.filter((role) => role !== "assassin")),
  // ];

  const humanRole = shuffled[0];
  const players = createPlayerModel(playerNames, shuffled);
  const leaderIndex = Math.floor(Math.random() * playerNames.length);

  setGameState({
    players,
    leaderIndex,
    round: 1,
    rejectCount: 0,
    questResults: [],
    selectedTeam: [],
    stateHistory: {},
    summary: "",
    summarizerModel: createSummaryModel(),
  });

  return {
    humanRole,
    playerRevelation: buildKnowledge(
      humanRole,
      [...players].map((agent) => ({ name: agent.name, role: agent.role })),
    ).map((player) => player.name),
    leader: playerNames[leaderIndex],
    state: {
      questResults: [],
      rejectCount: 0,
      round: 1,
    },
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

  const output = await runTeamSelection(state, names);

  return output ?? defaultOutput;
};

export const addVote = async (
  humanVote: VotedStatus,
): Promise<VoteResponse> => {
  const state = getGameState();
  const defaultOutput: VoteResponse = {
    leader: "",
    result: "approve",
    votes: {},
    selectedTeam: [],
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
      ...state,
      rejectCount: state.rejectCount + 1, // 5 -> evil wins
      leaderIndex: (state.leaderIndex + 1) % state.players.length,
      selectedTeam: [],
      stateHistory: {
        ...state.stateHistory,
        [`round-${state.round}`]: {
          ...(state.stateHistory[`round-${state.round}`] ?? {}),
          votes: allVotes,
        },
      },
    };
    setGameState(newState);
  } else {
    state.rejectCount = 0; // reset after approve
    state.stateHistory[`round-${state.round}`] = {
      ...(state.stateHistory[`round-${state.round}`] ?? {}),
      votes: allVotes,
    };
    setGameState(state);
  }
  const newState = getGameState() ?? state;
  const output: VoteResponse = {
    ...defaultOutput,
    leader: newState.players[newState.leaderIndex].name,
    result,
    votes: allVotes,
    selectedTeam: newState.selectedTeam,
  };
  if (newState.rejectCount >= 5) {
    console.log("addVote", "winner: evil", "rejectCount", newState.rejectCount);
    output["winner"] = {
      players: [...newState.players].map((player) => ({
        name: player.name,
        role: player.role,
      })),
      team: "evil",
    };
  } else {
    output["state"] = {
      questResults: newState.questResults,
      rejectCount: newState.rejectCount,
      round: newState.round,
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
    leader: "",
    result: "success",
    messages: [],
  };
  if (!state) return defaultOutput;

  const { cards, messages } = await runQuestCards(state, humanCard);
  const result = cards.includes("fail") ? "fail" : "success";
  state.stateHistory[`round-${state.round}`] = {
    ...(state.stateHistory[`round-${state.round}`] ?? {}),
    failCards: cards.filter((c) => c === "fail").length,
    result,
  };
  state.leaderIndex = (state.leaderIndex + 1) % state.players.length;
  state.questResults = [...state.questResults, result];
  state.round = state.round + 1;
  setGameState(state);

  const newState = getGameState() ?? state;
  await triggerSummarization(newState, messages);

  const output: QuestResponse = {
    ...defaultOutput,
    cards,
    leader: newState.players[newState.leaderIndex].name,
    result,
    messages,
  };

  if (newState.questResults.filter((r) => r === "success").length >= 3) {
    console.log(
      "setQuest",
      "winner: good",
      "questResults",
      newState.questResults,
    );
    output["winner"] = {
      players: [...newState.players].map((player) => ({
        name: player.name,
        role: player.role,
      })),
      team: "good",
    };
  } else if (newState.questResults.filter((r) => r === "fail").length >= 3) {
    console.log(
      "setQuest",
      "winner: evil",
      "questResults",
      newState.questResults,
    );
    output["winner"] = {
      players: [...newState.players].map((player) => ({
        name: player.name,
        role: player.role,
      })),
      team: "evil",
    };
  } else {
    output["state"] = {
      questResults: newState.questResults,
      rejectCount: newState.rejectCount,
      round: newState.round,
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
    winner: {
      team: "good",
      players: [],
    },
  };
  if (!state) return defaultOutput;

  const target = name ?? (await runAssassination(state));
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
  console.log(
    "assassinate",
    "winner: evil",
    "target",
    target,
    "merlin",
    isCorrect,
  );

  return {
    ...defaultOutput,
    targetName: target,
    winner: {
      team: isCorrect ? "evil" : "good",
      players: [...state.players].map((player) => ({
        name: player.name,
        role: player.role,
      })),
    },
    messages: filtered,
  };
};
