// js/agent.js

// Адрес backend-а Миранды
const MIRANDA_API_URL = "https://miranda-kaznakov.onrender.com/api/chat";


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
  const history = [];        // сюда складываем пары user/assistant для контекста
  let currentMode = "mentor"; // режим по умолчанию — тренировка промптов
  let currentLang = "ru";     // язык по умолчанию (можно поменять /lang en)
  let firstOpen = true;       // чтобы один раз написать приветствие

  function appendMessage(role, text) {
    const div = document.createElement("div");
    div.className = "ai-msg " + (role === "user" ? "ai-msg-user" : "ai-msg-agent");
    div.textContent = (role === "user" ? "Вы: " : "Миранда: ") + text;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function openWindow() {
    win.style.display = "flex"; // окно сверстано как flex-column
    input.focus();

    if (firstOpen) {
      appendMessage("agent", "Привет! Я Миранда. Чем могу помочь?");
      appendMessage(
        "agent",
        "Я умею работать в разных режимах. Попробуйте, например: /mode critic или /mode optimizer. Язык можно менять командой /lang ru или /lang en."
      );
      firstOpen = false;
    }
  }

  function closeWindow() {
    win.style.display = "none";
  }

  // клик по квадрату — открыть/закрыть
  toggle.addEventListener("click", () => {
    if (win.style.display === "flex") {
      closeWindow();
    } else {
      openWindow();
    }
  });

  // крестик
  if (closeBtn) {
    closeBtn.addEventListener("click", closeWindow);
  }

  // ---------- ОБРАБОТЧИКИ КНОПОК И ФОРМЫ ----------

  // Клик по квадрату агента — открыть/закрыть окно
  toggle.addEventListener("click", () => {
    if (win.style.display === "flex") {
      closeWindow();
    } else {
      openWindow();
    }
  });

  // Клик по крестику — закрыть окно
  if (closeBtn) {
    closeBtn.addEventListener("click", closeWindow);
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    // ---------- 1. Команда /mode ----------
    if (text.startsWith("/mode ")) {
      const m = text.slice(6).trim(); // всё после "/mode "
      if (m) {
        currentMode = m;
        appendMessage(
          "agent",
          `Режим Миранды переключён на: ${m}. Попробуйте задать тот же вопрос ещё раз — я буду отвечать в новом стиле.`
        );
      } else {
        appendMessage(
          "agent",
          "Укажите режим, например: /mode mentor, /mode critic, /mode optimizer, /mode technical, /mode creative."
        );
      }
      input.value = "";
      return; // в backend не идём, это локальная команда
    }

    // ---------- 2. Команда /lang ----------
    if (text.startsWith("/lang ")) {
      const l = text.slice(6).trim().toLowerCase(); // ru / en
      if (l === "ru" || l === "en") {
        currentLang = l;
        appendMessage(
          "agent",
          l === "ru"
            ? "Язык ответов переключён на русский."
            : "Language switched to English."
        );
      } else {
        appendMessage("agent", "Доступные языки: ru, en. Пример: /lang ru");
      }
      input.value = "";
      return; // тоже локальная команда
    }

    // ---------- 3. Обычное сообщение пользователя ----------
    appendMessage("user", text);
    input.value = "";
    input.focus();
    sendBtn.disabled = true;

    try {
      // отправляем запрос Миранде
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

      const data = await resp.json();

      if (data.error) {
        throw new Error(
          typeof data.error === "string" ? data.error : JSON.stringify(data.error)
        );
      }

      const reply = data.reply || "(пустой ответ)";

      // обновляем историю для контекста
      history.push({ role: "user", content: text });
      history.push({ role: "assistant", content: reply });

      appendMessage("agent", reply);
    } catch (err) {
      appendMessage("agent", "Ошибка: " + (err.message || err));
    } finally {
      sendBtn.disabled = false;
    }
  });

  // ---------- ДИНАМИЧЕСКИЙ ПОДЪЁМ КНОПОК И ОКНА НАД ФУТЕРОМ ----------

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

    // Насколько верх футера заехал в окно (если > 0 — футер "под ногами")
    const overlapFromBottom = viewportHeight - footerRect.top;

    const baseBottomAgent = 50; // должно совпадать с CSS: bottom: 50px у #ai-agent
    const safeGap = 30;         // зазор над футтером

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
