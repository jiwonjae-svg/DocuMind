import { auth } from "@/auth";
import { CROSS_ORIGIN_REQUEST_ERROR } from "@/lib/api/request-origin";
import {
  AUDIT_LOG_EXPORT_LIMIT,
  buildAuditLogCsv,
  buildAuditLogExportContentDisposition,
} from "@/lib/audit/export";
import {
  buildOrganizationAuditLogWhere,
  getOrganizationAdminContext,
} from "@/lib/auth/rbac";
import {
  I18N_COOKIE_NAME,
  normalizeLocale,
  readPreferredLocaleFromAcceptLanguage,
} from "@/lib/i18n/config";
import { prisma } from "@/lib/prisma";
import { readIpAddress, readUserAgent } from "@/lib/tools/response";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

function isCrossSiteAuditExportRequest(request: NextRequest) {
  const fetchSite = request.headers.get("sec-fetch-site")?.trim().toLowerCase();

  return fetchSite === "cross-site" || fetchSite === "same-site";
}

function readRequestLocale(request: NextRequest) {
  const cookieLocale = request.cookies.get(I18N_COOKIE_NAME)?.value;

  return cookieLocale
    ? normalizeLocale(cookieLocale)
    : readPreferredLocaleFromAcceptLanguage(
        request.headers.get("accept-language"),
      );
}

function redirectToLogin(request: NextRequest) {
  return NextResponse.redirect(
    new URL("/login?callbackUrl=/dashboard/admin/audit-logs", request.url),
  );
}

export async function GET(request: NextRequest) {
  if (isCrossSiteAuditExportRequest(request)) {
    return NextResponse.json(
      { error: CROSS_ORIGIN_REQUEST_ERROR },
      { status: 403 },
    );
  }

  const session = await auth();

  if (!session?.user?.id) {
    return redirectToLogin(request);
  }

  const context = await getOrganizationAdminContext({
    organizationId: request.nextUrl.searchParams.get("organizationId"),
    userId: session.user.id,
  });

  if (!context) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const memberUserIds = context.organization.memberships.map(
    (member) => member.userId,
  );
  const auditLogs = await prisma.auditLog.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      action: true,
      actor: {
        select: {
          email: true,
          name: true,
        },
      },
      createdAt: true,
      ipAddress: true,
      metadata: true,
      resourceId: true,
      resourceType: true,
      userAgent: true,
    },
    take: AUDIT_LOG_EXPORT_LIMIT,
    where: buildOrganizationAuditLogWhere(memberUserIds),
  });
  const csv = buildAuditLogCsv(auditLogs, readRequestLocale(request));

  await prisma.auditLog.create({
    data: {
      action: "organization_audit_exported",
      actorId: session.user.id,
      ipAddress: readIpAddress(request),
      metadata: {
        exportedCount: auditLogs.length,
        limit: AUDIT_LOG_EXPORT_LIMIT,
        memberCount: memberUserIds.length,
        organizationId: context.organization.id,
      },
      resourceId: context.organization.id,
      resourceType: "Organization",
      userAgent: readUserAgent(request),
    },
  });

  return new NextResponse(csv, {
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Disposition": buildAuditLogExportContentDisposition(),
      "Content-Length": String(Buffer.byteLength(csv, "utf8")),
      "Content-Type": "text/csv; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
