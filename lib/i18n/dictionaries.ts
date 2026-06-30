import { DEFAULT_LOCALE, type SupportedLocale } from "./config";

const dictionaries = {
  en: {
    adminAudit: "Organization audit",
    ask: "Ask questions",
    auditLogs: "Audit logs",
    dashboard: "Dashboard",
    documents: "Documents",
    forgotPassword: "Forgot password?",
    home: "Home",
    language: "Language",
    login: "Sign in",
    logout: "Sign out",
    resetPassword: "Reset password",
    search: "Search",
    signup: "Sign up",
  },
  ja: {
    adminAudit: "組織監査",
    ask: "質問する",
    auditLogs: "監査ログ",
    dashboard: "ダッシュボード",
    documents: "文書",
    forgotPassword: "パスワードをお忘れですか？",
    home: "ホーム",
    language: "言語",
    login: "ログイン",
    logout: "ログアウト",
    resetPassword: "パスワード再設定",
    search: "検索",
    signup: "登録",
  },
  ko: {
    adminAudit: "조직 감사",
    ask: "질문하기",
    auditLogs: "감사 로그",
    dashboard: "대시보드",
    documents: "문서",
    forgotPassword: "비밀번호를 잊으셨나요?",
    home: "홈",
    language: "언어",
    login: "로그인",
    logout: "로그아웃",
    resetPassword: "비밀번호 재설정",
    search: "검색",
    signup: "회원가입",
  },
} as const satisfies Record<SupportedLocale, Record<string, string>>;

export type I18nKey = keyof (typeof dictionaries)[typeof DEFAULT_LOCALE];

export function getDictionary(locale: SupportedLocale) {
  return dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE];
}

export function translate(locale: SupportedLocale, key: I18nKey) {
  return getDictionary(locale)[key] ?? dictionaries[DEFAULT_LOCALE][key];
}
