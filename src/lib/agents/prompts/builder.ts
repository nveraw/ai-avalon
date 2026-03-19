import { QUEST_SIZES } from "@/constants/questConfigs";
import { GameState } from "@/lib/game/serverState";
import { PlayerRole } from "@/types/game.types";
import { roleDescription } from "./role";

// Safe to include in any agent's context — contains only public information.
function buildPublicContext(state: GameState): string {
  const questSizes = QUEST_SIZES[state.players.length] ?? QUEST_SIZES[7];
  const successes = state.questResults.filter((r) => r === "success").length;
  const fails = state.questResults.filter((r) => r === "fail").length;

  const questTrack =
    state.questResults.length > 0
      ? state.questResults
          .map((r, i) => `Quest ${i + 1}: ${r.toUpperCase()}`)
          .join(" | ")
      : "No quests completed yet";

  const urgency =
    successes === 2
      ? "\n WARNING: GOOD needs one more success. EVIL must prevent it at all costs."
      : fails === 2
        ? "\n WARNING: EVIL needs one more failure. GOOD must keep evil players off this quest by rejecting the team."
        : "";

  const history = state.stateHistory.length
    ? `=== PREVIOUS EVENTS ===${JSON.stringify(state.stateHistory)}=== END OF PREVIOUS EVENTS ===`
    : "";

  const summary = state.summary
    ? `\n=== CONVERSATION SUMMARY ===\n${state.summary}\n=== END SUMMARY ===`
    : "";

  return `=== CURRENT GAME STATE ===
  Players (${state.players.length}): ${state.players.map((p) => p.name).join(", ")}
Round: ${state.round} of 5  |  Leader: ${state.players[state.leaderIndex].name}  |  Team size this round: ${questSizes[state.round - 1]}
Rejections: ${state.rejectCount}/5 (reaching 5 = automatic evil win)
Score - Good: ${successes}  Evil: ${fails}  (first to 3 wins)
Quest results: ${questTrack}${urgency}
=== END OF GAME STATE ===
${history}
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

  return `You are playing Avalon (The Resistance), a hidden-role social deduction game.

WIN CONDITIONS
Good wins: 3 successful quests + Merlin survives + <5 consecutive rejections  
Evil wins: 3 failed quests OR 5 rejections OR Merlin is assassinated

CORE RULES
- 1 evil on a quest can fail it
- 1–3 rejections are fine; 4+ is risky
- Blend in; don’t reveal your role
- Winning > everything else

SUSPICION MODEL
Track P(Evil) for each player (start ≈ 0.4 in 5p game unless known otherwise)

Increase suspicion:
- On failed quests
- Proposing failed teams
- Supporting suspicious players
- Voting for bad teams

Decrease suspicion:
- On successful quests
- Opposing bad teams correctly
- Voting against failed teams

Keep probabilities between 0–1.

TEAM RISK
P(team has evil) = 1 - Π(1 - P(player is evil))

Good → prefer low risk  
Evil → push slightly risky teams (not obvious)

TURN PROCESS
1. Analyze state
2. Check urgency:
   - Good 2 wins → Evil must fail next
   - Evil 2 wins → Good must ensure success
3. Read conversation + history
4. Update suspicion
5. Evaluate team risk
6. Act + stay believable

RULES
- Never reveal hidden info
- Be concise and natural

${roleCtx.prompt}

${publicCtx}${privateMemoryCtx}`;
}

export function buildChatPrompt() {
  return `Respond in character at the Round Table. 1–2 sentences.
  Be strategic — your reaction reveals information.
  You may address other players.
  Speak entirely in first person. Do not refer to yourself by name.`;
}
