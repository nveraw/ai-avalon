import { PLAYER_ROLES } from "@/constants/playerRoles";
import { PlayerDetails, PlayerRole } from "@/types/player.types";

export const buildKnowledge = (
  myRole: PlayerRole,
  allPlayers: PlayerDetails[],
) => {
  if (myRole === "merlin") {
    return allPlayers.filter(
      (p) =>
        !["mordred", "oberon"].includes(p.role) &&
        PLAYER_ROLES[p.role]?.team === "evil",
    );
  }

  if (myRole === "percival") {
    return allPlayers.filter((p) => ["merlin", "morgana"].includes(p.role));
  }

  if (PLAYER_ROLES[myRole]?.team === "evil" && myRole !== "oberon") {
    return allPlayers.filter(
      (p) =>
        p.role !== "oberon" &&
        p.role !== myRole &&
        PLAYER_ROLES[p.role]?.team === "evil",
    );
  }
  return [];
};
