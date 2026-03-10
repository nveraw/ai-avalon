import { atom } from "jotai";

export type ChatMessage = {
  from: string; // player name, or "system"
  text: string;
};

export const messagesAtom = atom<ChatMessage[]>([]);
