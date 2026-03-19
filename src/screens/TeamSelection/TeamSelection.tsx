import GoldButton from "@/components/GoldButton";
import Header from "@/components/Header";
import LoadingState from "@/components/LoadingState";
import { submitTeam } from "@/services/api";
import { messagesAtom } from "@/store/chat";
import { useSetAtom } from "jotai";
import { useCallback, useEffect, useRef, useState } from "react";

type TeamSelectionProps = {
  playerNames: string[];
  teamSize: number;
  leader: string;
  humanName: string;
  onConfirm: (selected: string[]) => void;
};

const TeamSelection = ({
  playerNames,
  humanName,
  teamSize,
  leader,
  onConfirm,
}: TeamSelectionProps) => {
  const addMessages = useSetAtom(messagesAtom);

  const [selected, setSelected] = useState<string[]>([]);
  const isLoading = useRef(false);

  const isHumanLeader = leader === humanName;

  const handleSubmitTeam = useCallback(
    async (selectedTeam: string[] = []) => {
      const res = await submitTeam({
        names: selectedTeam,
      });
      let i = 0;
      playerNames.forEach((name) => {
        if (res.proposedTeam.includes(name)) {
          setTimeout(
            () => setSelected((prevSelected) => [...prevSelected, name]),
            600 + i * 280,
          );
          i++;
        }
      });
      isLoading.current = false;

      addMessages(res.messages);
    },
    [addMessages, playerNames],
  );

  useEffect(() => {
    if (isLoading.current || isHumanLeader) return;

    isLoading.current = true;
    handleSubmitTeam();
  }, [handleSubmitTeam, isHumanLeader]);

  const handleOnClick = () => {
    if (isHumanLeader) {
      handleSubmitTeam(selected);
    }
    onConfirm(selected);
  };

  const handleToggleSelection = (name: string) => {
    if (selected.includes(name)) {
      setSelected((s) => s.filter((x) => x !== name));
    } else if (selected.length < teamSize) {
      setSelected((s) => [...s, name]);
    }
  };

  const buttonLabel =
    leader !== humanName
      ? isLoading.current
        ? "Picking..."
        : "⚔️ Send This Fellowship"
      : selected.length === teamSize
        ? "⚔️ Propose This Team"
        : `Select ${teamSize - selected.length} more knight${teamSize - selected.length !== 1 ? "s" : ""}`;

  const AiSubtitle = isLoading.current
    ? "The Leader Deliberates..."
    : "Fellowship Chosen";

  return (
    <div className="max-w-lg mx-auto px-5 py-8">
      <div className="text-center mb-7">
        <Header
          title="TEAM SELECTION"
          subtitle={isHumanLeader ? "Choose Your Fellowship" : AiSubtitle}
          hasFollowup={true}
        />
        {isHumanLeader ? (
          <p className="text-gray-500 font-serif text-sm">
            <span className="text-violet-400">{leader}</span> must choose{" "}
            {teamSize} knights
          </p>
        ) : (
          <p className="text-gray-500 font-serif text-sm">
            <span className="text-violet-400">{leader}</span> is choosing{" "}
            {teamSize} knights
          </p>
        )}
      </div>

      {leader !== humanName && isLoading.current && (
        <LoadingState
          icon="👑"
          title={`${leader} studies the table in silence...`}
        />
      )}

      <div className="grid grid-cols-2 gap-3 mb-7">
        {playerNames.map((name) => {
          const isSelected = selected.includes(name);
          const isLeaderToken = name === leader;

          return (
            <div
              role="button"
              key={name}
              onClick={() => {
                if (isHumanLeader) handleToggleSelection(name);
              }}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all duration-500 ${
                isSelected
                  ? "bg-amber-950/20 border-amber-700 opacity-100"
                  : isLeaderToken
                    ? "bg-violet-950/20 border-violet-800"
                    : "bg-slate-950 border-indigo-950"
              } ${isHumanLeader ? "cursor-pointer" : ""}`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-base font-serif font-bold text-slate-200 border-2 transition-all duration-500 ${
                  isSelected
                    ? "border-amber-400 token-selected"
                    : isLeaderToken
                      ? "border-violet-500 token-base"
                      : "border-indigo-800 token-base"
                }`}
              >
                {isLeaderToken ? "👑" : name[0]}
              </div>
              <div className="flex-1">
                <div
                  className={`font-serif text-sm transition-colors duration-300 ${
                    isSelected ? "text-amber-200" : "text-slate-400"
                  }`}
                >
                  {name}
                </div>
                {isLeaderToken && (
                  <div className="text-xs text-violet-400">Leader</div>
                )}
              </div>
              {isSelected && <span className="">✦</span>}
            </div>
          );
        })}
      </div>

      <div className="flex gap-2.5 justify-center mb-7">
        {Array.from({ length: teamSize }).map((_, i) => {
          return (
            <div
              key={i}
              className={`w-11 h-11 rounded-full flex items-center justify-center ${
                selected[i] !== undefined
                  ? "border-amber-400 bg-amber-950/20 text-amber-400"
                  : "border-indigo-900 bg-slate-950/80 text-indigo-800"
              } text-sm font-serif font-bold border-2 transition-all duration-500`}
            >
              {selected[i]?.[0] ?? "?"}
            </div>
          );
        })}
      </div>

      <GoldButton
        onClick={handleOnClick}
        disabled={selected.length !== teamSize}
      >
        {buttonLabel}
      </GoldButton>
    </div>
  );
};

export default TeamSelection;
