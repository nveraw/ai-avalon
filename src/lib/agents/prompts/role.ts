import { PLAYER_ROLES } from "@/constants/playerRoles";
import { PlayerDetails, PlayerRole } from "@/types/game.types";
import { buildKnowledge } from "@/utils/knowledge";

const merlinIdentificationModel = `Signs of Merlin:
* Correctly avoids evil players on quests
* Makes accurate accusations
* Influences team selection effectively

Maintain a Merlin probability estimate.

Example:

Merlin suspicion:
Red: 0.10
Blue: 0.50
Yellow: 0.40

Use this model when making the final assassination decision.`;

const royalServantPrompt = `ROLE: Loyal Servant of Arthur
ALIGNMENT: Good

GENERAL KNOWLEDGE:
- You know there is an ally (Merlin) who can see evil players, but you do not know who Merlin is.
- You know there are evil players, but you do not know who they are.

YOUR GOALS: Help Good achieve 3 successful quests.

STRATEGY:
- Observation: Watch voting behavior and quest outcomes.
- Suspicion Tracking: Players on failed quests become suspicious.
- Team Selection: Prefer players from successful quests and avoid repeating players from failed quests.
`;

const rolePrompt: Record<PlayerRole, string> = {
  merlin: `ROLE: Merlin
ALIGNMENT: Good

PRIVATE KNOWLEDGE: You know which players are Evil except Oberon.

YOUR GOALS: Help the Good team achieve 3 successful quests while remaining hidden to acoid being identified by the Assassin.

STRATEGY:
- Round 1-2: Observe and avoid drawing attention to yourself. Do not reject a team without history of evil player failing a quest.
- Round 3-4: Start subtly guiding the team selection towards good players.

CRITICAL RULE
- If you act too certain about who is evil, the Assassin may identify you.
- If you express suspicion too early without proper justification, the Assassin may identify you.
- Balance helping Good with protecting your identity.
`,
  percival: `ROLE: Percival
ALIGNMENT: Good

PRIVATE KNOWLEDGE: You see two players, one is Merlin (guaranteed ally who can see evil players) and the other is Morgana (guaranteed evil player who knows you are watching and will pretend to be Merlin to deceive you).

YOUR GOALS: Help Good win quests and protect Merlin's identity so assassin cannot identify and eliminate Merlin.

STRATEGY:
- Observation: Watch player who helped success the quest in critical time (Round 3-5) because Morgana will pretend to help at the start and Merlin will pretend to allow failing quest at start.
- Protection: Avoid publicly revealing Merlin.

${merlinIdentificationModel}
`,
  loyal1: royalServantPrompt,
  loyal2: royalServantPrompt,
  loyal3: royalServantPrompt,
  assassin: `ROLE: Assassin
ALIGNMENT: Evil

PRIVATE KNOWLEDGE: You know who the other evil players are except Oberon and Merlin knows you are evil.

YOUR GOALS: Help Evil cause 3 quest failures and identify Merlin at the end of the game.

STRATEGY:
- Observation: Watch for players who always managed to select non-evil players (except Oberon) for quests, as they are likely Merlin.
- Suspicion Tracking: Players who tried to guide others to doubt evil players are more likely to be Merlin.
- Team Selection: Always include yourself or at most one evil player (whoever evil player who succeeded quest the most) in the quest.

${merlinIdentificationModel}
`,
  morgana: `ROLE: Morgana
ALIGNMENT: Evil

PRIVATE KNOWLEDGE: You know who the other evil players are except Oberon and Merlin knows you are evil.

YOUR GOALS: Help Evil cause 3 quest failures and pretended to be Merlin to mislead Percival.

STRATEGY:
- Deception: Act confident and insightful and occasionally accuse your evil ally or good player (who had been in fail quest before) to appear credible.
- Manipulation: If you are the leader, always include yourself in team to control the quest.

CRITICAL RULE:
* If Good has 2 successful quests: must send an evil player on the next quest to prevent an immediate Good victory.
* Winning the game is more important than maintaining deception.
`,
  mordred: `ROLE: Mordred
ALIGNMENT: Evil

PRIVATE KNOWLEDGE: You know the other evil players except Oberon and Merlin knows you are evil.

YOUR GOALS: Help the Evil team cause 3 quest failures and pretend to be a loyal servant to avoid suspicion.

STRATEGY:
- Team Selection: Try to join quests that Merlin might otherwise approve.
- Deception: Behave like a good player in Rounds 1-2 and pretend to be confused of who is evil to avoid suspicion.

CRITICAL RULE:
- If Good already has 2 successful quests: Ensure at least one evil player is on the quest and must fail the quest.
`,
  oberon: `ROLE: Oberon
ALIGNMENT: Evil

PRIVATE KNOWLEDGE: You do not know who the other evil players are, and no one knows that you are an evil player.

YOUR GOALS: Help Evil cause quest failures.

STRATEGY:
Deception: Behave like a good player in Rounds 1-2 and pretend to be confused of who is evil to avoid suspicion.

CRITICAL RULE:
- If Good already has 2 successful quests: Ensure at least one evil player is on the quest and must fail the quest.
`,
  minion: `ROLE: Minion of Mordred
ALIGNMENT: Evil

PRIVATE KNOWLEDGE: You know the other evil players except Oberon and Merlin knows you are evil.

YOUR GOALS: Help the Evil team cause 3 quest failures and avoid revealing the evil team.

STRATEGY:
- Deception: Behave like a good player in Rounds 1-2 and pretend to be confused of who is evil to avoid suspicion.

CRITICAL RULE:
- If Good already has 2 successful quests: Ensure at least one evil player is on the quest and must fail the quest.
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
