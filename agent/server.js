// agent/server.js

const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const OpenAI = require("openai");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const app = express();
const PORT = process.env.PORT || 3030;

// ---------- OpenAI client ----------

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// ---------- Load prompts ----------

const PROMPTS_DIR = path.join(__dirname, "prompts");

function loadText(fileName) {
  const p = path.join(PROMPTS_DIR, fileName);
  return fs.readFileSync(p, "utf8");
}

function loadJSON(fileName) {
  const p = path.join(PROMPTS_DIR, fileName);
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

const systemEn = loadText("system_en.txt");
const systemRu = loadText("system_ru.txt");
const modesEn = loadJSON("modes_en.json");
const modesRu = loadJSON("modes_ru.json");

function detectLangFromText(text) {
  // простейший детектор: есть кириллица — считаем, что ru
  return /[а-яА-ЯёЁ]/.test(text) ? "ru" : "en";
}

function buildSystemPrompt(lang, modeName) {
  const base = lang === "ru" ? systemRu : systemEn;
  const modes = lang === "ru" ? modesRu : modesEn;
  const modeText = modes[modeName] || modes["base"] || "";
  if (!modeText) return base;
  return `${base.trim()}\n\nMode: ${modeName}\n${modeText.trim()}`;
}

// ---------- Middleware ----------

app.use(cors());
app.use(express.json());

// ---------- API: /api/chat ----------

app.post("/api/chat", async (req, res) => {
  try {
    const { message, history = [], mode, lang } = req.body || {};

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "message is required" });
    }

    const langEffective = lang || detectLangFromText(message);
    const modeEffective = mode || "mentor"; // по умолчанию учимся :)

    const systemPrompt = buildSystemPrompt(langEffective, modeEffective);

    const messages = [];

    messages.push({
      role: "system",
      content: systemPrompt
    });

    if (Array.isArray(history)) {
      history.forEach((m) => {
        if (m && m.role && m.content) {
          messages.push({ role: m.role, content: m.content });
        }
      });
    }

    messages.push({ role: "user", content: message });

    const completion = await client.chat.completions.create({
      model: "gpt-5.1-mini", // замени на нужную модель
      messages,
      temperature: 0.7
    });

    const reply = completion.choices[0]?.message?.content || "";

    res.json({
      reply,
      lang: langEffective,
      mode: modeEffective
      // при желании можно добавить systemPrompt для отладки
    });
  } catch (err) {
    console.error("Error in /api/chat:", err);
    res.status(500).json({
      error: "Server error",
      details: err.message || String(err)
    });
  }
});

// ---------- Start server ----------

app.listen(PORT, () => {
  console.log(`Miranda agent listening on http://localhost:${PORT}`);
});