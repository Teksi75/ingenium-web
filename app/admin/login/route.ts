import "server-only";
import { startAdminLogin } from "@/lib/admin/auth";
import { adminMethodNotAllowed } from "@/lib/admin/http";

export const runtime = "nodejs";
export const POST = startAdminLogin;
export const GET = adminMethodNotAllowed;
export const HEAD = adminMethodNotAllowed;
export const PUT = adminMethodNotAllowed;
export const PATCH = adminMethodNotAllowed;
export const DELETE = adminMethodNotAllowed;
export const OPTIONS = adminMethodNotAllowed;
