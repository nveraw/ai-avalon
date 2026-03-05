export const PLAYER_ROLES = {
  merlin: {
    name: "Merlin",
    icon: "⭐",
    team: "good",
    color: "#a78bfa",
    min: 0,
    hasKnowledge: true,
    mission:
      "You know the forces of evil — but if you reveal yourself, the Assassin will end your kingdom. Guide the good knights subtly.",
  },
  percival: {
    name: "Percival",
    icon: "👁️",
    team: "good",
    color: "#60a5fa",
    min: 0,
    hasKnowledge: true,
    mission:
      "Two figures appear to you in the dark — one is Merlin, one may be Morgana. Protect the true Merlin with your life.",
  },
  loyal1: {
    name: "Loyal Servant",
    icon: "🛡",
    team: "good",
    color: "#34d399",
    min: 0,
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
    min: 0,
    hasKnowledge: true,
    mission:
      "Blend in with the good knights. Fail quests when you can. When Good prevails, identify and eliminate Merlin.",
  },
  morgana: {
    name: "Morgana",
    icon: "🌙",
    team: "evil",
    color: "#c084fc",
    min: 0,
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

export const PLAYERS_DEMO = [
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
