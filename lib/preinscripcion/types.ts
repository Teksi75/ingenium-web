import type { preinscripcionConfig, relationshipOptions, targetSchoolOptions } from "./config";

export type RegistrationStatus = "abiertas" | "cerradas" | "suspendidas";
export type GroupId = (typeof preinscripcionConfig.groups)[number]["id"];
export type TargetSchool = (typeof targetSchoolOptions)[number]["value"];
export type Relationship = (typeof relationshipOptions)[number]["value"];
export type FormStep = 1 | 2 | 3 | 4;

// Normalized public submission only. Cycle/status, consent versions and timestamps
// are server-owned; idempotency belongs in the Idempotency-Key HTTP header.
export interface SubmissionData {
  studentName: string;
  birthDate: string;
  primarySchool: string;
  targetSchool: TargetSchool;
  otherSchool: string;
  guardianName: string;
  relationship: Relationship;
  whatsapp: string;
  email: string;
  locality: string;
  groups: GroupId[];
  firstPreference: GroupId | null;
  scheduleNotes: string;
  difficultSubjects: string;
  pedagogicalNotes: string;
  referralSource: string;
  acceptedProgram: true;
  acceptedPrivacy: true;
  website: string;
}

// UI working state stays in memory only, never localStorage or a persistent cache.
export type PreinscripcionFormData = Omit<SubmissionData,
  "targetSchool" | "relationship" | "acceptedProgram" | "acceptedPrivacy"
> & {
  targetSchool: TargetSchool | "";
  relationship: Relationship | "";
  acceptedProgram: boolean;
  acceptedPrivacy: boolean;
};

// Field keys plus _form for malformed payloads or forbidden properties.
export type ValidationErrors = Record<string, string>;
export type ValidationResult =
  | { ok: true; data: SubmissionData }
  | { ok: false; errors: ValidationErrors };
