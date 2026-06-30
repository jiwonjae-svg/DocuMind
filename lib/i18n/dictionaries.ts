import { DEFAULT_LOCALE, type SupportedLocale } from "./config";

const en = {
  meta: {
    description:
      "Agent-ready internal knowledge search for Japanese and Korean teams.",
    title: "DocuMind",
  },
  common: {
    adminAudit: "Organization audit",
    ask: "Ask questions",
    auditLogs: "Audit logs",
    backToDashboard: "Back to dashboard",
    cancel: "Cancel",
    dashboard: "Dashboard",
    delete: "Delete",
    documents: "Documents",
    email: "Email",
    forgotPassword: "Forgot password?",
    home: "Home",
    language: "Language",
    login: "Sign in",
    logout: "Sign out",
    name: "Name",
    password: "Password",
    homeLink: "DocuMind home",
    primaryNavigation: "Primary navigation",
    resetPassword: "Reset password",
    search: "Search",
    signup: "Sign up",
    userFallback: "User",
  },
  apiErrors: {
    "Admin access required.": "Admin access required.",
    "AI provider is rate limiting requests. Try again shortly.":
      "AI provider is rate limiting requests. Try again shortly.",
    "AI provider is temporarily unavailable. Try again shortly.":
      "AI provider is temporarily unavailable. Try again shortly.",
    "AI provider request failed.": "AI provider request failed.",
    "AI service is not configured. Contact an administrator.":
      "AI service is not configured. Contact an administrator.",
    "Ask request failed.": "Ask request failed.",
    "Authentication required.": "Authentication required.",
    "Content-Type must be application/json.": "Content-Type must be application/json.",
    "Cross-origin request blocked.": "Cross-origin request blocked.",
    "documentId is required.": "documentId is required.",
    "Document must be READY before summarization.":
      "Document must be READY before summarization.",
    "Document not found.": "Document not found.",
    "Document summarization failed.": "Document summarization failed.",
    "Email, team, organization role, and team role are required.":
      "Email, team, organization role, and team role are required.",
    "Enter a valid email address.": "Enter a valid email address.",
    "Enter a valid email, name, and password.":
      "Enter a valid email, name, and password.",
    "Enter a valid reset token and password.":
      "Enter a valid reset token and password.",
    "Invalid JSON body.": "Invalid JSON body.",
    "Invalid team membership request.": "Invalid team membership request.",
    "JSON request body must be 16 KB or smaller.":
      "JSON request body must be 16 KB or smaller.",
    "Password must be at least 12 characters.":
      "Password must be at least 12 characters.",
    "Question must be between 1 and 1000 characters.":
      "Question must be between 1 and 1000 characters.",
    "Search failed.": "Search failed.",
    "Search query must be between 1 and 1000 characters.":
      "Search query must be between 1 and 1000 characters.",
    "Team name must be between 1 and 80 characters.":
      "Team name must be between 1 and 80 characters.",
    "Team and user are required.": "Team and user are required.",
    "Team invitation belongs to another email address.":
      "Team invitation belongs to another email address.",
    "Team invitation is invalid or expired.":
      "Team invitation is invalid or expired.",
    "Invalid team invitation request.": "Invalid team invitation request.",
    "Team member not found.": "Team member not found.",
    "Team not found.": "Team not found.",
    "This password reset link is invalid or expired.":
      "This password reset link is invalid or expired.",
    "Too many account creation attempts. Try again shortly.":
      "Too many account creation attempts. Try again shortly.",
    "Too many answer requests. Try again shortly.":
      "Too many answer requests. Try again shortly.",
    "Too many password reset attempts. Try again shortly.":
      "Too many password reset attempts. Try again shortly.",
    "Too many search requests. Try again shortly.":
      "Too many search requests. Try again shortly.",
    "Unsupported locale.": "Unsupported locale.",
    "User must sign up before being added to a team.":
      "User must sign up before being added to a team.",
  },
  auth: {
    accountRecovery: "Account recovery",
    accountSetup: "Account setup",
    alreadyHaveAccount: "Already have an account?",
    auditTrail: "Audit trail",
    auditTrailBody: "Successful requests and password changes are recorded.",
    createAccount: "Create account",
    createAccountPending: "Creating account...",
    createAccountTitle: "Create a private knowledge workspace",
    createAccountBody:
      "Start with a password account or an enabled OAuth provider. New users get a private workspace and can later access team-scoped documents assigned by an organization admin.",
    createAccountFormBody:
      "Create an account for a private document workspace. OAuth options appear when configured in the deployment environment.",
    emailPasswordDescription:
      "Enter your email and password. If OAuth is configured for this deployment, you can continue with a connected provider.",
    forgotFormBody:
      "Enter the email for your password account. If the account can be reset, DocuMind will send instructions.",
    forgotTitle: "Reset access without exposing account details",
    forgotBody:
      "DocuMind sends a one-time reset link for password accounts. The public response stays the same whether an address exists or not.",
    forgotSubmit: "Send reset instructions",
    forgotSubmitPending: "Sending instructions...",
    forgotSuccess:
      "If an account exists, password reset instructions have been sent.",
    forgotError: "Unable to request a password reset.",
    hidePassword: "Hide password",
    localResetLink: "Open local reset link",
    loginTitle: "Sign in to a secure knowledge workspace",
    loginBody:
      "Use your workspace account or an enabled OAuth provider to access private and team document management, semantic search, grounded answers, and audit records.",
    loginError: "Check your email and password, then try again.",
    loginPending: "Signing in...",
    needAccount: "Need an account?",
    newPassword: "New password",
    oneTimeToken: "One-time token",
    oneTimeTokenBody: "Reset links expire and only hashed tokens are stored.",
    ownerScopedData: "Access-scoped data",
    ownerScopedDataBody:
      "Documents, chunks, and answers stay filtered by ownership or team membership.",
    passwordAccount: "Password account",
    passwordAccountBody: "This flow updates only accounts that use password sign-in.",
    passwordHelp: "Use at least 12 characters.",
    privateByDefault: "Private by default",
    privateByDefaultBody:
      "Documents and answers are filtered by your account and assigned teams.",
    rememberPassword: "Remember your password?",
    resetBody:
      "Reset links are single-use and expire quickly. After a successful reset, sign in again with the new password.",
    resetComplete: "Your password has been reset. Sign in again.",
    resetError: "Unable to reset this password.",
    resetFormBody: "Choose a new password with at least 12 characters.",
    resetMissing: "This reset link is missing its token.",
    resetPending: "Resetting password...",
    resetRequestNew: "Request a new link",
    resetTitle: "Set a new password for DocuMind",
    serverOnlySecrets: "Server-only secrets",
    serverOnlySecretsBody: "Password hashing and OAuth callbacks run on the server.",
    serverSideAuth: "Server-side auth",
    serverSideAuthBody: "Protected pages and API routes verify the current session.",
    serverSideUpdate: "Server-side update",
    serverSideUpdateBody: "The new password is hashed before it is stored.",
    signInExistingAccount: "If this account exists, sign in with its current password.",
    signupError: "Unable to create the account.",
    showPassword: "Show password",
  },
  oauth: {
    continueWith: "Continue with {provider}",
    opening: "Opening {provider}...",
    separator: "or",
  },
  home: {
    architectureBody:
      "Authorization stays in the backend before documents are processed, embedded, searched, summarized, or used for answers.",
    architectureEyebrow: "Architecture",
    architectureTitle:
      "Upload -> Parse -> Chunk -> Embed -> Store -> Search -> Answer -> Cite -> Audit",
    builtWith:
      "Built with Next.js, TypeScript, PostgreSQL, Prisma, pgvector, Auth.js, OpenAI API, and Vercel.",
    builtWithAlt: "Next.js / TypeScript / PostgreSQL / pgvector / OpenAI API.",
    currentOnly:
      "Every step below is implemented now. Planned-only items are intentionally separated in the MVP scope section above.",
    heroBody:
      "DocuMind is an agent-ready internal knowledge search system for Japanese/Korean teams. It combines secure document ingestion, access-scoped semantic search, grounded answers, and clean API endpoints that can be used by agents.",
    heroEyebrow: "Agent-ready knowledge search",
    heroLocalized:
      "A backend-focused MVP for internal knowledge search across Japanese and Korean teams, with authentication, document processing, semantic search, and cited answers.",
    implementedBody:
      "The MVP focuses on secure retrieval-augmented document workflows: authentication, ownership checks, document processing, vector search, grounded answers, and auditable tool APIs. Everything in this section is implemented in the current product; planned work is separated below.",
    implementedEyebrow: "Implemented / Available now",
    implementedTitle: "Concrete backend and full-stack evidence",
    mvp: "MVP",
    openDashboard: "Open dashboard",
    plannedBody: "These items are planned for production hardening and are not implemented yet.",
    plannedEyebrow: "Future / Planned only",
    plannedTitle: "Intentionally outside the current MVP",
    previewHeading: "Internal document index",
    previewLabel: "Search preview",
    previewPlaceholder: "Search policies, guides, and project notes...",
    previewSubtext: "Access-scoped retrieval with source-aware AI responses.",
    productStepsLabel: "DocuMind workflow steps",
    startNow: "Start now",
    useProductEyebrow: "Use the product",
    useProductTitle: "What a workspace user can do",
    viewImplementation: "View implementation",
    viewImplementationAria: "View the DocuMind implementation README in the GitHub repository",
    whyAgentBody:
      "DocuMind is not just a chat UI. It is a controlled knowledge layer for human users and future AI agents. Agents should reach internal knowledge through authenticated, access-scoped, auditable API boundaries instead of bypassing application logic or reading the database directly.",
    whyAgentEyebrow: "Why agent-ready?",
    whyAgentLocalized:
      "DocuMind is a controlled layer for humans and future AI agents to access internal knowledge through authenticated, access-scoped, auditable API boundaries.",
    whyAgentTitle: "A controlled knowledge layer for humans and agents",
    features: [
      ["Protected dashboard routes", "Server-side session checks redirect unauthenticated visitors before protected dashboard content is rendered."],
      ["Signup, OAuth, and recovery", "Auth.js supports password accounts, configured Google or GitHub OAuth providers, and one-time password reset links."],
      ["Document management", "Authenticated users can upload, process, list, and delete validated .txt, .md, and .pdf documents."],
      ["Access-scoped data access", "Document reads, chunks, retrieval, and tool calls filter by ownership or team membership; deletes remain owner-only."],
      ["Semantic search", "OpenAI embeddings and PostgreSQL pgvector rank relevant chunks through authenticated server routes and a dashboard search UI."],
      ["Grounded answers with citations", "Retrieved chunks constrain the answer prompt, and the UI returns source titles, chunk indexes, snippets, and scores."],
      ["Audit logging and review", "Login, upload, processing, delete, ask, and tool actions create user-visible and admin-visible audit records."],
      ["MCP and tool endpoints", "Authenticated HTTP tool routes and a JSON-RPC MCP wrapper expose search, cited answers, and document summaries."],
    ],
    flow: [
      ["Upload", "Validate type, size, and file bytes before saving metadata."],
      ["Parse", "Extract text server-side from TXT, Markdown, or PDF files."],
      ["Chunk", "Split normalized text into bounded, indexed retrieval units."],
      ["Embed", "Generate missing chunk vectors through the server-side OpenAI client."],
      ["Store", "Persist documents, chunks, status, and vectors in PostgreSQL."],
      ["Search", "Rank accessible ready chunks with pgvector after owner/team filtering."],
      ["Answer", "Build a prompt constrained to the retrieved document context."],
      ["Cite", "Return supporting titles, chunk indexes, and matched snippets."],
      ["Audit", "Record security-relevant user and agent-tool actions."],
    ],
    planned: [
      "Enterprise SSO and user-managed account-linking settings",
      "Team invitations and team-scoped document sharing",
      "Background processing for large document pipelines",
      "Richer MCP streaming/session transport",
      "Production-grade distributed rate limiting",
    ],
    previewResults: [
      ["Japan onboarding checklist", "Updated 2d ago"],
      ["Korea sales enablement brief", "Updated 5d ago"],
      ["Security policy for internal docs", "Updated 1w ago"],
    ],
    productSteps: [
      "Create an account with email/password or continue with a configured OAuth provider.",
      "Open Documents to review existing files or upload a short .txt, .md, or .pdf file.",
      "Run semantic search from Search and inspect matching chunks, snippets, and scores.",
      "Ask a grounded question using content from an uploaded document.",
      "Check the answer, citations, matched snippets, and insufficient-information behavior.",
      "Review personal and organization admin audit log entries for activity.",
    ],
  },
  dashboard: {
    heroBody:
      "Upload internal knowledge files, search ready document chunks, and ask grounded questions with citations in one protected workspace.",
    title: "Knowledge workspace",
    adminOnly: "Admin only",
    availableEyebrow: "Available now",
    availableNow: "Available now",
    availableTitle: "Core workspace actions",
    plannedOnly: "Planned only",
    roadmapEyebrow: "MVP roadmap",
    cards: [
      ["Document management", "Upload, process, list, and delete personal documents, or upload to writable teams.", "Manage documents"],
      ["Semantic search", "Search ready chunks directly and inspect similarity-scored snippets.", "Search documents"],
      ["Grounded question answering", "Ask questions over retrieved chunks and review source citations.", "Ask questions"],
      ["Audit log review", "Review your records for uploads, processing, questions, and agent tool usage.", "Review audit logs"],
      ["Organization audit", "Owners and admins can review recent activity across organization members.", "Review organization"],
      ["Team RBAC", "Owners and admins can create teams and assign existing users to organization and team roles.", "Manage teams"],
    ],
    roadmap: [
      ["Team invitation workflows", "Add email invitations and self-service join flows beyond current admin assignment."],
      ["Background processing", "Move long document processing and embeddings into a durable queue for larger deployments."],
    ],
  },
  documents: {
    acceptedFormats: "Accepted formats: .txt, .md, .pdf. Maximum size: 10 MB.",
    cardBody:
      "Add text, Markdown, or PDF files to a personal or writable team scope. Lists include documents you can access, while deletion stays limited to the uploading owner.",
    cardTitle: "Upload and manage knowledge files",
    characters: "characters",
    chunks: "chunks",
    confirmDelete: "Confirm delete",
    countLabel: "{count} files",
    deleteWarning:
      "This removes the document, chunks, and embeddings. Only the uploading owner can delete the stored file.",
    emptyBody: "Upload a supported file to create chunks for semantic search and grounded answers.",
    emptyTitle: "No documents uploaded yet",
    library: "Library",
    lifecycleBody:
      "Upload creates metadata, processing extracts and chunks text, ready files can be searched and asked against, and failed files show the processing reason.",
    lifecycleTitle: "Processing lifecycle",
    notices: {
      "Choose a file before uploading.": "Choose a file before uploading.",
      "Cross-origin request blocked.": "Cross-origin request blocked.",
      "Document deleted.": "Document deleted.",
      "Document not found.": "Document not found.",
      "Document operation failed.": "Document operation failed.",
      "Document upload could not be parsed.": "Document upload could not be parsed.",
      "Document upload must use multipart form data.": "Document upload must use multipart form data.",
      "Document upload requires a valid Content-Length header.":
        "Document upload requires a valid Content-Length header.",
      "Document uploaded and processed.": "Document uploaded and processed.",
      "Document uploaded, but text extraction failed.":
        "Document uploaded, but text extraction failed.",
      "Files must be 10 MB or smaller.": "Files must be 10 MB or smaller.",
      "Only .txt, .md, and .pdf files are supported.":
        "Only .txt, .md, and .pdf files are supported.",
      "PDF uploads must contain a valid PDF header.":
        "PDF uploads must contain a valid PDF header.",
      "Selected team is not available for uploads.":
        "Selected team is not available for uploads.",
      "Text and Markdown uploads must be text files.":
        "Text and Markdown uploads must be text files.",
      "The file type does not match the selected document format.":
        "The file type does not match the selected document format.",
      "The uploaded file is empty.": "The uploaded file is empty.",
      "Too many document delete requests. Try again shortly.":
        "Too many document delete requests. Try again shortly.",
      "Too many document uploads. Try again shortly.":
        "Too many document uploads. Try again shortly.",
    },
    processingErrors: {
      "AI provider is rate limiting requests. Try again shortly.":
        "AI provider is rate limiting requests. Try again shortly.",
      "AI provider is temporarily unavailable. Try again shortly.":
        "AI provider is temporarily unavailable. Try again shortly.",
      "AI provider request failed.": "AI provider request failed.",
      "AI service is not configured. Contact an administrator.":
        "AI service is not configured. Contact an administrator.",
      "Document processing failed.": "Document processing failed.",
      "Extracted document text must be 300,000 characters or fewer.":
        "Extracted document text must be 300,000 characters or fewer.",
      "Files must be 10 MB or smaller.": "Files must be 10 MB or smaller.",
      "No extractable text found in document.":
        "No extractable text found in document.",
      "PDF documents must be 50 pages or fewer.":
        "PDF documents must be 50 pages or fewer.",
      "Unsupported document type.": "Unsupported document type.",
    },
    status: {
      FAILED: "Failed",
      PROCESSING: "Processing",
      READY: "Ready",
      UPLOADED: "Uploaded",
    },
    statusHelp: {
      FAILED: "Processing stopped. Check the reason and upload a corrected file if needed.",
      PROCESSING: "Text extraction, chunking, or embedding is still running.",
      READY: "This file is searchable and can support grounded answers.",
      UPLOADED: "The file was saved and is waiting for processing.",
    },
    storageBody:
      "Files use the configured storage provider while metadata and chunks stay in PostgreSQL.",
    storageTitle: "Document storage",
    personalDocument: "Personal",
    personalScope: "Personal",
    readOnly: "Read-only",
    teamDocument: "Team: {team}",
    teamScope: "{organization} / {team}",
    upload: "Upload",
    uploadDocument: "Upload document",
    uploadScope: "Access scope",
    uploadedDocuments: "Uploaded documents",
  },
  searchPage: {
    body:
      "Enter a natural-language query to retrieve the most relevant chunks from READY documents you can access. OpenAI calls stay inside the server route.",
    previewBody:
      "Results include document title, chunk index, snippet, and a similarity score for fast validation.",
    previewTitle: "Retrieval preview",
    title: "Search accessible ready document chunks",
  },
  searchForm: {
    auditBody:
      "Successful searches write an audit event with result count, limit, and query length without exposing OpenAI credentials to the client.",
    auditEyebrow: "Audit",
    auditTitle: "Search activity",
    chunk: "Chunk",
    empty: "No ready document chunks matched this query.",
    emptyTitle: "No matches found",
    invalidResult: "Search response contained invalid results.",
    invalidResponse: "Search response was not valid.",
    matches: "{count} matches",
    noReadyBody:
      "Search becomes available after at least one uploaded document finishes processing and has chunks.",
    noReadyTitle: "Upload a ready document first",
    pending: "Searching...",
    placeholder: "Search policies, onboarding guides, and project notes...",
    queryLabel: "Search query",
    readyHintBody:
      "Try a policy, onboarding, or project-note query. Results come only from READY document chunks you can access.",
    readyHintTitle: "Search ready documents",
    required: "Enter a search query.",
    results: "Results",
    scoreHigh: "High match",
    scoreLabel: "Match",
    scoreLow: "Low match",
    scoreMedium: "Medium match",
    scopeBody:
      "Search runs through the server API and filters ready chunks by owner or team membership before ranking with pgvector.",
    scopeEyebrow: "Scope",
    scopeTitle: "Access-scoped retrieval",
    submit: "Search",
    topMatches: "Top matching chunks",
    uploadReadyCta: "Open documents",
    fallbackError: "Search failed.",
  },
  askPage: {
    body:
      "Questions are embedded on the server, matched against document chunks you can access, and answered only from retrieved context.",
    guardrailBody:
      "Unsupported questions return an insufficient-information answer instead of invented facts.",
    guardrailTitle: "Retrieval guardrail",
    title: "Ask with source citations",
  },
  askForm: {
    answer: "Answer",
    ask: "Ask",
    asking: "Asking...",
    chunk: "Chunk",
    citations: "Citations",
    insufficient: "Insufficient information",
    invalidResponse: "Question response was not valid.",
    invalidSources: "Question response contained invalid sources.",
    matchedSnippets: "Matched snippets",
    noCitations: "No citations yet.",
    noReadyBody:
      "Ask becomes available after at least one uploaded document is READY. Unsupported questions will still return an insufficient-information response.",
    noReadyTitle: "Upload a ready document first",
    noMatches: "No matches yet.",
    placeholder: "What does the onboarding guide say about approval steps?",
    question: "Question",
    readyHintBody:
      "Ask about a policy, guide, or project note that exists in your READY documents. Answers are constrained to retrieved chunks.",
    readyHintTitle: "Ask from retrieved sources",
    required: "Enter a question.",
    retrieval: "Retrieval",
    scoreHigh: "High match",
    scoreLabel: "Match",
    scoreLow: "Low match",
    scoreMedium: "Medium match",
    sources: "Sources",
    uploadReadyCta: "Open documents",
    fallbackError: "Question failed.",
  },
  audit: {
    body:
      "This view shows only audit records created by the signed-in user. It helps you verify document, search, ask, and tool activity without exposing logs from other users.",
    countShown: "{count} shown",
    emptyBody:
      "Upload a document, run a search, ask a question, or use a tool endpoint to create your own audit records.",
    emptyTitle: "No audit events yet",
    latest: "Latest activity",
    recentEvents: "Most recent audit events",
    scopeBody:
      "The query is filtered by the current session user before any audit records are rendered.",
    scopeTitle: "User-scoped visibility",
    title: "Review your account activity",
  },
  adminAudit: {
    accessBody:
      "Organization-wide audit logs are available only to organization owners and admins.",
    accessTitle: "Admin access required",
    adminRole: "Admin role",
    body:
      "This admin view shows recent audit events created by members of the organization. It reuses the same bounded audit metadata formatting as the personal activity log.",
    count: "{members} members / {events} events shown",
    emptyBody:
      "Member activity such as sign-in, document upload, search, ask, and tool usage will appear here.",
    emptyTitle: "No organization audit events yet",
    latestEvents: "Organization-wide audit events",
    memberRolePrefix: "Org",
    membersAndTeams: "Members and teams",
    myAuditLogs: "My audit logs",
    organizationRoles: {
      ADMIN: "admin",
      MEMBER: "member",
      OWNER: "owner",
    },
    rbac: "RBAC",
    roleBody: "You are viewing this workspace as an organization {role}.",
    teamRoles: {
      MANAGER: "manager",
      MEMBER: "member",
      VIEWER: "viewer",
    },
    unknownActor: "Unknown actor",
  },
  teamAdmin: {
    addMemberBody:
      "Add an existing DocuMind user to this organization and assign a team role. New users must sign up before they can be added.",
    addMemberSubmit: "Assign member",
    addMemberTitle: "Assign an existing user",
    addingMember: "Assigning...",
    body:
      "Create teams and manage role assignments for existing users. Team RBAC controls workspace administration and team-scoped document access.",
    createTeamBody:
      "Create a team inside this organization. The current admin is added as that team's manager.",
    createTeamSubmit: "Create team",
    createTeamTitle: "Create team",
    creatingTeam: "Creating...",
    currentTeams: "Current teams",
    existingUsersOnly: "Users must create an account before an admin can assign them to a team.",
    fallbackError: "Team RBAC update failed.",
    confirmRemoveMember: "Remove member",
    invitationLink: "Invitation link",
    inviteMemberBody:
      "Create a single-use invite link for a person who should join this organization and team.",
    inviteMemberSubmit: "Create invitation",
    inviteMemberTitle: "Invite by link",
    invitingMember: "Creating invitation...",
    memberEmail: "User email",
    memberCount: "{count} members",
    noTeams: "No teams yet. Create a team to start assigning roles.",
    organizationRole: "Organization role",
    removeMember: "Remove",
    removeMemberWarning:
      "This removes the user's team role and access to documents shared only through this team.",
    removingMember: "Removing...",
    successMemberAssigned: "Team member assigned.",
    successInvitationCreated: "Team invitation created.",
    successTeamCreated: "Team created.",
    team: "Team",
    teamCount: "{count} teams",
    teamName: "Team name",
    teamRole: "Team role",
    title: "Manage team RBAC",
  },
  teamInvite: {
    accepted: "Team invitation accepted. You can now open the workspace.",
    accepting: "Accepting...",
    acceptInvitation: "Accept invitation",
    auditBody: "Accepting an invitation writes an audit event for review.",
    auditTitle: "Audited join",
    body:
      "Use a team invitation to join the right organization and team without bypassing access control.",
    cardTitle: "Join a DocuMind team",
    emailMismatchBody:
      "Sign out and sign in with the email address that received this invitation.",
    emailMismatchTitle: "This invitation is for another account",
    eyebrow: "Team invitation",
    fallbackError: "Unable to accept this team invitation.",
    invalidBody: "Ask an organization admin to create a new invitation link.",
    invalidTitle: "This invitation link is invalid or expired.",
    organization: "Organization",
    secureBody:
      "The invitation token is checked on the server and can be used only once.",
    secureTitle: "Single-use token",
    signInBody:
      "Sign in or create an account with the invited email address to accept this team invitation.",
    team: "Team",
    title: "Accept secure access to a team workspace",
  },
};

const ko = {
  ...en,
  meta: {
    description:
      "일본 및 한국 팀을 위한 에이전트 준비형 내부 지식 검색 시스템입니다.",
    title: "DocuMind",
  },
  common: {
    adminAudit: "조직 감사",
    ask: "질문하기",
    auditLogs: "감사 로그",
    backToDashboard: "대시보드로 돌아가기",
    cancel: "취소",
    dashboard: "대시보드",
    delete: "삭제",
    documents: "문서",
    email: "이메일",
    forgotPassword: "비밀번호를 잊으셨나요?",
    home: "홈",
    language: "언어",
    login: "로그인",
    logout: "로그아웃",
    name: "이름",
    password: "비밀번호",
    homeLink: "DocuMind 홈",
    primaryNavigation: "주요 탐색",
    resetPassword: "비밀번호 재설정",
    search: "검색",
    signup: "회원가입",
    userFallback: "사용자",
  },
  auth: {
    ...en.auth,
    accountRecovery: "계정 복구",
    accountSetup: "계정 설정",
    alreadyHaveAccount: "이미 계정이 있으신가요?",
    auditTrail: "감사 기록",
    auditTrailBody: "성공한 요청과 비밀번호 변경은 감사 로그에 기록됩니다.",
    createAccount: "계정 만들기",
    createAccountPending: "계정 생성 중...",
    createAccountTitle: "비공개 지식 워크스페이스 만들기",
    createAccountBody:
      "비밀번호 계정이나 활성화된 OAuth 제공자로 시작하세요. 새 사용자는 비공개 워크스페이스를 받고, 이후 조직 관리자가 배정한 팀 문서에도 접근할 수 있습니다.",
    createAccountFormBody:
      "비공개 문서 워크스페이스 계정을 만드세요. 배포 환경에 OAuth가 설정되면 옵션이 표시됩니다.",
    emailPasswordDescription:
      "이메일과 비밀번호를 입력하세요. 이 배포에 OAuth가 설정되어 있으면 연결된 제공자로 계속할 수 있습니다.",
    forgotFormBody:
      "비밀번호 계정의 이메일을 입력하세요. 재설정 가능한 계정이면 안내를 보냅니다.",
    forgotTitle: "계정 정보를 노출하지 않고 접근 복구",
    forgotBody:
      "DocuMind는 비밀번호 계정에 1회용 재설정 링크를 보냅니다. 주소 존재 여부와 관계없이 공개 응답은 동일합니다.",
    forgotSubmit: "재설정 안내 보내기",
    forgotSubmitPending: "안내 전송 중...",
    forgotSuccess: "계정이 존재하면 비밀번호 재설정 안내를 보냈습니다.",
    forgotError: "비밀번호 재설정을 요청할 수 없습니다.",
    hidePassword: "비밀번호 숨기기",
    localResetLink: "로컬 재설정 링크 열기",
    loginTitle: "보안 지식 워크스페이스에 로그인",
    loginBody:
      "워크스페이스 계정이나 활성화된 OAuth 제공자로 비공개 문서 관리, 의미 검색, 근거 기반 답변, 감사 기록에 접근하세요.",
    loginError: "이메일과 비밀번호를 확인한 뒤 다시 시도하세요.",
    loginPending: "로그인 중...",
    needAccount: "계정이 필요하신가요?",
    newPassword: "새 비밀번호",
    oneTimeToken: "1회용 토큰",
    oneTimeTokenBody: "재설정 링크는 만료되며 해시된 토큰만 저장됩니다.",
    ownerScopedData: "접근 범위 데이터",
    ownerScopedDataBody:
      "문서, 청크, 답변은 소유권 또는 팀 멤버십으로 필터링됩니다.",
    passwordAccount: "비밀번호 계정",
    passwordAccountBody: "이 흐름은 비밀번호 로그인 계정만 업데이트합니다.",
    passwordHelp: "12자 이상을 사용하세요.",
    privateByDefault: "기본 비공개",
    privateByDefaultBody: "문서와 답변은 계정 및 배정된 팀으로 필터링됩니다.",
    rememberPassword: "비밀번호가 기억나시나요?",
    resetBody:
      "재설정 링크는 한 번만 사용할 수 있고 빠르게 만료됩니다. 성공 후 새 비밀번호로 다시 로그인하세요.",
    resetComplete: "비밀번호가 재설정되었습니다. 다시 로그인하세요.",
    resetError: "이 비밀번호를 재설정할 수 없습니다.",
    resetFormBody: "12자 이상의 새 비밀번호를 선택하세요.",
    resetMissing: "이 재설정 링크에는 토큰이 없습니다.",
    resetPending: "비밀번호 재설정 중...",
    resetRequestNew: "새 링크 요청",
    resetTitle: "DocuMind 새 비밀번호 설정",
    serverOnlySecrets: "서버 전용 비밀값",
    serverOnlySecretsBody: "비밀번호 해싱과 OAuth 콜백은 서버에서 실행됩니다.",
    serverSideAuth: "서버 측 인증",
    serverSideAuthBody: "보호 페이지와 API 라우트는 현재 세션을 검증합니다.",
    serverSideUpdate: "서버 측 업데이트",
    serverSideUpdateBody: "새 비밀번호는 저장 전에 해시됩니다.",
    signInExistingAccount: "이 계정이 존재한다면 현재 비밀번호로 로그인하세요.",
    signupError: "계정을 만들 수 없습니다.",
    showPassword: "비밀번호 표시",
  },
  apiErrors: {
    ...en.apiErrors,
    "Admin access required.": "관리자 접근이 필요합니다.",
    "AI provider is rate limiting requests. Try again shortly.":
      "AI 제공자가 요청을 제한하고 있습니다. 잠시 후 다시 시도하세요.",
    "AI provider is temporarily unavailable. Try again shortly.":
      "AI 제공자를 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도하세요.",
    "AI provider request failed.": "AI 제공자 요청에 실패했습니다.",
    "AI service is not configured. Contact an administrator.":
      "AI 서비스가 설정되어 있지 않습니다. 관리자에게 문의하세요.",
    "Ask request failed.": "질문 요청에 실패했습니다.",
    "Authentication required.": "로그인이 필요합니다.",
    "Content-Type must be application/json.": "Content-Type은 application/json이어야 합니다.",
    "Cross-origin request blocked.": "교차 출처 요청이 차단되었습니다.",
    "documentId is required.": "documentId가 필요합니다.",
    "Document must be READY before summarization.":
      "요약하기 전에 문서가 READY 상태여야 합니다.",
    "Document not found.": "문서를 찾을 수 없습니다.",
    "Document summarization failed.": "문서 요약에 실패했습니다.",
    "Email, team, organization role, and team role are required.":
      "이메일, 팀, 조직 역할, 팀 역할을 모두 입력해야 합니다.",
    "Enter a valid email address.": "유효한 이메일 주소를 입력하세요.",
    "Enter a valid email, name, and password.":
      "유효한 이메일, 이름, 비밀번호를 입력하세요.",
    "Enter a valid reset token and password.":
      "유효한 재설정 토큰과 비밀번호를 입력하세요.",
    "Invalid JSON body.": "JSON 본문이 올바르지 않습니다.",
    "Invalid team membership request.": "팀 멤버십 요청이 올바르지 않습니다.",
    "JSON request body must be 16 KB or smaller.":
      "JSON 요청 본문은 16 KB 이하여야 합니다.",
    "Password must be at least 12 characters.":
      "비밀번호는 12자 이상이어야 합니다.",
    "Question must be between 1 and 1000 characters.":
      "질문은 1자 이상 1000자 이하여야 합니다.",
    "Search failed.": "검색에 실패했습니다.",
    "Search query must be between 1 and 1000 characters.":
      "검색어는 1자 이상 1000자 이하여야 합니다.",
    "Team name must be between 1 and 80 characters.":
      "팀 이름은 1자 이상 80자 이하여야 합니다.",
    "Team and user are required.": "팀과 사용자가 필요합니다.",
    "Team invitation belongs to another email address.":
      "팀 초대가 다른 이메일 주소에 속해 있습니다.",
    "Team invitation is invalid or expired.":
      "팀 초대가 잘못되었거나 만료되었습니다.",
    "Invalid team invitation request.": "팀 초대 요청이 올바르지 않습니다.",
    "Team member not found.": "팀 멤버를 찾을 수 없습니다.",
    "Team not found.": "팀을 찾을 수 없습니다.",
    "This password reset link is invalid or expired.":
      "비밀번호 재설정 링크가 잘못되었거나 만료되었습니다.",
    "Too many account creation attempts. Try again shortly.":
      "계정 생성 시도가 너무 많습니다. 잠시 후 다시 시도하세요.",
    "Too many answer requests. Try again shortly.":
      "답변 요청이 너무 많습니다. 잠시 후 다시 시도하세요.",
    "Too many password reset attempts. Try again shortly.":
      "비밀번호 재설정 시도가 너무 많습니다. 잠시 후 다시 시도하세요.",
    "Too many search requests. Try again shortly.":
      "검색 요청이 너무 많습니다. 잠시 후 다시 시도하세요.",
    "Unsupported locale.": "지원하지 않는 언어입니다.",
    "User must sign up before being added to a team.":
      "팀에 추가하려면 사용자가 먼저 회원가입해야 합니다.",
  },
  oauth: {
    continueWith: "{provider}로 계속",
    opening: "{provider} 열기...",
    separator: "또는",
  },
  home: {
    ...en.home,
    architectureBody:
      "문서가 처리, 임베딩, 검색, 요약, 답변에 사용되기 전에 백엔드에서 권한을 확인합니다.",
    architectureEyebrow: "아키텍처",
    architectureTitle: "업로드 -> 파싱 -> 청킹 -> 임베딩 -> 저장 -> 검색 -> 답변 -> 인용 -> 감사",
    builtWith:
      "Next.js, TypeScript, PostgreSQL, Prisma, pgvector, Auth.js, OpenAI API, Vercel로 구축했습니다.",
    currentOnly:
      "아래 단계는 현재 구현되어 있습니다. 계획 단계 항목은 위 MVP 범위에서 분리했습니다.",
    heroBody:
      "DocuMind는 일본/한국 팀을 위한 agent-ready 내부 지식 검색 시스템입니다. 안전한 문서 수집, 접근 범위 의미 검색, 근거 기반 답변, 에이전트가 사용할 수 있는 API endpoint를 결합합니다.",
    heroEyebrow: "에이전트 준비 지식 검색",
    heroLocalized:
      "일본 및 한국 팀의 내부 지식 검색을 위한 백엔드 중심 MVP입니다. 인증, 문서 처리, 의미 검색, 출처 있는 답변을 제공합니다.",
    implementedBody:
      "MVP는 인증, 소유권 확인, 문서 처리, 벡터 검색, 근거 기반 답변, 감사 가능한 도구 API에 집중합니다. 이 섹션의 기능은 현재 제품에 구현되어 있습니다.",
    implementedEyebrow: "현재 구현 / 사용 가능",
    implementedTitle: "구체적인 백엔드와 풀스택 증거",
    openDashboard: "대시보드 열기",
    plannedBody: "이 항목들은 운영 강화를 위한 계획이며 아직 구현되지 않았습니다.",
    plannedEyebrow: "향후 / 계획",
    plannedTitle: "현재 MVP 밖의 범위",
    previewHeading: "내부 문서 인덱스",
    previewLabel: "검색 미리보기",
    previewPlaceholder: "정책, 가이드, 프로젝트 노트 검색...",
    previewSubtext: "접근 범위 검색과 출처 인식 AI 응답.",
    startNow: "지금 시작",
    useProductEyebrow: "제품 사용",
    useProductTitle: "워크스페이스 사용자가 할 수 있는 일",
    viewImplementation: "구현 보기",
    viewImplementationAria: "GitHub 저장소의 DocuMind 구현 README 보기",
    whyAgentBody:
      "DocuMind는 단순한 채팅 UI가 아닙니다. 사람과 향후 AI 에이전트가 인증되고 접근 범위가 적용되며 감사 가능한 API 경계로 내부 지식에 접근하는 제어 계층입니다.",
    whyAgentEyebrow: "왜 agent-ready인가?",
    whyAgentLocalized:
      "DocuMind는 사람과 향후 AI 에이전트가 인증, 접근 범위, 감사 가능한 API 경계로 내부 지식에 접근하게 하는 제어 계층입니다.",
    whyAgentTitle: "사람과 에이전트를 위한 제어된 지식 계층",
    features: [
      ["보호된 대시보드 라우트", "서버 측 세션 검사가 보호된 대시보드 콘텐츠 렌더링 전에 미인증 방문자를 리디렉션합니다."],
      ["회원가입, OAuth, 복구", "Auth.js가 비밀번호 계정, 설정된 Google/GitHub OAuth, 1회용 비밀번호 재설정 링크를 지원합니다."],
      ["문서 관리", "인증된 사용자는 검증된 .txt, .md, .pdf 문서를 업로드, 처리, 조회, 삭제할 수 있습니다."],
      ["접근 범위 데이터 접근", "문서 읽기, 청크, 검색, 도구 호출은 소유권 또는 팀 멤버십으로 필터링되며, 삭제는 소유자만 가능합니다."],
      ["의미 검색", "OpenAI 임베딩과 PostgreSQL pgvector가 인증된 서버 라우트와 대시보드 UI에서 관련 청크를 순위화합니다."],
      ["출처 있는 근거 기반 답변", "검색된 청크가 답변 프롬프트를 제한하고 UI는 출처 제목, 청크 인덱스, 스니펫, 점수를 반환합니다."],
      ["감사 로그와 검토", "로그인, 업로드, 처리, 삭제, 질문, 도구 action이 사용자 및 관리자 감사 기록을 만듭니다."],
      ["MCP와 도구 endpoint", "인증된 HTTP 도구 라우트와 JSON-RPC MCP wrapper가 검색, 출처 답변, 문서 요약을 노출합니다."],
    ],
    flow: [
      ["업로드", "메타데이터 저장 전에 유형, 크기, 파일 bytes를 검증합니다."],
      ["파싱", "TXT, Markdown, PDF에서 서버 측으로 텍스트를 추출합니다."],
      ["청킹", "정규화된 텍스트를 제한된 인덱스 검색 단위로 나눕니다."],
      ["임베딩", "서버 측 OpenAI client로 누락된 청크 벡터를 생성합니다."],
      ["저장", "문서, 청크, 상태, 벡터를 PostgreSQL에 저장합니다."],
      ["검색", "소유자/팀 필터를 거친 접근 가능한 READY 청크를 pgvector로 순위화합니다."],
      ["답변", "검색된 문서 맥락으로 제한된 프롬프트를 구성합니다."],
      ["인용", "근거 제목, 청크 인덱스, 일치 스니펫을 반환합니다."],
      ["감사", "보안 관련 사용자 및 도구 action을 기록합니다."],
    ],
    planned: [
      "엔터프라이즈 SSO와 사용자 관리 계정 연결 설정",
      "팀 초대와 팀 범위 문서 공유",
      "대용량 문서 파이프라인을 위한 백그라운드 처리",
      "더 풍부한 MCP 스트리밍/세션 전송",
      "운영 등급 분산 rate limiting",
    ],
    previewResults: [
      ["일본 온보딩 체크리스트", "2일 전 업데이트"],
      ["한국 영업 지원 브리프", "5일 전 업데이트"],
      ["내부 문서 보안 정책", "1주 전 업데이트"],
    ],
    productSteps: [
      "이메일/비밀번호로 계정을 만들거나 설정된 OAuth 제공자로 계속합니다.",
      "Documents에서 기존 파일을 확인하거나 짧은 .txt, .md, .pdf 파일을 업로드합니다.",
      "Search에서 의미 검색을 실행하고 일치 청크, 스니펫, 점수를 확인합니다.",
      "업로드한 문서 내용으로 근거 기반 질문을 합니다.",
      "답변, 인용, 일치 스니펫, 정보 부족 동작을 확인합니다.",
      "개인 및 조직 관리자 감사 로그에서 활동을 검토합니다.",
    ],
  },
  dashboard: {
    heroBody:
      "내부 지식 파일을 업로드하고, 준비된 문서 청크를 검색하며, 하나의 보호된 워크스페이스에서 출처 있는 질문 답변을 사용할 수 있습니다.",
    title: "지식 워크스페이스",
    adminOnly: "관리자 전용",
    availableEyebrow: "현재 사용 가능",
    availableNow: "사용 가능",
    availableTitle: "핵심 워크스페이스 작업",
    plannedOnly: "계획됨",
    roadmapEyebrow: "MVP 로드맵",
    cards: [
      ["문서 관리", "개인 문서를 업로드, 처리, 조회, 삭제하거나 쓰기 가능한 팀에 업로드합니다.", "문서 관리"],
      ["의미 검색", "준비된 청크를 직접 검색하고 유사도 점수와 스니펫을 확인합니다.", "문서 검색"],
      ["근거 기반 질문 답변", "검색된 청크를 기반으로 질문하고 출처 인용을 검토합니다.", "질문하기"],
      ["감사 로그 검토", "업로드, 처리, 질문, 에이전트 도구 사용 기록을 내 활동 범위에서 확인합니다.", "감사 로그 보기"],
      ["조직 감사", "소유자와 관리자는 조직 구성원의 최근 활동을 검토할 수 있습니다.", "조직 검토"],
      ["팀 RBAC", "소유자와 관리자는 팀을 만들고 기존 사용자를 조직 및 팀 역할에 배정할 수 있습니다.", "팀 관리"],
    ],
    roadmap: [
      ["팀 초대 워크플로", "현재 관리자 배정 방식 위에 이메일 초대와 셀프서비스 참여 흐름을 추가합니다."],
      ["백그라운드 처리", "더 큰 배포를 위해 긴 문서 처리와 임베딩을 내구성 있는 큐로 옮깁니다."],
    ],
  },
  documents: {
    ...en.documents,
    acceptedFormats: "지원 형식: .txt, .md, .pdf. 최대 크기: 10 MB.",
    cardBody:
      "개인 또는 쓰기 가능한 팀 범위에 텍스트, Markdown, PDF 파일을 추가하세요. 목록은 접근 가능한 문서를 포함하고, 삭제는 업로드한 소유자에게만 제한됩니다.",
    cardTitle: "지식 파일 업로드 및 관리",
    characters: "글자",
    chunks: "청크",
    confirmDelete: "삭제 확인",
    countLabel: "{count}개 파일",
    deleteWarning:
      "이 문서와 청크, 임베딩이 삭제됩니다. 저장된 파일 삭제는 업로드한 소유자만 할 수 있습니다.",
    emptyBody: "의미 검색과 근거 기반 답변을 위한 청크를 만들려면 지원 파일을 업로드하세요.",
    emptyTitle: "아직 업로드한 문서가 없습니다",
    library: "라이브러리",
    lifecycleBody:
      "업로드는 메타데이터를 만들고, 처리는 텍스트 추출과 청킹을 수행합니다. 준비됨 상태의 파일은 검색과 질문에 사용할 수 있으며, 실패한 파일은 처리 사유를 표시합니다.",
    lifecycleTitle: "처리 상태 흐름",
    notices: {
      "Choose a file before uploading.": "업로드할 파일을 선택하세요.",
      "Cross-origin request blocked.": "교차 출처 요청이 차단되었습니다.",
      "Document deleted.": "문서를 삭제했습니다.",
      "Document not found.": "문서를 찾을 수 없습니다.",
      "Document operation failed.": "문서 작업에 실패했습니다.",
      "Document upload could not be parsed.": "문서 업로드를 해석할 수 없습니다.",
      "Document upload must use multipart form data.": "문서 업로드는 multipart form data를 사용해야 합니다.",
      "Document upload requires a valid Content-Length header.":
        "문서 업로드에는 유효한 Content-Length 헤더가 필요합니다.",
      "Document uploaded and processed.": "문서를 업로드하고 처리했습니다.",
      "Document uploaded, but text extraction failed.":
        "문서를 업로드했지만 텍스트 추출에 실패했습니다.",
      "Files must be 10 MB or smaller.": "파일은 10 MB 이하여야 합니다.",
      "Only .txt, .md, and .pdf files are supported.":
        ".txt, .md, .pdf 파일만 지원합니다.",
      "PDF uploads must contain a valid PDF header.":
        "PDF 업로드에는 유효한 PDF 헤더가 있어야 합니다.",
      "Selected team is not available for uploads.":
        "선택한 팀에는 업로드할 수 없습니다.",
      "Text and Markdown uploads must be text files.":
        "텍스트와 Markdown 업로드는 텍스트 파일이어야 합니다.",
      "The file type does not match the selected document format.":
        "파일 유형이 선택한 문서 형식과 일치하지 않습니다.",
      "The uploaded file is empty.": "업로드한 파일이 비어 있습니다.",
      "Too many document delete requests. Try again shortly.":
        "문서 삭제 요청이 너무 많습니다. 잠시 후 다시 시도하세요.",
      "Too many document uploads. Try again shortly.":
        "문서 업로드 요청이 너무 많습니다. 잠시 후 다시 시도하세요.",
    },
    processingErrors: {
      "AI provider is rate limiting requests. Try again shortly.":
        "AI 제공자가 요청을 제한하고 있습니다. 잠시 후 다시 시도하세요.",
      "AI provider is temporarily unavailable. Try again shortly.":
        "AI 제공자를 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도하세요.",
      "AI provider request failed.": "AI 제공자 요청에 실패했습니다.",
      "AI service is not configured. Contact an administrator.":
        "AI 서비스가 설정되어 있지 않습니다. 관리자에게 문의하세요.",
      "Document processing failed.": "문서 처리에 실패했습니다.",
      "Extracted document text must be 300,000 characters or fewer.":
        "추출된 문서 텍스트는 300,000자 이하여야 합니다.",
      "Files must be 10 MB or smaller.": "파일은 10 MB 이하여야 합니다.",
      "No extractable text found in document.": "문서에서 추출 가능한 텍스트를 찾지 못했습니다.",
      "PDF documents must be 50 pages or fewer.": "PDF 문서는 50페이지 이하여야 합니다.",
      "Unsupported document type.": "지원하지 않는 문서 유형입니다.",
    },
    status: {
      FAILED: "실패",
      PROCESSING: "처리 중",
      READY: "준비됨",
      UPLOADED: "업로드됨",
    },
    statusHelp: {
      FAILED: "처리가 중단되었습니다. 사유를 확인하고 필요하면 수정한 파일을 다시 업로드하세요.",
      PROCESSING: "텍스트 추출, 청킹 또는 임베딩이 아직 진행 중입니다.",
      READY: "이 파일은 검색 가능하며 근거 기반 답변에 사용할 수 있습니다.",
      UPLOADED: "파일이 저장되었고 처리를 기다리는 중입니다.",
    },
    storageBody:
      "파일은 설정된 스토리지 제공자에 저장되고, 메타데이터와 청크는 PostgreSQL에 유지됩니다.",
    storageTitle: "문서 스토리지",
    personalDocument: "개인",
    personalScope: "개인",
    readOnly: "읽기 전용",
    teamDocument: "팀: {team}",
    teamScope: "{organization} / {team}",
    upload: "업로드",
    uploadDocument: "문서 업로드",
    uploadScope: "접근 범위",
    uploadedDocuments: "업로드된 문서",
  },
  searchPage: {
    body:
      "자연어 쿼리를 입력하면 접근 가능한 READY 문서에서 가장 관련 높은 청크를 검색합니다. OpenAI 호출은 서버 라우트 안에서만 실행됩니다.",
    previewBody:
      "결과에는 빠른 검토를 위한 문서 제목, 청크 번호, 스니펫, 유사도 점수가 포함됩니다.",
    previewTitle: "검색 미리보기",
    title: "접근 가능한 준비된 문서 청크 검색",
  },
  searchForm: {
    auditBody:
      "성공한 검색은 결과 수, 제한값, 쿼리 길이를 감사 이벤트로 기록하며 OpenAI 자격 증명을 클라이언트에 노출하지 않습니다.",
    auditEyebrow: "감사",
    auditTitle: "검색 활동",
    chunk: "청크",
    empty: "이 쿼리와 일치하는 준비된 문서 청크가 없습니다.",
    emptyTitle: "일치 항목이 없습니다",
    invalidResult: "검색 응답에 잘못된 결과가 포함되어 있습니다.",
    invalidResponse: "검색 응답이 올바르지 않습니다.",
    matches: "{count}개 일치",
    noReadyBody:
      "업로드한 문서가 처리 완료되고 청크가 생기면 검색을 사용할 수 있습니다.",
    noReadyTitle: "먼저 준비된 문서를 업로드하세요",
    pending: "검색 중...",
    placeholder: "정책, 온보딩 가이드, 프로젝트 노트 검색...",
    queryLabel: "검색어",
    readyHintBody:
      "정책, 온보딩, 프로젝트 노트 관련 검색어를 입력하세요. 결과는 접근 가능한 READY 문서 청크에서만 가져옵니다.",
    readyHintTitle: "준비된 문서 검색",
    required: "검색어를 입력하세요.",
    results: "결과",
    scoreHigh: "높은 일치",
    scoreLabel: "일치도",
    scoreLow: "낮은 일치",
    scoreMedium: "중간 일치",
    scopeBody:
      "검색은 서버 API를 통해 실행되며 pgvector 순위화 전에 준비된 청크를 소유자 또는 팀 멤버십으로 필터링합니다.",
    scopeEyebrow: "범위",
    scopeTitle: "접근 범위 검색",
    submit: "검색",
    topMatches: "상위 일치 청크",
    uploadReadyCta: "문서 열기",
    fallbackError: "검색에 실패했습니다.",
  },
  askPage: {
    body:
      "질문은 서버에서 임베딩되고, 접근 가능한 문서 청크와 매칭되며, 검색된 맥락만 기반으로 답변됩니다.",
    guardrailBody:
      "지원되지 않는 질문에는 지어낸 답변 대신 정보 부족 응답을 반환합니다.",
    guardrailTitle: "검색 가드레일",
    title: "출처 인용으로 질문하기",
  },
  askForm: {
    answer: "답변",
    ask: "질문하기",
    asking: "질문 중...",
    chunk: "청크",
    citations: "인용",
    insufficient: "정보 부족",
    invalidResponse: "질문 응답이 올바르지 않습니다.",
    invalidSources: "질문 응답에 잘못된 출처가 포함되어 있습니다.",
    matchedSnippets: "일치 스니펫",
    noCitations: "아직 인용이 없습니다.",
    noReadyBody:
      "업로드한 문서가 READY 상태가 되면 질문할 수 있습니다. 지원되지 않는 질문은 정보 부족 응답으로 처리됩니다.",
    noReadyTitle: "먼저 준비된 문서를 업로드하세요",
    noMatches: "아직 일치 항목이 없습니다.",
    placeholder: "온보딩 가이드에서 승인 단계에 대해 무엇이라고 하나요?",
    question: "질문",
    readyHintBody:
      "READY 문서에 들어 있는 정책, 가이드, 프로젝트 노트에 대해 질문하세요. 답변은 검색된 청크 범위로 제한됩니다.",
    readyHintTitle: "검색된 출처로 질문",
    required: "질문을 입력하세요.",
    retrieval: "검색",
    scoreHigh: "높은 일치",
    scoreLabel: "일치도",
    scoreLow: "낮은 일치",
    scoreMedium: "중간 일치",
    sources: "출처",
    uploadReadyCta: "문서 열기",
    fallbackError: "질문에 실패했습니다.",
  },
  audit: {
    body:
      "이 화면은 로그인 사용자가 만든 감사 기록만 보여줍니다. 다른 사용자의 로그를 노출하지 않고 문서, 검색, 질문, 도구 활동을 확인할 수 있습니다.",
    countShown: "{count}개 표시",
    emptyBody:
      "문서를 업로드하거나, 검색을 실행하거나, 질문하거나, 도구 endpoint를 사용하면 내 감사 기록이 생성됩니다.",
    emptyTitle: "아직 감사 이벤트가 없습니다",
    latest: "최근 활동",
    recentEvents: "가장 최근 감사 이벤트",
    scopeBody:
      "감사 기록을 렌더링하기 전에 쿼리는 현재 세션 사용자로 필터링됩니다.",
    scopeTitle: "사용자 범위 가시성",
    title: "계정 활동 검토",
  },
  adminAudit: {
    accessBody: "조직 전체 감사 로그는 조직 소유자와 관리자만 사용할 수 있습니다.",
    accessTitle: "관리자 접근 필요",
    adminRole: "관리자 역할",
    body:
      "이 관리자 화면은 조직 구성원이 만든 최근 감사 이벤트를 보여줍니다. 개인 활동 로그와 같은 제한된 감사 메타데이터 형식을 사용합니다.",
    count: "구성원 {members}명 / 이벤트 {events}개 표시",
    emptyBody:
      "로그인, 문서 업로드, 검색, 질문, 도구 사용 같은 구성원 활동이 여기에 표시됩니다.",
    emptyTitle: "아직 조직 감사 이벤트가 없습니다",
    latestEvents: "조직 전체 감사 이벤트",
    memberRolePrefix: "조직",
    membersAndTeams: "구성원 및 팀",
    myAuditLogs: "내 감사 로그",
    organizationRoles: {
      ADMIN: "관리자",
      MEMBER: "구성원",
      OWNER: "소유자",
    },
    rbac: "RBAC",
    roleBody: "이 워크스페이스를 조직 {role} 역할로 보고 있습니다.",
    teamRoles: {
      MANAGER: "매니저",
      MEMBER: "구성원",
      VIEWER: "뷰어",
    },
    unknownActor: "알 수 없는 사용자",
  },
  teamAdmin: {
    addMemberBody:
      "기존 DocuMind 사용자를 이 조직에 추가하고 팀 역할을 배정합니다. 새 사용자는 먼저 가입해야 합니다.",
    addMemberSubmit: "멤버 배정",
    addMemberTitle: "기존 사용자 배정",
    addingMember: "배정 중...",
    body:
      "팀을 만들고 기존 사용자의 역할 배정을 관리합니다. 팀 RBAC는 워크스페이스 관리와 팀 범위 문서 접근을 함께 제어합니다.",
    createTeamBody:
      "이 조직 안에 팀을 만듭니다. 현재 관리자는 해당 팀의 매니저로 추가됩니다.",
    createTeamSubmit: "팀 생성",
    createTeamTitle: "팀 생성",
    creatingTeam: "생성 중...",
    currentTeams: "현재 팀",
    existingUsersOnly: "관리자가 팀에 배정하려면 사용자가 먼저 계정을 만들어야 합니다.",
    fallbackError: "팀 RBAC 업데이트에 실패했습니다.",
    confirmRemoveMember: "멤버 제거",
    invitationLink: "초대 링크",
    inviteMemberBody:
      "이 조직과 팀에 참여해야 하는 사람을 위한 1회용 초대 링크를 만듭니다.",
    inviteMemberSubmit: "초대 생성",
    inviteMemberTitle: "링크로 초대",
    invitingMember: "초대 생성 중...",
    memberEmail: "사용자 이메일",
    memberCount: "{count}명",
    noTeams: "아직 팀이 없습니다. 역할 배정을 시작하려면 팀을 만드세요.",
    organizationRole: "조직 역할",
    removeMember: "제거",
    removeMemberWarning:
      "이 사용자의 팀 역할과 이 팀을 통해서만 공유된 문서 접근 권한을 제거합니다.",
    removingMember: "제거 중...",
    successMemberAssigned: "팀 멤버를 배정했습니다.",
    successInvitationCreated: "팀 초대를 생성했습니다.",
    successTeamCreated: "팀을 생성했습니다.",
    team: "팀",
    teamCount: "{count}개 팀",
    teamName: "팀 이름",
    teamRole: "팀 역할",
    title: "팀 RBAC 관리",
  },
  teamInvite: {
    accepted: "팀 초대를 수락했습니다. 이제 워크스페이스를 열 수 있습니다.",
    accepting: "수락 중...",
    acceptInvitation: "초대 수락",
    auditBody: "초대를 수락하면 검토용 감사 이벤트가 기록됩니다.",
    auditTitle: "감사되는 참여",
    body:
      "팀 초대로 접근 제어를 우회하지 않고 올바른 조직과 팀에 참여하세요.",
    cardTitle: "DocuMind 팀 참여",
    emailMismatchBody:
      "로그아웃한 뒤 이 초대를 받은 이메일 주소로 로그인하세요.",
    emailMismatchTitle: "이 초대는 다른 계정용입니다",
    eyebrow: "팀 초대",
    fallbackError: "이 팀 초대를 수락할 수 없습니다.",
    invalidBody: "조직 관리자에게 새 초대 링크 생성을 요청하세요.",
    invalidTitle: "이 초대 링크가 잘못되었거나 만료되었습니다.",
    organization: "조직",
    secureBody:
      "초대 토큰은 서버에서 확인되며 한 번만 사용할 수 있습니다.",
    secureTitle: "1회용 토큰",
    signInBody:
      "초대받은 이메일 주소로 로그인하거나 계정을 만들어 팀 초대를 수락하세요.",
    team: "팀",
    title: "팀 워크스페이스 접근 수락",
  },
};

const ja = {
  ...en,
  meta: {
    description:
      "日本・韓国チーム向けのエージェント対応社内ナレッジ検索システムです。",
    title: "DocuMind",
  },
  common: {
    adminAudit: "組織監査",
    ask: "質問する",
    auditLogs: "監査ログ",
    backToDashboard: "ダッシュボードへ戻る",
    cancel: "キャンセル",
    dashboard: "ダッシュボード",
    delete: "削除",
    documents: "文書",
    email: "メール",
    forgotPassword: "パスワードをお忘れですか？",
    home: "ホーム",
    language: "言語",
    login: "ログイン",
    logout: "ログアウト",
    name: "名前",
    password: "パスワード",
    homeLink: "DocuMindホーム",
    primaryNavigation: "主要ナビゲーション",
    resetPassword: "パスワード再設定",
    search: "検索",
    signup: "登録",
    userFallback: "ユーザー",
  },
  auth: {
    ...en.auth,
    accountRecovery: "アカウント復旧",
    accountSetup: "アカウント設定",
    alreadyHaveAccount: "すでにアカウントをお持ちですか？",
    auditTrail: "監査証跡",
    auditTrailBody: "成功したリクエストとパスワード変更は監査ログに記録されます。",
    createAccount: "アカウント作成",
    createAccountPending: "作成中...",
    createAccountTitle: "非公開ナレッジワークスペースを作成",
    createAccountBody:
      "パスワードアカウントまたは有効なOAuthプロバイダーで開始します。新規ユーザーには非公開ワークスペースが用意され、後で組織管理者が割り当てたチーム文書にもアクセスできます。",
    createAccountFormBody:
      "非公開の文書ワークスペースを作成します。OAuthはデプロイ環境で設定されると表示されます。",
    emailPasswordDescription:
      "メールとパスワードを入力してください。このデプロイでOAuthが設定されている場合は接続済みプロバイダーでも続行できます。",
    forgotFormBody:
      "パスワードアカウントのメールを入力してください。再設定可能な場合は手順を送信します。",
    forgotTitle: "アカウント情報を公開せずにアクセスを復旧",
    forgotBody:
      "DocuMindはパスワードアカウントに1回限りの再設定リンクを送信します。アドレスの有無に関わらず公開レスポンスは同じです。",
    forgotSubmit: "再設定手順を送信",
    forgotSubmitPending: "送信中...",
    forgotSuccess: "アカウントが存在する場合、パスワード再設定手順を送信しました。",
    forgotError: "パスワード再設定をリクエストできません。",
    hidePassword: "パスワードを隠す",
    localResetLink: "ローカル再設定リンクを開く",
    loginTitle: "安全なナレッジワークスペースにログイン",
    loginBody:
      "ワークスペースアカウントまたは有効なOAuthプロバイダーで、非公開文書管理、セマンティック検索、根拠付き回答、監査記録にアクセスします。",
    loginError: "メールとパスワードを確認して再試行してください。",
    loginPending: "ログイン中...",
    needAccount: "アカウントが必要ですか？",
    newPassword: "新しいパスワード",
    oneTimeToken: "1回限りのトークン",
    oneTimeTokenBody: "再設定リンクは期限切れになり、ハッシュ化されたトークンだけが保存されます。",
    ownerScopedData: "アクセススコープのデータ",
    ownerScopedDataBody:
      "文書、チャンク、回答は所有権またはチームメンバーシップでフィルタリングされます。",
    passwordAccount: "パスワードアカウント",
    passwordAccountBody: "このフローはパスワードログインのアカウントだけを更新します。",
    passwordHelp: "12文字以上を使用してください。",
    privateByDefault: "初期状態で非公開",
    privateByDefaultBody:
      "文書と回答はアカウントと割り当てられたチームでフィルタリングされます。",
    rememberPassword: "パスワードを覚えていますか？",
    resetBody:
      "再設定リンクは1回だけ使用でき、短時間で期限切れになります。成功後は新しいパスワードで再度ログインしてください。",
    resetComplete: "パスワードを再設定しました。再度ログインしてください。",
    resetError: "このパスワードを再設定できません。",
    resetFormBody: "12文字以上の新しいパスワードを選択してください。",
    resetMissing: "この再設定リンクにはトークンがありません。",
    resetPending: "再設定中...",
    resetRequestNew: "新しいリンクをリクエスト",
    resetTitle: "DocuMindの新しいパスワードを設定",
    serverOnlySecrets: "サーバー専用シークレット",
    serverOnlySecretsBody: "パスワードハッシュ化とOAuthコールバックはサーバーで実行されます。",
    serverSideAuth: "サーバー側認証",
    serverSideAuthBody: "保護ページとAPIルートは現在のセッションを検証します。",
    serverSideUpdate: "サーバー側更新",
    serverSideUpdateBody: "新しいパスワードは保存前にハッシュ化されます。",
    signInExistingAccount: "このアカウントが存在する場合は現在のパスワードでログインしてください。",
    signupError: "アカウントを作成できません。",
    showPassword: "パスワードを表示",
  },
  apiErrors: {
    ...en.apiErrors,
    "Admin access required.": "管理者アクセスが必要です。",
    "AI provider is rate limiting requests. Try again shortly.":
      "AIプロバイダーがリクエストを制限しています。しばらくしてから再試行してください。",
    "AI provider is temporarily unavailable. Try again shortly.":
      "AIプロバイダーを一時的に利用できません。しばらくしてから再試行してください。",
    "AI provider request failed.": "AIプロバイダーへのリクエストに失敗しました。",
    "AI service is not configured. Contact an administrator.":
      "AIサービスが設定されていません。管理者に連絡してください。",
    "Ask request failed.": "質問リクエストに失敗しました。",
    "Authentication required.": "ログインが必要です。",
    "Content-Type must be application/json.": "Content-Typeはapplication/jsonである必要があります。",
    "Cross-origin request blocked.": "クロスオリジンリクエストがブロックされました。",
    "documentId is required.": "documentIdは必須です。",
    "Document must be READY before summarization.":
      "要約する前に文書がREADY状態である必要があります。",
    "Document not found.": "文書が見つかりません。",
    "Document summarization failed.": "文書要約に失敗しました。",
    "Email, team, organization role, and team role are required.":
      "メール、チーム、組織ロール、チームロールはすべて必須です。",
    "Enter a valid email address.": "有効なメールアドレスを入力してください。",
    "Enter a valid email, name, and password.":
      "有効なメール、名前、パスワードを入力してください。",
    "Enter a valid reset token and password.":
      "有効な再設定トークンとパスワードを入力してください。",
    "Invalid JSON body.": "JSON本文が正しくありません。",
    "Invalid team membership request.": "チームメンバーシップリクエストが正しくありません。",
    "JSON request body must be 16 KB or smaller.":
      "JSONリクエスト本文は16 KB以下である必要があります。",
    "Password must be at least 12 characters.":
      "パスワードは12文字以上である必要があります。",
    "Question must be between 1 and 1000 characters.":
      "質問は1文字以上1000文字以下である必要があります。",
    "Search failed.": "検索に失敗しました。",
    "Search query must be between 1 and 1000 characters.":
      "検索クエリは1文字以上1000文字以下である必要があります。",
    "Team name must be between 1 and 80 characters.":
      "チーム名は1文字以上80文字以下である必要があります。",
    "Team and user are required.": "チームとユーザーは必須です。",
    "Team invitation belongs to another email address.":
      "チーム招待は別のメールアドレスに紐づいています。",
    "Team invitation is invalid or expired.":
      "チーム招待が無効または期限切れです。",
    "Invalid team invitation request.": "チーム招待リクエストが正しくありません。",
    "Team member not found.": "チームメンバーが見つかりません。",
    "Team not found.": "チームが見つかりません。",
    "This password reset link is invalid or expired.":
      "このパスワード再設定リンクは無効または期限切れです。",
    "Too many account creation attempts. Try again shortly.":
      "アカウント作成の試行が多すぎます。しばらくしてから再試行してください。",
    "Too many answer requests. Try again shortly.":
      "回答リクエストが多すぎます。しばらくしてから再試行してください。",
    "Too many password reset attempts. Try again shortly.":
      "パスワード再設定の試行が多すぎます。しばらくしてから再試行してください。",
    "Too many search requests. Try again shortly.":
      "検索リクエストが多すぎます。しばらくしてから再試行してください。",
    "Unsupported locale.": "サポートされていないロケールです。",
    "User must sign up before being added to a team.":
      "チームに追加する前に、ユーザーが登録している必要があります。",
  },
  oauth: {
    continueWith: "{provider}で続行",
    opening: "{provider}を開いています...",
    separator: "または",
  },
  home: {
    ...en.home,
    architectureBody:
      "文書が処理、埋め込み、検索、要約、回答に使われる前に、バックエンドで認可を確認します。",
    architectureEyebrow: "アーキテクチャ",
    architectureTitle: "アップロード -> 解析 -> 分割 -> 埋め込み -> 保存 -> 検索 -> 回答 -> 引用 -> 監査",
    builtWith:
      "Next.js、TypeScript、PostgreSQL、Prisma、pgvector、Auth.js、OpenAI API、Vercelで構築。",
    currentOnly:
      "以下の手順は現在実装済みです。計画段階の項目は上のMVP範囲で分けています。",
    heroBody:
      "DocuMindは日本・韓国チーム向けのagent-readyな社内ナレッジ検索システムです。安全な文書取り込み、アクセススコープのセマンティック検索、根拠付き回答、エージェントが利用できるAPI endpointを組み合わせています。",
    heroEyebrow: "エージェント対応ナレッジ検索",
    heroLocalized:
      "日本・韓国チームの社内ナレッジ検索に向けたバックエンド重視のMVPです。認証、文書処理、セマンティック検索、出典付き回答を提供します。",
    implementedBody:
      "MVPは認証、所有権チェック、文書処理、ベクトル検索、根拠付き回答、監査可能なツールAPIに集中しています。このセクションの機能は現在の製品に実装済みです。",
    implementedEyebrow: "実装済み / 利用可能",
    implementedTitle: "具体的なバックエンドとフルスタックの証拠",
    openDashboard: "ダッシュボードを開く",
    plannedBody: "これらは本番強化のための計画項目で、まだ実装されていません。",
    plannedEyebrow: "今後 / 計画",
    plannedTitle: "現在のMVP範囲外",
    previewHeading: "社内文書インデックス",
    previewLabel: "検索プレビュー",
    previewPlaceholder: "ポリシー、ガイド、プロジェクトノートを検索...",
    previewSubtext: "アクセススコープ検索と出典を意識したAI回答。",
    startNow: "今すぐ開始",
    useProductEyebrow: "製品を使う",
    useProductTitle: "ワークスペースユーザーができること",
    viewImplementation: "実装を見る",
    viewImplementationAria: "GitHubリポジトリのDocuMind実装READMEを見る",
    whyAgentBody:
      "DocuMindは単なるチャットUIではありません。人と将来のAIエージェントが、認証済み・アクセススコープ・監査可能なAPI境界を通じて社内ナレッジにアクセスするための制御レイヤーです。",
    whyAgentEyebrow: "なぜagent-readyか",
    whyAgentLocalized:
      "DocuMindは、人と将来のAIエージェントが認証済み・アクセススコープ・監査可能なAPI境界で社内ナレッジにアクセスする制御レイヤーです。",
    whyAgentTitle: "人とエージェントのための制御されたナレッジレイヤー",
    features: [
      ["保護されたダッシュボードルート", "サーバー側セッションチェックにより、保護コンテンツの表示前に未認証訪問者をリダイレクトします。"],
      ["登録、OAuth、復旧", "Auth.jsがパスワードアカウント、設定済みGoogle/GitHub OAuth、1回限りのパスワード再設定リンクをサポートします。"],
      ["文書管理", "認証済みユーザーは検証済みの.txt、.md、.pdf文書をアップロード、処理、一覧、削除できます。"],
      ["アクセススコープのデータアクセス", "文書読み取り、チャンク、検索、ツール呼び出しは所有権またはチームメンバーシップでフィルタリングされ、削除は所有者だけが可能です。"],
      ["セマンティック検索", "OpenAI埋め込みとPostgreSQL pgvectorが認証済みサーバールートと検索UIで関連チャンクをランク付けします。"],
      ["引用付きの根拠回答", "取得チャンクが回答プロンプトを制限し、UIは出典タイトル、チャンク番号、スニペット、スコアを返します。"],
      ["監査ログとレビュー", "ログイン、アップロード、処理、削除、質問、ツールactionがユーザーと管理者向け監査記録を作成します。"],
      ["MCPとツールendpoint", "認証済みHTTPツールルートとJSON-RPC MCP wrapperが検索、引用付き回答、文書要約を公開します。"],
    ],
    flow: [
      ["アップロード", "メタデータ保存前に種類、サイズ、ファイルbytesを検証します。"],
      ["解析", "TXT、Markdown、PDFからサーバー側でテキストを抽出します。"],
      ["分割", "正規化テキストを制限されたインデックス付き検索単位に分けます。"],
      ["埋め込み", "サーバー側OpenAI clientで不足しているチャンクベクトルを生成します。"],
      ["保存", "文書、チャンク、状態、ベクトルをPostgreSQLに保存します。"],
      ["検索", "所有者/チームフィルター後のアクセス可能なREADYチャンクをpgvectorでランク付けします。"],
      ["回答", "取得した文書コンテキストに制限したプロンプトを作成します。"],
      ["引用", "根拠タイトル、チャンク番号、一致スニペットを返します。"],
      ["監査", "セキュリティ関連のユーザーとツールactionを記録します。"],
    ],
    planned: [
      "エンタープライズSSOとユーザー管理のアカウント連携設定",
      "チーム招待とチームスコープの文書共有",
      "大規模文書パイプライン向けバックグラウンド処理",
      "より豊富なMCPストリーミング/セッション転送",
      "本番レベルの分散レート制限",
    ],
    previewResults: [
      ["日本オンボーディングチェックリスト", "2日前に更新"],
      ["韓国営業支援ブリーフ", "5日前に更新"],
      ["社内文書セキュリティポリシー", "1週間前に更新"],
    ],
    productSteps: [
      "メール/パスワードでアカウントを作成するか、設定済みOAuthプロバイダーで続行します。",
      "Documentsで既存ファイルを確認するか、短い.txt、.md、.pdfファイルをアップロードします。",
      "Searchでセマンティック検索を実行し、一致チャンク、スニペット、スコアを確認します。",
      "アップロード済み文書の内容で根拠付き質問をします。",
      "回答、引用、一致スニペット、情報不足時の動作を確認します。",
      "個人および組織管理者の監査ログで活動を確認します。",
    ],
  },
  dashboard: {
    heroBody:
      "社内ナレッジファイルをアップロードし、準備済み文書チャンクを検索し、1つの保護されたワークスペースで出典付き質問応答を利用できます。",
    title: "ナレッジワークスペース",
    adminOnly: "管理者のみ",
    availableEyebrow: "現在利用可能",
    availableNow: "利用可能",
    availableTitle: "主要ワークスペース操作",
    plannedOnly: "計画中",
    roadmapEyebrow: "MVPロードマップ",
    cards: [
      ["文書管理", "個人文書をアップロード、処理、一覧、削除し、書き込み可能なチームにもアップロードできます。", "文書を管理"],
      ["セマンティック検索", "準備済みチャンクを直接検索し、類似度スコア付きスニペットを確認します。", "文書を検索"],
      ["根拠付き質問応答", "取得チャンクに対して質問し、出典引用を確認します。", "質問する"],
      ["監査ログ確認", "アップロード、処理、質問、エージェントツール利用の記録を自分の活動範囲で確認します。", "監査ログを見る"],
      ["組織監査", "オーナーと管理者は組織メンバーの最近の活動を確認できます。", "組織を確認"],
      ["チームRBAC", "オーナーと管理者はチームを作成し、既存ユーザーを組織ロールとチームロールに割り当てられます。", "チームを管理"],
    ],
    roadmap: [
      ["チーム招待ワークフロー", "現在の管理者割り当て方式に加えて、メール招待とセルフサービス参加フローを追加します。"],
      ["バックグラウンド処理", "大規模デプロイ向けに長い文書処理と埋め込みを耐久性のあるキューへ移します。"],
    ],
  },
  documents: {
    ...en.documents,
    acceptedFormats: "対応形式: .txt、.md、.pdf。最大サイズ: 10 MB。",
    cardBody:
      "個人または書き込み可能なチームスコープにテキスト、Markdown、PDFファイルを追加します。一覧にはアクセス可能な文書が含まれ、削除はアップロードしたオーナーに限定されます。",
    cardTitle: "ナレッジファイルのアップロードと管理",
    characters: "文字",
    chunks: "チャンク",
    confirmDelete: "削除を確定",
    countLabel: "{count}件のファイル",
    deleteWarning:
      "この文書、チャンク、埋め込みを削除します。保存済みファイルを削除できるのはアップロードしたオーナーだけです。",
    emptyBody: "セマンティック検索と根拠付き回答用のチャンクを作成するには、対応ファイルをアップロードしてください。",
    emptyTitle: "まだ文書がアップロードされていません",
    library: "ライブラリ",
    lifecycleBody:
      "アップロードでメタデータを作成し、処理でテキスト抽出と分割を行います。準備完了のファイルは検索と質問に使え、失敗したファイルには理由を表示します。",
    lifecycleTitle: "処理ステータスの流れ",
    notices: {
      "Choose a file before uploading.": "アップロードするファイルを選択してください。",
      "Cross-origin request blocked.": "クロスオリジンリクエストがブロックされました。",
      "Document deleted.": "文書を削除しました。",
      "Document not found.": "文書が見つかりません。",
      "Document operation failed.": "文書操作に失敗しました。",
      "Document upload could not be parsed.": "文書アップロードを解析できませんでした。",
      "Document upload must use multipart form data.": "文書アップロードにはmultipart form dataが必要です。",
      "Document upload requires a valid Content-Length header.":
        "文書アップロードには有効なContent-Lengthヘッダーが必要です。",
      "Document uploaded and processed.": "文書をアップロードして処理しました。",
      "Document uploaded, but text extraction failed.":
        "文書はアップロードされましたが、テキスト抽出に失敗しました。",
      "Files must be 10 MB or smaller.": "ファイルは10 MB以下である必要があります。",
      "Only .txt, .md, and .pdf files are supported.":
        ".txt、.md、.pdfファイルのみ対応しています。",
      "PDF uploads must contain a valid PDF header.":
        "PDFアップロードには有効なPDFヘッダーが必要です。",
      "Selected team is not available for uploads.":
        "選択したチームにはアップロードできません。",
      "Text and Markdown uploads must be text files.":
        "テキストとMarkdownのアップロードはテキストファイルである必要があります。",
      "The file type does not match the selected document format.":
        "ファイル種別が選択した文書形式と一致しません。",
      "The uploaded file is empty.": "アップロードされたファイルは空です。",
      "Too many document delete requests. Try again shortly.":
        "文書削除リクエストが多すぎます。しばらくしてから再試行してください。",
      "Too many document uploads. Try again shortly.":
        "文書アップロードリクエストが多すぎます。しばらくしてから再試行してください。",
    },
    processingErrors: {
      "AI provider is rate limiting requests. Try again shortly.":
        "AIプロバイダーがリクエストを制限しています。しばらくしてから再試行してください。",
      "AI provider is temporarily unavailable. Try again shortly.":
        "AIプロバイダーを一時的に利用できません。しばらくしてから再試行してください。",
      "AI provider request failed.": "AIプロバイダーへのリクエストに失敗しました。",
      "AI service is not configured. Contact an administrator.":
        "AIサービスが設定されていません。管理者に連絡してください。",
      "Document processing failed.": "文書処理に失敗しました。",
      "Extracted document text must be 300,000 characters or fewer.":
        "抽出された文書テキストは300,000文字以下である必要があります。",
      "Files must be 10 MB or smaller.": "ファイルは10 MB以下である必要があります。",
      "No extractable text found in document.": "文書から抽出可能なテキストが見つかりません。",
      "PDF documents must be 50 pages or fewer.": "PDF文書は50ページ以下である必要があります。",
      "Unsupported document type.": "対応していない文書形式です。",
    },
    status: {
      FAILED: "失敗",
      PROCESSING: "処理中",
      READY: "準備完了",
      UPLOADED: "アップロード済み",
    },
    statusHelp: {
      FAILED: "処理が停止しました。理由を確認し、必要に応じて修正したファイルを再アップロードしてください。",
      PROCESSING: "テキスト抽出、分割、または埋め込みがまだ実行中です。",
      READY: "このファイルは検索可能で、根拠付き回答に利用できます。",
      UPLOADED: "ファイルは保存され、処理を待っています。",
    },
    storageBody:
      "ファイルは設定済みストレージプロバイダーを使用し、メタデータとチャンクはPostgreSQLに保持されます。",
    storageTitle: "文書ストレージ",
    personalDocument: "個人",
    personalScope: "個人",
    readOnly: "読み取り専用",
    teamDocument: "チーム: {team}",
    teamScope: "{organization} / {team}",
    upload: "アップロード",
    uploadDocument: "文書をアップロード",
    uploadScope: "アクセス範囲",
    uploadedDocuments: "アップロード済み文書",
  },
  searchPage: {
    body:
      "自然言語クエリを入力すると、アクセス可能なREADY文書から最も関連するチャンクを取得します。OpenAI呼び出しはサーバールート内に留まります。",
    previewBody:
      "結果には、素早く検証できるよう文書タイトル、チャンク番号、スニペット、類似度スコアが含まれます。",
    previewTitle: "取得プレビュー",
    title: "アクセス可能な準備済み文書チャンクを検索",
  },
  searchForm: {
    auditBody:
      "成功した検索は結果件数、制限、クエリ長を監査イベントに記録し、OpenAI認証情報をクライアントに公開しません。",
    auditEyebrow: "監査",
    auditTitle: "検索アクティビティ",
    chunk: "チャンク",
    empty: "このクエリに一致する準備済み文書チャンクはありません。",
    emptyTitle: "一致する結果はありません",
    invalidResult: "検索レスポンスに不正な結果が含まれています。",
    invalidResponse: "検索レスポンスが正しくありません。",
    matches: "{count}件一致",
    noReadyBody:
      "アップロードした文書の処理が完了し、チャンクが作成されると検索を利用できます。",
    noReadyTitle: "まず準備完了の文書をアップロードしてください",
    pending: "検索中...",
    placeholder: "ポリシー、オンボーディングガイド、プロジェクトノートを検索...",
    queryLabel: "検索クエリ",
    readyHintBody:
      "ポリシー、オンボーディング、プロジェクトノートに関するクエリを入力してください。結果はアクセス可能なREADY文書チャンクだけから返されます。",
    readyHintTitle: "準備済み文書を検索",
    required: "検索クエリを入力してください。",
    results: "結果",
    scoreHigh: "高い一致",
    scoreLabel: "一致度",
    scoreLow: "低い一致",
    scoreMedium: "中程度の一致",
    scopeBody:
      "検索はサーバーAPIを通じて実行され、pgvectorでランク付けする前に準備済みチャンクを所有者またはチームメンバーシップでフィルタリングします。",
    scopeEyebrow: "スコープ",
    scopeTitle: "アクセススコープの取得",
    submit: "検索",
    topMatches: "上位一致チャンク",
    uploadReadyCta: "文書を開く",
    fallbackError: "検索に失敗しました。",
  },
  askPage: {
    body:
      "質問はサーバーで埋め込み、アクセス可能な文書チャンクと照合し、取得されたコンテキストだけから回答します。",
    guardrailBody:
      "対応できない質問には、作り話ではなく情報不足の回答を返します。",
    guardrailTitle: "取得ガードレール",
    title: "出典引用付きで質問",
  },
  askForm: {
    answer: "回答",
    ask: "質問する",
    asking: "質問中...",
    chunk: "チャンク",
    citations: "引用",
    insufficient: "情報不足",
    invalidResponse: "質問レスポンスが正しくありません。",
    invalidSources: "質問レスポンスに不正な出典が含まれています。",
    matchedSnippets: "一致スニペット",
    noCitations: "まだ引用はありません。",
    noReadyBody:
      "アップロードした文書がREADYになると質問できます。対応できない質問には情報不足の回答を返します。",
    noReadyTitle: "まず準備完了の文書をアップロードしてください",
    noMatches: "まだ一致はありません。",
    placeholder: "オンボーディングガイドは承認手順について何と説明していますか？",
    question: "質問",
    readyHintBody:
      "READY文書に含まれるポリシー、ガイド、プロジェクトノートについて質問してください。回答は取得されたチャンクの範囲に制限されます。",
    readyHintTitle: "取得した出典から質問",
    required: "質問を入力してください。",
    retrieval: "取得",
    scoreHigh: "高い一致",
    scoreLabel: "一致度",
    scoreLow: "低い一致",
    scoreMedium: "中程度の一致",
    sources: "出典",
    uploadReadyCta: "文書を開く",
    fallbackError: "質問に失敗しました。",
  },
  audit: {
    body:
      "このビューはログインユーザーが作成した監査記録のみを表示します。他ユーザーのログを公開せずに、文書、検索、質問、ツール活動を確認できます。",
    countShown: "{count}件表示",
    emptyBody:
      "文書アップロード、検索、質問、またはツールendpointの利用で自分の監査記録が作成されます。",
    emptyTitle: "まだ監査イベントはありません",
    latest: "最新アクティビティ",
    recentEvents: "直近の監査イベント",
    scopeBody:
      "監査記録を表示する前に、クエリは現在のセッションユーザーでフィルタリングされます。",
    scopeTitle: "ユーザースコープの可視性",
    title: "アカウント活動を確認",
  },
  adminAudit: {
    accessBody: "組織全体の監査ログは組織オーナーと管理者のみ利用できます。",
    accessTitle: "管理者アクセスが必要です",
    adminRole: "管理者ロール",
    body:
      "この管理者ビューは、組織メンバーが作成した最近の監査イベントを表示します。個人活動ログと同じ制限付き監査メタデータ形式を使用します。",
    count: "メンバー{members}人 / イベント{events}件表示",
    emptyBody:
      "サインイン、文書アップロード、検索、質問、ツール利用などのメンバー活動がここに表示されます。",
    emptyTitle: "まだ組織監査イベントはありません",
    latestEvents: "組織全体の監査イベント",
    memberRolePrefix: "組織",
    membersAndTeams: "メンバーとチーム",
    myAuditLogs: "自分の監査ログ",
    organizationRoles: {
      ADMIN: "管理者",
      MEMBER: "メンバー",
      OWNER: "オーナー",
    },
    rbac: "RBAC",
    roleBody: "このワークスペースを組織{role}として表示しています。",
    teamRoles: {
      MANAGER: "マネージャー",
      MEMBER: "メンバー",
      VIEWER: "閲覧者",
    },
    unknownActor: "不明なユーザー",
  },
  teamAdmin: {
    addMemberBody:
      "既存のDocuMindユーザーをこの組織に追加し、チームロールを割り当てます。新規ユーザーは先に登録する必要があります。",
    addMemberSubmit: "メンバーを割り当て",
    addMemberTitle: "既存ユーザーを割り当て",
    addingMember: "割り当て中...",
    body:
      "チームを作成し、既存ユーザーのロール割り当てを管理します。チームRBACはワークスペース管理とチームスコープ文書アクセスの両方を制御します。",
    createTeamBody:
      "この組織内にチームを作成します。現在の管理者はそのチームのマネージャーとして追加されます。",
    createTeamSubmit: "チームを作成",
    createTeamTitle: "チーム作成",
    creatingTeam: "作成中...",
    currentTeams: "現在のチーム",
    existingUsersOnly: "管理者がチームに割り当てるには、ユーザーが先にアカウントを作成する必要があります。",
    fallbackError: "チームRBACの更新に失敗しました。",
    confirmRemoveMember: "メンバーを削除",
    invitationLink: "招待リンク",
    inviteMemberBody:
      "この組織とチームに参加する人向けの1回限りの招待リンクを作成します。",
    inviteMemberSubmit: "招待を作成",
    inviteMemberTitle: "リンクで招待",
    invitingMember: "招待を作成中...",
    memberEmail: "ユーザーメール",
    memberCount: "{count}人",
    noTeams: "まだチームはありません。ロール割り当てを始めるにはチームを作成してください。",
    organizationRole: "組織ロール",
    removeMember: "削除",
    removeMemberWarning:
      "このユーザーのチームロールと、このチーム経由でのみ共有される文書へのアクセスを削除します。",
    removingMember: "削除中...",
    successMemberAssigned: "チームメンバーを割り当てました。",
    successInvitationCreated: "チーム招待を作成しました。",
    successTeamCreated: "チームを作成しました。",
    team: "チーム",
    teamCount: "{count}チーム",
    teamName: "チーム名",
    teamRole: "チームロール",
    title: "チームRBACを管理",
  },
  teamInvite: {
    accepted: "チーム招待を承認しました。ワークスペースを開けます。",
    accepting: "承認中...",
    acceptInvitation: "招待を承認",
    auditBody: "招待を承認すると、レビュー用の監査イベントが記録されます。",
    auditTitle: "監査される参加",
    body:
      "アクセス制御を迂回せず、チーム招待で正しい組織とチームに参加します。",
    cardTitle: "DocuMindチームに参加",
    emailMismatchBody:
      "サインアウトして、この招待を受け取ったメールアドレスでサインインしてください。",
    emailMismatchTitle: "この招待は別のアカウント用です",
    eyebrow: "チーム招待",
    fallbackError: "このチーム招待を承認できません。",
    invalidBody: "組織管理者に新しい招待リンクの作成を依頼してください。",
    invalidTitle: "この招待リンクは無効または期限切れです。",
    organization: "組織",
    secureBody:
      "招待トークンはサーバーで確認され、1回だけ使用できます。",
    secureTitle: "1回限りのトークン",
    signInBody:
      "招待されたメールアドレスでサインインするかアカウントを作成して、チーム招待を承認してください。",
    team: "チーム",
    title: "チームワークスペースへの安全なアクセスを承認",
  },
};

const dictionaries = {
  en,
  ja,
  ko,
};

export type AppDictionary = typeof en;
export type I18nKey = keyof AppDictionary["common"];

export function getDictionary(locale: SupportedLocale): AppDictionary {
  return dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE];
}

export function translate(locale: SupportedLocale, key: I18nKey) {
  return getDictionary(locale).common[key] ?? dictionaries[DEFAULT_LOCALE].common[key];
}

export function formatCopy(template: string, values: Record<string, string | number>) {
  return Object.entries(values).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, String(value)),
    template,
  );
}

export function lookupCopy(copy: Record<string, string>, key: string) {
  return copy[key] ?? key;
}

export function lookupApiError(
  copy: Record<string, string>,
  key: string | null | undefined,
  fallback: string,
) {
  return key ? (copy[key] ?? fallback) : fallback;
}
