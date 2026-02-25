import { z } from "zod";
import type { JwtProviderResult, JwtValidationInput, ValidationResult } from "./types";
import { err, ok } from "./errors";

/**
 * Structural validation: do we have an Authorization header/token?
 * Mirrors the n8n expectation that auth_token must be present.
 */
export function validateJwtInput(input: JwtValidationInput): ValidationResult<{ token: string }> {
  const schema = z.object({
    authorization: z.string().min(1)
  });

  const parsed = schema.safeParse({ authorization: input.authorization ?? "" });
  if (!parsed.success) {
    return err("Authorization token ausente.", "UNAUTHORIZED");
  }

  const token = parsed.data.authorization.trim();
  return ok({ token });
}

/**
 * Normalize a provider (Supabase) response to a domain result.
 * In your n8n flows, `id` presence implies valid token; empty implies invalid.
 */
export function normalizeJwtProviderResult(res: JwtProviderResult): ValidationResult<{ userId: string }> {
  const id = (res.id ?? "")?.toString().trim();
  if (!id) {
    return err(res.error?.toString() || "JWT inválido ou expirado.", "UNAUTHORIZED");
  }
  return ok({ userId: id });
}
