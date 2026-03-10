import type {
  AssassinationRequest,
  AssassinationResponse,
  ChatRequest,
  ChatResponse,
  InitGameRequest,
  InitGameResponse,
  QuestRequest,
  QuestResponse,
  TeamSelectionRequest,
  TeamSelectionResponse,
  VoteRequest,
  VoteResponse,
} from "../types/api.types";

const BASE = "/api/game";

async function post<TReq, TRes>(path: string, body: TReq): Promise<TRes> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json();
}

export const startGame = (body: InitGameRequest) =>
  post<InitGameRequest, InitGameResponse>("/init", body);
export const sendChat = (body: ChatRequest) =>
  post<ChatRequest, ChatResponse>("/chat", body);
export const submitTeam = (body: TeamSelectionRequest) =>
  post<TeamSelectionRequest, TeamSelectionResponse>("/team", body);
export const submitVote = (body: VoteRequest) =>
  post<VoteRequest, VoteResponse>("/vote", body);
export const submitQuest = (body: QuestRequest) =>
  post<QuestRequest, QuestResponse>("/quest", body);
export const assassinate = (body: AssassinationRequest) =>
  post<AssassinationRequest, AssassinationResponse>("/assassinate", body);
