import { useState } from "react";
import type { PlayerDetails } from "../../types/player";
import CardBox from "../../components/CardBox";
import Header from "../../components/Header";

type VotingProps = {
  allPlayers: PlayerDetails[];
  player: PlayerDetails;
  team: PlayerDetails[];
  onResult: (result: Exclude<VotingOutcome, null>) => void;
};

type VotingStatus = "approve" | "reject" | null;
type VotedStatus = Exclude<VotingStatus, null>;
type VotingOutcome = "approved" | "rejected" | null;
type VotingPhase = "vote" | "waiting" | "reveal" | "outcome";

const Voting = ({ allPlayers, player, team, onResult }: VotingProps) => {
  const [playerVote, setPlayerVote] = useState<VotingStatus>(null);
  const [phase, setPhase] = useState<VotingPhase>("vote");
  const [botVotes, setBotVotes] = useState<Record<string, VotedStatus>>({});
  const [visibleCards, setVisibleCards] = useState(0);
  const [outcome, setOutcome] = useState<VotingOutcome>(null);

  // After player votes, simulate bots deliberating then reveal
  const submitVote = (vote: VotedStatus) => {
    setPlayerVote(vote);
    setPhase("waiting");

    // TODO ai Generate bot votes (slightly biased toward approve)
    const bots: Record<string, VotedStatus> = {};
    allPlayers.forEach((p) => {
      if (p !== player)
        bots[p.name] = Math.random() > 0.38 ? "approve" : "reject";
    });
    setBotVotes(bots);

    // Stagger the reveal
    setTimeout(() => setPhase("reveal"), 1400);
    setTimeout(() => setVisibleCards(1), 1600);
    allPlayers.forEach((_, i) => {
      setTimeout(() => setVisibleCards(i + 1), 1600 + i * 280);
    });
    const allVotes = { [player.name]: vote, ...bots };
    const approves = Object.values(allVotes).filter(
      (v) => v === "approve",
    ).length;
    const result: VotingOutcome =
      approves > allPlayers.length / 2 ? "approved" : "rejected";

    setTimeout(
      () => {
        setOutcome(result);
        setPhase("outcome");
      },
      1600 + allPlayers.length * 280 + 600,
    );
    setTimeout(() => onResult(result), 1600 + allPlayers.length * 280 + 2400);
  };

  const allVotesMap = { [player.name]: playerVote, ...botVotes };

  return (
    <div className="max-w-lg mx-auto px-5 py-8">
      {/* Header */}
      <div className="text-center mb-6">
        <Header title="TEAM VOTE" subtitle="Approve or Reject?" description="Majority decides — ties are rejected" />

        {/* Proposed team badges */}
        <div className="flex gap-2 justify-center flex-wrap mt-3">
          {team.map((teamPlayer) => (
            <span
              key={teamPlayer.name}
              className="px-3 py-1 rounded-full bg-amber-950/20
              border border-amber-700 text-amber-200 text-xs font-serif"
            >
              {teamPlayer.name}
            </span>
          ))}
        </div>
      </div>

      {phase === "vote" && (
        <>
          <CardBox className="mb-5 text-center">
            <div className="text-xs text-purple-400 tracking-widest font-serif mb-3">
              YOUR VOTE, {player.name.toUpperCase()}
            </div>
            <p className="font-serif text-gray-400 text-sm mb-6 leading-relaxed">
              Do you support this team being sent on the quest?
            </p>
            <div className="flex gap-4">
              {/* Approve card */}
              <button
                onClick={() => submitVote("approve")}
                className="flex-1 py-8 rounded-2xl border-2 border-green-900 bg-green-950/20
                  flex flex-col items-center gap-3 cursor-pointer transition-all
                  hover:border-green-600 hover:bg-green-950/40 group"
              >
                <span className="text-5xl group-hover:scale-110 transition-transform duration-200">
                  ✅
                </span>
                <span className="cinzel text-green-400 text-sm tracking-widest">
                  APPROVE
                </span>
                <span className="text-gray-400 text-xs font-serif">
                  Send them on the quest
                </span>
              </button>
              {/* Reject card */}
              <button
                onClick={() => submitVote("reject")}
                className="flex-1 py-8 rounded-2xl border-2 border-red-900 bg-red-950/20
                  flex flex-col items-center gap-3 cursor-pointer transition-all
                  hover:border-red-600 hover:bg-red-950/40 group"
              >
                <span className="text-5xl group-hover:scale-110 transition-transform duration-200">
                  ❌
                </span>
                <span className="cinzel text-red-400 text-sm tracking-widest">
                  REJECT
                </span>
                <span className="text-gray-400 text-xs font-serif">
                  Refuse this fellowship
                </span>
              </button>
            </div>
          </CardBox>

          <CardBox className="play">
            <div className="text-xs text-purple-400 tracking-widest font-serif mb-3">
              OTHER PLAYERS
            </div>
            <div className="grid gap-2">
              {allPlayers
                .filter((p) => p !== player)
                .map((botPlayer, i) => (
                  <div key={i} className="flex items-center gap-3 px-1 py-1">
                    <div
                      className="w-8 h-8 rounded-full bg-indigo-950 border border-indigo-800
                    flex items-center justify-center text-slate-300 font-serif font-bold text-sm shrink-0"
                    >
                      {botPlayer.name[0]}
                    </div>
                    <span className="text-gray-400 font-serif text-sm flex-1">
                      {botPlayer.name}
                    </span>
                    <span className="text-indigo-700 text-xs font-serif italic animate-pulse [animation-duration:3s]">
                      waiting...
                    </span>
                  </div>
                ))}
            </div>
          </CardBox>
        </>
      )}

      {/* ── PHASE: bots deliberating ── */}
      {phase === "waiting" && (
        <div className="text-center py-10">
          <div className="text-5xl mb-5 animate-bounce [animation-duration:3s]">
            ⚖
          </div>
          <div className="cinzel text-amber-400 text-lg mb-2">
            Votes are being cast...
          </div>
          <p className="font-serif text-gray-500 text-sm">
            The other knights deliberate in silence.
          </p>
          <div className="flex gap-1.5 justify-center mt-6">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-amber-700 animate-pulse"
                style={{ animationDelay: `${i * 0.25}s` }}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── PHASE: reveal all votes ── */}
      {(phase === "reveal" || phase === "outcome") && (
        <>
          {/* Vote cards grid */}
          <div className="flex gap-3 justify-center flex-wrap mb-6">
            {allPlayers.map((p, i) => {
              const v = allVotesMap[p.name];
              const visible = i < visibleCards;
              const isHuman = p.name === player.name;
              return (
                <div key={i} className="text-center">
                  <div
                    className={`w-18 h-24 rounded-xl flex flex-col items-center justify-center gap-2 ${
                      isHuman ? "ring-2 ring-amber-500/50 ring-offset-1 ring-offset-transparent" : ""} ${
                      visible
                        ? v === "approve"
                          ? "bg-reveal-good border-green-600"
                          : "bg-reveal-evil border-red-600"
                        : "bg-indigo-950/40 border-indigo-900"
                    } border-2 transition-all duration-500`}
                  >
                    {visible ? (
                      <>
                        <span className="text-2xl">
                          {v === "approve" ? "✅" : "❌"}
                        </span>
                        <span className="text-xs text-white font-serif tracking-wider uppercase">
                          {v}
                        </span>
                      </>
                    ) : (
                      <span className="text-xl text-indigo-700">?</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-1.5 font-serif">
                    {p.name}
                  </div>
                  {isHuman && (
                    <div className="text-xs text-amber-600 font-serif">
                      you
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Outcome banner */}
          {phase === "outcome" && outcome && (
            <div
              className={`p-5 rounded-2xl border-2 text-center ${
                outcome === "approved"
                  ? "bg-green-950/40 border-green-700"
                  : "bg-red-950/40 border-red-800"
              }`}
            >
              <div className="text-4xl mb-2">
                {outcome === "approved" ? "⚔" : "🚫"}
              </div>
              <div
                className={`cinzel text-xl tracking-widest ${
                  outcome === "approved" ? "text-green-400" : "text-red-400"}`}
              >
                TEAM {outcome === "approved" ? "APPROVED" : "REJECTED"}
              </div>
              <p className="font-serif text-gray-500 text-xs mt-2">
                {outcome === "approved"
                  ? "The fellowship advances to the quest."
                  : "The proposal has been refused. Leadership passes on."}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Voting;
