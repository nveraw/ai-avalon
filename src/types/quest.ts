export type QuestStatus = "pending" | "success" | "fail";
export type CompletedQuestStatus = Exclude<QuestStatus, "pending">;