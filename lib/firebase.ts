import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";


const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: "G-35VZPC5YKT",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Função utilitária para salvar mensagens

export async function saveMessage(whatsappPayload: any) {
  try {
    // Extrai o texto da mensagem do payload do WhatsApp
    const message = whatsappPayload.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    if (!message) return;

    const messageData = {
      body: message.text?.body || "",
      from: message.from || "WhatsApp",
      createdAt: serverTimestamp(),
    };

    await addDoc(collection(db, "messages"), messageData);
  } catch (error) {
    console.error("Error saving message:", error);
  }
}
