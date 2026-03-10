"use client";

import ChatPanel from "@/components/ChatPanel";
import StarField from "@/components/StarField";
import { QUEST_SIZES } from "@/constants/questConfigs";
import Assassination from "@/screens/Assassination/Assassination";
import Board from "@/screens/Board/Board";
import Lobby from "@/screens/Lobby/Lobby";
import Night from "@/screens/Night/Night";
import Quest from "@/screens/Quest/Quest";
import Results from "@/screens/Result/Results";
import TeamSelection from "@/screens/TeamSelection/TeamSelection";
import Voting from "@/screens/Voting/Voting";
import {
  AssassinationResponse,
  InitGameResponse,
  QuestResponse,
  VoteResponse,
} from "@/types/api.types";
import type { PlayerDetails, PlayerTeam } from "@/types/player.types";
import { CompletedQuestStatus } from "@/types/quest.types";
import { useState } from "react";

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
  const [playerNames, setPlayerNames] = useState<string[]>([]);
  const [player, setPlayer] = useState<PlayerDetails | null>(null);
  const [screen, setScreen] = useState<Stage>("lobby");
  const [round, setRound] = useState(1);
  const [leader, setLeader] = useState<string>("");
  const [rejectCount, setRejectCount] = useState(0);
  const [questResults, setQuestResults] = useState<CompletedQuestStatus[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string[]>([]);
  const [assassinated, setAssassinated] = useState<string>("");
  const [winner, setWinner] = useState<PlayerTeam | null>(null);
  const [allPlayers, setAllPlayers] = useState<PlayerDetails[]>([]); // result: reveal all roles

  const handleReady = (playerNames: string[]) => {
    setPlayerNames(playerNames);
    setScreen("night");
  };

  const handleStart = (res: InitGameResponse) => {
    setPlayer({ name: playerNames[0], role: res.humanRole });
    setLeader(res.leader);
    setScreen("game");
  };

  const handleProposeTeam = (selected: string[]) => {
    setSelectedTeam(selected);
    setScreen("vote");
  };

  const handleVotingResult = (res: VoteResponse) => {
    setRejectCount(res.rejectCount);
    if (res.result === "reject") {
      setLeader(res.nextLeader || "");
      if (res.rejectCount >= 5 || res.winner?.team === "evil") {
        setWinner(res.winner?.team || "evil");
        setAllPlayers(res.winner?.players || []);
        setScreen("results");
        return;
      }
      setScreen("game");
    } else {
      setScreen("quest");
    }
  };

  const handleQuestResult = (res: QuestResponse) => {
    setQuestResults((prev) => [...prev, res.result]);
    setLeader(res.nextLeader);
    if (res.winner?.team === "good") {
      setScreen("assassin");
    } else if (res.winner?.team === "evil") {
      setWinner(res.winner?.team || "evil");
      setAllPlayers(res.winner?.players || []);
      setScreen("results");
    } else {
      setRound((r) => r + 1);
      setScreen("game");
    }
  };

  const handleRevealAssassination = (res: AssassinationResponse) => {
    setAllPlayers(res.players || []);
    setAssassinated(res.targetName);
    setWinner(res.team || null);
    setScreen("results");
  };

  const showChat = !["lobby", "night"].includes(screen);

  return (
    <div className="flex min-h-screen min-w-178.25 overflow-auto text-slate-200 app-bg">
      <StarField />
      <div className="relative h-screen overflow-auto z-10 transition-all duration-300 flex-1">
        {screen === "lobby" && <Lobby onStart={handleReady} />}
        {screen === "night" && playerNames.length > 1 && (
          <Night playerNames={playerNames} onDone={handleStart} />
        )}
        {screen === "game" && (
          <Board
            leader={leader}
            onSelectTeam={() => setScreen("team")}
            playerNames={playerNames}
            questResults={questResults}
            rejectCount={rejectCount}
            round={round}
          />
        )}
        {screen === "team" && (
          <TeamSelection
            leader={leader}
            onConfirm={handleProposeTeam}
            humanName={player?.name || playerNames[0]}
            playerNames={playerNames}
            teamSize={QUEST_SIZES[playerNames.length][round - 1]}
          />
        )}
        {screen === "vote" && (
          <Voting
            playerNames={playerNames}
            humanName={player?.name || playerNames[0]}
            team={selectedTeam}
            onResult={handleVotingResult}
          />
        )}
        {screen === "quest" && player && (
          <Quest
            player={player}
            team={selectedTeam}
            onResult={handleQuestResult}
          />
        )}
        {screen === "assassin" && player && (
          <Assassination
            player={player}
            playerNames={playerNames}
            onReveal={handleRevealAssassination}
          />
        )}
        {screen === "results" && winner && (
          <Results
            allPlayers={allPlayers}
            assassinated={assassinated}
            winner={winner}
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
    </div>
  );
};

export default Game;
