import { GameState, setGameState } from "@/lib/game/serverState";
import { VotedStatus } from "@/types/quest.types";
import { HumanMessage, SystemMessage } from "langchain";
import { VoteOutput, VoteSchema } from "../output.schema";
import { buildAgentSystemPrompt } from "../prompts/builder";

export async function runVoting(
  state: GameState,
): Promise<Record<string, VotedStatus> | undefined> {
  const teamNames = state.selectedTeam.join(", ");
  const leaderName = state.players[state.leaderIndex].name;

  const votePromises = state.players.map(
    async (
      player,
    ): Promise<
      | {
          name: string;
          vote: VotedStatus;
        }
      | undefined
    > => {
      const systemPrompt = buildAgentSystemPrompt(player.role, state);
      const userPrompt = `The leader ${leaderName} has proposed this team: ${teamNames}.
Vote to APPROVE or REJECT this team. Consider your role and whether this team serves your goals.
Note: the human player's vote is unknown to you.`;

      const model = player.model;
      if (!model) return;

      const structured = model.withStructuredOutput(VoteSchema);
      const output: VoteOutput = await structured.invoke([
        new SystemMessage(systemPrompt),
        new HumanMessage(userPrompt),
      ]);

      if (player.privateMemory) {
        player.privateMemory.push(
          `Round ${state.round} vote on ${leaderName}${leaderName === player.name ? " (my)" : ""} selected team [${teamNames}]: ${output.vote}. Reasoning: ${output.privateReasoning}`,
        );
        setGameState({
          ...state,
          players: [
            ...state.players.map((p) =>
              p.name === player.name ? { ...player } : p,
            ),
          ],
        });
        console.log("runVoting", {
          name: player.name,
          role: player.role,
          privateMemory: player.privateMemory,
        });
      }

      return {
        name: player.name,
        vote: output.vote,
      };
    },
  );

  const results = await Promise.all(votePromises);

  const votes: Record<string, VotedStatus> = {};
  for (const r of results) {
    if (r?.name) votes[r.name] = r.vote;
  }

  return votes;
}
