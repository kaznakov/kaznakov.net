const path = require("path");
const fs = require("fs");
const OpenAI = require("openai");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-5-mini";

if (!BOT_TOKEN) throw new Error("Missing TELEGRAM_BOT_TOKEN in agent/.env");
if (!OPENAI_API_KEY) throw new Error("Missing OPENAI_API_KEY in agent/.env");

const client = new OpenAI({ apiKey: OPENAI_API_KEY });
const apiBase = `https://api.telegram.org/bot${BOT_TOKEN}`;

const PROMPTS_DIR = path.join(__dirname, "prompts");
function loadText(fileName) {
  return fs.readFileSync(path.join(PROMPTS_DIR, fileName), "utf8");
}
function loadJSON(fileName) {
  return JSON.parse(fs.readFileSync(path.join(PROMPTS_DIR, fileName), "utf8"));
}

const systemEn = loadText("system_en.txt");
const systemRu = loadText("system_ru.txt");
const modesEn = loadJSON("modes_en.json");
const modesRu = loadJSON("modes_ru.json");

const sessions = new Map();
let updateOffset = 0;

function detectLang(text = "") {
  return /[а-яА-ЯёЁ]/.test(text) ? "ru" : "en";
}

function buildSystemPrompt(lang, modeName) {
  const base = lang === "ru" ? systemRu : systemEn;
  const modes = lang === "ru" ? modesRu : modesEn;
  const modeText = modes[modeName] || modes.base || "";
  return modeText ? `${base.trim()}\n\nMode: ${modeName}\n${modeText.trim()}` : base;
}

function getSession(chatId) {
  if (!sessions.has(chatId)) {
    sessions.set(chatId, { lang: "ru", mode: "qualify", history: [] });
  }
  return sessions.get(chatId);
}

function helpText(lang) {
  if (lang === "ru") {
    return [
      "Я — Миранда, AI-отдел продаж.",
      "",
      "Команды:",
      "/mode qualify — квалификация лида",
      "/mode offer — подбор предложения",
      "/mode objections — отработка возражений",
      "/mode closing — перевод в следующий шаг",
      "/mode followup — итог и follow-up сообщение",
      "/lang ru|en — язык ответов",
      "/reset — очистить контекст",
      "/help — помощь"
    ].join("\n");
  }

  return [
    "I am Miranda, your AI Sales Department.",
    "",
    "Commands:",
    "/mode qualify — lead qualification",
    "/mode offer — offer mapping",
    "/mode objections — objection handling",
    "/mode closing — move to next step",
    "/mode followup — summary and follow-up draft",
    "/lang ru|en — response language",
    "/reset — clear context",
    "/help — help"
  ].join("\n");
}

async function tg(method, payload = {}) {
  const res = await fetch(`${apiBase}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!data.ok) throw new Error(`Telegram API error in ${method}: ${JSON.stringify(data)}`);
  return data.result;
}

async function sendMessage(chatId, text) {
  return tg("sendMessage", { chat_id: chatId, text });
}

async function sendTyping(chatId) {
  return tg("sendChatAction", { chat_id: chatId, action: "typing" });
}

async function handleCommand(chatId, text, session) {
  if (text === "/start" || text === "/help") {
    await sendMessage(chatId, helpText(session.lang));
    return true;
  }

  if (text === "/reset") {
    sessions.set(chatId, { lang: session.lang || "ru", mode: "qualify", history: [] });
    await sendMessage(chatId, session.lang === "ru" ? "Контекст очищен." : "Context cleared.");
    return true;
  }

  if (text.startsWith("/lang ")) {
    const lang = text.split(/\s+/)[1]?.toLowerCase();
    if (lang !== "ru" && lang !== "en") {
      await sendMessage(chatId, "Use /lang ru or /lang en");
      return true;
    }
    session.lang = lang;
    await sendMessage(chatId, lang === "ru" ? "Язык: русский." : "Language: English.");
    return true;
  }

  if (text.startsWith("/mode ")) {
    const mode = text.split(/\s+/)[1]?.toLowerCase();
    const modes = session.lang === "ru" ? modesRu : modesEn;
    if (!modes[mode]) {
      await sendMessage(chatId, `Unknown mode. Available: ${Object.keys(modes).join(", ")}`);
      return true;
    }
    session.mode = mode;
    await sendMessage(chatId, session.lang === "ru" ? `Режим: ${mode}.` : `Mode: ${mode}.`);
    return true;
  }

  return false;
}

async function handleUserMessage(chatId, text) {
  const session = getSession(chatId);
  session.lang = session.lang || detectLang(text);

  if (text.startsWith("/")) {
    const processed = await handleCommand(chatId, text, session);
    if (processed) return;
  }

  const lang = session.lang || detectLang(text);
  const mode = session.mode || "qualify";
  const systemPrompt = buildSystemPrompt(lang, mode);

  const messages = [{ role: "system", content: systemPrompt }, ...session.history, { role: "user", content: text }];

  try {
    await sendTyping(chatId);

    const completion = await client.chat.completions.create({
      model: OPENAI_MODEL,
      messages
    });

    const reply = completion.choices?.[0]?.message?.content || (lang === "ru" ? "Пустой ответ." : "Empty reply.");

    session.history.push({ role: "user", content: text });
    session.history.push({ role: "assistant", content: reply });
    if (session.history.length > 20) session.history = session.history.slice(-20);

    await sendMessage(chatId, reply);
  } catch (err) {
    console.error("Telegram bot error:", err);
    const fallback =
      lang === "ru"
        ? "Сервис временно недоступен. Опишите задачу, сроки и бюджет — передам заявку менеджеру вручную."
        : "Service is temporarily unavailable. Share your goal, timeline, and budget; I will pass your request to a manager manually.";
    await sendMessage(chatId, fallback);
  }
}

async function pollUpdates() {
  while (true) {
    try {
      const updates = await tg("getUpdates", { timeout: 25, offset: updateOffset + 1, allowed_updates: ["message"] });
      for (const upd of updates) {
        updateOffset = upd.update_id;
        const msg = upd.message;
        if (!msg || typeof msg.text !== "string") continue;
        await handleUserMessage(msg.chat.id, msg.text.trim());
      }
    } catch (err) {
      console.error("Polling error:", err.message || err);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
}

console.log("Telegram AI Sales bot is running (long polling)...");
pollUpdates().catch((err) => {
  console.error("Fatal bot error:", err);
  process.exit(1);
});
