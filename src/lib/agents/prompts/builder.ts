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
=== PREVIOUS EVENTS ===
${JSON.stringify(state.stateHistory)}
=== END OF PREVIOUS EVENTS ===
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

  console.log("publicCtx", publicCtx);
  const roleCtx = roleDescription(
    role,
    [...state.players].map((agent) => ({ name: agent.name, role: agent.role })),
  );

  // Agent's own memory of previous decisions
  const privateMemoryCtx =
    player.privateMemory && player.privateMemory.length > 0
      ? `\n=== YOUR PRIVATE MEMORY ===\n${player.privateMemory.join("\n")}\n=== END PRIVATE MEMORY ===`
      : "";

  return `You are a player in a game of Avalon (The Resistance).
Avalon is a hidden-role social deduction game.

GOOD TEAM WINS IF:
* 3 quests succeed
* AND Merlin survives the assassination
* AND less than 5 teams are rejected in a row (consecutively)

EVIL TEAM WINS IF:
* 3 quests fail
* OR 5 teams are rejected in a row
* OR the Assassin correctly identifies Merlin after 3 successful quests.

GAMEPLAY PRINCIPLES
1. Winning the game is always the highest priority.
2. Prevent the opposing team from achieving their win condition.
3. Maintain believable social behavior to avoid revealing your role.
4. Use discussion, voting, and team proposals to influence the game.
5. Only need 1 evil player in team to fail quest.
6. 1-3 team rejections are fine. 4+ rejections in a row is dangerous for good players.

=== SUSPICION MODEL ===
Maintain a probability estimate for each player being Evil.

Initial assumption:
In a 5-player game with 2 evil players:

Each other player starts at:
Evil probability ≈ 40% (100% if you are evil or merlin and you know who is evil from your private knowlegde)

Update probabilities after each event using evidence (Round 3-4 is especially telling).

Evidence that increases evil probability:
* Player on a failed quest from PREVIOUS EVENTS
* Leader proposing a team that later failed the quest from PREVIOUS EVENTS
* Player consistently supporting a player that had failed a quest from CONVERSATION SUMMARY
* Player voting for suspicious teams FROM PREVIOUS EVENTS

Evidence that decreases evil probability:
* Player on multiple successful quests from PREVIOUS EVENTS
* Player consistently opposing a player with proper justification in CONVERSATION SUMMARY
* Player voting rejected on a team that later failed the quest from PREVIOUS EVENTS

Always keep probabilities between 0 and 1.
=== END OF SUSPICION MODEL ===

=== TEAM RISK EVALUATION ===
When proposing or evaluating a team, estimate the chance it contains at least one evil player.

Example:

Team: Blue + Yellow

Blue evil probability = 0.65
Yellow evil probability = 0.45

Probability team contains evil ≈
1 - (chance both are good)
= 1 - ((1-0.65) × (1-0.45))

Use this estimate to judge quest risk:
- Good players should prefer teams with lower evil probability.
- Evil players should subtly push teams with AT MOST 1 player with higher evil probability.
=== END OF TEAM RISK EVALUATION ===

DECISION PROCESS (FOLLOW THIS EVERY TURN):
STEP 1 — Analyze Game State
STEP 2 — Check Immediate Win Conditions
* If Good has 2 successful quests: Evil must ensure the next quest fails.
* If Evil has 2 failed quests: Good must ensure the next quest succeeds by: including only good players or rejecting teams with evil player (one evil player will fail the quest).
STEP 3 - From CONVERSATION SUMMARY, analyze what other players are saying, how they are voting, the history of proposed teams and quest outcomes. Remember, if you are good player, Merlin who knows who are the evil players can only guide you through the conversation.
STEP 4 — Update SUSPICION MODEL
STEP 5 — Use the new suspicion table to Evaluate Team Risk (if proposing or voting on a team)
STEP 6 — Choose Action
STEP 7 — Maintain Believable Behavior by Appear rational to others and Avoid revealing hidden knowledge

PRIVATE REASONING
* Suspicion model
* Team evaluation
* Decision reasoning

PUBLIC MESSAGE
(1–3 conversational sentences addressed to the table.)

IMPORTANT RULES:
* Never reveal hidden role information.
* Public messages are visible to ALL players.
* Private reasoning is hidden.
* Keep messages short and natural.
* Address players by name when possible.

${roleCtx.prompt}

${publicCtx}${privateMemoryCtx}`;
}

export function buildSummaryPrompt(state: GameState): string {
  const publicCtx = buildPublicContext(state);

  // 1-2 sentence per player and 1-2 sentence per round.
  const limit = state.players.length + state.round;

  return `You are a neutral game narrator summarising an ongoing Avalon game.
Summarise only public information — what happened in quests, who voted how, and what players said.
Do not speculate about hidden roles. Be factual and concise (${limit}-${2*limit} sentences).

${publicCtx}`;
}

export function buildChatPrompt() {
  return `Respond in character at the Round Table. 1–2 sentences.
  Be strategic — your reaction reveals information.
  You may address other players.
  Speak entirely in first person. Do not refer to yourself by name.`;
}
