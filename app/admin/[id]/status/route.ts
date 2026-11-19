import "server-only";
import { updateRegistrationStatus } from "@/lib/admin/registration-actions";
import { adminMethodNotAllowed } from "@/lib/admin/http";

export const runtime = "nodejs";
function privateResponse(response: Response): Response {
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
export async function POST(request: Request, context: { params: Promise<{ id: string }> }): Promise<Response> {
  const { id } = await context.params;
  return privateResponse(await updateRegistrationStatus(request, id));
}
function unsupported(request: Request): Response {
  return privateResponse(adminMethodNotAllowed(request));
}
export const GET = unsupported;
export const HEAD = unsupported;
export const PUT = unsupported;
export const PATCH = unsupported;
export const DELETE = unsupported;
export const OPTIONS = unsupported;
