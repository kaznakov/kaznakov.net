# kaznakov.net

Static website source for `kaznakov.net` and related pages.

## Local development

Because this project is a static site, you can preview it with any local web server from the repository root.

### Using Python

```bash
python3 -m http.server 8080
```

Then open <http://localhost:8080>.

### Using Node.js

```bash
npx serve .
```

## Project structure

- `index.html` — main landing page markup.
- `css/` — stylesheets.
- `js/` — site scripts and language/agent integrations.
- `images/` and `fonts/` — static assets.
- `agent/` — API/prompt helper service.
