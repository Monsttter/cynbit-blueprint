# Cynbit Blueprint

An independent assessment prototype for guided project discovery and preliminary technical blueprint planning. It is not an authorized modification of Cynbit Technologies' production website.

## Current phase

- Responsive React/Vite application and five-step discovery wizard with local draft resume.
- Express REST API with server validation, rate limits and health reporting.
- Deterministic blueprint generation with optional server-side Gemini refinement and PostgreSQL persistence.
- Shareable public report URL. Contact details are stored in the private `enquiries` table and are never returned by public blueprint endpoints.
- Responsive blueprint report with a downloadable, paginated PDF.
- Gemini and PDF export are optional; the report still works if Gemini is not configured or unavailable. Admin features remain out of scope.

The visual system is an independent prototype direction: warm neutral canvas, deep evergreen accents and restrained lime highlights. These are not claims about Cynbit's official brand palette or typography.

## Requirements

- Node.js 22.13+ (required by the PDF text-extraction test dependency) or a current Node.js 24 release
- npm
- PostgreSQL 13+

## Install

```sh
npm install
```

Copy `.env.example` to `server/.env` and set `DATABASE_URL` to a PostgreSQL database you control. `CLIENT_ORIGIN` accepts a comma-separated list of frontend origins if yours differ from the local defaults. Gemini is optional; leave `GEMINI_API_KEY` blank to use deterministic rules only. Never commit either `.env` file.

Apply the schema migration:

```sh
npm run migrate --workspace server
```

The migration runner applies the initial schema and the generation-source constraint update. Existing submissions remain marked `rules`.

## Run locally

```sh
npm run dev
```

Vite runs at <http://localhost:5173> and Express at <http://localhost:4000>. Vite proxies `/api` to Express. `GET /api/health` returns `200` when PostgreSQL is connected and `503` with a generic degraded status when it is not.

## API

### `POST /api/blueprints`

Accepts `{ "contact": { "name": "...", "email": "...", "company": "..." }, "answers": { ... } }`. Returns `201` with `{ reference, blueprint, generationSource, createdAt }`. `generationSource` is `gemini` or `rules`. Validation failures return `400` with field errors. Persistence uses a transaction; private contact fields are stored only in `enquiries` and are not sent to Gemini.

### `GET /api/blueprints/:reference`

Returns `{ reference, blueprint, generationSource, createdAt }` only. Unknown references return `404`. The reference is generated with a cryptographically secure random generator. Treat it as a bearer link because anyone with it can view the public report.

## Gemini refinement

1. Create an API key in [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Put it in `server/.env` as `GEMINI_API_KEY`. Never use a `VITE_` variable or include the key in client code.
3. Set `GEMINI_MODEL` to a model available to your key. The default is `gemini-2.5-flash`. `GEMINI_TIMEOUT_MS` defaults to 12 seconds and is bounded between 1 and 30 seconds.

The server sends validated project answers and the deterministic draft to Gemini using a structured JSON response schema. The contact object is excluded. The result is checked against the blueprint schema and must preserve selected requirements and integrations. Missing configuration, provider errors, timeouts, oversized or invalid output all fall back to deterministic generation without failing submission. No automatic retries are made. The saved source reports which path actually produced the blueprint.

Gemini recommendations remain suggestions. User-selected requirements, user roles, the project name and the preliminary-planning disclaimer are preserved. The prototype does not make claims about model accuracy.

## PDF download

Open a saved `/blueprint/:reference` report and select **Download PDF**. The browser renders a text-based A4 report from the same report data, with page numbers, headings and flowing content. It is not a screenshot of the page. Long reports can span multiple pages.

## Environment

- `PORT` — API port (default `4000`)
- `CLIENT_ORIGIN` — comma-separated allowed browser origins (development defaults to `http://localhost:5173,http://localhost:5174`; required in production)
- `NODE_ENV` — runtime mode
- `DATABASE_URL` — PostgreSQL connection string; required for migrations, production startup and blueprint submissions
- `GEMINI_API_KEY` — optional server-only Google Gemini API key
- `GEMINI_MODEL` — optional model name (default `gemini-2.5-flash`)
- `GEMINI_TIMEOUT_MS` — optional provider timeout in milliseconds (default `12000`, bounded to `1000`–`30000`)

No credentials or AI keys belong in frontend configuration.

## Verify and build

```sh
npm test
npm run build
```

Tests use `pg-mem`, mocked Gemini responses and an in-memory PDF render/parser. They do not contact Gemini or a real development database. PDF checks verify report content and page numbering in memory. Production/local PostgreSQL setup is separate from the isolated API tests.

## Production deployment preparation

Deployment files are prepared, but no services or database are provisioned by this repository and no live deployment is claimed.

### Render API

`render.yaml` defines a Node web service with `npm ci`, a pre-deploy migration command, `npm run start --workspace server`, and `/api/health` as its health check. The service binds to `0.0.0.0:$PORT`, trusts Render's single proxy hop for client IP handling, and closes its HTTP server and PostgreSQL pool on termination. The migration pre-deploy command is supported on paid Render web services; if your plan does not support it, run the same migration command manually from the service shell before switching traffic.

Create a Render PostgreSQL instance in the same region as the API (the blueprint defaults the API to Singapore), then set:

- `DATABASE_URL` — the database's **internal** connection URL for a same-region Render service. For connections from outside Render, use its external URL with TLS required (`sslmode=require`).
- `CLIENT_ORIGIN` — the exact Vercel production origin, e.g. `https://your-project.vercel.app`; comma-separate any custom frontend origins. Do not use `*`.
- `GEMINI_API_KEY` — optional Google key; keep it only in Render's secret environment settings. Empty/missing means rules-based generation.
- `GEMINI_MODEL` — optional; defaults to `gemini-2.5-flash`.
- `GEMINI_TIMEOUT_MS` — optional; defaults to `12000` and is bounded to 1–30 seconds.
- `NODE_ENV` — set to `production` (declared in `render.yaml`). Render supplies `PORT`.

The migration runner applies migrations 001 and 002 in one transaction. They create missing tables/indexes and update the generation-source constraint; they do not delete enquiry or submission rows. Back up an existing database before applying migrations as normal operational practice.

### Vercel frontend

Import the repository with the repository root as the project root. `vercel.json` sets `npm run build`, the `client/dist` output directory and the SPA fallback needed for direct `/blueprint/:reference` navigation and refresh. Set this Vercel environment variable for Production (and Preview only if its API CORS origin is separately configured):

- `VITE_API_BASE_URL` — the Render API's public HTTPS origin plus `/api`, e.g. `https://your-api.onrender.com/api`. This value is public frontend configuration; never put database credentials or Gemini keys in Vercel variables prefixed with `VITE_`.

For local Vite development, leave it unset: the client uses `/api` and the Vite development server proxies to Express on port 4000.

### Release checks

Before opening production traffic, confirm `/api/health` reports a connected database, run the migration command once, then test a new submission, a saved reference after API restart, report refresh, PDF download, all five project types, validation, Gemini and rules fallback, and a mobile viewport. Inspect the public report response for contact fields. The automated suite is isolated and does not substitute for these live checks. Vercel applies environment changes to new deployments, so redeploy after changing `VITE_API_BASE_URL`.

### Repository status

The checkout must be connected to the intended GitHub repository and its branch before either host can import it. No remote is configured in this workspace, and no push, public repository creation, or deployment has been performed.
