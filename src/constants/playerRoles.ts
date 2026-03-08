import type { PlayerRole, PlayerRoleConfig } from "@/types/player.types";

export const roleList: PlayerRole[] = [
  "merlin",
  "percival",
  "assassin",
  "morgana",
  "loyal1",
  "loyal2",
  "loyal3",
  "oberon",
  "minion",
  "mordred",
];

const loyalServant: PlayerRoleConfig = {
  name: "Loyal Servant",
  icon: "🛡",
  team: "good",
  color: "#34d399",
  mission:
    "You have no special knowledge. Observe carefully, build trust, and help root out the traitors among you.",
  knowledge: {
    flavour: "The night reveals nothing to you.",
    desc: "You are a loyal servant. No special knowledge is granted to you. Watch, listen, and deduce.",
    type: "none",
  },
};

export const PLAYER_ROLES: Record<PlayerRole, PlayerRoleConfig> = {
  merlin: {
    name: "Merlin",
    icon: "⭐",
    team: "good",
    color: "#a78bfa",
    mission:
      "You know the forces of evil — but if you reveal yourself, the Assassin will end your kingdom. Guide the good knights subtly.",
    knowledge: {
      flavour: "Your eyes open to the darkness...",
      desc: "These servants of evil are known to you. Remember their faces — but guard your knowledge carefully.",
      type: "evil",
      seenPlayer: "Servant of Evil",
    },
  },
  percival: {
    name: "Percival",
    icon: "👁️",
    team: "good",
    color: "#60a5fa",
    mission:
      "Two figures appear to you in the dark — one is Merlin, one may be Morgana. Protect the true Merlin with your life.",
    knowledge: {
      flavour: "Two figures emerge from the veil...",
      desc: "One wields the light of Merlin. The other wears a mask. You cannot tell them apart.",
      type: "ambiguous",
      seenPlayer: "Merlin?",
    },
  },
  loyal1: loyalServant,
  loyal2: loyalServant,
  loyal3: loyalServant,
  assassin: {
    name: "Assassin",
    icon: "🗡",
    team: "evil",
    color: "#f87171",
    mission:
      "Blend in with the good knights. Fail quests when you can. When Good prevails, identify and eliminate Merlin.",
    knowledge: {
      flavour: "Your allies step out of the shadows...",
      desc: "These players stand with you in darkness. Their exact roles are hidden — even from each other.",
      type: "evil",
      seenPlayer: "Evil Ally",
    },
  },
  morgana: {
    name: "Morgana",
    icon: "🌙",
    team: "evil",
    color: "#c084fc",
    mission:
      "You appear as Merlin to Percival. Sow confusion, protect your true identity, and let doubt do the work.",
    knowledge: {
      flavour: "Your allies step out of the shadows...",
      desc: "These players stand with you in darkness. Their exact roles are hidden — even from each other.",
      type: "evil",
      seenPlayer: "Evil Ally",
    },
  },
  oberon: {
    name: "Oberon",
    icon: "👁",
    team: "evil",
    color: "#f43f5e",
    mission:
      "You walk alone. You do not know your evil allies, and they do not know you. Trust only yourself.",
    knowledge: {
      flavour: "The night reveals nothing to you.",
      desc: "You are Oberon — isolated, unknown. Your allies do not know you, and you do not know them.",
      type: "none",
    },
  },
  minion: {
    name: "Minion of Mordred",
    icon: "🔱",
    team: "evil",
    color: "#ef4444",
    mission:
      "You are a faithful servant of Mordred. Follow your allies' lead, stay hidden, and sabotage the quests.",
    knowledge: {
      flavour: "Your allies step out of the shadows...",
      desc: "These players stand with you in darkness. Their exact roles are hidden — even from each other.",
      type: "evil",
      seenPlayer: "Evil Ally",
    },
  },
  mordred: {
    name: "Mordred",
    icon: "💀",
    team: "evil",
    color: "#fb923c",
    mission:
      "Even Merlin does not know your face. You are the shadow behind the shadow. Strike from complete darkness.",
    knowledge: {
      flavour: "Your allies step out of the shadows...",
      desc: "These players stand with you in darkness. Their exact roles are hidden — even from each other.",
      type: "evil",
      seenPlayer: "Evil Ally",
    },
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
  {
    colour: "text-violet-400",
    border: "border-violet-800",
    bg: "bg-violet-950/20",
  },
  { colour: "text-blue-400", border: "border-blue-900", bg: "bg-blue-950/20" },
  {
    colour: "text-emerald-400",
    border: "border-emerald-900",
    bg: "bg-emerald-950/20",
  },
  {
    colour: "text-emerald-400",
    border: "border-emerald-900",
    bg: "bg-emerald-950/20",
  },
  {
    colour: "text-emerald-400",
    border: "border-emerald-900",
    bg: "bg-emerald-950/20",
  },
  { colour: "text-red-400", border: "border-red-900", bg: "bg-red-950/20" },
  {
    colour: "text-purple-400",
    border: "border-purple-900",
    bg: "bg-purple-950/20",
  },
  {
    colour: "text-orange-400",
    border: "border-orange-900",
    bg: "bg-orange-950/20",
  },
  { colour: "text-rose-400", border: "border-rose-900", bg: "bg-rose-950/20" },
  { colour: "text-red-300", border: "border-red-900", bg: "bg-red-950/20" },
];
