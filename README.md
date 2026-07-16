# UNIFI — Nuclear facts + SMR deployment model (Indonesia)

A single-page, static site. **No build step, no server, no internet required** — every
dependency is vendored locally, so it runs by double-clicking `index.html` and works as-is
on GitHub Pages.

## Run it

- **Locally:** open `index.html` in any browser.
- **GitHub Pages:** push every file below to a repo (root), then
  *Settings → Pages → Deploy from branch → `main` / `/root`*.
  Your site appears at `https://<user>.github.io/<repo>/`.

`.nojekyll` is included so GitHub Pages serves the files untouched.

## Files (keep them all in the same folder)

| File | Purpose |
|---|---|
| `index.html` | The site (rename of the dashboard page). |
| `facts.js`, `facts.json` | Chatbot knowledge base (embedded + fallback). |
| `smr-chatbot.js` | The "UNIFI Assistant" chatbot engine. |
| `unifi-tailwind.css` | Static Tailwind stylesheet for the analytics model. |
| `vendor-react.js`, `vendor-react-dom.js`, `vendor-prop-types.js`, `vendor-recharts.js` | Vendored React 18 + Recharts (UMD). |
| `unifi-i18n.js` | Model translations (EN / ID / RU). |
| `unifi-data.js` | Precomputed model data — 164 countries (WRI GPPD, CC BY 4.0). |
| `unifi-stats.js` | The SMR deployment analytics dashboard (transpiled React). |
| `unifi-mount.js` | Mounts the dashboard and follows the site's language switch. |

## Languages

EN / Bahasa Indonesia / Русский via the header dropdown.

## Attribution (required — do not remove the model's footer)

Plant data: **WRI Global Power Plant Database** (Byers et al., 2019), **CC BY 4.0**.
Natural Earth (public domain); uranium shares: World Nuclear Association.
Deployment curve, tariff, capex, capacity factor and jobs multipliers are **stated
screening assumptions — not forecasts or investment advice.**
