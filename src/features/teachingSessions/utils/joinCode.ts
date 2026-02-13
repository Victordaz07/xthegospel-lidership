/**
 * Session Join Code
 *
 * Formato: XTG- + 6 chars [A-Z0-9]
 * Sin caracteres confusos: evita O/0, I/1
 * A prueba de miembros creativos (hacks).
 */

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No O, 0, I, 1

export function generateJoinCode(): string {
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
  }
  return `XTG-${code}`;
}

/** Valida formato XTG-XXXXXX (6 chars alfanuméricos) */
export function isValidJoinCode(code: string): boolean {
  if (!code || typeof code !== 'string') return false;
  const normalized = code.trim().toUpperCase();
  return /^XTG-[A-Z0-9]{6}$/.test(normalized);
}

/** Normaliza para lookup (sin espacios, mayúsculas) */
export function normalizeJoinCode(code: string): string {
  return code.replace(/[\s-]/g, '').toUpperCase();
}

/** Formatea para display/query: XTG-XXXXXX */
export function formatJoinCodeForDisplay(normalized: string): string {
  if (normalized.length !== 9) return normalized; // XTG + 6 chars
  return `XTG-${normalized.slice(3)}`;
}
