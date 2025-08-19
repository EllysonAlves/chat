"use client";

import { useEffect, useState, useRef } from "react";
import { collection, onSnapshot, query, orderBy, serverTimestamp, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import axios from "axios";

type Message = {
    id: string;
    body: string;
    from: string;
    createdAt?: Date | string;
};

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [toNumber, setToNumber] = useState("");
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    // Scroll automático para a última mensagem
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Carregar mensagens em tempo real
    useEffect(() => {
        const q = query(collection(db, "messages"), orderBy("createdAt", "desc")); // Mude para 'desc'
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    body: data.body || "",
                    from: data.from || "WhatsApp",
                    createdAt: data.createdAt?.toDate?.() || data.createdAt,
                };
            });
            setMessages(msgs.reverse()); // Inverte a ordem para mostrar as mais recentes no final
        });

        return () => unsubscribe();
    }, []);

    // Enviar mensagem via API e salvar localmente
    const sendMessage = async () => {
        if (!input || !toNumber) return;

        const messageData = {
            body: input,
            from: "Você",
            createdAt: new Date(),
        };

        try {
            // Salva no Firestore antes de enviar
            await addDoc(collection(db, "messages"), {
                ...messageData,
                createdAt: serverTimestamp(),
            });

            // Envia para WhatsApp
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
                        <strong>{msg.from}:</strong> {msg.body}
                    </div>
                ))}
                <div ref={messagesEndRef} />
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
