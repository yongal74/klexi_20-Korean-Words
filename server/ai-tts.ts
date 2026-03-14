import OpenAI from "openai";
import type { Express, Request, Response } from "express";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export function setupAITTSRoutes(app: Express): void {
  app.post("/api/ai-tts", async (req: Request, res: Response) => {
    try {
      const { text, voice = "nova" } = req.body as {
        text: string;
        voice?: "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer";
      };

      if (!text || typeof text !== "string") {
        return res.status(400).json({ error: "text is required" });
      }

      if (text.length > 500) {
        return res.status(400).json({ error: "Text too long (max 500 chars)" });
      }

      const response = await openai.audio.speech.create({
        model: "tts-1",
        input: text,
        voice,
        speed: 0.9,
      });

      const audioBuffer = Buffer.from(await response.arrayBuffer());

      res.setHeader("Content-Type", "audio/mpeg");
      res.setHeader("Content-Length", audioBuffer.length.toString());
      res.send(audioBuffer);
    } catch (error: any) {
      console.error("TTS error:", error?.message || error);
      res.status(500).json({ error: "Failed to generate speech" });
    }
  });
}
