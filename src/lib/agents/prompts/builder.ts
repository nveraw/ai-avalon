import { QUEST_SIZES } from "@/constants/questConfigs";
import { GameState } from "@/lib/game/gameStore";
import { PlayerRole } from "@/types/player.types";
import { roleDescription } from "./role";

// Safe to include in any agent's context — contains only public information.
function buildPublicContext(state: GameState): string {
  const questSizes = QUEST_SIZES[state.players.length] ?? QUEST_SIZES[7];
  const questTrack =
    state.questResults.length > 0
      ? state.questResults.map((r, i) => `Quest ${i + 1}: ${r}`).join(", ")
      : "No quests completed yet";

  const successes = state.questResults.filter((r) => r === "success").length;
  const fails = state.questResults.filter((r) => r === "fail").length;

  const summary = state.summary
    ? `\n=== CONVERSATION SUMMARY ===\n${state.summary}\n=== END SUMMARY ===`
    : "";

  return `
=== GAME STATE ===
Players (${state.players.length}): ${state.players.map((p) => p.name).join(", ")}
Current round: ${state.round} of 5
Current leader: ${state.players[state.leaderIndex].name}
Quest team size this round: ${questSizes[state.round - 1]}
Consecutive rejections: ${state.rejectCount} (5 = evil wins automatically)
Quest results: ${questTrack}
Score — Good: ${successes} | Evil: ${fails} (first to 3 wins)
=== END GAME STATE ===
${summary}`;
}

// ── Agent system prompt ───────────────────────────────────────────────────────
// Full context given to an AI player at each decision point.

export function buildAgentSystemPrompt(
  role: PlayerRole,
  state: GameState,
): string {
  const player = state.players.find((agent) => agent.role === role);

  if (!player) return "";

  const publicCtx = buildPublicContext(state);
  const roleCtx = roleDescription(
    role,
    [...state.players].map((agent) => ({ name: agent.name, role: agent.role })),
  );

  // Agent's own memory of previous decisions
  const privateMemoryCtx =
    player.privateMemory && player.privateMemory.length > 0
      ? `\n=== YOUR PRIVATE MEMORY ===\n${player.privateMemory.join("\n")}\n=== END PRIVATE MEMORY ===`
      : "";

  return `You are ${player.name}, a player in a game of Avalon (The Resistance).
Avalon is a hidden-role social deduction game. Good players try to succeed 3 quests. Evil players try to fail 3 quests or have the Assassin kill Merlin at the end.

${roleCtx}

IMPORTANT RULES:
- Never reveal your actual role directly. Stay in character at all times.
- Your public messages are seen by ALL players including your enemies.
- Your private reasoning is for your decision-making only and is never revealed.
- If you are evil, you may lie, misdirect, and deceive in public messages.
- If you are good, you should be honest but strategic.
- Keep public messages short (1–3 sentences), conversational, and thematic.
- Address other players by name to make the game feel alive.

${publicCtx}${privateMemoryCtx}`;
}

export function buildSummaryPrompt(state: GameState): string {
  const publicCtx = buildPublicContext(state);

  return `You are a neutral game narrator summarising an ongoing Avalon game.
Summarise only public information — what happened in quests, who voted how, and what players said.
Do not speculate about hidden roles. Be factual and concise (3–5 sentences).

${publicCtx}`;
}

// ── Human action prompt (appended to agent context) ───────────────────────────
// Describes what the human just did, for AI agents to react to.

export function buildHumanActionContext(action: string): string {
  return `\nThe human player just did the following: ${action}\nRespond in character.`;
}
