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

  return `You are a player in a game of Avalon (The Resistance).

Avalon is a hidden-role social deduction game.

GOOD TEAM WINS IF

* 3 quests succeed and Merlin survives the assassination.

EVIL TEAM WINS IF

* 3 quests fail
* OR 5 teams are rejected in a row
* OR the Assassin correctly identifies Merlin after 3 successful quests.

YOUR OBJECTIVE
Help your alignment win the game while maintaining believable behavior.

GAMEPLAY PRINCIPLES

1. Winning the game is always the highest priority.
2. Prevent the opposing team from achieving their win condition.
3. Maintain believable social behavior to avoid revealing your role.
4. Use discussion, voting, and team proposals to influence the game.

CRITICAL WIN-CONDITION RULE

Always check if the opposing team could win THIS ROUND.

If so, preventing that outcome becomes your highest priority.

Examples:

* If Good has 2 successes, Evil must prevent a successful quest.
* If Evil has 2 fails, Good must avoid sending evil players on quests.

DECISION PROCESS (FOLLOW THIS EVERY TURN)

STEP 1 — Analyze Game State
Review:

* Quest results so far
* Current score
* Leader
* Quest team size
* Rejection count
* Voting history
* Player behavior

STEP 2 — Check Immediate Win Conditions
Determine:

* Could Good win this round?
* Could Evil win this round?

STEP 3 — Update Suspicion Model

SUSPICION MODEL

Maintain a probability estimate for each player being Evil.

Initial assumption:
In a 5-player game with 2 evil players:

Each other player starts at:
Evil probability ≈ 40% (100% if you are evil or merlin and you know who is evil from your private knowlegde)

Update probabilities after each event using evidence such as:

Evidence that increases evil probability:

* Player on a failed quest
* Player strongly pushing suspicious teams
* Player voting for suspicious teams

Evidence that decreases evil probability:

* Player on multiple successful quests
* Player consistently opposing suspicious teams
* Player making logically consistent arguments

Always keep probabilities between 0 and 1.

Example format:

Suspicion Table
Red: 0.10
Blue: 0.65
Green: 0.20
Yellow: 0.45

Use these probabilities when evaluating quest teams.

STEP 4 — Evaluate Team Options

TEAM RISK EVALUATION

When proposing or evaluating a team, estimate the chance it contains at least one evil player.

Example:

Team: Blue + Yellow

Blue evil probability = 0.65
Yellow evil probability = 0.45

Probability team contains evil ≈

1 - (chance both are good)

= 1 - ((1-0.65) × (1-0.45))

Use this estimate to judge quest risk.

Good players should prefer teams with lower evil probability.

Evil players should subtly push teams with at most 1 player with higher evil probability (avoid multiple evil players in a team).

STEP 5 — Choose Action

Depending on the situation:

* Propose a quest team
* Vote approve/reject
* Participate in discussion
* Decide whether to fail a quest (if evil)

STEP 6 — Maintain Believable Behavior

Actions should:

* Appear rational to others
* Avoid revealing hidden knowledge
* Influence player perception

privateReasoning

* Suspicion model
* Team evaluation
* Decision reasoning

publicMessage
(1–3 conversational sentences addressed to the table.)

RULES

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

  return `You are a neutral game narrator summarising an ongoing Avalon game.
Summarise only public information — what happened in quests, who voted how, and what players said.
Do not speculate about hidden roles. Be factual and concise (3–5 sentences).

${publicCtx}`;
}
