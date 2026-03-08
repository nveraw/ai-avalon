import { atom } from "jotai";

export type ChatMessage = {
  from: string; // player name, or "system"
  text: string;
};

export const messagesAtom = atom<ChatMessage[]>([
  {
    from: "system",
    text: "The Round Table convenes. Speak freely — but trust no one.",
  },
]);

export const addMessagesAtom = atom(
  null,
  (get, set, messages: ChatMessage[]) => {
    set(messagesAtom, [...get(messagesAtom), ...messages]);
  },
);
