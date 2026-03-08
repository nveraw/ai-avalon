import { QUEST_STATUS } from "@/constants/questConfigs";
import type { QuestStatus } from "@/types/quest.types";
import clsx from "clsx";
import styles from "./QuestShield.module.scss";

const QuestShield = ({
  status,
  index,
}: {
  status: QuestStatus;
  index: number;
}) => {
  const icon = QUEST_STATUS[status] || QUEST_STATUS.pending;
  const classNames: Record<string, string> = {
    pending: "bg-[#1e1b2e] border-x-2 border-t-2 border-[#4a3f6b]",
    success: "bg-[#052e16] border-2 border-[#16a34a]",
    fail: "bg-[#2d0a0a] border-2 border-[#dc2626]",
  };
  return (
    <div
      className={clsx(
        styles.questShield,
        classNames[status],
        "relative h-18 w-16 flex flex-col items-center justify-center transition-all duration-500",
      )}
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-xs font-bold font-serif mt-0.5">Q{index + 1}</span>
    </div>
  );
};

export default QuestShield;
