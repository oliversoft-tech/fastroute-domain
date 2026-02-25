import type { ValidationErr, ValidationOk } from "./types";

export function err(
  error: string,
  code: ValidationErr["code"] = "INVALID_INPUT",
  details?: ValidationErr["details"]
): ValidationErr {
  if (details === undefined) {
    return { ok: false, error, code };
  }

  return { ok: false, error, code, details };
}

export function ok<T>(value: T, warnings?: string[]): ValidationOk<T> {
  if (warnings === undefined) {
    return { ok: true, value };
  }

  return { ok: true, value, warnings };
}
