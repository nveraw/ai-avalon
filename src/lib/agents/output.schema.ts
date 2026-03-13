import * as z from "zod";

export const TeamSelectionSchema = z.object({
  selectedPlayers: z
    .array(z.string())
    .describe("Names of players chosen for the quest team"),
  privateReasoning: z
    .string()
    .describe(
      "Your private strategic reasoning for this choice. Include suspicionTable:<name><probability> and riskEvaluation:<number>. Never shown to other players.",
    ),
  publicMessage: z
    .string()
    .describe(
      "What you say out loud at the Round Table about your choice. Can include misdirection if you are evil.",
    ),
});
export type TeamSelectionOutput = z.infer<typeof TeamSelectionSchema>;

export const VoteSchema = z.object({
  vote: z
    .enum(["approve", "reject"])
    .describe("Your vote on the proposed team"),
  privateReasoning: z
    .string()
    .describe(
      "Your private strategic reasoning. Include suspicionTable:<name><probability> and riskEvaluation:<number>. Never shown to other players.",
    ),
});
export type VoteOutput = z.infer<typeof VoteSchema>;

export const QuestCardSchema = z.object({
  card: z.enum(["success", "fail"]).describe("The card you play on this quest"),
  privateReasoning: z
    .string()
    .describe(
      "Your private reasoning for this choice. Never shown to other players.",
    ),
  publicMessage: z
    .string()
    .describe(
      "A short statement about your vote to share at the Round Table. Can be deceptive if you are evil.",
    ),
});
export type QuestCardOutput = z.infer<typeof QuestCardSchema>;

export const AssassinationSchema = z.object({
  target: z.string().describe("The name of the player you believe is Merlin"),
  privateReasoning: z
    .string()
    .describe(
      "Your reasoning for this assassination attempt. Include merlinSuspicionTable:<name><probability>.",
    ),
  publicMessage: z
    .string()
    .describe("What the Assassin says dramatically before striking."),
});
export type AssassinationOutput = z.infer<typeof AssassinationSchema>;

export const ChatResponseSchema = z.object({
  publicMessage: z
    .string()
    .describe("Your in-character response at the Round Table. 1–2 sentences."),
});
export type ChatResponseOutput = z.infer<typeof ChatResponseSchema>;

export const SummarySchema = z.object({
  public: z
    .string()
    .describe(
      "A concise factual summary of public information. (1-2 sentence per round)",
    ),
  content: z
    .string()
    .describe(
      "A concise factual summary of key chat moments. (1-2 sentence per player)",
    ),
});
export type SummaryOutput = z.infer<typeof SummarySchema>;
