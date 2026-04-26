const path = require("path");
const fs = require("fs");
const http = require("http");
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

const ROLES = {
  ivf_clinic: {
    titleRu: "IVF/репродуктивная клиника",
    titleEn: "IVF / Fertility Clinic",
    promptRu: "Фокусируйся на продажах для репродуктивной клиники: первичные консультации, программы ЭКО, этапы маршрута пациента, деликатная коммуникация, конфиденциальность.",
    promptEn: "Focus on sales for a fertility clinic: first consultations, IVF programs, patient journey stages, sensitive communication, and confidentiality."
  },
  industrial_b2b: {
    titleRu: "B2B промышленное оборудование",
    titleEn: "B2B Industrial Equipment",
    promptRu: "Фокусируйся на длинных B2B-сделках: квалификация по отрасли, объему закупки, спецификациям, интеграции, циклу согласований и тендерам.",
    promptEn: "Focus on long B2B cycles: qualification by industry, procurement volume, specs, integration requirements, approval cycles, and tenders."
  },
  premium_real_estate: {
    titleRu: "Премиальная недвижимость",
    titleEn: "Premium Real Estate",
    promptRu: "Фокусируйся на премиальной недвижимости: инвестиционные цели, стиль жизни, срочность сделки, статус клиента, приватные показы и юридические этапы.",
    promptEn: "Focus on premium real estate: investment goals, lifestyle fit, urgency, client profile, private showings, and legal closing stages."
  },
  mssp_cybersecurity: {
    titleRu: "MSSP / кибербезопасность",
    titleEn: "MSSP / Cybersecurity",
    promptRu: "Фокусируйся на продажах услуг кибербезопасности: профиль рисков, требования комплаенса, текущий стек, SLA, бюджет и пилот/аудит как первый шаг.",
    promptEn: "Focus on cybersecurity service sales: risk profile, compliance requirements, current stack, SLA, budget, and pilot/audit as next step."
  },
  immigration_legal: {
    titleRu: "Иммиграционный legal",
    titleEn: "Immigration Legal Services",
    promptRu: "Фокусируйся на продаже иммиграционных юридических услуг: страна/цель, категория кейса, сроки, документы, риски отказа и план подготовки досье.",
    promptEn: "Focus on immigration legal sales: country/goal, case category, timeline, documents, refusal risks, and dossier preparation plan."
  }
};

const DEFAULT_ROLE = "ivf_clinic";
const sessions = new Map();
let updateOffset = 0;

function detectLang(text = "") {
  return /[а-яА-ЯёЁ]/.test(text) ? "ru" : "en";
}

function roleTitle(roleKey, lang) {
  const role = ROLES[roleKey] || ROLES[DEFAULT_ROLE];
  return lang === "ru" ? role.titleRu : role.titleEn;
}

function rolePrompt(roleKey, lang) {
  const role = ROLES[roleKey] || ROLES[DEFAULT_ROLE];
  return lang === "ru" ? role.promptRu : role.promptEn;
}

function buildSystemPrompt(lang, modeName, roleKey) {
  const base = lang === "ru" ? systemRu : systemEn;
  const modes = lang === "ru" ? modesRu : modesEn;
  const modeText = modes[modeName] || modes.base || "";
  const businessRole = rolePrompt(roleKey, lang);

  return [
    base.trim(),
    `Mode: ${modeName}`,
    modeText.trim(),
    `Business role: ${roleTitle(roleKey, lang)}`,
    businessRole
  ]
    .filter(Boolean)
    .join("\n\n");
}

function getSession(chatId) {
  if (!sessions.has(chatId)) {
    sessions.set(chatId, { lang: "ru", mode: "qualify", role: DEFAULT_ROLE, history: [] });
  }
  return sessions.get(chatId);
}

function roleKeysList() {
  return Object.keys(ROLES).join(", ");
}

function buildRoleKeyboard(lang) {
  const rows = Object.keys(ROLES).map((k) => [{ text: `🎯 ${roleTitle(k, lang)}` }]);
  return {
    keyboard: rows,
    resize_keyboard: true,
    one_time_keyboard: false
  };
}

function helpText(lang) {
  const roleInfo = Object.keys(ROLES)
    .map((k) => `- ${k}: ${roleTitle(k, lang)}`)
    .join("\n");

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
      "/roles — показать меню ролей",
      "/role <key> — выбрать роль вручную",
      "/reset — очистить контекст",
      "/help — помощь",
      "",
      "Доступные бизнес-роли:",
      roleInfo
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
    "/roles — show role menu",
    "/role <key> — set role manually",
    "/reset — clear context",
    "/help — help",
    "",
    "Available business roles:",
    roleInfo
  ].join("\n");
}

function parseCommand(text) {
  const parts = String(text || "").trim().split(/\s+/);
  const raw = parts[0] || "";
  if (!raw.startsWith("/")) return { cmd: "", args: [] };
  const cmd = raw.split("@")[0].toLowerCase();
  const args = parts.slice(1);
  return { cmd, args };
}

function matchRoleFromMenuText(text, lang) {
  const cleaned = String(text || "").replace(/^🎯\s*/, "").trim().toLowerCase();
  return Object.keys(ROLES).find((k) => roleTitle(k, lang).toLowerCase() === cleaned);
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

async function sendMessage(chatId, text, options = {}) {
  return tg("sendMessage", { chat_id: chatId, text, ...options });
}

async function sendTyping(chatId) {
  return tg("sendChatAction", { chat_id: chatId, action: "typing" });
}

async function sendRolesMenu(chatId, lang) {
  const title = lang === "ru" ? "Выберите бизнес-роль для бота:" : "Choose business role for the bot:";
  await sendMessage(chatId, title, { reply_markup: buildRoleKeyboard(lang) });
}

async function handleCommand(chatId, text, session) {
  const { cmd, args } = parseCommand(text);
  if (!cmd) return false;

  if (cmd === "/start" || cmd === "/help") {
    await sendMessage(chatId, helpText(session.lang));
    await sendRolesMenu(chatId, session.lang);
    return true;
  }

  if (cmd === "/reset") {
    sessions.set(chatId, {
      lang: session.lang || "ru",
      mode: "qualify",
      role: session.role || DEFAULT_ROLE,
      history: []
    });
    await sendMessage(chatId, session.lang === "ru" ? "Контекст очищен." : "Context cleared.");
    return true;
  }

  if (cmd === "/lang") {
    const lang = (args[0] || "").toLowerCase();
    if (lang !== "ru" && lang !== "en") {
      await sendMessage(chatId, "Use /lang ru or /lang en");
      return true;
    }
    session.lang = lang;
    await sendMessage(chatId, lang === "ru" ? "Язык: русский." : "Language: English.");
    await sendRolesMenu(chatId, session.lang);
    return true;
  }

  if (cmd === "/roles") {
    await sendRolesMenu(chatId, session.lang);
    return true;
  }

  if (cmd === "/role") {
    const roleKey = (args[0] || "").toLowerCase();
    if (!ROLES[roleKey]) {
      await sendMessage(chatId, `Unknown role. Available: ${roleKeysList()}`);
      return true;
    }
    session.role = roleKey;
    const msg = session.lang === "ru"
      ? `Роль установлена: ${roleTitle(roleKey, session.lang)}.`
      : `Role set: ${roleTitle(roleKey, session.lang)}.`;
    await sendMessage(chatId, msg);
    return true;
  }

  if (cmd === "/mode") {
    const mode = (args[0] || "").toLowerCase();
    const modes = session.lang === "ru" ? modesRu : modesEn;
    if (!modes[mode]) {
      await sendMessage(chatId, `Unknown mode. Available: ${Object.keys(modes).join(", ")}`);
      return true;
    }
    session.mode = mode;
    await sendMessage(chatId, session.lang === "ru" ? `Режим: ${mode}.` : `Mode: ${mode}.`);
    return true;
  }

  await sendMessage(chatId, helpText(session.lang));
  return true;
}

async function handleUserMessage(chatId, text) {
  const session = getSession(chatId);
  session.lang = session.lang || detectLang(text);

  if (text.startsWith("/")) {
    const processed = await handleCommand(chatId, text, session);
    if (processed) return;
  }

  const selectedByMenu = matchRoleFromMenuText(text, session.lang);
  if (selectedByMenu) {
    session.role = selectedByMenu;
    const msg = session.lang === "ru"
      ? `Роль установлена: ${roleTitle(selectedByMenu, session.lang)}.`
      : `Role set: ${roleTitle(selectedByMenu, session.lang)}.`;
    await sendMessage(chatId, msg);
    return;
  }

  const lang = session.lang || detectLang(text);
  const mode = session.mode || "qualify";
  const role = session.role || DEFAULT_ROLE;
  const systemPrompt = buildSystemPrompt(lang, mode, role);

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


async function initTelegram() {
  // Ensure long polling works even if webhook was previously configured.
  await tg("deleteWebhook", { drop_pending_updates: false });
  const me = await tg("getMe");
  console.log(`Telegram bot connected: @${me.username || "unknown"}`);
}

async function pollUpdates() {
  while (true) {
    try {
      const updates = await tg("getUpdates", { timeout: 25, offset: updateOffset + 1, allowed_updates: ["message"] });
      for (const upd of updates) {
        updateOffset = upd.update_id;
        const msg = upd.message;
        if (!msg || typeof msg.text !== "string") continue;
        try {
          await handleUserMessage(msg.chat.id, msg.text.trim());
        } catch (err) {
          console.error("Update handling error:", err.message || err);
        }
      }
    } catch (err) {
      console.error("Polling error:", err.message || err);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
}

console.log("Telegram AI Sales bot is running (long polling)...");

async function runBotForever() {
  while (true) {
    try {
      await initTelegram();
      await pollUpdates(); // normally infinite; exits only on unexpected fatal error
    } catch (err) {
      console.error("Bot runtime error, retrying in 5s:", err.message || err);
      await new Promise((r) => setTimeout(r, 5000));
    }
  }
}

runBotForever().catch((err) => {
  console.error("Unexpected top-level error:", err);
});

const PORT = Number(process.env.PORT || 10000);
const healthServer = http.createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, service: "telegram-ai-sales-bot" }));
    return;
  }
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Telegram bot is running");
});

healthServer.listen(PORT, () => {
  console.log(`Health server listening on :${PORT}`);
});
