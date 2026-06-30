const auditActionLabels: Record<string, string> = {
  agent_tool_ask_with_citations: "Agent ask with citations",
  agent_tool_search_documents: "Agent document search",
  agent_tool_summarize_document: "Agent document summary",
  demo_user_seeded: "Legacy bootstrap user seeded",
  document_delete: "Document deleted",
  document_process_failed: "Document processing failed",
  document_process_ready: "Document processing ready",
  document_search: "Document search",
  document_upload: "Document uploaded",
  mcp_tool_ask_with_citations: "MCP ask with citations",
  mcp_tool_search_documents: "MCP document search",
  mcp_tool_summarize_document: "MCP document summary",
  oauth_account_linked: "OAuth account linked",
  oauth_user_created: "OAuth user created",
  organization_created: "Organization created",
  password_reset_completed: "Password reset completed",
  password_reset_email_failed: "Password reset email failed",
  password_reset_requested: "Password reset requested",
  question_ask: "Question asked",
  seed_user_created: "Bootstrap user seeded",
  team_created: "Team created",
  user_login: "User signed in",
  user_login_failed: "User sign-in failed",
  user_signed_up: "User signed up",
};

export function formatAuditAction(action: string) {
  return auditActionLabels[action] ?? action.replaceAll("_", " ");
}

export function formatAuditTimestamp(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
