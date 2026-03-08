import CardBox from "@/components/CardBox";
import Header from "@/components/Header";
import { submitVote } from "@/lib/api";
import { addMessagesAtom } from "@/store/chat";
import { VoteResponse } from "@/types/api.types";
import { VotedStatus, VotingStatus } from "@/types/vote.types";
import { useSetAtom } from "jotai";
import { useState } from "react";

type VotingProps = {
  playerNames: string[];
  humanName: string;
  team: string[];
  onResult: (result: VoteResponse) => void;
};

type VotingPhase = "vote" | "waiting" | "reveal" | "outcome";

const Voting = ({ playerNames, humanName, team, onResult }: VotingProps) => {
  const addMessages = useSetAtom(addMessagesAtom);

  const [playerVote, setPlayerVote] = useState<VotingStatus>(null);
  const [phase, setPhase] = useState<VotingPhase>("vote");
  const [botVotes, setBotVotes] = useState<Record<string, VotedStatus>>({});
  const [visibleCards, setVisibleCards] = useState(0);
  const [outcome, setOutcome] = useState<VotedStatus | null>(null);

  const handleVoting = async (vote: VotedStatus) => {
    setPlayerVote(vote);
    setPhase("waiting");

    const res = await submitVote({ humanVote: vote });
    setBotVotes(res.votes);
    addMessages(res.messages);

    setTimeout(() => setPhase("reveal"), 400);
    // stagger reveal as before
    playerNames.forEach((_, i) => {
      setTimeout(() => setVisibleCards(i + 1), 600 + i * 280);
    });
    setTimeout(
      () => {
        setOutcome(res.result as VotedStatus);
        setPhase("outcome");
      },
      600 + playerNames.length * 280 + 400,
    );
    setTimeout(() => onResult(res), 600 + playerNames.length * 280 + 2000);
  };

  const allVotesMap = { [humanName]: playerVote, ...botVotes };

  return (
    <div className="max-w-lg mx-auto px-5 py-8">
      {/* Header */}
      <div className="text-center mb-6">
        <Header
          title="TEAM VOTE"
          subtitle="Approve or Reject?"
          description="Majority decides — ties are rejected"
        />

        {/* Proposed team badges */}
        <div className="flex gap-2 justify-center flex-wrap mt-3">
          {team.map((name) => (
            <span
              key={name}
              className="px-3 py-1 rounded-full bg-amber-950/20
              border border-amber-700 text-amber-200 text-xs font-serif"
            >
              {name}
            </span>
          ))}
        </div>
      </div>

      {phase === "vote" && (
        <>
          <CardBox className="mb-5 text-center">
            <div className="text-xs text-purple-400 tracking-widest font-serif mb-3">
              YOUR VOTE, {humanName.toUpperCase()}
            </div>
            <p className="font-serif text-gray-400 text-sm mb-6 leading-relaxed">
              Do you support this team being sent on the quest?
            </p>
            <div className="flex gap-4">
              {/* Approve card */}
              <button
                onClick={() => handleVoting("approve")}
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
                onClick={() => handleVoting("reject")}
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
              {playerNames
                .filter((p) => p !== humanName)
                .map((name, i) => (
                  <div key={i} className="flex items-center gap-3 px-1 py-1">
                    <div
                      className="w-8 h-8 rounded-full bg-indigo-950 border border-indigo-800
                    flex items-center justify-center text-slate-300 font-serif font-bold text-sm shrink-0"
                    >
                      {name[0]}
                    </div>
                    <span className="text-gray-400 font-serif text-sm flex-1">
                      {name}
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
            {playerNames.map((name, i) => {
              const v = allVotesMap[name];
              const visible = i < visibleCards;
              const isHuman = name === humanName;
              return (
                <div key={i} className="text-center">
                  <div
                    className={`w-18 h-24 rounded-xl flex flex-col items-center justify-center gap-2 ${
                      isHuman
                        ? "ring-2 ring-amber-500/50 ring-offset-1 ring-offset-transparent"
                        : ""
                    } ${
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
                    {name}
                  </div>
                  {isHuman && (
                    <div className="text-xs text-amber-600 font-serif">you</div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Outcome banner */}
          {phase === "outcome" && outcome && (
            <div
              className={`p-5 rounded-2xl border-2 text-center ${
                outcome === "approve"
                  ? "bg-green-950/40 border-green-700"
                  : "bg-red-950/40 border-red-800"
              }`}
            >
              <div className="text-4xl mb-2">
                {outcome === "approve" ? "⚔" : "🚫"}
              </div>
              <div
                className={`cinzel text-xl tracking-widest ${
                  outcome === "approve" ? "text-green-400" : "text-red-400"
                }`}
              >
                TEAM {outcome === "approve" ? "APPROVED" : "REJECTED"}
              </div>
              <p className="font-serif text-gray-500 text-xs mt-2">
                {outcome === "approve"
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
