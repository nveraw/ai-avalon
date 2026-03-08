import { PERSONAS } from "@/constants/playerRoles";
import { sendChat } from "@/lib/api";
import { addMessagesAtom, ChatMessage, messagesAtom } from "@/store/chat";
import type { PlayerDetails } from "@/types/player.types";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useRef, useState } from "react";
import Header from "./Header";

type ChatPanelProps = {
  allPlayers: PlayerDetails[];
  className: string;
};

const ChatPanel = ({ allPlayers, className }: ChatPanelProps) => {
  const messages = useAtomValue(messagesAtom);
  const addMessage = useSetAtom(addMessagesAtom);
  const [displayMessages, setDisplayMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });

    messages.forEach((msg, i) => {
      setTimeout(() => {
        setTyping(msg.from);

        setTimeout(() => {
          setTyping(null);
          setDisplayMessages((prev) => [...prev, msg]);
        }, 800);
      }, i * 1200);
    });
  }, [messages]);

  const send = async () => {
    const message = input.trim();
    if (!message) return;
    addMessage([{ from: allPlayers[0].name, text: message }]);
    setInput("");

    const res = await sendChat({ message });
    addMessage(res.messages);
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-indigo-950 shrink-0">
        <Header
          title="Round Table"
          description={`${allPlayers.length} knights`}
        />
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 min-h-0">
        {displayMessages.map((msg, i) => {
          if (msg.from === "system")
            return (
              <div key={i} className="text-center py-1">
                <span className="text-xs text-indigo-300 font-serif italic">
                  {msg.text}
                </span>
              </div>
            );

          const isHuman = msg.from === allPlayers[0].name;

          return (
            <div
              key={i}
              className={`flex flex-col gap-1 ${isHuman ? "items-end" : "items-start"}`}
            >
              <div className="flex items-center gap-1.5 px-1">
                {!isHuman && (
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                      PERSONAS[i].border
                    } font-serif font-bold border shrink-0 token-base text-slate-300`}
                  >
                    {msg.from[0]}
                  </div>
                )}
                <span
                  className={`text-xs font-serif ${isHuman ? "text-amber-400" : PERSONAS[i].colour}`}
                >
                  {isHuman ? "You" : msg.from}
                </span>
              </div>
              <div
                className={`max-w-[85%] px-3 py-2 rounded-xl text-xs font-serif leading-relaxed ${
                  isHuman
                    ? "bg-amber-950/30 border border-amber-900/50 text-amber-100 rounded-br-sm"
                    : `${PERSONAS[i].bg} border ${PERSONAS[i].border} text-slate-300 rounded-bl-sm`
                }`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}

        {typing && (
          <div className="flex items-center gap-2 px-1 animate-fadeInUp">
            <div
              className="w-5 h-5 rounded-full token-base border border-indigo-800
              flex items-center justify-center text-xs font-serif text-slate-300"
            >
              {typing[0]}
            </div>
            <div className="flex gap-1 px-3 py-2 rounded-xl bg-indigo-950/40 border border-indigo-900">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="px-3 py-3 border-t border-indigo-950 shrink-0">
        <div className="flex gap-2 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Speak at the Round Table..."
            rows={2}
            className="flex-1 bg-slate-950 border border-indigo-900 rounded-xl px-3 py-2
              text-slate-200 font-serif text-xs resize-none outline-none leading-relaxed
              focus:border-violet-700 placeholder-indigo-500"
          />
          <button
            onClick={send}
            disabled={!input.trim()}
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-all
                  bg-amber-950/40 border-amber-700 text-amber-400 cursor-pointer hover:brightness-110
                  disabled:bg-slate-950 disabled:border-indigo-900 disabled:text-indigo-500 disabled:cursor-not-allowed"
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
