"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import axios from "axios";

type Message = {
  id: string;
  body?: string;
  from?: string;
  createdAt?: any;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [toNumber, setToNumber] = useState("");

  // Carregar mensagens em tempo real
  useEffect(() => {
    const q = query(collection(db, "messages"), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs as Message[]);
    });
    return () => unsubscribe();
  }, []);

  // Enviar mensagem via API
  const sendMessage = async () => {
    if (!input || !toNumber) return;
    try {
      await axios.post("/api/sendMessage", {
        to: toNumber,
        message: input,
      });
      setInput("");
    } catch (err) {
      console.error("Erro ao enviar mensagem:", err);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Chat WhatsApp</h1>

      <div className="border p-4 h-96 overflow-y-auto mb-4 bg-gray-50">
        {messages.map((msg) => (
          <div key={msg.id} className="mb-2">
            <strong>{msg.from || "WhatsApp"}:</strong> {msg.body}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Número (ex: 5511999999999)"
          value={toNumber}
          onChange={(e) => setToNumber(e.target.value)}
          className="border p-2 flex-1 rounded"
        />
        <input
          type="text"
          placeholder="Mensagem"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="border p-2 flex-2 rounded"
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white p-2 rounded"
        >
          Enviar
        </button>
      </div>
    </div>
  );
}
