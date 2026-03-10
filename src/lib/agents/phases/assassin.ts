import { PLAYER_ROLES } from "@/constants/playerRoles";
import { GameState, setGameState } from "@/lib/game/serverState";
import { HumanMessage, SystemMessage } from "langchain";
import { AssassinationOutput, AssassinationSchema } from "../output.schema";
import { buildAgentSystemPrompt } from "../prompts/builder";

export async function runAssassination(state: GameState): Promise<string> {
  const assassin = state.players.find((p) => p.role === "assassin")!;

  const goodPlayers = state.players
    .filter((p) => PLAYER_ROLES[p.role].team === "good")
    .map((p) => p.name)
    .join(", ");

  const systemPrompt = buildAgentSystemPrompt(assassin.role, state);
  const userPrompt = `Good has won 3 quests. As the Assassin, you must now identify and kill Merlin.
Available targets: ${goodPlayers}.
Use everything you know — their voting patterns, quest choices, and chat behaviour — to identify Merlin.
Choose wisely. If you kill Merlin, Evil wins.

MERLIN DETECTION MODEL

Track players who may be Merlin.

Signs of Merlin:

* Correctly avoids evil players on quests
* Makes accurate accusations
* Influences team selection effectively

Maintain a Merlin probability estimate.

Example:

Merlin suspicion:
Red: 0.10
Blue: 0.50
Yellow: 0.40

Use this model when making the final assassination decision.
`;

  const model = assassin.model;
  if (!model) return "";
  const structured = model.withStructuredOutput(AssassinationSchema);
  const output: AssassinationOutput = await structured.invoke([
    new SystemMessage(systemPrompt),
    new HumanMessage(userPrompt),
  ]);

  // Validate target exists
  const validTarget = state.players.find((p) => p.name === output.target);
  const finalTarget = validTarget
    ? output.target
    : state.players.find((p) => p.role !== "assassin")!.name;

  if (assassin.privateMemory) {
    assassin.privateMemory.push(
      `Assassination target: ${finalTarget}. Reasoning: ${output.privateReasoning}`,
    );
    setGameState({
      ...state,
      players: [
        ...state.players.map((p) =>
          p.name === assassin.name ? { ...assassin } : p,
        ),
      ],
    });
    console.log("runAssassination", {
      name: assassin.name,
      role: assassin.role,
      privateMemory: assassin.privateMemory,
    });
  }

  return finalTarget;
}
