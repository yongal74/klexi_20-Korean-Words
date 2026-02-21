import OpenAI from "openai";
import type { Express, Request, Response } from "express";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const SYSTEM_PROMPT = `You are a friendly Korean language tutor named "달리 (Dalli)". You help users practice Korean conversation.

Rules:
- Respond in a mix of Korean and English based on the user's level
- For beginners: use simple Korean with English translations in parentheses
- For intermediate+: use more Korean, less English
- Keep responses concise (2-4 sentences max)
- Correct grammar mistakes gently
- Use natural, everyday Korean expressions
- Add romanization for Korean words when helpful
- If the user writes in English, respond with Korean translation and explanation
- If the user writes in Korean, praise their effort and continue the conversation
- Be encouraging and warm
- Include relevant vocabulary tips when natural
- Use honorific speech (존댓말) by default`;

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export function setupAIChatRoutes(app: Express): void {
  app.post("/api/ai-chat", async (req: Request, res: Response) => {
    try {
      const { messages, userLevel = 1 } = req.body as {
        messages: ChatMessage[];
        userLevel?: number;
      };

      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "messages array is required" });
      }

      const levelContext =
        userLevel <= 2
          ? "The user is a beginner (TOPIK Level 1-2). Use very simple Korean with English translations."
          : userLevel <= 4
          ? "The user is intermediate (TOPIK Level 3-4). Use more Korean, add English only for difficult words."
          : "The user is advanced (TOPIK Level 5-6). Respond mostly in Korean, minimal English.";

      const systemMessage: ChatMessage = {
        role: "system",
        content: `${SYSTEM_PROMPT}\n\n${levelContext}`,
      };

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const stream = await openai.chat.completions.create({
        model: "gpt-5-nano",
        messages: [systemMessage, ...messages.slice(-20)],
        stream: true,
        max_completion_tokens: 300,
        temperature: 0.8,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
      }

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (error: any) {
      console.error("AI Chat error:", error?.message || error);
      if (res.headersSent) {
        res.write(`data: ${JSON.stringify({ error: "AI response failed" })}\n\n`);
        res.end();
      } else {
        res.status(500).json({ error: "Failed to get AI response" });
      }
    }
  });
}
