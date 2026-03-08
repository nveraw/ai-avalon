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

export type PlayerTeam = "evil" | "good";

export type PlayerRoleConfig = {
  name: string;
  icon: string;
  team: PlayerTeam;
  color: string;
  mission: string;
  knowledge: {
    flavour: string;
    desc: string;
    type: "evil" | "none" | "ambiguous";
    seenPlayer?: string;
  };
};
