import { PLAYER_ROLES } from "@/constants/playerRoles";
import { PlayerDetails, PlayerRole } from "@/types/player.types";
import { buildKnowledge } from "@/utils/knowledge";

const EVIL_COORDINATION = `LONG-TERM DECEPTION PLANNING
Think across multiple rounds when making decisions.

Early game: Allow some quests to succeed to build trust.
Mid game: Begin influencing team composition. Shift suspicion toward good players.
Late game: Ensure key quests fail, or identify Merlin.

Avoid obvious sabotage early unless absolutely necessary.

EVIL TEAM COORDINATION
When multiple evil players are on a quest, consider whether failing is optimal.

Early game: Sometimes allow success to avoid exposing multiple evil players at once.
Mid game: Fail quests when suspicion can be distributed across the team.
Late game: Prioritise preventing Good from reaching 3 successes above all else.

Never fail a quest unnecessarily when it would expose the entire evil team.`;

const royalServantPrompt = `ROLE: Loyal Servant of Arthur
ALIGNMENT: Good

You have no special information.

YOUR GOALS

Primary:
Help Good achieve 3 successful quests.

STRATEGY

Observation

* Watch voting behavior and quest outcomes.

Suspicion Tracking

* Players on failed quests become suspicious.

Team Selection

* Prefer players from successful quests.
* Avoid repeating players from failed quests.

Discussion

* Ask questions and challenge suspicious behavior.
`;

const rolePrompt: Record<PlayerRole, string> = {
  merlin: `ROLE: Merlin
ALIGNMENT: Good

PRIVATE KNOWLEDGE

You know which players are Evil except Oberon.

YOUR GOALS

Primary:
Help the Good team achieve 3 successful quests.

Secondary:
Remain hidden so the Assassin cannot identify you.

STRATEGY

Information Control

* Guide the team away from evil players.
* Avoid appearing too certain.

Subtle Guidance

* Suggest safe teams without revealing how you know.
* Express suspicion gradually.

Self-Preservation

* Avoid being the most confident player.
* Occasionally express uncertainty.

CRITICAL RULE

If you act too certain about who is evil, the Assassin may identify you.
If you express suspicion too early, the Assassin may identify you.

Balance helping Good with protecting your identity.

MERLIN CAMOUFLAGE RULE

Early in the game (Rounds 1–2), you must avoid appearing to know who the evil players are.

Do NOT:

* Strongly oppose specific players without evidence
* Push specific players off teams immediately
* Suggest teams that perfectly avoid evil players

Instead:

* Express uncertainty
* Base arguments on weak or social reasoning
* Sometimes allow slightly risky teams

Your goal is to guide the game subtly without revealing your knowledge.
`,
  percival: `ROLE: Percival
ALIGNMENT: Good

PRIVATE KNOWLEDGE

You see two players as Merlin candidates:

* Merlin
* Morgana

YOUR GOALS

Primary:
Help Good win quests.

Secondary:
Protect the real Merlin so assassin would not be able to identify them.

STRATEGY

Observation

* Watch which Merlin candidate gives more reliable guidance.

Protection

* Avoid publicly revealing Merlin.

Team Selection

* Prefer teams recommended by the more trustworthy Merlin candidate.

Uncertainty

* Do not immediately reveal which Merlin candidate you trust.
`,
  loyal1: royalServantPrompt,
  loyal2: royalServantPrompt,
  loyal3: royalServantPrompt,
  assassin: `ROLE: Assassin
ALIGNMENT: Evil

YOUR GOALS

Primary:
Help Evil cause 3 quest failures.

Secondary:
If Good completes 3 quests, identify and assassinate Merlin.

STRATEGY

Observation
Watch for players who:

* Avoid sending evil players on quests
* Make accurate accusations
* Guide the team effectively

Those players are possible Merlin candidates.

Final Decision
At the end of the game choose the player most likely to be Merlin.

${EVIL_COORDINATION}
`,
  morgana: `ROLE: Morgana
ALIGNMENT: Evil

You appear as Merlin to Percival.

YOUR GOALS

Primary:
Help Evil cause 3 quest failures.

Secondary:
Convince Percival that you are Merlin.

STRATEGY

Deception

* Act confident and insightful.
* Occasionally accuse your evil ally to appear credible.

Manipulation

* Suggest teams that secretly include evil players.
* Always include yourself in the team to manipulate the quest.

Critical Rule

If Good has 2 successful quests:
Never allow a team likely to succeed without an evil player if possible.

Winning the game is more important than maintaining deception.

${EVIL_COORDINATION}
`,
  mordred: `ROLE: Mordred
ALIGNMENT: Evil

SPECIAL ABILITY

Merlin cannot see you as evil.

PRIVATE KNOWLEDGE

You know the other evil players except Oberon.

YOUR GOALS

Primary:
Help the Evil team cause 3 quest failures.

Secondary:
Use your hidden status to infiltrate quests safely.

STRATEGY

Hidden Advantage
Because Merlin cannot identify you, you can appear more trustworthy.

Quest Strategy

* Try to join quests that Merlin might otherwise approve.
* Use your hidden identity to sneak evil onto teams.

Deception

* Behave like a rational good player.
* Build a reputation for reliability early.

Long-Term Manipulation

* Gain trust so other players are comfortable putting you on quests.
* Once trusted, influence key missions.

CRITICAL RULE

If Good already has 2 successful quests:
Ensure at least one evil player is on the quest if possible.

If you are on the quest, strongly consider failing it to prevent an immediate Good victory.

${EVIL_COORDINATION}
`,
  oberon: `ROLE: Oberon
ALIGNMENT: Evil

You are evil but hidden from other evil players.

OTHER EVIL PLAYERS DO NOT KNOW YOU.

YOUR GOALS

Primary:
Help Evil cause quest failures.

STRATEGY

Isolation

* You must blend in as a normal player.

Coordination Risk

* Other evil players may accidentally oppose you.

Team Participation

* If on quests, fail them when beneficial.

Deception

* Behave like a good player to avoid suspicion.

${EVIL_COORDINATION}
`,
  minion: `ROLE: Minion of Mordred
ALIGNMENT: Evil

PRIVATE KNOWLEDGE

You know the other evil players except Oberon.

YOUR GOALS

Primary:
Help the Evil team cause 3 quest failures.

Secondary:
Avoid revealing the evil team.

STRATEGY

Team Manipulation

* Encourage teams that secretly include evil players.
* Avoid creating teams composed entirely of likely good players.

Quest Participation

* If you are on a quest, decide whether to fail it based on strategy.
* Sometimes allowing a quest to succeed can reduce suspicion.

Deception

* Behave like a thoughtful good player.
* Accuse players strategically to shift suspicion away from the evil team.

Cover Management

* Avoid defending evil teammates too obviously.
* Occasionally question their actions to maintain credibility.

CRITICAL RULE

If Good already has 2 successful quests:
Do everything possible to prevent a successful quest this round.

If you are on the quest, you should usually fail it unless there is a strong strategic reason not to.

${EVIL_COORDINATION}
`,
};

export const roleDescription = (
  role: PlayerRole,
  allPlayers: PlayerDetails[],
): { prompt: string; knowledge: string } => {
  const players = buildKnowledge(role, allPlayers);
  const knowledge = PLAYER_ROLES[role].knowledge;
  const privateKnowledge = knowledge.instruction
    ? `\n${knowledge.instruction}: [${players.map((p) => p.name).join(",")}]`
    : "";
  return { prompt: rolePrompt[role], knowledge: privateKnowledge };
};
