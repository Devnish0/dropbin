export const EXPIRY_DURATIONS = {
  "10m": 10 * 60 * 1000,
  "30m": 30 * 60 * 1000,
  "1h": 60 * 60 * 1000,
  "6h": 6 * 60 * 60 * 1000,
  "1d": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
} as const;

export type ExpiryDuration = keyof typeof EXPIRY_DURATIONS;

export const DEFAULT_EXPIRY: ExpiryDuration = "30m";

/**
 * Calculates absolute expiration Date from a duration key.
 * Falls back to 30 minutes if invalid or not specified.
 */
export function calculateExpiresAt(duration?: string): Date {
  const durationMs =
    duration && duration in EXPIRY_DURATIONS
      ? EXPIRY_DURATIONS[duration as ExpiryDuration]
      : EXPIRY_DURATIONS[DEFAULT_EXPIRY];

  return new Date(Date.now() + durationMs);
}
