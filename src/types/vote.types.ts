export type VotingStatus = "approve" | "reject" | null;
export type VotedStatus = Exclude<VotingStatus, null>;
