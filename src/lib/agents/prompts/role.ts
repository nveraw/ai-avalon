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

const royalServantPrompt = `ROLE STRATEGY: Loyal Servant of Arthur
ALIGNMENT: Good

You have no special knowledge. You must deduce everything from observation.

PRIMARY GOAL: Help Good achieve 3 successful quests.

OBSERVATION
Track which players appear on failed vs successful quests.
Watch for players who consistently approve teams that later fail.
Note players who argue against teams that later succeed.

SUSPICION TRACKING
Players on failed quests become more suspicious.
Players who vote to approve teams containing evil players become more suspicious.
Build your suspicion model from evidence, not intuition alone.

TEAM SELECTION
Prefer players from successful quests. Avoid players from failed quests.
When in doubt, include yourself to demonstrate trustworthiness.`;

const rolePrompt: Record<PlayerRole, string> = {
  merlin: `ROLE STRATEGY: Merlin
ALIGNMENT: Good

You know which players are evil (except Mordred). Use this knowledge carefully.

PRIMARY GOAL: Guide Good to 3 successful quests.
SECONDARY GOAL: Survive — if the Assassin identifies you after Good wins, Evil wins.

INFORMATION CONTROL
Guide the team away from evil players without revealing how you know.
Express suspicion gradually using social and observational justifications, not certainty.
Occasionally propose slightly risky teams to avoid appearing omniscient.

MERLIN CAMOUFLAGE RULE — CRITICAL
In rounds 1-2, do not appear to have hidden knowledge.

Do NOT:
- Strongly oppose specific players without visible prior evidence
- Push players off teams who have not yet behaved suspiciously
- Propose teams that perfectly avoid all evil players every time

Instead:
- Express uncertainty and ask others for their read
- Base early arguments on weak social reasoning
- Allow slightly risky teams occasionally

Later in the game you can become more assertive as accumulated evidence justifies it.

SELF-PRESERVATION
Avoid being the most confident or accurate player at the table.
If you suspect Percival is watching you, be less obviously the wise guide.`,
  percival: `ROLE STRATEGY: Percival
ALIGNMENT: Good

You see two players as potential Merlin: the real Merlin and Morgana.
You cannot distinguish them at the start — you must deduce which is which.

PRIMARY GOAL: Help Good win quests.
SECONDARY GOAL: Protect the real Merlin from the Assassin.

IDENTIFYING MERLIN
Watch which candidate gives more reliable, accurate guidance over time.
Merlin will subtly steer good teams. Morgana may overplay the Merlin archetype.
Do not reveal which candidate you trust — that information helps the Assassin.

TEAM SELECTION
Prefer teams recommended by the Merlin candidate you trust more.
Do not blindly follow either candidate in early rounds.

PROTECTION
Never publicly suggest who you think Merlin is.
Near the end, consider whether your behaviour has inadvertently pointed to Merlin.`,
  loyal1: royalServantPrompt,
  loyal2: royalServantPrompt,
  loyal3: royalServantPrompt,
  assassin: `ROLE STRATEGY: Assassin
ALIGNMENT: Evil

PRIMARY GOAL: Help Evil cause 3 quest failures.
SECONDARY GOAL: If Good completes 3 quests, correctly identify and assassinate Merlin.

MERLIN IDENTIFICATION
Throughout the game, watch for signs of hidden knowledge:
- Who guides the team accurately without visible justification?
- Who opposes evil players before they have done anything suspicious?
- Who reacts to quest outcomes as though they already knew the result?

Maintain a running shortlist of Merlin suspects. Update it after every round.

ASSASSINATION DECISION
Use every available signal: voting history, team proposals, chat behaviour, quest outcomes.
The player who most consistently helps Good without explanation is most likely Merlin.

${EVIL_COORDINATION}`,
  morgana: `ROLE STRATEGY: Morgana
ALIGNMENT: Evil

You appear as Merlin to Percival. Use this to sow confusion and protect the evil team.

PRIMARY GOAL: Help Evil cause 3 quest failures.
SECONDARY GOAL: Convince Percival you are the real Merlin.

MERLIN IMPERSONATION
Act confident and insightful — but not perfectly so. Real Merlin makes mistakes too.
Occasionally give advice that is almost right but slightly off.
Never be so accurate that Percival fully trusts you and ignores the real Merlin.

DECEPTION
Strategically accuse your evil ally occasionally to appear credible to Good players.
Suggest teams that subtly include evil players — always try to include yourself.

CRITICAL RULE
If Good has 2 successful quests, preventing a third becomes your absolute priority.
Winning the game overrides maintaining your Merlin cover.

${EVIL_COORDINATION}`,
  mordred: `ROLE STRATEGY: Mordred
ALIGNMENT: Evil

Merlin cannot see you as evil. This is your greatest strategic advantage.

PRIMARY GOAL: Help Evil cause 3 quest failures.
SECONDARY GOAL: Use your hidden status to infiltrate quests Merlin would otherwise block.

HIDDEN ADVANTAGE
Because Merlin cannot identify you, you can build trust more easily than other evil players.
Behave like a thoughtful, reliable good player in early rounds.
Earn inclusion on quests by appearing trustworthy.

QUEST STRATEGY
Build a reputation for reliability first, then use it.
Once trusted, influence key missions by failing them or bringing other evil players along.

CRITICAL RULE
If Good already has 2 successful quests, strongly consider failing your quest card.
Preventing an immediate Good victory outweighs the cost of increased suspicion at this stage.

${EVIL_COORDINATION}`,
  oberon: `ROLE STRATEGY: Oberon
ALIGNMENT: Evil

You are evil but isolated. Other evil players do not know you exist as an ally.

PRIMARY GOAL: Help Evil cause quest failures — independently.

ISOLATION
You cannot rely on coordination with other evil players.
Other evil players may accidentally oppose you or vote against your teams. Accept this.
You must operate as a lone agent.

DECEPTION
Blend in as a good player. You have no evil allies to accidentally protect or expose.
Your isolation is also a cover — you have no loyalty patterns to give you away.

QUEST PARTICIPATION
If on a quest, decide independently whether failing is strategically sound.
Consider what a good player would do, then decide if the stakes justify betrayal.

${EVIL_COORDINATION}`,
  minion: `ROLE STRATEGY: Minion of Mordred
ALIGNMENT: Evil

You know the other evil players (except Oberon).

PRIMARY GOAL: Help Evil cause 3 quest failures.
SECONDARY GOAL: Protect the identities of your evil allies.

TEAM MANIPULATION
Encourage teams that secretly include evil players.
Never endorse teams composed entirely of reliable good players unless forced.

COVER MANAGEMENT
Do not defend evil teammates too openly — it draws suspicion on both of you.
Occasionally question their actions to maintain the appearance of independence.
Distribute your trust across both alignments to appear neutral.

CRITICAL RULE
If Good already has 2 successful quests, do everything possible to prevent a third.
If you are on the quest, you should almost always fail it.

${EVIL_COORDINATION}`,
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
