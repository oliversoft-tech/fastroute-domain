import { ParsedSmsCommand, ConfirmedCommand, RescheduleCommand, AddressChangeCommand } from './types';

const CONFIRMED_PATTERNS = /^(confirmado|ok|sim|confirmo|aceito)$/i;
const RESCHEDULE_PATTERNS = /reagendar|mudar data|nova data/i;
const ADDRESS_PATTERNS = /novo endereco|mudar endereco|endereco:/i;
const DATE_PATTERN = /\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})\b/;

export function parseSmsText(text: string): ParsedSmsCommand | null {
  const normalized = text.trim();
  const now = new Date();

  if (CONFIRMED_PATTERNS.test(normalized)) {
    return {
      type: 'CONFIRMED',
      rawText: text,
      parsedAt: now
    } as ConfirmedCommand;
  }

  if (RESCHEDULE_PATTERNS.test(normalized)) {
    const dateMatch = normalized.match(DATE_PATTERN);
    if (!dateMatch) return null;

    const [_, day, month, year] = dateMatch;
    const fullYear = year.length === 2 ? `20${year}` : year;
    const isoDate = `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

    if (!isValidDate(isoDate)) return null;

    return {
      type: 'RESCHEDULE',
      rawText: text,
      parsedAt: now,
      newDate: isoDate
    } as RescheduleCommand;
  }

  if (ADDRESS_PATTERNS.test(normalized)) {
    const addressStart = normalized.search(ADDRESS_PATTERNS);
    const rawAddress = normalized.substring(addressStart).replace(/^novo endereco:?\s*/i, '').trim();
    if (!rawAddress) return null;

    return {
      type: 'ADDRESS_CHANGE',
      rawText: text,
      parsedAt: now,
      newAddress: normalizeAddress(rawAddress)
    } as AddressChangeCommand;
  }

  return null;
}

function isValidDate(isoDate: string): boolean {
  const date = new Date(isoDate);
  if (isNaN(date.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date >= today;
}

function normalizeAddress(address: string): string {
  return address.replace(/\s+/g, ' ').trim().toLowerCase();
}