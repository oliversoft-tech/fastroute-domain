import { parseSmsText } from '../parser';
import { ParsedSmsCommand } from '../types';

describe('parseSmsText', () => {
  it('parses confirmed variations', () => {
    const inputs = ['confirmado', 'CONFIRMADO', 'ok', 'Sim', 'aceito'];
    inputs.forEach(input => {
      const result = parseSmsText(input);
      expect(result?.type).toBe('CONFIRMED');
    });
  });

  it('parses reschedule with valid date', () => {
    const result = parseSmsText('reagendar para 25/12/2024');
    expect(result?.type).toBe('RESCHEDULE');
    if (result?.type === 'RESCHEDULE') {
      expect(result.newDate).toBe('2024-12-25');
    }
  });

  it('rejects past dates', () => {
    const result = parseSmsText('reagendar para 01/01/2020');
    expect(result).toBeNull();
  });

  it('parses address change', () => {
    const result = parseSmsText('novo endereco: Rua das Flores, 123');
    expect(result?.type).toBe('ADDRESS_CHANGE');
    if (result?.type === 'ADDRESS_CHANGE') {
      expect(result.newAddress).toBe('rua das flores, 123');
    }
  });

  it('returns null for unrecognized text', () => {
    const result = parseSmsText('mensagem aleatoria');
    expect(result).toBeNull();
  });
});