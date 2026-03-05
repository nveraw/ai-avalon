import type { PLAYER_ROLES } from "../constants/player";

export type PlayerRole = keyof typeof PLAYER_ROLES;

export interface PlayerDetails {
    name: string;
    role: PlayerRole;
}