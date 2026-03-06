export type PlayerRole =
  | "merlin"
  | "percival"
  | "loyal1"
  | "loyal2"
  | "loyal3"
  | "assassin"
  | "morgana"
  | "oberon"
  | "minion"
  | "mordred";

export type PlayerDetails = {
  name: string;
  role: PlayerRole;
};

export type PlayerRoleConfig = {
  name: string;
  icon: string;
  team: string;
  color: string;
  min: number;
  mission: string;
  knowledge: {
    flavour: string,
    desc: string,
    type: "evil" | "none" | "ambiguous",
    seenPlayer?: string;
  };
};
