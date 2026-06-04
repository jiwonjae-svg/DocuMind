# AGENTS.md

## Project

DocuMind is an agent-ready internal knowledge search system for Japanese and Korean teams.

The project should demonstrate backend/full-stack ability, AI integration, document processing, access control, testing, Docker, and Japan-ready product thinking.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Auth.js
- PostgreSQL
- Prisma
- pgvector
- OpenAI API
- Docker Compose
- Vitest
- Playwright
- i18n for English, Korean, and Japanese

## Working Principles

- Build a clean MVP first.
- Do not overbuild.
- Do not add unnecessary dependencies.
- Prefer simple, explicit code over premature abstractions.
- Keep UI simple, professional, responsive, and appropriate for internal business users.
- Update `README.md` after major features or setup changes.

## Security and Access Control

- Never expose API keys or secrets to the client.
- Use environment variables for all secrets.
- Keep OpenAI API calls on the server side only.
- All document operations must check user ownership before reading, writing, searching, embedding, deleting, or exporting data.
- Treat authorization checks as core business logic, not UI-only behavior.

## AI and Document Processing

- Keep document ingestion, chunking, embedding, and search behavior understandable and testable.
- Store embeddings with pgvector.
- Avoid sending unnecessary document content to AI providers.
- Make document search useful for Japanese and Korean teams, including clear support for EN/KO/JA user-facing text where practical.
- Prefer deterministic business logic around permissions, filtering, and retrieval before adding agentic behavior.

## Testing

- Add tests for core logic when practical.
- Prioritize tests for:
  - access control and ownership checks
  - document ingestion and chunking
  - search/retrieval behavior
  - API route validation
  - i18n routing or translation helpers
- Use Vitest for unit/integration-style logic tests.
- Use Playwright for key end-to-end flows when UI behavior is involved.

## Docker and Local Development

- Use Docker Compose for local infrastructure such as PostgreSQL and pgvector.
- Keep local setup reproducible from documented commands.
- Do not require committed secrets or machine-specific configuration.

## Completion Checklist

Before considering work complete:

- `npm run lint` passes, if available.
- `npm run test` passes, if available.
- `npm run build` passes.
- `README.md` explains setup and current features.

If a command is unavailable or cannot be run, document the reason in the final response.


## Commit/Push Automation

- After implementing user-requested changes in this repository and passing verification, automatically commit and push unless the user explicitly asks not to.
- Use `scripts/codex-commit-push.ps1` for automated commits. Provide an explicit commit message and explicit file list whenever possible.
- Do not stage unrelated files. Never stage `.env`, `.env*.local`, `.vercel`, `.next`, `node_modules`, `repomix-output.xml`, build outputs, or ignored/generated output.
- Prefer a `codex/` branch for new work. If the user is already working on `main` and explicitly wants direct deployment or push, use `-AllowMain`.
- Use `-AllowAssets` only when the requested change intentionally adds or updates binary assets such as screenshots.
- If lint, test, or build checks fail, fix the failure before committing. If the failure is unrelated and cannot be fixed safely, report it and do not hide it.
- GitHub CLI is available as `gh`; if `gh auth status` reports logged out, run `gh auth login` before GitHub API, issue, PR, or release operations.
