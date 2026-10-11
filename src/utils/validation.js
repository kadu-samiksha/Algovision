export const MAX_ARRAY_LENGTH = 40;
export const MIN_VALUE = -999;
export const MAX_VALUE = 999;

/** Parses "5, 3, -2 8" into integers. Returns { ok, values } or { ok: false, error }. */
export function parseArrayInput(text) {
  const trimmed = String(text ?? '').trim();
  if (!trimmed) {
    return { ok: false, error: 'Enter at least one whole number, separated by commas or spaces.' };
  }
  const tokens = trimmed.split(/[\s,;]+/).filter(Boolean);
  const bad = tokens.find((t) => !/^[+-]?\d+$/.test(t));
  if (bad !== undefined) {
    return { ok: false, error: `"${bad}" is not a whole number. Use integers such as 5, -2 or 40.` };
  }
  const values = tokens.map((t) => Number(t) + 0); // + 0 turns -0 into 0
  if (values.length > MAX_ARRAY_LENGTH) {
    return { ok: false, error: `Use at most ${MAX_ARRAY_LENGTH} numbers (you entered ${values.length}).` };
  }
  const outOfRange = values.find((v) => v < MIN_VALUE || v > MAX_VALUE);
  if (outOfRange !== undefined) {
    return { ok: false, error: `${outOfRange} is out of range. Keep values between ${MIN_VALUE} and ${MAX_VALUE}.` };
  }
  return { ok: true, values };
}

/** Parses one whole number. `label` is used in the error message. */
export function parseInteger(text, label = 'value', min = MIN_VALUE, max = MAX_VALUE) {
  const t = String(text ?? '').trim();
  if (!t) return { ok: false, error: `Enter a ${label}.` };
  if (!/^[+-]?\d+$/.test(t)) return { ok: false, error: `"${t}" is not a whole number. Enter a ${label} such as 7 or -3.` };
  const value = Number(t) + 0;
  if (value < min || value > max) return { ok: false, error: `Keep the ${label} between ${min} and ${max}.` };
  return { ok: true, value };
}
