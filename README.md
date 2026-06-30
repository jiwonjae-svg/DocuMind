# DocuMind

DocuMind is an agent-ready internal knowledge search system for Japanese/Korean teams.

This repository contains a usable MVP with email/password signup, password reset, optional Google/GitHub OAuth, document upload and processing, OpenAI embeddings, owner-scoped semantic search, and grounded question answering.

Public Vercel deployment: [https://documind-chi.vercel.app](https://documind-chi.vercel.app)

Implementation README: [GitHub repository README](https://github.com/jiwonjae-svg/DocuMind#readme)

## English Summary

DocuMind lets authenticated users upload internal `.txt`, `.md`, and `.pdf` files, process them into searchable chunks, store embeddings in PostgreSQL with pgvector, and ask grounded questions with source citations. It is designed as a clean full-stack MVP that demonstrates secure AI integration, document processing, access control, testing, Docker-backed local infrastructure, and Japan-ready product thinking.

## Japanese Summary

DocuMind は、日本・韓国チーム向けの社内ナレッジ検索 MVP です。認証済みユーザーが文書をアップロードし、文書チャンクの埋め込みを PostgreSQL/pgvector に保存し、出典付きの質問応答を利用できます。API キーはサーバー側だけで扱い、文書検索・削除・質問応答はユーザー所有権を確認して実行します。

## Portfolio Project Description

DocuMind is a portfolio-ready backend/full-stack project for demonstrating how to build a secure retrieval-augmented knowledge product. It covers authenticated document ingestion, file validation, local or Vercel Blob document storage, Prisma data modeling, vector search, OpenAI integration, grounded answer generation, audit logging, scoped HTTP tool endpoints, and an authenticated MCP wrapper.

## Final Portfolio Copy

English:

DocuMind is a secure internal knowledge search MVP for Japanese and Korean teams. It demonstrates full-stack execution across authentication, document upload and processing, PostgreSQL/Prisma data modeling, pgvector semantic search, OpenAI-powered grounded answers, source citations, audit logging, Docker, CI, and agent-ready tool APIs. The product focus is deliberately practical: help internal teams find trusted answers from their own documents without leaking secrets or bypassing ownership rules.

Japanese:

DocuMind は、日本・韓国チーム向けの安全な社内ナレッジ検索 MVP です。認証、文書アップロード、文書処理、PostgreSQL/Prisma、pgvector によるセマンティック検索、OpenAI を使った出典付き回答、監査ログ、Docker、CI、エージェント向け API を一つの実用的なプロダクトとしてまとめています。社内文書から根拠のある回答を返し、API キーやアクセス権限を安全に扱うことを重視しています。

## Why This Matters In Agentic Workflows

Agentic systems need reliable tools, not just chat UI. DocuMind prepares the core tool surface an internal assistant would need: search documents, ask with citations, and summarize a document while preserving user authentication, owner-scoped retrieval, and auditability. This keeps the future agent from becoming a privileged bypass around access control.

## Implemented vs Future Scope

DocuMind is a practical MVP rather than a throwaway demo. The distinction below separates what is implemented now from production-hardening work that is intentionally still future scope.

### Implemented

- Auth.js email/password signup, credentials sign-in, password reset, optional Google/GitHub OAuth sign-in, and protected dashboard routes.
- OAuth sign-ins create or link a local Prisma user only after provider email verification; existing password accounts are not auto-linked, including a transaction-time recheck before linking.
- OAuth provider account IDs are bounded and reject control/format characters before lookup or linking.
- Auth.js redirect callbacks are bounded and constrained to the landing page, login/signup pages, and dashboard paths.
- Public signup is protected with same-origin checks, bounded JSON parsing, bounded password input validation, password hashing, and in-memory client/email/aggregate rate limiting.
- Public password reset uses non-enumerating responses, same-origin checks, bounded JSON parsing, in-memory client/email/aggregate request rate limiting, hashed single-use reset tokens, expiry checks, server-side password hashing, and audit logs for reset requests and completed resets.
- Password reset email delivery uses the Resend HTTP API when `RESEND_API_KEY` and `PASSWORD_RESET_EMAIL_FROM` are configured, without adding a client-side secret or extra runtime dependency.
- Document ingestion for `.txt`, `.md`, and `.pdf` files.
- Server-side file validation for extension, MIME type, size, and storage path safety.
- Document storage provider abstraction with local filesystem storage for development and private Vercel Blob storage for durable Vercel deployments.
- Upload requests must use multipart form data and malformed multipart bodies are handled as user-facing errors.
- Upload requests must include a valid `Content-Length`, and declared oversized requests are rejected before multipart parsing.
- Bounded display filenames that remove path components, control characters, and Unicode format characters while preserving Japanese/Korean names.
- Storage path construction re-sanitizes filename segments before resolving local upload paths.
- Upload writes use exclusive file creation, and stored files are size-checked again before extraction.
- PDF extraction is capped by page count before text extraction to reduce parser abuse risk.
- Document IDs are normalized before owner-scoped document mutations.
- Same-origin and Fetch Metadata checks for authenticated mutating POST routes.
- Cookie-authenticated mutating POST routes without Origin or Fetch Metadata provenance are rejected.
- Baseline security headers, Content Security Policy without production `unsafe-eval`, HSTS, cross-origin opener/resource policies, disabled framework powered-by header, and private `no-store` caching headers for API responses.
- Bounded JSON body parsing and `application/json` content-type enforcement for search, ask, and agent tool endpoints.
- Search and ask text inputs are normalized to remove control and Unicode format characters before embedding, persistence, and audit metadata length calculation.
- Per-client, per-email, and aggregate in-memory rate limiting for credentials sign-in attempts, with aggregate denial short-circuiting before new client/email buckets are created.
- Per-client, per-email, and aggregate in-memory rate limiting for account creation, with aggregate denial short-circuiting before new client buckets are created.
- Per-user in-memory rate limiting for document uploads before multipart parsing and document deletes before delete lookup.
- The shared in-memory rate-limit helper caps active bucket creation to bound process memory during abusive key spray attempts.
- Unknown-user sign-in attempts still run a dummy password verification path to reduce email enumeration timing signals.
- Failed credentials sign-in attempts write bounded audit records without storing submitted email or password values.
- Signup, OAuth profile, session display values, and email credentials are bounded and stripped or rejected when they contain control/format characters; OAuth profile images must be HTTPS URLs before storage or display.
- OAuth provider account identifiers are bounded before user-account lookup or storage.
- Password signup, verified OAuth user creation, and verified OAuth account linking write audit records in the same database transaction as the account change.
- OAuth linking rechecks email collisions inside the account-linking transaction before creating provider links, and recovers cleanly when a concurrent sign-in creates the provider link first.
- Password signup accepts duplicate-email submissions with the same public response shape as new-account submissions to reduce account enumeration.
- New password and OAuth users receive a default organization, owner membership, default `General` team, and team manager membership for RBAC-ready workspace administration.
- Text extraction and chunking with overlap metadata.
- Extracted document text and PDF page counts are capped before chunking and embedding to bound processing cost.
- Document processing status writes remain owner-scoped.
- OpenAI embeddings stored in PostgreSQL with pgvector.
- Bounded search-time missing embedding backfill to avoid unbounded OpenAI calls from a single search request.
- Document-specific embedding backfills and embedding writes recheck `Document.ownerId` before selecting or updating chunks.
- Empty searches skip query embedding when the signed-in user has no searchable ready chunks.
- Owner-scoped semantic search over ready document chunks with dashboard UI.
- Grounded question answering with source citations.
- JSON Lines source packaging for grounded-answer prompts so retrieved document text cannot spoof source boundaries.
- Question, answer, and ask audit records are persisted in a single database transaction, with document links rechecked against the owner before persistence.
- OpenAI embedding and answer requests use bounded timeouts with retry handling for transient failures.
- OpenAI provider JSON responses are read with a byte limit before parsing.
- OpenAI answer response extraction is bounded by text size and nested traversal limits before persistence.
- Shared per-user in-memory rate limiting for AI search and answer generation across app and agent tool endpoints.
- AI rate limits are applied after request validation and immediately before AI-backed work.
- Document processing failure messages are normalized before being stored or shown in the dashboard.
- Audit logs for document upload/delete, semantic search, question ask, and agent tool usage.
- Request metadata stored in audit logs is stripped of control characters and length-bounded.
- Audit metadata records search/question lengths instead of raw search or question text.
- Owner-scoped audit log viewer in the dashboard.
- Organization-wide admin audit log viewer for organization owners/admins, scoped to audit events created by current organization members.
- Agent-ready HTTP tool endpoints for search, ask with citations, and document summarization.
- Authenticated JSON-RPC MCP wrapper at `POST /api/mcp` exposing the same scoped search, ask-with-citations, and summarize-document tools.
- Docker and Docker Compose setup for local app + PostgreSQL infrastructure.
- Docker and Git ignore hygiene for secrets, local uploads, and generated outputs.
- Docker runtime uses a non-root application user.
- GitHub Actions CI for Prisma generation, lint, tests, and build.

### Future / Production Hardening

- MCP streaming/session transport hardening beyond the current authenticated JSON-RPC wrapper.
- Team invitations, team-scoped document sharing, and role-scoped document access beyond the current owner/admin audit foundation.
- Optional S3/GCS storage adapters if deploying outside the current Vercel Blob path.
- Background queue for document processing and embedding generation.
- Production-grade distributed rate limiting.
- Larger evaluation set for grounded answers and citation quality.
- Locale-prefixed URL routing and a managed translation review workflow.

## Architecture

```mermaid
flowchart LR
  User["Authenticated user"] --> UI["Next.js App Router UI"]
  Agent["Agent or MCP client"] --> Tools["Scoped /api/tools and /api/mcp endpoints"]
  UI --> AppAPI["App API routes"]
  Tools --> Auth["Auth.js session check"]
  AppAPI --> Auth
  Auth --> Ownership["Owner-scoped Prisma queries"]
  Ownership --> Documents["Documents and chunks"]
  Documents --> Storage["Local uploads for development"]
  Documents --> Vector["PostgreSQL + pgvector"]
  Ownership --> Search["Embedding search"]
  Search --> OpenAI["OpenAI API server-side only"]
  OpenAI --> Answers["Grounded answers and summaries"]
  Answers --> Audit["Audit logs"]
  Tools --> Audit
```

## Current Features

- Next.js App Router
- TypeScript
- Tailwind CSS
- Responsive landing page
- Auth.js email/password signup and credentials authentication
- Password reset pages and API routes with hashed single-use tokens, expiry, audit logging, and optional Resend email delivery
- Optional Google and GitHub OAuth authentication through Auth.js, with verified-email checks and transaction-time password-account collision checks before local account creation or linking
- App-relative login callback URL normalization plus Auth.js redirect callback allowlisting
- Bounded server-side credential normalization with control/format-character rejection for email credentials, validated-IP per-client/per-email/aggregate sign-in attempt rate limiting, aggregate login rate-limit bucket short-circuiting, and dummy password verification for unknown or OAuth-only users
- Bounded signup email/name/password validation, server-side scrypt password hashing, per-client/per-email/aggregate signup rate limiting, and duplicate-email response normalization
- Bounded forgot-password and reset-password validation, non-enumerating reset request responses, per-client/per-email/aggregate reset request rate limiting, and one-time reset token consumption
- PostgreSQL support through Prisma
- Lazy Prisma client initialization for build-safe server imports
- pgvector support for semantic search
- Ownership-ready models for users, documents, chunks, questions, answers, and audit logs
- Organization, organization membership, team, and team membership models with owner/admin/member and team manager/member/viewer roles
- Organization owner/admin team RBAC management at `/dashboard/admin/teams` for creating teams and assigning existing users to organization and team roles
- EN/KO/JA localized landing, auth, dashboard, documents, search, ask, personal audit, organization admin audit UI, page metadata, and accessibility labels with a shared dictionary, locale cookie API, Accept-Language fallback, and language switcher
- Known server validation and API errors shown in auth, search, ask, and team admin forms are mapped through the EN/KO/JA dictionary instead of leaking raw English API strings.
- Protected dashboard navigation at `/dashboard`
- Browser Origin and Fetch Metadata checks on mutating POST routes for uploads, deletes, search, ask, and agent tool APIs
- Cookie-authenticated mutating requests without Origin or Fetch Metadata provenance are blocked
- Security headers, Content Security Policy without production `unsafe-eval`, cross-origin opener/resource policies, disabled Next.js powered-by header, HSTS, and private `no-store` caching headers on API routes
- 16 KB JSON body limit and `application/json` requirement for search, ask, and agent tool APIs
- Control/format-character normalization for search and ask inputs before AI-backed work or question persistence
- Secure local document upload and management for `.txt`, `.md`, and `.pdf`
- Configurable document storage provider: `local` for development and `vercel-blob` for durable private object storage
- Multipart content-type enforcement and parse-error handling for document uploads
- Valid `Content-Length` enforcement and declared oversized upload rejection before multipart body parsing
- Per-user upload rate limiting before multipart body parsing and delete rate limiting before delete lookup
- Defense-in-depth filename segment sanitization during storage path construction
- Document IDs are normalized before delete mutations
- Bounded document operation notices for upload/delete redirects
- Text extraction and chunking for uploaded text, Markdown, and page-limited PDF documents
- Stored document files are rechecked for size before text/PDF extraction.
- OpenAI embeddings for document chunks
- Authenticated semantic search endpoint at `POST /api/search`
- Dashboard semantic search UI at `/dashboard/search`
- Grounded question answering endpoint at `POST /api/ask`
- Agent-ready tool endpoints under `/api/tools/*`
- MCP JSON-RPC wrapper at `/api/mcp` for authenticated tool discovery and calls
- Shared per-user rate limiting across AI-backed dashboard and tool endpoints
- Ask UI with source citations at `/dashboard/ask`
- Document upload/delete audit logs
- Semantic search audit logs
- Question ask audit logs
- Agent tool usage audit logs
- Failed credentials sign-in audit logs without raw credential values
- Signup and OAuth account audit logs
- Password reset request, completion, and delivery-failure audit logs
- Owner-scoped audit log viewer at `/dashboard/audit-logs`
- Organization-wide admin audit log viewer at `/dashboard/admin/audit-logs` for organization owners/admins
- Admin team-management API routes for creating teams and assigning existing users, with same-origin checks, bounded JSON parsing, role validation, and audit logs
- Dockerfile and Docker Compose setup for app + PostgreSQL
- `.dockerignore` excludes secrets, local Vercel state, uploads, dependencies, and build artifacts from image build context
- `.gitignore` excludes non-example environment files while keeping `.env.example` tracked for reproducible setup
- Production Docker image runs the Next.js app as a non-root `nextjs` user
- GitHub Actions CI for lint, tests, and build
- Optional local bootstrap user seed script with bounded credentials and production safeguards
- Health check route at `/api/health`
- Local environment example in `.env.example`

## Screenshots

Screenshots should be added when the portfolio is published:

- Landing page with Japanese-facing product copy
- Documents dashboard showing upload, status, chunks, and delete action
- Search page showing owner-scoped semantic matches with similarity scores
- Ask page showing a grounded answer with citations and matched snippets
- Audit log page showing owner-scoped user activity
- Example agent tool API response

## Local Setup

Install dependencies:

```bash
npm install
```

Create a local environment file:

```powershell
Copy-Item .env.example .env.local
```

Edit `.env.local` and set a strong `AUTH_SECRET`. The default local database URL matches `docker-compose.yml`.

Required environment variables:

```text
DATABASE_URL=postgresql://documind:documind@localhost:5432/documind?schema=public
AUTH_SECRET=replace-with-a-strong-random-secret
AUTH_URL=http://localhost:3000
AUTH_TRUST_HOST=true
OPENAI_API_KEY=replace-with-openai-api-key
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
OPENAI_ANSWER_MODEL=gpt-5-mini
```

`OPENAI_API_KEY` is only read in server-side document processing, search, and ask code. Do not expose it with a `NEXT_PUBLIC_` prefix.

To enter OAuth and email secrets locally without pasting them into Codex chat, run:

```powershell
.\scripts\configure-local-auth-secrets.ps1 -LaunchNewWindow
```

The script opens a PowerShell prompt, reads secret values with `Read-Host -AsSecureString`, updates `.env.local`, and prints only the Google callback URL to register.

To enable the Google button on the deployed login/signup pages without pasting OAuth secrets into Codex chat, run:

```powershell
.\scripts\configure-google-oauth-vercel.ps1 -LaunchNewWindow -ProductionUrl https://documind-chi.vercel.app
```

The script opens a PowerShell prompt, prints the Google callback URL to register, reads the Google OAuth client ID and client secret locally, writes `AUTH_URL`, `AUTH_TRUST_HOST`, `AUTH_GOOGLE_ID`, and `AUTH_GOOGLE_SECRET` to Vercel through `vercel env add/update`, and can redeploy production from the same prompt.

To enter Google OAuth and optional Resend secrets together directly into Vercel production without pasting them into Codex chat, run:

```powershell
.\scripts\configure-vercel-auth-secrets.ps1 -LaunchNewWindow -ProductionUrl https://documind-chi.vercel.app
```

The script opens a PowerShell prompt, reads secret values locally, writes them to Vercel environment variables through `vercel env add/update`, and prints only the Google callback URL. Redeploy production after changing Vercel environment variables.

Optional OAuth variables:

```text
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
AUTH_GITHUB_ID=
AUTH_GITHUB_SECRET=
```

Google and GitHub buttons are shown only when both the provider ID and secret are configured. Add callback URLs in the provider console that match the deployment host, for example:

```text
http://localhost:3000/api/auth/callback/google
http://localhost:3000/api/auth/callback/github
https://documind-chi.vercel.app/api/auth/callback/google
```

Optional password reset email variables:

```text
PASSWORD_RESET_BASE_URL=http://localhost:3000
PASSWORD_RESET_EMAIL_FROM=
RESEND_API_KEY=
PASSWORD_RESET_DEBUG_LINKS=false
```

Set `PASSWORD_RESET_BASE_URL=https://documind-chi.vercel.app`, `PASSWORD_RESET_EMAIL_FROM`, and `RESEND_API_KEY` in production to send real reset emails. `PASSWORD_RESET_DEBUG_LINKS=true` is for local development only; outside production it returns a reset link in the forgot-password response so the flow can be tested without email delivery.

Optional document storage variables:

```text
DOCUMENT_STORAGE_PROVIDER=local
BLOB_READ_WRITE_TOKEN=
```

Use `DOCUMENT_STORAGE_PROVIDER=vercel-blob` and set `BLOB_READ_WRITE_TOKEN` on Vercel for durable private document storage. The database stores only a safe relative blob pathname; uploaded document bytes are read back on the server for extraction, chunking, and embedding.

Start PostgreSQL with pgvector support:

```bash
docker compose up -d postgres
```

Generate Prisma Client:

```bash
npm run prisma:generate
```

Apply Prisma migrations:

```bash
npm run prisma:migrate
```

Optionally seed a local bootstrap user:

```bash
npm run prisma:seed
```

The seed script is optional because users can now create accounts at `/signup`. Seed credentials use the same bounded-email/password posture as app authentication. If `npm run prisma:seed` is run with `NODE_ENV=production`, `SEED_USER_PASSWORD` must be explicitly set to a non-default value or the seed script will fail. Seed audit/log output avoids writing the raw bootstrap email.

Run the development server:

```bash
npm run dev
```

Open the app at [http://localhost:3000](http://localhost:3000).

## Docker Setup

The repository includes a production-oriented `Dockerfile` and a Compose stack for the app plus PostgreSQL with pgvector.

Start the full stack:

```bash
docker compose up --build
```

The app runs at [http://localhost:3000](http://localhost:3000), and PostgreSQL is exposed on port `5432`.

Useful Docker commands:

```bash
docker compose up --build
docker compose exec app npm run prisma:seed
docker compose exec app npm run test
docker compose down
```

The `app` service runs `npx prisma migrate deploy` before `npm run start`. With `DOCUMENT_STORAGE_PROVIDER=local`, uploaded development files are stored in the `uploads-data` Docker volume. With `DOCUMENT_STORAGE_PROVIDER=vercel-blob`, uploaded files are stored in Vercel Blob instead. Set `OPENAI_API_KEY` in your shell or `.env` file before using embeddings, search, ask, or summarize flows that call OpenAI.

The Docker build context is intentionally bounded with `.dockerignore` so local secrets, `.vercel`, `uploads`, dependencies, test coverage, and framework build output are not copied into image builds. Git ignore rules also exclude non-example environment files while keeping `.env.example` tracked for reproducible setup. The production container runs as a non-root `nextjs` user, with the local uploads directory created before startup.

Example `.env` values for Docker:

```text
AUTH_SECRET=replace-with-a-strong-random-secret
AUTH_URL=http://localhost:3000
AUTH_TRUST_HOST=true
OPENAI_API_KEY=replace-with-openai-api-key
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
OPENAI_ANSWER_MODEL=gpt-5-mini
# Optional:
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
AUTH_GITHUB_ID=
AUTH_GITHUB_SECRET=
PASSWORD_RESET_BASE_URL=http://localhost:3000
PASSWORD_RESET_EMAIL_FROM=
RESEND_API_KEY=
DOCUMENT_STORAGE_PROVIDER=local
BLOB_READ_WRITE_TOKEN=
```

## AWS Deployment Plan

The current deployment target is Vercel for portfolio demonstration. For an AWS production deployment, the intended architecture would be:

- ECS/Fargate for the Next.js application container built from the included `Dockerfile`.
- RDS PostgreSQL with pgvector support for documents, chunks, embeddings, questions, answers, and audit logs.
- S3 for durable document object storage instead of local filesystem uploads.
- Secrets Manager or SSM Parameter Store for `AUTH_SECRET`, database credentials, and `OPENAI_API_KEY`.
- CloudWatch Logs for application logs, document processing errors, and audit-related operational visibility.
- Optional SQS-backed background worker for document extraction, chunking, and embedding generation.

This is not implemented in the MVP yet. It is documented here to make the production migration path explicit.

## Continuous Integration

GitHub Actions is configured in:

```text
.github/workflows/ci.yml
```

CI runs:

- `npm run prisma:generate`
- `npm run lint`
- `npm run test`
- `npm run build`

Unit tests use mocked `fetch` implementations for OpenAI helpers and do not require real OpenAI API calls. CI sets a dummy `OPENAI_API_KEY` only so server-only modules can be imported consistently during build/test steps.

## Testing Evidence

The test suite is designed to cover the reliability and safety concerns that matter for AI-enabled internal tools:

- `tests/document-chunking.test.ts`: chunking behavior and overlap handling.
- `tests/document-validation.test.ts`: file extension, MIME type, file/request size, multipart request type, safe storage/display filename, display-name control/format character stripping, storage path construction, storage provider selection, and upload validation.
- `tests/document-deletion.test.ts`: owner-scoped document delete mutations and delete race handling.
- `tests/document-notices.test.ts`: document redirect notices avoid reflecting arbitrary query text while allowing known rate-limit notices.
- `tests/document-ownership.test.ts`: owner-scoped filters and access control for document operations.
- `tests/answers.test.ts`: grounded answer formatting, JSON Lines prompt boundary construction, unsafe answer character normalization, insufficient-information behavior, citation handling, oversized/malformed answer payload handling, bounded provider response parsing and answer response extraction, and timed-out answer retries.
- `tests/qa-persistence.test.ts`: transactional persistence for question, answer, and ask audit records, including owner-scoped document link verification.
- `tests/embeddings.test.ts`: OpenAI embedding helper behavior, malformed and oversized embedding response handling, request timeout handling, pgvector formatting, bounded search-time embedding backfill, and document-owner-scoped chunk embedding updates.
- `tests/rate-limit.test.ts`: per-user rate limiting behavior, shared AI search/answer quota, document upload/delete quotas, retry headers, expired bucket cleanup, and active bucket cap behavior.
- `tests/tool-summary.test.ts`: document summary tool response behavior, bounded/control-character-normalized snippets, and non-empty summary context selection.
- `tests/document-extraction.test.ts`: text/PDF extraction boundaries and stored-file size checks before extraction.
- `tests/document-extraction-limits.test.ts`: PDF page counts are checked before text extraction and parser resources are released on rejection.
- `tests/document-processing.test.ts`: document processing status writes stay owner-scoped, extracted text and PDF page count limits are enforced before chunking/embedding, and failure messages avoid leaking provider, configuration, or filesystem details.
- `tests/audit-logs.test.ts`: owner-scoped audit log visibility.
- `tests/audit-formatting.test.ts`: bounded and control-character-normalized audit metadata formatting plus raw query/question text and AI model avoidance for audit metadata.
- `tests/search-validation.test.ts`: semantic search query normalization, control/format-character stripping, and limit validation.
- `tests/search-availability.test.ts`: searchable chunk availability checks before query embedding.
- `tests/tools-response.test.ts`: bounded, control/format-character-normalized, single-hop valid-IP-filtered request metadata captured for audit logs.
- `tests/api-errors.test.ts`: stable API error mapping for AI configuration and provider failures without exposing internal environment variable names.
- `tests/json-body.test.ts`: bounded JSON request parsing, content-type enforcement, oversized body rejection, and stable route-handler error mapping.
- `tests/api-route-security.test.ts`: protected API POST routes keep authentication, same-origin checks, bounded JSON parsing contracts, upload rate limiting before multipart parsing, exclusive upload file writes, delete rate limiting before delete lookup, summarize rate limiting before chunk lookup, and document ID normalization before delete mutations.
- `tests/request-origin.test.ts`: same-origin protection for mutating browser requests and cookie-authenticated requests with missing provenance headers.
- `tests/next-config.test.ts`: security headers, Content Security Policy including production `unsafe-eval` exclusion, cross-origin opener/resource policies, disabled powered-by header, and API cache headers in Next.js configuration.
- `tests/deployment-hygiene.test.ts`: Docker and Git ignore rules exclude secrets and generated output.
- `tests/seed-policy.test.ts`: production seed runs reject the documented default bootstrap password, validates seed email/password bounds, and avoids raw seed email audit/log output.
- `tests/prisma-client.test.ts`: Prisma client creation is deferred until first use.
- `tests/auth-callback-url.test.ts`: login redirects stay dashboard-scoped, and Auth.js redirects are allowlisted to expected same-origin paths while rejecting external or malformed callback URLs.
- `tests/auth-credentials.test.ts`: login credentials, email control/format-character rejection, auth display names, and profile image URLs are normalized and bounded before use.
- `tests/auth-rate-limit.test.ts`: credentials sign-in attempts are rate-limited by validated client IP, email, and aggregate attempt volume; malformed or multi-hop forwarded IP values are not trusted, and aggregate denial avoids creating new client/email buckets.
- `tests/auth-login-audit.test.ts`: successful and failed sign-in audit records include bounded, control/format-character-normalized, single-hop valid-IP-filtered request metadata without storing submitted credential values.
- `tests/auth-signup.test.ts`: signup input validation, display-name/password bounds, client/email/aggregate account-creation rate limits, and aggregate bucket short-circuiting.
- `tests/auth-signup-persistence.test.ts`: password user creation and signup audit logs are written in one transaction, and unique email collisions return a non-enumerating accepted result.
- `tests/auth-password-reset.test.ts`: forgot-password/reset-password validation, non-enumerating token issuance behavior, hashed single-use token persistence, transactional password updates, audit logging, and reset rate limits.
- `tests/auth-password-reset-email.test.ts`: optional Resend password reset email delivery, skipped delivery when unconfigured, and provider failure handling.
- `tests/auth-rbac.test.ts`: organization/team role checks, organization audit filters, default organization/team provisioning, and migrated-user default workspace creation.
- `tests/i18n.test.ts`: EN/KO/JA locale normalization, Accept-Language preference parsing, shared navigation labels, core product-surface dictionary coverage, localized document notices, and formatted copy helpers.
- `tests/auth-oauth-providers.test.ts`: OAuth provider buttons/configuration are enabled only when the required server environment variables are set.
- `tests/auth-oauth.test.ts`: OAuth provisioning requires verified provider emails, bounds provider account identifiers, normalizes provider display values, preserves already-linked accounts, blocks automatic linking into password accounts, and recovers from provider-link unique races.
- `tests/password.test.ts`: scrypt password hashing and missing-hash rejection for OAuth-only users.
- `tests/client-server-boundary.test.ts`: client components are scanned to prevent value imports from server-only authentication, Prisma, document processing, QA, AI, and password modules.

Run the suite with:

```bash
npm run test
```

Local verification on 2026-06-30:

```text
Test Files  41 passed (41)
Tests       249 passed (249)
npm audit --omit=dev --audit-level=moderate: found 0 vulnerabilities
```

## Useful Commands

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run test
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

## Account Setup

After running migrations, create an account at [http://localhost:3000/signup](http://localhost:3000/signup). Email/password signup hashes the password on the server and then signs the new user in. If Google or GitHub OAuth variables are configured, the signup and login pages also show OAuth buttons. OAuth only provisions or links local users when the provider supplies a verified email; password accounts are not automatically linked by OAuth sign-in.

Password users can start account recovery at [http://localhost:3000/forgot-password](http://localhost:3000/forgot-password). The app stores only a hashed reset token, sends a one-time reset link when Resend email delivery is configured, and accepts the new password at `/reset-password?token=...`. For local testing without email, set `PASSWORD_RESET_DEBUG_LINKS=true` outside production to show the reset link after requesting it.

The dashboard at `/dashboard` is protected. Unauthenticated users are redirected to `/login?callbackUrl=/dashboard`.

Recommended local verification flow:

1. Create an account with email/password or continue with a configured OAuth provider.
2. Open Documents and upload a short `.txt`, `.md`, or `.pdf` file.
3. Run semantic search from the Search page and inspect matching chunks, snippets, and scores.
4. Ask a grounded question using content from an uploaded document.
5. Confirm the answer, citations, matched snippets, and insufficient-information behavior.
6. Review owner-scoped audit log entries for your activity.
7. Open Organization audit logs to confirm owner/admin visibility over organization member activity.

The seed script remains available for local bootstrap accounts, but the product no longer depends on seeded credentials for normal use. Seed credentials are bounded and normalized; production seeding rejects the documented default password.

## Audit Logs

Signed-in users can review their own recent audit events at [http://localhost:3000/dashboard/audit-logs](http://localhost:3000/dashboard/audit-logs).

The page is intentionally owner-scoped for the MVP:

- It authenticates the user with Auth.js before querying.
- It filters `AuditLog.actorId` to the current session user.
- It shows recent action, resource, timestamp, and bounded metadata summaries.
- Metadata display is normalized and capped to keep control characters, long filenames, provider/model details, or nested values from dominating the audit screen.
- Search and ask audit metadata records input lengths, not the raw search query or question text.
- Login, failed login, upload, delete, search, ask, and agent tool logs store bounded request metadata such as IP address and User-Agent when available, with control/format characters normalized and IP metadata validated before persistence.
- Failed login audit metadata records a generic invalid-credentials reason, not submitted email or password values.
- It does not expose other users' audit records.

Organization owners and admins can also review organization member activity at [http://localhost:3000/dashboard/admin/audit-logs](http://localhost:3000/dashboard/admin/audit-logs):

- New users receive a default organization owner role and `General` team manager role.
- Existing users without a membership receive a default organization the next time they sign in or open the admin audit view.
- The admin view verifies the signed-in user has `OWNER` or `ADMIN` organization role.
- It finds current organization members and filters audit records by those member `actorId` values.
- It shows member organization roles and team roles next to recent organization-wide audit events.
- Document reads, writes, search, ask, and tool execution still keep their existing owner-scoped authorization checks.

Organization owners and admins can manage team RBAC at [http://localhost:3000/dashboard/admin/teams](http://localhost:3000/dashboard/admin/teams):

- Create teams inside the current organization.
- Assign existing DocuMind users by email to organization `ADMIN`/`MEMBER` roles.
- Assign existing users to team `MANAGER`/`MEMBER`/`VIEWER` roles.
- Team creation and member assignment write bounded audit log records.
- Users must sign up before an admin can assign them to a team; email invitation delivery is future scope.

## Documents

Signed-in users can manage documents at [http://localhost:3000/dashboard/documents](http://localhost:3000/dashboard/documents).

Supported uploads:

- `.txt`
- `.md`
- `.pdf`
- Maximum size: 10 MB

With `DOCUMENT_STORAGE_PROVIDER=local`, uploaded files are stored locally under:

```text
uploads/documents
```

With `DOCUMENT_STORAGE_PROVIDER=vercel-blob`, uploaded files are stored as private Vercel Blob objects using the same safe relative pathname stored in the database.

The app validates file extension, MIME type, declared request length, declared file size, actual byte size, display filename, and basic file content server-side. Authenticated uploads are rate-limited per user before multipart parsing, and authenticated deletes are rate-limited per user before delete lookup. Stored filenames are sanitized, storage path construction re-sanitizes filename segments, and stored relative paths are validated before local or Blob reads/deletes; display filenames are reduced to a bounded basename and stripped of control/format characters while preserving Japanese/Korean text. Local upload file writes use exclusive file creation, Blob uploads disallow overwrite, and stored files are rechecked for size before text/PDF extraction. PDF text extraction rejects documents above the configured page limit before extracting page text. Users can only list and delete documents where `ownerId` matches their authenticated user ID. Delete lookups and delete mutations both include the owner filter, and stored paths are validated before the database record is deleted.

After upload, documents are processed server-side:

- Status changes to `PROCESSING` while text extraction and chunking run.
- Processing status updates include the authenticated owner filter.
- Extracted text is capped at 300,000 characters before chunking and embedding to keep processing and AI cost bounded.
- `.txt` and `.md` files are read as UTF-8 text.
- `.pdf` files are parsed with `pdf-parse` after a page-count limit check.
- Extracted text is split into chunks of about 3,000 characters with about 500 characters of overlap.
- Chunk metadata stores character offsets, original filename, MIME type, and document title.
- Chunk embeddings are generated server-side with the OpenAI embeddings API and stored in PostgreSQL using pgvector.
- Existing chunk embeddings are skipped when backfilling missing embeddings.
- Embedding backfills and embedding writes recheck the owning document row before selecting or updating chunks.
- Status changes to `READY` when chunks and embeddings are stored.
- Status changes to `FAILED` with a processing error when extraction fails or no text is found.
- Processing audit logs are written only after the owner-scoped status update succeeds.
- Failed processing stores and displays a normalized user-facing error instead of raw provider, parser, or filesystem details.

## Semantic Search

Signed-in users can search their own ready document chunks at [http://localhost:3000/dashboard/search](http://localhost:3000/dashboard/search) or with:

```http
POST /api/search
```

Request body:

```json
{
  "query": "customer onboarding guide",
  "limit": 5
}
```

The endpoint returns top matching chunks for the authenticated user only:

```json
{
  "results": [
    {
      "documentTitle": "Onboarding Guide",
      "chunkIndex": 0,
      "snippet": "Relevant document text...",
      "similarityScore": 0.82
    }
  ]
}
```

Search validates the request, applies a shared per-user in-memory rate limit immediately before AI-backed work, generates the query embedding server-side, and filters by `ownerId` before returning results. Successful searches write a `document_search` audit log with the bounded query length, requested limit, and result count. AI configuration and provider failures are returned as stable API errors instead of raw provider messages.

If ready chunks are missing embeddings, search backfills only a bounded batch per request. Full document processing still embeds all chunks for the uploaded document.
If no ready chunks have embeddings after that bounded backfill, search returns an empty result set without generating a query embedding.

## Grounded Question Answering

Signed-in users can ask questions over their own ready document chunks at [http://localhost:3000/dashboard/ask](http://localhost:3000/dashboard/ask) or with:

```http
POST /api/ask
```

Request body:

```json
{
  "question": "What approval step is required before publishing?"
}
```

The RAG flow is:

- The API authenticates the user, validates the request, and applies a shared per-user in-memory rate limit immediately before answer generation.
- The question is embedded server-side with `OPENAI_EMBEDDING_MODEL`.
- The app retrieves top matching `READY` chunks where both `DocumentChunk.ownerId` and `Document.ownerId` match the signed-in user.
- Retrieved chunks are passed as the only allowed context to the answer model, packaged as JSON Lines so source text cannot spoof citation boundaries.
- The model must return insufficient information when the retrieved chunks do not directly support an answer.
- The response includes the answer, citations, and matched snippets.
- The app stores `Question` and `Answer` records and writes a `question_ask` audit log.
- The question, answer, and ask audit log are saved in one transaction to avoid partial persistence.
- The optional persisted document link is rechecked with `ownerId` before it is saved.

Response shape:

```json
{
  "answer": "Manager review is required before publishing.",
  "citations": [
    {
      "documentTitle": "Workflow Guide",
      "chunkIndex": 0,
      "snippet": "The approval step requires manager review before publishing."
    }
  ],
  "matchedSnippets": [
    {
      "documentTitle": "Workflow Guide",
      "chunkIndex": 0,
      "snippet": "The approval step requires manager review before publishing.",
      "similarityScore": 0.82
    }
  ],
  "insufficientInformation": false
}
```

The ask UI and API never call OpenAI from client components. The shared answer-generation rate limiter is process-local, applied after request validation, and intended for development/MVP use. AI configuration and provider failures are normalized before they are returned to the client.

## Agent Tool API

DocuMind exposes both scoped HTTP tool endpoints and an authenticated JSON-RPC MCP wrapper. All tool surfaces require the same Auth.js session as the dashboard and keep owner-scoped retrieval rules.

All tool endpoints require the same Auth.js session as the dashboard. Unauthenticated requests return `401`. Each endpoint filters by the authenticated user's `ownerId` and writes an agent tool audit log. Search and answer-generating tool endpoints share the same per-user in-memory rate limits as the dashboard APIs.

### Search Documents

```http
POST /api/tools/search-documents
```

Request body:

```json
{
  "query": "approval workflow",
  "limit": 5
}
```

Response shape:

```json
{
  "tool": "search-documents",
  "results": [
    {
      "documentTitle": "Workflow Guide",
      "chunkIndex": 0,
      "snippet": "Relevant document text...",
      "similarityScore": 0.82
    }
  ]
}
```

Audit action: `agent_tool_search_documents`.

### Ask With Citations

```http
POST /api/tools/ask-with-citations
```

Request body:

```json
{
  "question": "What approval step is required before publishing?"
}
```

The endpoint retrieves only the current user's ready chunks, generates a grounded answer, stores `Question` and `Answer` records, and returns citations plus matched snippets.

Audit action: `agent_tool_ask_with_citations`.

### Summarize Document

```http
POST /api/tools/summarize-document
```

Request body:

```json
{
  "documentId": "document-id"
}
```

The endpoint verifies the document belongs to the current user and is `READY`, summarizes bounded document chunk context, returns citations and matched snippets, and reports `truncated: true` when the summary input was capped for MVP safety.

Audit action: `agent_tool_summarize_document`.

## MCP Wrapper

Authenticated MCP-style clients can call:

```http
POST /api/mcp
```

The route accepts bounded JSON-RPC 2.0 requests and supports:

- `initialize`
- `tools/list`
- `tools/call` with `search-documents`, `ask-with-citations`, or `summarize-document`

Example `tools/list` request:

```json
{
  "jsonrpc": "2.0",
  "id": "tools-1",
  "method": "tools/list"
}
```

Example tool call:

```json
{
  "jsonrpc": "2.0",
  "id": "search-1",
  "method": "tools/call",
  "params": {
    "name": "search-documents",
    "arguments": {
      "query": "approval workflow",
      "limit": 5
    }
  }
}
```

The MCP wrapper uses same-origin checks, Auth.js session authentication, bounded JSON parsing, owner-scoped retrieval, shared AI rate limits, and MCP-specific audit actions.

## Database

Prisma schema:

```text
prisma/schema.prisma
```

Migrations:

```text
prisma/migrations/20260602015000_init/migration.sql
prisma/migrations/20260602030500_document_uploads/migration.sql
prisma/migrations/20260602042500_document_processing/migration.sql
prisma/migrations/20260602054500_embeddings_semantic_search/migration.sql
prisma/migrations/20260603122222_deploy_managed_postgres/migration.sql
prisma/migrations/20260603123000_restore_pgvector_hnsw_index/migration.sql
prisma/migrations/20260629083000_signup_oauth_accounts/migration.sql
prisma/migrations/20260630093000_password_reset_tokens/migration.sql
prisma/migrations/20260630101500_organization_team_rbac/migration.sql
```

The schema includes ownership fields such as `ownerId` on `Document`, `DocumentChunk`, `Question`, and `Answer` for document access control. `UserAccount` stores OAuth provider links for stable local user IDs, `PasswordResetToken` stores hashed single-use recovery tokens, organization/team membership tables store RBAC roles, and `AuditLog` records actor and resource fields for security-relevant events.

## Known Limitations

- Local file storage is intended for development; use `DOCUMENT_STORAGE_PROVIDER=vercel-blob` for durable Vercel uploads.
- AI-backed search, answer, signup, and credentials sign-in endpoints use bounded in-memory rate limiters, which are not shared across multiple app instances.
- Document processing runs inline after upload; a production system should use a background queue.
- Summarization uses bounded chunk context for MVP predictability and may truncate very large documents.
- User-managed OAuth account-linking settings and enterprise SSO are not implemented yet.
- Email invitations and team-scoped document sharing are not implemented yet; document operations remain owner-scoped.
- Production password reset email requires `RESEND_API_KEY` and `PASSWORD_RESET_EMAIL_FROM`; without them, reset requests still return safely but no email is delivered.
- The MCP wrapper currently uses a bounded JSON-RPC POST endpoint; richer streaming/session transport can be added later.

## Future Improvements

- Add S3/GCS storage adapters and signed upload/download URLs for non-Vercel deployments.
- Move document processing and embedding generation to a job queue.
- Add account-linking settings, email invitations, and team-scoped document sharing.
- Add organization-wide audit export controls.
- Add locale-prefixed URLs and a managed translation review workflow.
- Add Playwright end-to-end coverage for upload, ask, and tool endpoints.
- Add production-grade rate limiting with Redis.
- Add richer MCP streaming/session transport once external client requirements are fixed.
- Add screenshot assets and a short product walkthrough video for portfolio presentation.

## Health Check

After starting the app, check service health at:

```text
http://localhost:3000/api/health
```

Expected response:

```json
{
  "status": "ok",
  "service": "documind"
}
```
