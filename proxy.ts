import { NextRequest, NextResponse } from "next/server";
import {
  I18N_LOCALE_HEADER,
  getLocaleCookieName,
  getLocaleCookieOptions,
  readLocalePrefixedPath,
} from "./lib/i18n/routing";

export function proxy(request: NextRequest) {
  const localePath = readLocalePrefixedPath(request.nextUrl.pathname);

  if (!localePath) {
    return NextResponse.next();
  }

  const rewrittenUrl = request.nextUrl.clone();
  rewrittenUrl.pathname = localePath.pathname;

  const headers = new Headers(request.headers);
  headers.set(I18N_LOCALE_HEADER, localePath.locale);

  const response = NextResponse.rewrite(rewrittenUrl, {
    request: {
      headers,
    },
  });

  response.cookies.set(
    getLocaleCookieName(),
    localePath.locale,
    getLocaleCookieOptions(),
  );

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)",
  ],
};
