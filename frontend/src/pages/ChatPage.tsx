import React, { useEffect, useState, useRef } from "react";
import { SendIcon, BotIcon, UserIcon, Pencil, Copy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "../components/Sidebar";
import { SuggestedQuestions } from "../components/SuggestedQuestions";

interface Message {
  id: string;
  text: string;
  sender: "user" | "assistant";
  timestamp: Date;
  isEditing?: boolean;
}

export function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I am Smart College Assistant. How can I help you?",
      sender: "assistant",
      timestamp: new Date()
    }
  ]);

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim()) return;

    // Remove old reply if editing
    if (editingId) {
      setMessages(prev =>
        prev.filter(
          m => m.id !== editingId && m.id !== `${editingId}-reply`
        )
      );
      setEditingId(null);
    }

    const userId = Date.now().toString();

    setMessages(prev => [
      ...prev,
      {
        id: userId,
        text: messageText,
        sender: "user",
        timestamp: new Date()
      }
    ]);

    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch("https://collegeassistant-backend.onrender.com/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: messageText })
      });

      const data = await res.json();

      setMessages(prev => [
        ...prev,
        {
          id: `${userId}-reply`,
          text: data.reply || "No response received.",
          sender: "assistant",
          timestamp: new Date()
        }
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: `${userId}-reply`,
          text: "⚠️ Unable to reach AI server.",
          sender: "assistant",
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.length === 1 && (
              <SuggestedQuestions onSelectQuestion={handleSend} />
            )}

            <AnimatePresence initial={false}>
              {messages.map(message => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-4 ${
                    message.sender === "user"
                      ? "flex-row-reverse"
                      : "flex-row"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      message.sender === "user"
                        ? "bg-slate-700"
                        : "bg-blue-600"
                    }`}
                  >
                    {message.sender === "user" ? (
                      <UserIcon className="w-5 h-5 text-white" />
                    ) : (
                      <BotIcon className="w-5 h-5 text-white" />
                    )}
                  </div>

                  <div className="flex-1 max-w-2xl">
                    <div
                      className={`rounded-2xl px-5 py-3 ${
                        message.sender === "user"
                          ? "bg-slate-700 text-white ml-auto"
                          : "bg-white border border-slate-200"
                      }`}
                    >
                      {message.isEditing ? (
                        <input
                          value={editText}
                          onChange={e => setEditText(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg text-sm text-slate-800"
                          autoFocus
                        />
                      ) : (
                        <p className="text-sm whitespace-pre-wrap">
                          {message.text}
                        </p>
                      )}

                      <div className="flex justify-end gap-3 mt-2">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(message.text);
                            setCopiedId(message.id);
                            setTimeout(() => setCopiedId(null), 1200);
                          }}
                          className="text-slate-400 hover:text-slate-600"
                          title="Copy"
                        >
                          <Copy size={14} />
                        </button>

                        {message.sender === "user" && (
                          <button
                            onClick={() => {
                              setEditingId(message.id);
                              setEditText(message.text);
                              setMessages(prev =>
                                prev.map(m =>
                                  m.id === message.id
                                    ? { ...m, isEditing: true }
                                    : m
                                )
                              );
                            }}
                            className="text-slate-400 hover:text-slate-600"
                            title="Edit"
                          >
                            <Pencil size={14} />
                          </button>
                        )}
                      </div>
                    </div>

                    <span className="text-xs text-slate-500 mt-1 block">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isTyping && (
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                  <BotIcon className="w-5 h-5 text-white" />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl px-5 py-3">
                  <span className="text-sm text-slate-500">
                    Assistant is typing...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="border-t bg-white p-4">
          <div className="max-w-3xl mx-auto flex gap-3">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask anything about the college..."
              className="flex-1 px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50"
            >
              <SendIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
