// js/agent.js
//
// Что изменено и зачем:
// 1) Добавлена страховка для кнопки TOP (#scrollUp):
//    - при смене языка некоторые плагины/DOM могут переинициализироваться,
//      из-за чего TOP перестаёт кликаться.
//    - мы перепривязываем клик на window.scrollTo({top:0}) при загрузке и при kaz:langChanged.
// 2) Остальная логика без изменений.

function getSalesAgentApiCandidates() {
  const host = window.location.hostname;
  const isLocal =
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "0.0.0.0";

  if (isLocal) {
    return ["http://localhost:3030/api/chat", "/api/chat"];
  }

  // 1) same-origin proxy (if configured), 2) direct Render fallback
  return ["/api/chat", "https://kaznakov-net.onrender.com/api/chat"];
}

const SALES_AGENT_API_CANDIDATES = getSalesAgentApiCandidates();
let activeSalesApiUrl = SALES_AGENT_API_CANDIDATES[0] || "";

function getLang() {
  try {
    if (window.i18n && typeof window.i18n.getLang === "function") {
      const l = window.i18n.getLang();
      if (l === "ru" || l === "en") return l;
    }
  } catch (_) {}
  return "en";
}

function t(key) {
  try {
    if (window.i18n && typeof window.i18n.t === "function") return window.i18n.t(key);
  } catch (_) {}

  const fallback = {
    "agent.greet1": "Hi! I'm the AI Sales Department. How can I help?",
    "agent.greet2": "Share your goal, timeline, and budget range. I'll suggest the best next step.",
    "agent.greet3": "Current backend: ",
    "agent.placeholder": "Type your message..."
  };
  return fallback[key] || key;
}

document.addEventListener("DOMContentLoaded", function () {
  const toggle = document.getElementById("ai-agent");
  const win = document.getElementById("ai-agent-window");
  const closeBtn = document.getElementById("ai-agent-close");
  const messagesEl = document.getElementById("ai-agent-messages");
  const form = document.getElementById("ai-agent-form");
  const input = document.getElementById("ai-agent-input");
  const sendBtn = document.getElementById("ai-agent-send");

  // -----------------------------
  // ✅ TOP button страховка
  // -----------------------------
  function bindTopButton() {
    const el = document.getElementById("scrollUp");
    if (!el) return;

    // чтобы не навешивать обработчик много раз
    if (el.dataset.topBound === "1") return;
    el.dataset.topBound = "1";

    el.addEventListener("click", (e) => {
      // scrollUp-plugin может не успеть или слететь — мы гарантируем скролл наверх
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // Подхватываем появление/пересоздание #scrollUp (часто создаётся плагином)
  const mo = new MutationObserver(() => bindTopButton());
  mo.observe(document.body, { childList: true, subtree: true });

  // Пробуем сразу
  bindTopButton();

  // -----------------------------
  // AI Sales Department — основной код
  // -----------------------------
  if (!toggle || !win || !form || !input || !messagesEl) {
    console.error("AI Sales Department: missing DOM elements. Check ids in index.html");
    return;
  }

  const history = [];
  let currentMode = "qualify";
  let currentLang = getLang();
  let firstOpen = true;

  function appendMessage(role, text) {
    const div = document.createElement("div");
    div.className = "ai-msg " + (role === "user" ? "ai-msg-user" : "ai-msg-agent");
    div.textContent =
      (role === "user"
        ? (currentLang === "ru" ? "Вы: " : "You: ")
        : "AI Sales: ") + text;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function applyInputPlaceholder() {
    input.setAttribute("placeholder", t("agent.placeholder"));
  }

  function greetIfNeeded() {
    if (!firstOpen) return;
    appendMessage("assistant", t("agent.greet1"));
    appendMessage("assistant", t("agent.greet2"));
    appendMessage("assistant", t("agent.greet3") + activeSalesApiUrl);
    firstOpen = false;
  }

  function openWindow() {
    win.style.display = "flex";
    applyInputPlaceholder();
    input.focus();
    greetIfNeeded();
  }

  function closeWindow() {
    win.style.display = "none";
  }

  toggle.addEventListener("click", () => {
    if (win.style.display === "flex") closeWindow();
    else openWindow();
  });

  if (closeBtn) closeBtn.addEventListener("click", closeWindow);

  // При смене языка:
  // - обновляем placeholder
  // - ✅ перепривязываем TOP на всякий случай
  window.addEventListener("kaz:langChanged", (e) => {
    const lang = e?.detail?.lang;
    if (lang === "ru" || lang === "en") {
      currentLang = lang;
      applyInputPlaceholder();
      // важный фикс: если DOM/плагины пересоздали #scrollUp
      setTimeout(bindTopButton, 0);
      setTimeout(bindTopButton, 250);
    }
  });

  // ----------------------------------------------------------
  // Lift offset (умеренный отскок от футера)
  // ----------------------------------------------------------
  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function updateFloatingButtonsOffset() {
    const scrollUpEl = document.getElementById("scrollUp");
    const agentEl = document.getElementById("ai-agent");
    const winEl = document.getElementById("ai-agent-window");
    if (!scrollUpEl || !agentEl || !winEl) return;

    const footer = document.querySelector("footer#landing-footer") || document.querySelector("footer");
    if (!footer) return;

    const footerRect = footer.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    const overlap = viewportHeight - footerRect.top;
    const safeGap = 14;

    let shift = 0;
    if (overlap > 0) shift = overlap + safeGap;

    shift = clamp(shift, 0, 35);

    scrollUpEl.style.setProperty("--lift-offset", `${shift}px`);
    agentEl.style.setProperty("--lift-offset", `${shift}px`);
    winEl.style.setProperty("--lift-offset", `${shift}px`);
  }

  window.addEventListener("scroll", updateFloatingButtonsOffset, { passive: true });
  window.addEventListener("resize", updateFloatingButtonsOffset);
  updateFloatingButtonsOffset();

  async function postChatWithFallback(payload) {
    let lastError = null;

    for (const url of SALES_AGENT_API_CANDIDATES) {
      try {
        const resp = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        let data;
        try {
          data = await resp.json();
        } catch (_) {
          throw new Error(`Backend returned non-JSON. HTTP ${resp.status}`);
        }

        if (!resp.ok || data.error) {
          throw new Error(data?.details || data?.error || `HTTP ${resp.status}`);
        }

        activeSalesApiUrl = url;
        return data;
      } catch (err) {
        lastError = err;
      }
    }

    throw lastError || new Error("All API endpoints failed");
  }

  function buildOfflineSalesReply(lang, userText) {
    const text = (userText || "").toLowerCase();

    if (lang === "ru") {
      if (/цена|стоим|бюджет|price/.test(text)) {
        return "AI-канал сейчас нестабилен, но могу сразу собрать бриф для оценки. Напишите: 1) ниша/продукт, 2) задача, 3) желаемый срок, 4) ориентир бюджета. После этого передам запрос и вернусь с вилкой по стоимости.";
      }
      if (/срок|когда|deadline|быстро/.test(text)) {
        return "Чтобы оценить срок, пришлите 3 пункта: объём задачи, текущие материалы/доступы, желаемая дата запуска. Я зафиксирую запрос и передам в работу.";
      }
      return "AI-канал временно недоступен, но я могу продолжить как отдел продаж. Пришлите коротко: цель проекта, нишу, срок, бюджет и контакт (Telegram/email). Также можно сразу написать: Telegram @kaznakov, email alex@kaznakov.net.";
    }

    if (/price|budget|cost/.test(text)) {
      return "The AI channel is unstable right now, but I can collect a brief for estimation immediately. Please share: 1) niche/product, 2) target outcome, 3) timeline, 4) budget range. I'll pass it to the team and follow up with a price range.";
    }
    if (/timeline|deadline|when|asap/.test(text)) {
      return "To estimate timeline, please share: scope, existing assets/access, and desired launch date. I will log it and pass it to the team.";
    }
    return "The AI channel is temporarily unavailable, but I can continue as the sales desk. Please share your goal, niche, timeline, budget, and contact (Telegram/email). You can also contact directly: Telegram @kaznakov, email alex@kaznakov.net.";
  }

  // ----------------------------------------------------------
  // Chat submit
  // ----------------------------------------------------------
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    if (text.startsWith("/mode ")) {
      const m = text.slice(6).trim();
      if (m) {
        currentMode = m;
        appendMessage("assistant", currentLang === "ru" ? `Режим: ${m}.` : `Mode set to: ${m}.`);
      } else {
        appendMessage("assistant", currentLang === "ru"
          ? "Укажите режим, например: /mode qualify /mode offer /mode closing"
          : "Specify a mode, e.g.: /mode qualify /mode offer /mode closing");
      }
      input.value = "";
      return;
    }

    if (text.startsWith("/lang ")) {
      const l = text.slice(6).trim().toLowerCase();
      if (l === "ru" || l === "en") {
        currentLang = l;
        if (window.i18n && typeof window.i18n.setLang === "function") {
          window.i18n.setLang(l);
        } else {
          applyInputPlaceholder();
        }
        appendMessage("assistant", l === "ru" ? "Язык: русский." : "Language: English.");
      } else {
        appendMessage("assistant", currentLang === "ru"
          ? "Доступные языки: ru, en. Пример: /lang ru"
          : "Available languages: ru, en. Example: /lang en");
      }
      input.value = "";
      return;
    }

    appendMessage("user", text);
    input.value = "";
    input.focus();
    if (sendBtn) sendBtn.disabled = true;

    try {
      const data = await postChatWithFallback({
        message: text,
        history,
        mode: currentMode,
        lang: currentLang
      });

      const reply = data.reply || "";
      history.push({ role: "user", content: text });
      history.push({ role: "assistant", content: reply });
      appendMessage("assistant", reply || (currentLang === "ru" ? "(пустой ответ)" : "(empty reply)"));
    } catch (err) {
      console.error("AI Sales chat error:", err);
      const offlineReply = buildOfflineSalesReply(currentLang, text);
      history.push({ role: "assistant", content: offlineReply });
      appendMessage("assistant", offlineReply);
    } finally {
      if (sendBtn) sendBtn.disabled = false;
    }
  });
});