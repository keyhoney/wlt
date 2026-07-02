import express from "express";
import path from "path";
import { existsSync } from "fs";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { buildSystemInstruction, GEMINI_MODEL } from "./functions/_lib/translate-prompt";

if (existsSync(".env.local")) {
  dotenv.config({ path: ".env.local" });
} else {
  dotenv.config();
}

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("GEMINI_API_KEY가 설정되지 않았습니다. .env.local 파일을 확인하세요.");
}

const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.post("/api/translate/text", async (req, res) => {
    try {
      if (!apiKey) {
        res.status(500).json({ error: "GEMINI_API_KEY가 설정되지 않았습니다" });
        return;
      }

      const { text, tone } = req.body;
      const systemInstruction = buildSystemInstruction(tone);

      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: text,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
        }
      });
      
      const responseText = response.text || "{}";
      const result = JSON.parse(responseText);
      res.json({ result });
    } catch (error) {
      console.error("Translation error:", error);
      res.status(500).json({ error: "번역에 실패했습니다" });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
