# DocuMind

DocuMind is an agent-ready internal knowledge search system for Japanese/Korean teams.

This repository currently contains the MVP application scaffold with authentication, document upload and processing, OpenAI embeddings, owner-scoped semantic search, and grounded question answering.

Public Vercel deployment: [https://documind-chi.vercel.app](https://documind-chi.vercel.app)

## English Summary

DocuMind lets authenticated users upload internal `.txt`, `.md`, and `.pdf` files, process them into searchable chunks, store embeddings in PostgreSQL with pgvector, and ask grounded questions with source citations. It is designed as a clean full-stack MVP that demonstrates secure AI integration, document processing, access control, testing, Docker-backed local infrastructure, and Japan-ready product thinking.

## Japanese Summary

DocuMind は、日本・韓国チーム向けの社内ナレッジ検索 MVP です。認証済みユーザーが文書をアップロードし、文書チャンクの埋め込みを PostgreSQL/pgvector に保存し、出典付きの質問応答を利用できます。API キーはサーバー側だけで扱い、文書検索・削除・質問応答はユーザー所有権を確認して実行します。

## Portfolio Project Description

DocuMind is a portfolio-ready backend/full-stack project for demonstrating how to build a secure retrieval-augmented knowledge product. It covers authenticated document ingestion, file validation, local development storage, Prisma data modeling, vector search, OpenAI integration, grounded answer generation, audit logging, and clean API endpoints that can later be wrapped by agents or MCP tools.

## Final Portfolio Copy

English:

DocuMind is a secure internal knowledge search MVP for Japanese and Korean teams. It demonstrates full-stack execution across authentication, document upload and processing, PostgreSQL/Prisma data modeling, pgvector semantic search, OpenAI-powered grounded answers, source citations, audit logging, Docker, CI, and agent-ready tool APIs. The product focus is deliberately practical: help internal teams find trusted answers from their own documents without leaking secrets or bypassing ownership rules.

Japanese:

DocuMind は、日本・韓国チーム向けの安全な社内ナレッジ検索 MVP です。認証、文書アップロード、文書処理、PostgreSQL/Prisma、pgvector によるセマンティック検索、OpenAI を使った出典付き回答、監査ログ、Docker、CI、エージェント向け API を一つの実用的なプロダクトとしてまとめています。社内文書から根拠のある回答を返し、API キーやアクセス権限を安全に扱うことを重視しています。

## Why This Matters In Agentic Workflows

Agentic systems need reliable tools, not just chat UI. DocuMind prepares the core tool surface an internal assistant would need: search documents, ask with citations, and summarize a document while preserving user authentication, owner-scoped retrieval, and auditability. This keeps the future agent from becoming a privileged bypass around access control.

## Implemented vs Future Scope

DocuMind is presented as an MVP portfolio project. The distinction below is intentional so reviewers can clearly see what is already implemented and what is planned for production hardening. Items under Future are not advertised as working demo features.

### Implemented

- Auth.js credentials authentication and protected dashboard routes.
- Document ingestion for `.txt`, `.md`, and `.pdf` files.
- Server-side file validation for extension, MIME type, size, and storage path safety.
- Same-origin checks for authenticated mutating POST routes.
- Baseline security headers and `no-store` caching for API responses.
- Text extraction and chunking with overlap metadata.
- OpenAI embeddings stored in PostgreSQL with pgvector.
- Owner-scoped semantic search over ready document chunks with dashboard UI.
- Grounded question answering with source citations.
- Audit logs for document upload/delete, semantic search, question ask, and agent tool usage.
- Owner-scoped audit log viewer in the dashboard.
- Agent-ready HTTP tool endpoints for search, ask with citations, and document summarization.
- Docker and Docker Compose setup for local app + PostgreSQL infrastructure.
- Docker build context hygiene for secrets, local uploads, and generated outputs.
- GitHub Actions CI for Prisma generation, lint, tests, and build.

### Future / Production Hardening

- MCP wrapper around the scoped HTTP tool endpoints.
- Team workspaces, RBAC, and organization-wide admin audit review.
- S3/GCS object storage with signed upload/download URLs.
- Background queue for document processing and embedding generation.
- Production-grade distributed rate limiting.
- Larger evaluation set for grounded answers and citation quality.
- Japanese/Korean/English localized dashboard routing.

## Architecture

```mermaid
flowchart LR
  User["Authenticated user"] --> UI["Next.js App Router UI"]
  Agent["Future agent or MCP wrapper"] --> Tools["Scoped /api/tools endpoints"]
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
- Auth.js credentials authentication
- App-relative login callback URL normalization
- Bounded server-side credential normalization before database lookup and password verification
- PostgreSQL support through Prisma
- Lazy Prisma client initialization for build-safe server imports
- pgvector support for semantic search
- Ownership-ready models for users, documents, chunks, questions, answers, and audit logs
- Protected dashboard navigation at `/dashboard`
- Browser-origin checks on mutating POST routes for uploads, deletes, search, ask, and agent tool APIs
- Security headers for browser hardening and `Cache-Control: no-store` on API routes
- Secure local document upload and management for `.txt`, `.md`, and `.pdf`
- Text extraction and chunking for uploaded text, Markdown, and PDF documents
- OpenAI embeddings for document chunks
- Authenticated semantic search endpoint at `POST /api/search`
- Dashboard semantic search UI at `/dashboard/search`
- Grounded question answering endpoint at `POST /api/ask`
- Agent-ready tool endpoints under `/api/tools/*`
- Ask UI with source citations at `/dashboard/ask`
- Document upload/delete audit logs
- Semantic search audit logs
- Question ask audit logs
- Agent tool usage audit logs
- Owner-scoped audit log viewer at `/dashboard/audit-logs`
- Dockerfile and Docker Compose setup for app + PostgreSQL
- `.dockerignore` excludes secrets, local Vercel state, uploads, dependencies, and build artifacts from image build context
- GitHub Actions CI for lint, tests, and build
- Demo user seed script
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

Edit `.env.local` and set a strong `AUTH_SECRET` for non-demo use. The default local database URL matches `docker-compose.yml`.

Required environment variables:

```text
DATABASE_URL=postgresql://documind:documind@localhost:5432/documind?schema=public
AUTH_SECRET=replace-with-a-strong-random-secret
AUTH_TRUST_HOST=true
OPENAI_API_KEY=replace-with-openai-api-key
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
OPENAI_ANSWER_MODEL=gpt-5-mini
```

`OPENAI_API_KEY` is only read in server-side document processing, search, and ask code. Do not expose it with a `NEXT_PUBLIC_` prefix.

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

Seed the demo user:

```bash
npm run prisma:seed
```

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

The `app` service runs `npx prisma migrate deploy` before `npm run start`. Uploaded development files are stored in the `uploads-data` Docker volume. Set `OPENAI_API_KEY` in your shell or `.env` file before using embeddings, search, ask, or summarize flows that call OpenAI.

The Docker build context is intentionally bounded with `.dockerignore` so local secrets, `.vercel`, `uploads`, dependencies, test coverage, and framework build output are not copied into image builds.

Example `.env` values for Docker:

```text
AUTH_SECRET=replace-with-a-strong-random-secret
OPENAI_API_KEY=replace-with-openai-api-key
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
OPENAI_ANSWER_MODEL=gpt-5-mini
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
- `tests/document-validation.test.ts`: file extension, MIME type, size, and upload validation.
- `tests/document-ownership.test.ts`: owner-scoped access control for document operations.
- `tests/answers.test.ts`: grounded answer formatting, prompt boundary construction, insufficient-information behavior, and citation handling.
- `tests/embeddings.test.ts`: OpenAI embedding helper behavior with mocked API responses.
- `tests/rate-limit.test.ts`: per-user rate limiting behavior and expired bucket cleanup.
- `tests/tool-summary.test.ts`: document summary tool response behavior.
- `tests/document-extraction.test.ts`: text/PDF extraction boundaries.
- `tests/audit-logs.test.ts`: owner-scoped audit log visibility.
- `tests/audit-formatting.test.ts`: bounded audit metadata formatting for dashboard display.
- `tests/search-validation.test.ts`: semantic search query and limit validation.
- `tests/tools-response.test.ts`: bounded request metadata captured for audit logs.
- `tests/api-errors.test.ts`: stable API error mapping for AI configuration and provider failures.
- `tests/request-origin.test.ts`: same-origin protection for mutating browser requests.
- `tests/next-config.test.ts`: security and API cache headers in Next.js configuration.
- `tests/deployment-hygiene.test.ts`: Docker build context excludes secrets and generated output.
- `tests/prisma-client.test.ts`: Prisma client creation is deferred until first use.
- `tests/auth-callback-url.test.ts`: login redirects reject external callback URLs.
- `tests/auth-credentials.test.ts`: login credentials are normalized and bounded before verification.

Run the suite with:

```bash
npm run test
```

Local verification on 2026-06-27:

```text
Test Files  19 passed (19)
Tests       65 passed (65)
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

## Demo Login

After running the migration and seed script, sign in at [http://localhost:3000/login](http://localhost:3000/login).

```text
Email: demo@documind.local
Password: DocuMindDemo123!
```

The dashboard at `/dashboard` is protected. Unauthenticated users are redirected to `/login?callbackUrl=/dashboard`.

For a quick reviewer pass, sign in, open Documents, upload or review a small `.txt` or `.md` file, run a semantic search from the Search page, ask a grounded question from the Ask page, then confirm source citations and your owner-scoped audit log entries.

## Audit Logs

Signed-in users can review their own recent audit events at [http://localhost:3000/dashboard/audit-logs](http://localhost:3000/dashboard/audit-logs).

The page is intentionally owner-scoped for the MVP:

- It authenticates the user with Auth.js before querying.
- It filters `AuditLog.actorId` to the current session user.
- It shows recent action, resource, timestamp, and bounded metadata summaries.
- Metadata display is capped to keep long filenames, provider details, or nested values from dominating the audit screen.
- Upload, delete, search, ask, and agent tool logs store bounded request metadata such as IP address and User-Agent when available.
- It does not expose other users' audit records.

Organization-wide admin audit review is not implemented yet and remains a future production-hardening feature.

## Documents

Signed-in users can manage documents at [http://localhost:3000/dashboard/documents](http://localhost:3000/dashboard/documents).

Supported uploads:

- `.txt`
- `.md`
- `.pdf`
- Maximum size: 10 MB

Uploaded files are stored locally under:

```text
uploads/documents
```

The app validates file extension, MIME type, size, and basic file content server-side. Stored filenames are sanitized and resolved under the upload directory to prevent path traversal. Users can only list and delete documents where `ownerId` matches their authenticated user ID.

After upload, documents are processed server-side:

- Status changes to `PROCESSING` while text extraction and chunking run.
- `.txt` and `.md` files are read as UTF-8 text.
- `.pdf` files are parsed with `pdf-parse`.
- Extracted text is split into chunks of about 3,000 characters with about 500 characters of overlap.
- Chunk metadata stores character offsets, original filename, MIME type, and document title.
- Chunk embeddings are generated server-side with the OpenAI embeddings API and stored in PostgreSQL using pgvector.
- Existing chunk embeddings are skipped when backfilling missing embeddings.
- Status changes to `READY` when chunks and embeddings are stored.
- Status changes to `FAILED` with a processing error when extraction fails or no text is found.

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

Search generates the query embedding server-side and filters by `ownerId` before returning results. Successful searches write a `document_search` audit log with the bounded query length, requested limit, and result count. AI configuration and provider failures are returned as stable API errors instead of raw provider messages.

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

- The API authenticates the user and applies a per-user in-memory rate limit.
- The question is embedded server-side with `OPENAI_EMBEDDING_MODEL`.
- The app retrieves top matching `READY` chunks where both `DocumentChunk.ownerId` and `Document.ownerId` match the signed-in user.
- Retrieved chunks are passed as the only allowed context to the answer model.
- The model must return insufficient information when the retrieved chunks do not directly support an answer.
- The response includes the answer, citations, and matched snippets.
- The app stores `Question` and `Answer` records and writes a `question_ask` audit log.

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

The ask UI and API never call OpenAI from client components. The local rate limiter is process-local and intended for development/MVP use. AI configuration and provider failures are normalized before they are returned to the client.

## Agent Tool API

These endpoints are not MCP tools yet. They are scoped HTTP endpoints that can be wrapped by MCP or another agent runtime later.

All tool endpoints require the same Auth.js session as the dashboard. Unauthenticated requests return `401`. Each endpoint filters by the authenticated user's `ownerId` and writes an agent tool audit log.

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
```

The schema includes ownership fields such as `ownerId` on `Document`, `DocumentChunk`, `Question`, and `Answer` for document access control. `AuditLog` records actor and resource fields for security-relevant events.

## Known Limitations

- Local file storage is intended for development; production should use object storage such as S3 or GCS.
- The ask endpoint uses an in-memory rate limiter, which is not shared across multiple app instances.
- Document processing runs inline after upload; a production system should use a background queue.
- Summarization uses bounded chunk context for MVP predictability and may truncate very large documents.
- Authentication is credentials-based for demo purposes; enterprise SSO is not implemented.
- MCP is not implemented yet; `/api/tools/*` endpoints are prepared so they can be wrapped later.
- There is no organization-wide admin audit review UI yet; the MVP exposes only owner-scoped user audit logs.

## Future Improvements

- Add S3/GCS storage and signed upload/download URLs.
- Move document processing and embedding generation to a job queue.
- Add team/workspace membership and role-based access control.
- Add organization-wide admin audit review and export controls.
- Add Japanese/Korean/English i18n routing and localized dashboard copy.
- Add Playwright end-to-end coverage for upload, ask, and tool endpoints.
- Add production-grade rate limiting with Redis.
- Wrap the scoped tool endpoints with MCP once the HTTP tool surface is stable.
- Add screenshot assets and a short demo video for portfolio presentation.

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
