import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: Request) {
    const { to, message } = await req.json();

    try {
        const r = await axios.post(
            `https://graph.facebook.com/v22.0/718972057972485/messages`,
            {
                messaging_product: "whatsapp",
                to,
                text: { body: message }
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
                    "Content-Type": "application/json"
                }
            }
        );

        return NextResponse.json({ success: true, data: r.data });
    } catch (err: unknown) {
        let message = "Erro desconhecido";
        if (err instanceof Error) message = err.message;
        return NextResponse.json({ error: message }, { status: 500 });
    }

}
