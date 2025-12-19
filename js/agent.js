// js/agent.js

// ============================================================
// ✅ ВАЖНОЕ ИЗМЕНЕНИЕ:
// Автовыбор backend-а Миранды:
// - локально (localhost/127.0.0.1) -> http://localhost:3030/api/chat
// - прод (всё остальное)          -> Render URL
// Это убирает ручные правки и ошибки “забыл вернуть URL”.
// ============================================================

function getMirandaApiUrl() {
  const host = window.location.hostname;
  const isLocal =
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "0.0.0.0";

  if (isLocal) {
    return "http://localhost:3030/api/chat";
  }

  // PROD (Render)
  return "https://kaznakov-net.onrender.com/api/chat";
}

// Адрес backend-а Миранды (локально/прод выбирается автоматически)
const MIRANDA_API_URL = getMirandaApiUrl();

document.addEventListener("DOMContentLoaded", function () {
  // --- Находим элементы в DOM ---
  const toggle = document.getElementById("ai-agent");
  const win = document.getElementById("ai-agent-window");
  const closeBtn = document.getElementById("ai-agent-close");
  const messagesEl = document.getElementById("ai-agent-messages");
  const form = document.getElementById("ai-agent-form");
  const input = document.getElementById("ai-agent-input");
  const sendBtn = document.getElementById("ai-agent-send");

  if (!toggle || !win || !form || !input || !messagesEl) {
    console.error("Miranda: не найдены элементы DOM. Проверь id в index.html");
    return;
  }

  // --- Состояние агента ---
  const history = [];
  let currentMode = "mentor";
  let currentLang = "ru";
  let firstOpen = true;

  function appendMessage(role, text) {
    const div = document.createElement("div");
    div.className = "ai-msg " + (role === "user" ? "ai-msg-user" : "ai-msg-agent");
    div.textContent = (role === "user" ? "Вы: " : "Миранда: ") + text;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function openWindow() {
    win.style.display = "flex";
    input.focus();

    if (firstOpen) {
      appendMessage("agent", "Привет! Я Миранда. Чем могу помочь?");
      appendMessage(
        "agent",
        "Я умею работать в разных режимах. Попробуйте: /mode critic или /mode optimizer. Язык: /lang ru или /lang en."
      );
      appendMessage("agent", "Текущий backend: " + MIRANDA_API_URL);
      firstOpen = false;
    }
  }

  function closeWindow() {
    win.style.display = "none";
  }

  // клик по квадрату — открыть/закрыть
  toggle.addEventListener("click", () => {
    if (win.style.display === "flex") closeWindow();
    else openWindow();
  });

  // крестик
  if (closeBtn) closeBtn.addEventListener("click", closeWindow);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    // ---------- 1. Команда /mode ----------
    if (text.startsWith("/mode ")) {
      const m = text.slice(6).trim();
      if (m) {
        currentMode = m;
        appendMessage("agent", `Режим Миранды переключён на: ${m}.`);
      } else {
        appendMessage("agent", "Укажите режим, например: /mode mentor /mode critic /mode optimizer.");
      }
      input.value = "";
      return;
    }

    // ---------- 2. Команда /lang ----------
    if (text.startsWith("/lang ")) {
      const l = text.slice(6).trim().toLowerCase();
      if (l === "ru" || l === "en") {
        currentLang = l;
        appendMessage("agent", l === "ru" ? "Язык: русский." : "Language: English.");
      } else {
        appendMessage("agent", "Доступные языки: ru, en. Пример: /lang ru");
      }
      input.value = "";
      return;
    }

    // ---------- 3. Обычное сообщение ----------
    appendMessage("user", text);
    input.value = "";
    input.focus();
    sendBtn.disabled = true;

    try {
      const resp = await fetch(MIRANDA_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: history,
          mode: currentMode,
          lang: currentLang
        })
      });

      let data;
      try {
        data = await resp.json();
      } catch (_) {
        throw new Error(`Backend вернул не-JSON. HTTP ${resp.status}`);
      }

      if (!resp.ok || data.error) {
        throw new Error(
          data?.details ||
          data?.error ||
          `HTTP ${resp.status}`
        );
      }

      const reply = data.reply || "(пустой ответ)";
      history.push({ role: "user", content: text });
      history.push({ role: "assistant", content: reply });
      appendMessage("agent", reply);
    } catch (err) {
      appendMessage("agent", "Ошибка: " + (err.message || err));
    } finally {
      sendBtn.disabled = false;
    }
  });

  // --- Лифт кнопок над футером (как было) ---
  function updateFloatingButtonsOffset() {
    const scrollUpEl = document.getElementById("scrollUp");
    const agentEl = document.getElementById("ai-agent");
    const winEl = document.getElementById("ai-agent-window");
    if (!scrollUpEl || !agentEl || !winEl) return;

    const footers = document.querySelectorAll("footer");
    if (!footers.length) return;
    const footer = footers[footers.length - 1];

    const footerRect = footer.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    const overlapFromBottom = viewportHeight - footerRect.top;

    const baseBottomAgent = 50;
    const safeGap = 30;

    let shift = 0;
    if (overlapFromBottom > 0) {
      const needed = overlapFromBottom + safeGap - baseBottomAgent;
      shift = needed > 0 ? needed : 0;
    }

    scrollUpEl.style.setProperty("--lift-offset", `${shift}px`);
    agentEl.style.setProperty("--lift-offset", `${shift}px`);
    winEl.style.setProperty("--lift-offset", `${shift}px`);
  }

  window.addEventListener("scroll", updateFloatingButtonsOffset);
  window.addEventListener("resize", updateFloatingButtonsOffset);
  updateFloatingButtonsOffset();
});