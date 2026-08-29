import { createHash } from "crypto";

export function hashAnswer(answer: string): string {
  return createHash("sha256").update(answer.trim().toLowerCase()).digest("hex");
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
