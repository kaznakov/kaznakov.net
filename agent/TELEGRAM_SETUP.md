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
