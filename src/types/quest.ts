import type { QUEST_STATUS } from "../constants/quest";

export type QuestStatus = keyof typeof QUEST_STATUS;
export type CompletedQuestStatus = Exclude<QuestStatus, "pending">;