import { methodNotAllowed, submitPreinscripcion } from "../../../lib/preinscripcion/server";

export const runtime = "nodejs";
export const POST = submitPreinscripcion;
export const GET = methodNotAllowed;
export const HEAD = methodNotAllowed;
export const PUT = methodNotAllowed;
export const PATCH = methodNotAllowed;
export const DELETE = methodNotAllowed;
export const OPTIONS = methodNotAllowed;
