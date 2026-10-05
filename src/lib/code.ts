import crypto from "crypto";

// 56-character alphabet excluding ambiguous characters: 0, O, I, l, 1
const UNAMBIGUOUS_ALPHABET = "23456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";

/**
 * Generates a cryptographically secure random slug.
 * @param length Defaults to 6 characters (~30.8 billion permutations)
 */
export function generateCode(length = 6): string {
  const bytes = crypto.randomBytes(length);
  let code = "";
  for (let i = 0; i < length; i++) {
    code += UNAMBIGUOUS_ALPHABET[bytes[i] % UNAMBIGUOUS_ALPHABET.length];
  }
  return code;
}

/**
 * Validates whether a user-supplied custom code is valid for URLs.
 * Allows 3 to 64 alphanumeric characters, dashes, and underscores.
 */
export function isValidCustomCode(code: string): { valid: boolean; error?: string } {
  const trimmed = code.trim();
  if (trimmed.length < 3) {
    return { valid: false, error: "Custom code must be at least 3 characters." };
  }
  if (trimmed.length > 64) {
    return { valid: false, error: "Custom code cannot exceed 64 characters." };
  }
  // URL-safe characters only: letters, digits, underscores, and hyphens
  const regex = /^[a-zA-Z0-9_-]+$/;
  if (!regex.test(trimmed)) {
    return { valid: false, error: "Custom code can only contain letters, numbers, hyphens, and underscores." };
  }
  return { valid: true };
}
