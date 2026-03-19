import GoldButton from "@/components/GoldButton";
import Header from "@/components/Header";
import LoadingState from "@/components/LoadingState";
import { submitVote } from "@/services/api";
import { VoteResponse } from "@/types/api.types";
import { VotedStatus } from "@/types/quest.types";
import { useState } from "react";
import CardPicker from "./CardPicker";
import CardReveal from "./CardReveal";

type VotingProps = {
  playerNames: string[];
  humanName: string;
  team: string[];
  onResult: (result: VoteResponse) => void;
};

type VotingPhase = "pick" | "waiting" | "reveal" | "result";

const Voting = ({ playerNames, humanName, team, onResult }: VotingProps) => {
  const [playerVote, setPlayerVote] = useState<VotedStatus | null>(null);
  const [phase, setPhase] = useState<VotingPhase>("pick");
  const [visibleCards, setVisibleCards] = useState(0);
  const [data, setData] = useState<VoteResponse>();
  const [outcome, setOutcome] = useState<VotedStatus>();

  const handleVoting = async (vote: VotedStatus) => {
    setPlayerVote(vote);
    setPhase("waiting");

    const res = await submitVote({ humanVote: vote });
    setData(res);

    setTimeout(() => setPhase("reveal"), 400);
    // stagger reveal as before
    playerNames.forEach((_, i) => {
      setTimeout(() => setVisibleCards(i + 1), 600 + i * 280);
    });
    setTimeout(
      () => {
        setOutcome(res.result);
        setPhase("result");
      },
      600 + playerNames.length * 280 + 400,
    );
  };

  return (
    <div className="max-w-lg mx-auto px-5 py-8">
      <div className="text-center mb-6">
        <Header
          title="TEAM VOTE"
          subtitle="Approve or Reject?"
          description="Majority decides — ties are rejected"
        />

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

      {phase === "pick" && (
        <CardPicker
          humanName={humanName}
          playerNames={playerNames}
          onPick={handleVoting}
        />
      )}

      {/* ── PHASE: bots deliberating ── */}
      {phase === "waiting" && (
        <LoadingState
          icon="⚖"
          title="Votes are being cast..."
          subtitle="The other knights deliberate in silence."
        />
      )}

      {(phase === "reveal" || phase === "result") && (
        <CardReveal
          humanName={humanName}
          playerNames={playerNames}
          showResult={phase === "result"}
          approved={outcome === "approve"}
          allVotesMap={{ [humanName]: playerVote, ...data?.votes }}
          visibleCards={visibleCards}
        />
      )}

      {phase === "result" && (
        <GoldButton
          className="mt-6"
          disabled={!data}
          onClick={() => data && onResult(data)}
        >
          Move on to quest
        </GoldButton>
      )}
    </div>
  );
};

export default Voting;
