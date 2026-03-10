import type { PlayerRole } from "@/types/game.types";

export function randomRoleToAssign(activeRoles: PlayerRole[]): PlayerRole[] {
  const shuffled = [...activeRoles];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
