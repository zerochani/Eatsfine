export function toHHmm(
  input: { hour?: number; minute?: number } | string | undefined | null,
) {
  if (!input) return undefined;

  if (typeof input === "string") {
    const s = input.trim();
    if (!s) return undefined;

    if (s.includes("undefined") || s.includes("NaN") || s.includes("null"))
      return undefined;
    const m = s.match(/^(\d{1,2}):(\d{1,2})(?::\d{1,2})?$/);
    if (!m) return undefined;
    const hh = Number(m[1]);
    const mm = Number(m[2]);
    if (!Number.isFinite(hh) || !Number.isFinite(mm)) return undefined;
    return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
  }
  const { hour, minute } = input;
  if (hour == null || minute == null) return undefined;

  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}
