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
        "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.",
      "about.p2":
        "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet!",
      "about.watch_video": "WATCH VIDEO",
      "about.quote":
        "AI is the future. With us or without us.",
      "about.quote_footer": "— Alex Kaznakov",

      "projects.kicker": "PROJECTS",
      "projects.title": "Projects",

      "certs.kicker": "Certs",
      "certs.title": "Diplomas and certificates",

      "education.kicker": "YOUR CHOICE",
      "education.title": "We have the right package for you",
      "education.buy": "BUY TODAY",

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
      "education.course3.li1": "Tutorials",
      "education.course3.li2": "Videos",
      "education.course3.li3": "Tests",

      "footer.madeby": 'Made with love by <a href="https://www.shapingrain.com">ShapingRain</a>',

      "agent.title": "Miranda",
      "agent.placeholder": "Type your message...",

      "agent.greet1": "Hi! I'm Miranda. How can I help?",
      "agent.greet2": "Try commands: /mode critic or /mode optimizer. Language: /lang en or /lang ru.",
      "agent.greet3": "Current backend: "
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
        "Я - предприниматель и продуктовый разработчик с опытом работы на международных рынках. Запускал бизнесы, собирал команды, покорял высоты и ошибался, начинал сначала.<br>Сегодня мой фокус — искусственный интеллект, автоматизация и цифровые продукты, которые упрощают жизнь и создают реальную ценность.",
      "about.p1":
        "Этот блок можно использовать для короткого рассказа о вашем опыте, подходе к работе и проектах.",
      "about.p2":
        "Второй абзац — для конкретики: чем вы занимаетесь сейчас, какие задачи решаете и какой результат даёте.",
      "about.watch_video": "СМОТРЕТЬ ВИДЕО",
      "about.quote":
        "ИИ — это будущее. С нами или без нас.",
      "about.quote_footer": "— Алексей Казнаков",

      "projects.kicker": "ПРОЕКТЫ",
      "projects.title": "Мой опыт",

      "certs.kicker": "СЕРТИФИКАТЫ",
      "certs.title": "Мои дипломы и сертификаты",

      "education.kicker": "ОБУЧЕНИЕ",
      "education.title": "Делюсь своим опытом",
      "education.buy": "СКОРО",

      "education.course1.name": "Что такое ИИ",
      "education.course1.sub": "Курс",
      "education.course1.desc": "Простыми словами про Искуственный Интеллект",
      "education.course1.li1": "5 загрузок",
      "education.course1.li2": "2 расширения",
      "education.course1.li3": "Материалы",
      "education.course1.li4": "Поддержка на форуме",
      "education.course1.li5": "1 год обновлений",

      "education.course2.name": "Студент",
      "education.course2.sub": "Самый популярный",
      "education.course2.desc": "Описание тарифа — заменим на реальный текст",
      "education.course2.li1": "15 загрузок",
      "education.course2.li2": "5 расширений",
      "education.course2.li3": "Материалы с файлами",
      "education.course2.li4": "Поддержка на форуме",
      "education.course2.li5": "2 года обновлений",

      "education.course3.name": "Бизнес",
      "education.course3.sub": "Для команды",
      "education.course3.desc": "Описание тарифа — заменим на реальный текст",
      "education.course3.li1": "Безлимит загрузок",
      "education.course3.li2": "Безлимит расширений",
      "education.course3.li3": "Безлимит расширений",
      "education.course3.li4": "HD видеоуроки",
      "education.course3.li5": "Чат-поддержка",
      "education.course3.li6": "Пожизненные обновления",

      "footer.madeby": 'Сделано с любовью — <a href="https://www.shapingrain.com">ShapingRain</a>',

      "agent.title": "Миранда",
      "agent.placeholder": "Введите сообщение...",

      "agent.greet1": "Привет! Я Миранда. Чем могу помочь?",
      "agent.greet2": "Команды: /mode critic или /mode optimizer. Язык: /lang en или /lang ru.",
      "agent.greet3": "Текущий backend: "
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