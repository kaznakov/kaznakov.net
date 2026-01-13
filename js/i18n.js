// js/i18n.js
(function () {
  const STORAGE_KEY = "kaz_lang";
  const DEFAULT_LANG = "en";

  const dict = {
    en: {
      "nav.home": "Home",
      "nav.about": "About",
      "nav.projects": "Projects",
      "nav.certs": "Certs",
      "nav.education": "Education",

      "hero.title": "AI SOLUTIONS",
      "hero.subtitle":
        "Mastering AI is like learning to ride a motorcycle:<br>at first it’s scary, then it becomes exciting, and eventually it turns into complete freedom and a sense of control.<br>I help entrepreneurs manage AI with the same confidence they bring to running their business.",

      "console.placeholder": "/help, /projects, /learning, /certs, /contact",
      "console.log": "AI-OS kernel online. Type /help",

      "about.kicker": "ABOUT",
      "about.title": "Focusing On What Matters Most",
      "about.subtitle":
        "I am an entrepreneur and product developer with experience in international markets. I’ve launched businesses, built teams, reached new heights, made mistakes, and started over.<br>Today, my focus is on artificial intelligence, automation, and digital products that simplify life and create real value.",
      "about.p1":
        "I see technology not as hype, but as a practical tool. My approach is grounded in clarity, systems thinking, and execution — turning complex ideas into simple, working solutions. I’m especially interested in how AI can replace routine, reduce friction, and give people back time and mental space to focus on what actually matters.",
      "about.p2":
        "Right now, I’m building and experimenting at the intersection of AI, productivity, and human behavior. I believe the strongest products are born not from trends, but from real problems — ones I’ve faced myself. My goal is to create tools that feel intuitive, trustworthy, and quietly powerful, helping people live and work more intentionally in an increasingly noisy digital world.",
      "about.watch_video": "WATCH VIDEO",
      "about.quote":
        "AI is the future. With us or without us.",
      "about.quote_footer": "— Alex Kaznakov",

      "projects.kicker": "PROJECTS",
      "projects.title": "Turning ideas into working systems",
      "projects.modal.kicker": "PROJECT",
      "projects.modal.ariaLabel": "Project details",
      "projects.modal.close": "Close project details",
      "projects.modal.project1.title": "AWOS Display",
      "projects.modal.project1.description": "AWOS Display for virtual aviation v1.0.0-beta.",
      "projects.modal.project1.link": "Open project",
      "projects.modal.project2.title": "MIRANDA Chatbot",
      "projects.modal.project2.description": "AI chatbot v1.0.0-beta. Working in different roles as assistant or saler.",
      "projects.modal.project2.link": "Chat with Miranda",
      "projects.modal.project3.title": "ScanYOmail",
      "projects.modal.project3.description": "Paper mail tracking app v1.0.0-alpha. Scan, organise, export to calendar your payper mail. Never miss your payment dates again. Experimental AI agent for consultations and prompt-engineering demos.",
      "projects.modal.project3.link": "In progress",
      "projects.modal.project4.title": "AI Catalog",
      "projects.modal.project4.description": "AI catalog service v1.0.0-alpha. Choose AI services for any of yours tasks. Track its financial data.",
      "projects.modal.project4.link": "In progress",
      "projects.modal.project5.title": "Where is the Fly?",
      "projects.modal.project5.description": "Mind game app v 1.0.0-alpha. Play just with your voice.",
      "projects.modal.project5.link": "In progress",
      "projects.modal.project6.title": "Walk",
      "projects.modal.project6.description": "Urban walking companion app v1.0.0-alpha. Routes, challenges, and progress tracking.",
      "projects.modal.project6.link": "In progress",

      "certs.kicker": "CERTS",
      "certs.title": "Diplomas and certificates",

      "education.kicker": "EDUCATION",
      "education.title": "Sharing my experience",
      "education.buy": "COMMING SOON",

      "education.course1.name": "What is AI",
      "education.course1.sub": "Course",
      "education.course1.desc": "Simply about AI",
      "education.course1.li1": "Tutorials",
      "education.course1.li2": "Videos",
      "education.course1.li3": "Tests",

      "education.course2.name": "Prompt Engineering",
      "education.course2.sub": "Course",
      "education.course2.desc": "Simply about Prompt Engineering",
      "education.course2.li1": "Tutorials",
      "education.course2.li2": "Videos",
      "education.course2.li3": "Tests",

      "education.course3.name": "AI for business",
      "education.course3.sub": "For the whole team",
      "education.course3.desc": "How AI can help to grow your bussines",
      "education.course3.li1": "Online",
      "education.course3.li2": "Offline",
      "education.course3.li3": "Interactive",

      "footer.madeby": 'Made with love by <a href="https://www.shapingrain.com">ShapingRain</a>',

      "agent.title": "Miranda",
      "agent.placeholder": "Type your message...",

      "agent.greet1": "Hi! I’m Miranda — a virtual assistant for Alexey Kaznakov. You can ask me about Alexey, as well as the projects and products we’re building.",
      "agent.greet2": "Try my modes by using these commands: /assistant or /saler",
    },

    ru: {
      "nav.home": "Главная",
      "nav.about": "Обо мне",
      "nav.projects": "Проекты",
      "nav.certs": "Сертификаты",
      "nav.education": "Обучение",

      "hero.title": "ИИ РЕШЕНИЯ",
      "hero.subtitle":
        "Освоение ИИ похоже на езду на мотоцикле:<br>в начале — страх, затем азарт, а потом — полная свобода и ощущение контроля.<br>Я помогаю предпринимателям управлять ИИ с той же уверенностью, с какой они управляют своим бизнесом.",

      "console.placeholder": "/help, /projects, /learning, /certs, /contact",
      "console.log": "Ядро AI-OS онлайн. Введите /help",

      "about.kicker": "ОБО МНЕ",
      "about.title": "Фокус на главном",
      "about.subtitle":
        "Я — предприниматель и продуктовый разработчик с опытом работы на международных рынках. Я запускал бизнесы, собирал команды, достигал высот, совершал ошибки и начинал заново. Сегодня мой фокус — искусственный интеллект, автоматизация и цифровые продукты, которые упрощают жизнь и создают реальную ценность.",
      "about.p1":
        "Я рассматриваю технологии не как хайп, а как практичный инструмент. Мой подход основан на ясности, системном мышлении и реализации — превращении сложных идей в простые, работающие решения. Меня особенно интересует, как ИИ может брать на себя рутину, снижать трение и возвращать людям время и ментальное пространство для действительно важных вещей.",
      "about.p2":
        "Сейчас я создаю и экспериментирую на стыке ИИ, продуктивности и человеческого поведения. Я убеждён, что сильные продукты рождаются не из трендов, а из реальных проблем — тех, с которыми я сталкивался сам. Моя цель — создавать инструменты, которые ощущаются интуитивными, вызывают доверие и обладают тихой силой, помогая людям жить и работать более осознанно в всё более шумном цифровом мире.",
      "about.watch_video": "СМОТРЕТЬ ВИДЕО",
      "about.quote":
        "ИИ — это будущее. С нами или без нас.",
      "about.quote_footer": "— Алексей Казнаков",

      "projects.kicker": "ПРОЕКТЫ",
      "projects.title": "Мой опыт",
      "projects.modal.kicker": "ПРОЕКТ",
      "projects.modal.ariaLabel": "Информация о проекте",
      "projects.modal.close": "Закрыть информацию о проекте",
      "projects.modal.project1.title": "AWOS Display",
      "projects.modal.project1.description": "Погодный дисплей для виртуальной авиации v.1.0.0-beta.",
      "projects.modal.project1.link": "Открыть проект",
      "projects.modal.project2.title": "Чат-бот Миранда",
      "projects.modal.project2.description": "Персональный чат-бот v1.0.0-beta. Общается в роли персонального ассистента или продажника.",
      "projects.modal.project2.link": "Общаться с Мирандой",
      "projects.modal.project3.title": "ScanYOmail",
      "projects.modal.project3.description": "Прилодения для организации бумажной почты v1.0.0-alpha. Сканируй, сортируй, экспортируй бумажныую почту в календарь. Больше никаких пропущенных платежей.",
      "projects.modal.project3.link": "В разработке",
      "projects.modal.project4.title": "AI Catalog",
      "projects.modal.project4.description": "Каталог AI-инструментов v.1.0.0-alpha с фильтрами, рейтингами и реальными сценариями.",
      "projects.modal.project4.link": "В разработке",
      "projects.modal.project5.title": "Where is the Fly?",
      "projects.modal.project5.description": "Динамичная мини-игра v1.0.0-alpha на внимательность и скорость реакции.",
      "projects.modal.project5.link": "В разработке",
      "projects.modal.project6.title": "Walk",
      "projects.modal.project6.description": "Городской помощник v1.0.0-akpha для прогулок с маршрутами и трекингом прогресса.",
      "projects.modal.project6.link": "В разработке",

      "certs.kicker": "СЕРТИФИКАТЫ",
      "certs.title": "Мои дипломы и сертификаты",

      "education.kicker": "ОБУЧЕНИЕ",
      "education.title": "Делюсь своим опытом",
      "education.buy": "СКОРО",

      "education.course1.name": "Что такое ИИ<br><br>",
      "education.course1.sub": "Курс",
      "education.course1.desc": "Простыми словами про Искуственный Интеллект",
      "education.course1.li1": "Материалы",
      "education.course1.li2": "Видео",
      "education.course1.li3": "Тесты",

      "education.course2.name": "Что такое Промпт-инжиниринг",
      "education.course2.sub": "Курс",
      "education.course2.desc": "Простыми словами о промпт-инжиниринге",
      "education.course2.li1": "Материалы",
      "education.course2.li2": "Видео",
      "education.course2.li3": "Тесты",

      "education.course3.name": "ИИ для бизнеса<br><br>",
      "education.course3.sub": "Лекция",
      "education.course3.desc": "Как ИИ поможет вашему бизнесу<br><br>",
      "education.course3.li1": "Онлайн",
      "education.course3.li2": "Офлайн",
      "education.course3.li3": "Интерактив",

      "footer.madeby": 'Сделано с любовью — <a href="https://www.shapingrain.com">ShapingRain</a>',

      "agent.title": "Миранда",
      "agent.placeholder": "Введите сообщение...",

      "agent.greet1": "Привет! Я Миранда. Виртуальный ассиситен Алексея Казнакова. Вы можете спроситьменя об авторе, проектах и продуктах, которые мы разрабатываем",
      "agent.greet2": "Попробуйте мои режимы: /assistant или /saler."
    }
  };

  function getBrowserLang() {
    const raw = (navigator.language || "").toLowerCase();
    if (raw.startsWith("ru")) return "ru";
    return "en";
  }

  function getSavedLang() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "ru" || saved === "en") return saved;
    return null;
  }

  function resolveLang() {
    return getSavedLang() || DEFAULT_LANG || getBrowserLang();
  }

  function t(lang, key) {
    const table = dict[lang] || dict.en;
    return table[key] != null ? table[key] : (dict.en[key] != null ? dict.en[key] : key);
  }

  function applyLogo(lang) {
    // Меняем src у элементов, где прописаны data-src-en / data-src-ru
    document.querySelectorAll("[data-src-en][data-src-ru]").forEach((img) => {
      const en = img.getAttribute("data-src-en");
      const ru = img.getAttribute("data-src-ru");
      const src = (lang === "ru") ? ru : en;
      if (src) img.setAttribute("src", src);
    });
  }

  function applyContacts(lang) {
    // Показываем только элементы, подходящие текущему языку
    document.querySelectorAll("[data-lang-only]").forEach((el) => {
      const only = el.getAttribute("data-lang-only");
      el.style.display = (only === lang) ? "" : "none";
    });
  }

  function applyLangLinksActive(lang) {
    document.querySelectorAll(".lang-link").forEach((a) => {
      const l = a.getAttribute("data-lang");
      a.classList.toggle("is-active", l === lang);
    });
  }

  function applyTexts(lang) {
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (!key) return;
      el.innerHTML = t(lang, key);
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      if (!key) return;
      el.setAttribute("placeholder", t(lang, key));
    });
  }

  function applyLang(lang) {
    applyTexts(lang);
    applyLogo(lang);
    applyContacts(lang);
    applyLangLinksActive(lang);

    localStorage.setItem(STORAGE_KEY, lang);
    window.dispatchEvent(new CustomEvent("kaz:langChanged", { detail: { lang } }));
  }

  function setLang(lang) {
    const safe = (lang === "ru" || lang === "en") ? lang : "en";
    applyLang(safe);
  }

  function getLang() {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG;
  }

  function init() {
    // Языковые ссылки EN/RU (как пункты меню)
    document.querySelectorAll(".lang-link[data-lang]").forEach((a) => {
      a.addEventListener("click", (e) => {
        e.preventDefault();
        const lang = a.getAttribute("data-lang") || "en";
        setLang(lang);
      });
    });

    setLang(resolveLang());
  }

  window.i18n = { setLang, getLang, t: (key) => t(getLang(), key), dict };

  document.addEventListener("DOMContentLoaded", init);
})();
