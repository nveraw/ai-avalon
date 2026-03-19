"use client";

import ChatPanel from "@/components/ChatPanel";
import { QUEST_SIZES } from "@/constants/questConfigs";
import Assassination from "@/screens/Assassination/Assassination";
import Board from "@/screens/Board/Board";
import Lobby from "@/screens/Lobby/Lobby";
import Night from "@/screens/Night/Night";
import Quest from "@/screens/Quest/Quest";
import Results from "@/screens/Result/Results";
import TeamSelection from "@/screens/TeamSelection/TeamSelection";
import Voting from "@/screens/Voting/Voting";
import { startGame } from "@/services/api";
import {
  AssassinationResponse,
  InitGameResponse,
  QuestResponse,
  VoteResponse,
} from "@/types/api.types";
import type { PlayerDetails } from "@/types/game.types";
import { useState } from "react";

interface InitStage extends InitGameResponse {
  screen: "lobby" | "night" | "game" | "team";
}
interface VoteStage extends VoteResponse {
  screen: "result" | "game" | "quest";
}
interface QuestState extends QuestResponse {
  screen: "assassin" | "result" | "game";
}
interface AssassinState extends AssassinationResponse {
  screen: "result";
}
type GameData =
  | InitStage
  | { screen: "vote"; selectedTeam: string[] }
  | VoteStage
  | QuestState
  | AssassinState
  | undefined;

const Game = () => {
  const [playerNames, setPlayerNames] = useState<string[]>([]);
  const [player, setPlayer] = useState<PlayerDetails>();
  const [data, setData] = useState<GameData>();

  const handleReady = async (playerNames: string[]) => {
    setPlayerNames(playerNames);
    const res = await startGame({ playerNames });
    if (res) {
      setData({ ...res, screen: "night" });
      setPlayer({ name: playerNames[0], role: res.humanRole });
    }
  };

  const handleStart = () => {
    setData((prevData) => ({ ...prevData, screen: "game" }) as InitStage);
  };

  const handleSelectTeam = () => {
    setData((prevData) => ({ ...prevData, screen: "team" }) as InitStage);
  };

  const handleProposeTeam = (selectedTeam: string[]) => {
    setData({ selectedTeam, screen: "vote" });
  };

  const handleVotingResult = (res: VoteResponse) => {
    if (res.result === "reject") {
      const rejectCount = res.state?.rejectCount || 0;
      if (rejectCount >= 5 || res.winner?.team === "evil") {
        setData({ ...res, screen: "result" });
      } else {
        setData({ ...res, screen: "game" });
      }
    } else {
      setData({ ...res, screen: "quest" });
    }
  };

  const handleQuestResult = (res: QuestResponse) => {
    switch (res.winner?.team) {
      case "good":
        setData({ ...res, screen: "assassin" });
        break;

      case "evil":
        setData({ ...res, screen: "result" });
        break;

      default:
        setData({ ...res, screen: "game" });
        break;
    }
  };

  const handleRevealAssassination = (res: AssassinationResponse) => {
    setData({ ...res, screen: "result" });
  };

  if (!data) {
    return <Lobby onStart={handleReady} />;
  }

  const showChat = !["lobby", "night"].includes(data.screen);

  return (
    <>
      <div className="relative h-screen overflow-auto z-10 transition-all duration-300 flex-1">
        {data.screen === "lobby" && <Lobby onStart={handleReady} />}
        {data.screen === "night" && playerNames.length > 1 && (
          <Night
            playerNames={playerNames}
            knowledge={{
              humanRole: data.humanRole,
              playerRevelation: data.playerRevelation,
            }}
            onDone={handleStart}
          />
        )}

        {data.screen === "game" && (
          <Board
            leader={data.leader ?? ""}
            onSelectTeam={handleSelectTeam}
            playerNames={playerNames}
            questResults={data.state?.questResults || []}
            rejectCount={data.state?.rejectCount || 0}
            round={data.state?.round || 0}
          />
        )}

        {data.screen === "team" && (
          <TeamSelection
            leader={data.leader}
            onConfirm={handleProposeTeam}
            humanName={player!.name}
            playerNames={playerNames}
            teamSize={QUEST_SIZES[playerNames.length][data.state?.round - 1]}
          />
        )}

        {data.screen === "vote" && (
          <Voting
            playerNames={playerNames}
            humanName={player!.name}
            team={data.selectedTeam}
            onResult={handleVotingResult}
          />
        )}

        {data.screen === "quest" && (
          <Quest
            player={player!}
            team={data.selectedTeam}
            onResult={handleQuestResult}
          />
        )}

        {data.screen === "assassin" && (
          <Assassination
            player={player!}
            playerNames={playerNames}
            onReveal={handleRevealAssassination}
          />
        )}

        {data.screen === "result" && (
          <Results
            allPlayers={data.winner?.players || []}
            assassinated={"targetName" in data ? (data.targetName ?? "") : ""}
            winner={data.winner?.team || "good"}
            onRestart={() => window.location.reload()}
          />
        )}
      </div>
      {showChat && (
        <ChatPanel
          className="top-14 right-0 bottom-0 z-30 w-72 h-screen flex flex-col
          border-l border-indigo-950 bg-black/95 backdrop-blur-xl"
          playerNames={playerNames}
        />
      )}
    </>
  );
};

export default Game;
