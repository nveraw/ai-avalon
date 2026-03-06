"use client";

import { PLAYER_ROLES } from "@/constants/playerRoles";
import { QUEST_SIZES } from "@/constants/questConfigs";
import Assassination from "@/screens/Assassination/Assassination";
import Board from "@/screens/Board/Board";
import Lobby from "@/screens/Lobby/Lobby";
import Night from "@/screens/Night/Night";
import Quest from "@/screens/Quest/Quest";
import Results from "@/screens/Result/Results";
import TeamSelection from "@/screens/TeamSelection/TeamSelection";
import Voting from "@/screens/Voting/Voting";
import type { PlayerDetails, PlayerRole } from "@/types/Player";
import { CompletedQuestStatus } from "@/types/Quest";
import { randomRoleToAssign } from "@/utils/shuffle";
import { useState } from "react";
import ChatPanel from "./ChatPanel";
import StarField from "./StarField";

type Stage =
  | "lobby"
  | "night"
  | "game"
  | "team"
  | "vote"
  | "quest"
  | "assassin"
  | "results";

const Game = () => {
  const [allPlayers, setAllPlayers] = useState<PlayerDetails[]>([]);
  const [screen, setScreen] = useState<Stage>("lobby");
  const [round, setRound] = useState(1);
  const [leader, setLeader] = useState<PlayerDetails | undefined>();
  const [rejectCount, setRejectCount] = useState(0);
  const [questResults, setQuestResults] = useState<CompletedQuestStatus[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<PlayerDetails[]>([]);
  const [assassinated, setAssassinated] = useState<PlayerDetails | undefined>();

  const setNextLeader = () => {
    const currentLeader = allPlayers.findIndex((p) => p.name === leader?.name);
    setLeader(allPlayers[(currentLeader + 1) % allPlayers.length]);
  };

  const handleReady = (playerList: string[]) => {
    const activeRoles = Object.entries(PLAYER_ROLES)
      .filter(([, roles]) => playerList.length >= roles.min)
      .map(([k]) => k as PlayerRole);
    const shuffled = randomRoleToAssign(activeRoles);

    playerList.map((p: string, i: number) => {
      const player: PlayerDetails = { name: p, role: shuffled[i] };
      setAllPlayers((prevList) => [...prevList, player]);
    });

    setScreen("night");
  };

  const handleStart = () => {
    setLeader(allPlayers[Math.floor(Math.random() * allPlayers.length)]);
    setScreen("game");
  };

  const handleProposeTeam = (selected: PlayerDetails[]) => {
    setSelectedTeam(selected);
    setScreen("vote");
  };

  const handleVotingResult = (result: "approved" | "rejected") => {
    if (result === "rejected") {
      if (rejectCount >= 4) {
        setScreen("results");
      } else {
        setRejectCount((c) => c + 1);
        setNextLeader();
        setScreen("game");
      }
      return;
    }
    setScreen("quest");
  };

  const handleQuestResult = (result: "fail" | "success") => {
    const newResults = [...questResults, result];
    setQuestResults(newResults);
    if (newResults.filter((r) => r === "success").length >= 3)
      setScreen("assassin");
    else if (newResults.filter((r) => r === "fail").length >= 3)
      setScreen("results");
    else {
      setRound((r) => r + 1);
      setNextLeader();
      setScreen("game");
    }
  };

  const handleRevealAssassination = (target: PlayerDetails) => {
    setAssassinated(target);
    setScreen("results");
  };

  const showChat = !["lobby", "night"].includes(screen);

  return (
    <div className="flex min-h-screen min-w-178.25 overflow-auto text-slate-200 app-bg">
      <StarField />
      <div className="relative h-screen overflow-auto z-10 transition-all duration-300 flex-1">
        {screen === "lobby" && <Lobby onStart={handleReady} />}
        {screen === "night" && allPlayers.length > 1 && (
          <Night
            allPlayers={allPlayers}
            player={allPlayers[0]}
            onDone={handleStart}
          />
        )}
        {screen === "game" && leader && (
          <Board
            leader={leader}
            onSelectTeam={() => setScreen("team")}
            players={allPlayers}
            questResults={questResults}
            rejectCount={rejectCount}
            round={round}
          />
        )}
        {screen === "team" && leader && allPlayers.length > 1 && (
          <TeamSelection
            leader={leader}
            onConfirm={handleProposeTeam}
            player={allPlayers[0]}
            allPlayers={allPlayers}
            teamSize={QUEST_SIZES[allPlayers.length][round - 1]}
          />
        )}
        {screen === "vote" && selectedTeam.length && allPlayers.length > 1 && (
          <Voting
            allPlayers={allPlayers}
            player={allPlayers[0]}
            team={selectedTeam}
            onResult={handleVotingResult}
          />
        )}
        {screen === "quest" && selectedTeam.length && allPlayers.length > 1 && (
          <Quest
            player={allPlayers[0]}
            team={selectedTeam}
            onResult={handleQuestResult}
          />
        )}
        {screen === "assassin" && allPlayers.length > 1 && (
          <Assassination
            player={allPlayers[0]}
            allPlayers={allPlayers}
            onReveal={handleRevealAssassination}
          />
        )}
        {screen === "results" && (
          <Results
            allPlayers={allPlayers}
            assassinated={assassinated}
            winner={
              assassinated?.role !== "merlin" &&
              questResults.filter((r) => r === "success").length >= 3
                ? "good"
                : "evil"
            }
            onRestart={() => window.location.reload()}
          />
        )}
      </div>
      {showChat && (
        <ChatPanel
          className="top-14 right-0 bottom-0 z-30 w-72 min-h-screen flex flex-col
      border-l border-indigo-950 bg-black/95 backdrop-blur-xl"
          allPlayers={allPlayers}
        />
      )}
    </div>
  );
};

export default Game;
