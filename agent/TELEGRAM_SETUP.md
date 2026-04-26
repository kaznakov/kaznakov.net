# Telegram: Miranda as AI Sales Department

This repository now includes a dedicated Telegram bot runtime:

- file: `agent/telegram-bot.js`
- start command: `npm run telegram` (inside `agent/`)

## 1) Required environment variables (`agent/.env`)

```env
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-5-mini
TELEGRAM_BOT_TOKEN=...
```

## 2) Start locally

```bash
cd agent
npm install
npm run telegram
```

The bot uses long polling (`getUpdates`) and reuses the same sales prompts/modes from:

- `agent/prompts/system_en.txt`
- `agent/prompts/system_ru.txt`
- `agent/prompts/modes_en.json`
- `agent/prompts/modes_ru.json`

## 3) Built-in Telegram commands

- `/start` — intro + help
- `/help` — help
- `/mode qualify|offer|objections|closing|followup`
- `/lang ru|en`
- `/reset` — clear chat context

## 4) Production note

For always-on behavior, run the process under a supervisor (`pm2`, `systemd`, Docker, etc.).

## Render (important)

If Render uses repository root (`/`) instead of `agent/`, use:

- Build command: `npm install`
- Start command: `npm run telegram`

Root `package.json` includes `telegram` script that starts `agent/telegram-bot.js`.

If you set Root Directory to `agent`, the same start command works there as well.

### Render service type

- Best option: **Background Worker** (no inbound port requirement).
- If you use **Web Service**, this bot now binds `PORT` and exposes `/health` to satisfy Render port scanning.

## Как работает агент в Telegram (пошагово)

1. **Telegram присылает обновление**
   Бот забирает сообщения через long polling (`getUpdates`) и обрабатывает только текстовые `message`-события.

2. **Команды обрабатываются отдельно**
   Команды (`/start`, `/help`, `/mode`, `/lang`, `/reset`) парсятся с поддержкой формата `@BotName` (например, `/start@your_bot`).

3. **Для каждого чата хранится сессия**
   Для `chat_id` сохраняются:
   - язык (`ru`/`en`),
   - режим продаж (`qualify`, `offer`, `objections`, `closing`, `followup`),
   - короткая история диалога (последние сообщения).

4. **Собирается system prompt**
   Бот берет:
   - базовый промпт из `system_ru.txt` или `system_en.txt`,
   - доп. режим из `modes_ru.json` или `modes_en.json`,
   и объединяет их в финальный инструктивный промпт.

5. **Запрос в OpenAI**
   В `chat.completions` отправляются:
   - `system` (роль + режим),
   - история чата,
   - текущее сообщение пользователя.

6. **Ответ пользователю**
   Ответ модели отправляется в Telegram, а история сессии обновляется.

7. **Ограничение истории**
   Чтобы не раздувать контекст, сохраняются только последние сообщения (rolling window).

8. **Fallback при ошибке**
   Если OpenAI/сеть недоступны, бот отвечает безопасным fallback-сообщением и просит прислать цель/срок/бюджет для ручной передачи менеджеру.

9. **Health endpoint для Render Web Service**
   Дополнительно поднимается HTTP-сервер на `PORT` с `/health`, чтобы Render видел открытый порт и не останавливал деплой.

## Роли (5 нишевых направлений) и меню

В боте включены 5 нишевых бизнес-ролей для AI-отдела продаж:

1. `ivf_clinic` — IVF / репродуктивная клиника
2. `industrial_b2b` — B2B промышленное оборудование
3. `premium_real_estate` — премиальная недвижимость
4. `mssp_cybersecurity` — MSSP / кибербезопасность
5. `immigration_legal` — иммиграционные юридические услуги

Как менять роль:

- через команду: `/role <key>`
- через меню: `/roles` (клавиатура с кнопками ролей)

Пример:

```bash
/role mssp_cybersecurity
/mode qualify
```

## Если бот "молчит" после деплоя

Проверьте типовые причины:

1. У бота был настроен webhook, а вы запускаете long polling.
   - В текущей версии бот автоматически вызывает `deleteWebhook` при старте.
2. Запущено несколько инстансов бота одновременно (конфликт `getUpdates`).
3. Неверный `TELEGRAM_BOT_TOKEN` или отсутствует `OPENAI_API_KEY`.
4. Ограничения сети/провайдера до Telegram/OpenAI.

5. Временный сбой Telegram/OpenAI не должен требовать редеплоя.
   - Бот запускается в бесконечном цикле с авто-повтором и паузой при ошибке.
