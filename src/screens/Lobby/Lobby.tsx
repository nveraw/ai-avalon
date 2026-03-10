import CardBox from "@/components/CardBox";
import GoldButton from "@/components/GoldButton";
import GoldDivider from "@/components/GoldDivider";
import Header from "@/components/Header";
import SectionLabel from "@/components/SectionLabel";
import {
  DEFAULT_PLAYER_NAMES,
  PLAYER_ROLES,
  roleList,
} from "@/constants/playerRoles";
import { useState } from "react";

const DEFAULT_NUMBER = 7;

const Lobby = ({ onStart }: { onStart: (names: string[]) => void }) => {
  const [playerCount, setPlayerCount] = useState(DEFAULT_NUMBER);
  const [names, setNames] = useState(
    DEFAULT_PLAYER_NAMES.slice(0, DEFAULT_NUMBER),
  );
  const [duplicateName, setDuplicateName] = useState("");

  return (
    <div className="header max-w-xl mx-auto px-5 py-10">
      <div className="text-center mb-8">
        <div className="text-6xl mb-2 animate-bounce">🏰</div>
        <h1 className="cinzel-deco text-5xl text-amber-400 tracking-widest m-0 mb-2">
          AVALON
        </h1>
        <Header title="THE RESISTANCE" />
      </div>

      <CardBox className="player-count">
        <div className="mb-6">
          <SectionLabel className="text-violet-400">
            Number of Players
          </SectionLabel>
          <div className="flex gap-2 mt-2.5">
            {[5, 6, 7, 8, 9, 10].map((n) => (
              <button
                key={n}
                onClick={() => {
                  setPlayerCount(n);
                  setNames(DEFAULT_PLAYER_NAMES.slice(0, n));
                }}
                className={`flex-1 py-2.5 rounded-lg border-none font-serif text-base font-bold cursor-pointer transition-all ${
                  playerCount === n
                    ? "bg-violet-900 text-violet-200"
                    : "bg-indigo-950 text-gray-500 hover:bg-indigo-900"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <GoldDivider />

        <div className="names mb-6">
          <SectionLabel className="text-violet-400">Player Names</SectionLabel>
          <div className="grid grid-cols-2 gap-2 mt-2.5">
            {names.map((name, i) => (
              <div key={i} className="flex items-center justify-center gap-2">
                <input
                  value={name}
                  onChange={(e) => {
                    setDuplicateName("");
                    const value = e.target.value.trim().toLocaleLowerCase();
                    const duplicateIndex = names
                      .map((n) => n.toLocaleLowerCase())
                      .indexOf(value);
                    if (duplicateIndex > -1 && duplicateIndex !== i) {
                      setDuplicateName(value);
                    }
                    const n = [...names];
                    n[i] = value;
                    setNames(n);
                  }}
                  className={`${name.toLocaleLowerCase() === duplicateName ? "border-red-800" : "border-indigo-950"} flex-1 bg-slate-950 border  rounded-lg px-3 py-2 text-slate-200 font-serif text-sm outline-none focus:border-violet-600`}
                />
                {i > 0 && <span>🤖</span>}
              </div>
            ))}
          </div>
        </div>

        <GoldDivider />

        <div className="roles mb-7">
          <SectionLabel className="text-violet-400">Playing Roles</SectionLabel>
          <div className="grid grid-cols-2 gap-2.5 mt-3">
            {roleList.slice(0, playerCount).map((role) => (
              <div
                key={role}
                className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl transition-all bg-violet-950/30 border border-violet-700"
              >
                <span className="text-lg">{PLAYER_ROLES[role].icon}</span>
                <div>
                  <div className="font-serif text-[13px] text-violet-200">
                    {PLAYER_ROLES[role].name}
                  </div>
                  <div
                    className={`text-xs ${PLAYER_ROLES[role].team === "good" ? "text-emerald-400" : "text-red-400"}`}
                  >
                    {PLAYER_ROLES[role].team}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <GoldButton
          onClick={() => onStart(names)}
          disabled={duplicateName !== ""}
        >
          ⚔️ Begin the Quest ⚔️
        </GoldButton>
      </CardBox>
    </div>
  );
};

export default Lobby;
