import { NextRequest, NextResponse } from "next/server";
import { saveMessage } from "@/lib/firebase";

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

// Define o formato esperado do webhook do WhatsApp
export interface WhatsAppWebhookPayload {
  entry?: {
    changes?: {
      value?: {
        messages?: {
          from?: string;
          text?: { body?: string };
        }[];
      };
    }[];
  }[];
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook verificado com sucesso!");
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse("Erro de verificação", { status: 403 });
}

export async function POST(req: NextRequest) {
  try {
    const body: WhatsAppWebhookPayload = await req.json();
    console.log("Mensagem recebida do WhatsApp:", JSON.stringify(body, null, 2));

    // Salva no Firebase
    await saveMessage(body);

    return NextResponse.json({ status: "ok" });
  } catch (err: unknown) {
    let message = "Erro desconhecido";
    if (err instanceof Error) message = err.message;
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
