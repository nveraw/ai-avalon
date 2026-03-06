import type { PlayerRole, PlayerRoleConfig } from "../types/player";

export const PLAYER_ROLES: Record<PlayerRole, PlayerRoleConfig> = {
  merlin: {
    name: "Merlin",
    icon: "⭐",
    team: "good",
    color: "#a78bfa",
    min: 5,
    hasKnowledge: true,
    mission:
      "You know the forces of evil — but if you reveal yourself, the Assassin will end your kingdom. Guide the good knights subtly.",
  },
  percival: {
    name: "Percival",
    icon: "👁️",
    team: "good",
    color: "#60a5fa",
    min: 5,
    hasKnowledge: true,
    mission:
      "Two figures appear to you in the dark — one is Merlin, one may be Morgana. Protect the true Merlin with your life.",
  },
  loyal1: {
    name: "Loyal Servant",
    icon: "🛡",
    team: "good",
    color: "#34d399",
    min: 5,
    hasKnowledge: false,
    mission:
      "You have no special knowledge. Observe carefully, build trust, and help root out the traitors among you.",
  },
  loyal2: {
    name: "Loyal Servant",
    icon: "🛡",
    team: "good",
    color: "#34d399",
    min: 6,
    hasKnowledge: false,
    mission:
      "You have no special knowledge. Observe carefully, build trust, and help root out the traitors among you.",
  },
  loyal3: {
    name: "Loyal Servant",
    icon: "🛡",
    team: "good",
    color: "#34d399",
    min: 7,
    hasKnowledge: false,
    mission:
      "You have no special knowledge. Observe carefully, build trust, and help root out the traitors among you.",
  },
  assassin: {
    name: "Assassin",
    icon: "🗡",
    team: "evil",
    color: "#f87171",
    min: 5,
    hasKnowledge: true,
    mission:
      "Blend in with the good knights. Fail quests when you can. When Good prevails, identify and eliminate Merlin.",
  },
  morgana: {
    name: "Morgana",
    icon: "🌙",
    team: "evil",
    color: "#c084fc",
    min: 5,
    hasKnowledge: true,
    mission:
      "You appear as Merlin to Percival. Sow confusion, protect your true identity, and let doubt do the work.",
  },
  oberon: {
    name: "Oberon",
    icon: "👁",
    team: "evil",
    color: "#f43f5e",
    min: 8,
    hasKnowledge: true,
    mission:
      "You walk alone. You do not know your evil allies, and they do not know you. Trust only yourself.",
  },
  minion: {
    name: "Minion of Mordred",
    icon: "🔱",
    team: "evil",
    color: "#ef4444",
    min: 9,
    hasKnowledge: true,
    mission:
      "You are a faithful servant of Mordred. Follow your allies' lead, stay hidden, and sabotage the quests.",
  },
  mordred: {
    name: "Mordred",
    icon: "💀",
    team: "evil",
    color: "#fb923c",
    min: 10,
    hasKnowledge: true,
    mission:
      "Even Merlin does not know your face. You are the shadow behind the shadow. Strike from complete darkness.",
  },
};

export const DEFAULT_PLAYER_NAMES = [
  "Red",
  "Blue",
  "Green",
  "Yellow",
  "Orange",
  "Purple",
  "Pink",
  "Brown",
  "Black",
  "White",
];

export const PERSONAS = [
  { colour: "text-violet-400", border: "border-violet-800", bg: "bg-violet-950/20" },
  { colour: "text-blue-400",   border: "border-blue-900",   bg: "bg-blue-950/20"   },
  { colour: "text-emerald-400",border: "border-emerald-900",bg: "bg-emerald-950/20"},
  { colour: "text-emerald-400",border: "border-emerald-900",bg: "bg-emerald-950/20"},
  { colour: "text-emerald-400",border: "border-emerald-900",bg: "bg-emerald-950/20"},
  { colour: "text-red-400",    border: "border-red-900",    bg: "bg-red-950/20"    },
  { colour: "text-purple-400", border: "border-purple-900", bg: "bg-purple-950/20" },
  { colour: "text-orange-400", border: "border-orange-900", bg: "bg-orange-950/20" },
  { colour: "text-rose-400",   border: "border-rose-900",   bg: "bg-rose-950/20"   },
  { colour: "text-red-300",    border: "border-red-900",    bg: "bg-red-950/20"    },
];
