import { ChatMessage } from "@/types/chat.types";
import { atom } from "jotai";

export const messagesAtom = atom<ChatMessage[]>([]);
