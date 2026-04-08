export class SMSResponseValidator {
  private static readonly DATE_REGEX_DDMMYYYY = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  private static readonly DATE_REGEX_ISO = /^(\d{4})-(\d{2})-(\d{2})$/;
  private static readonly CEP_REGEX = /^\d{5}-?\d{3}$/;

  static validateAndNormalizeDate(dateStr: string): Date {
    let match = this.DATE_REGEX_DDMMYYYY.exec(dateStr.trim());
    if (match) {
      const [, day, month, year] = match;
      const date = new Date(`${year}-${month}-${day}`);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date values');
      }
      return date;
    }

    match = this.DATE_REGEX_ISO.exec(dateStr.trim());
    if (match) {
      const date = new Date(dateStr.trim());
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date values');
      }
      return date;
    }

    throw new Error('Date format must be dd/mm/yyyy or yyyy-mm-dd');
  }

  static validateAddress(address: string): boolean {
    const trimmed = address.trim();
    const hasCEP = this.CEP_REGEX.test(trimmed);
    if (hasCEP) return true;

    const hasStreet = /[a-zA-Z]{3,}/.test(trimmed);
    const hasNumber = /\d+/.test(trimmed);

    if (hasStreet && hasNumber) return true;

    throw new Error('Address must contain street and number or valid CEP');
  }

  static parseSMSResponse(message: string): {
    type: 'confirm' | 'reschedule' | 'address';
    date?: Date;
    address?: string;
  } {
    const lower = message.toLowerCase();

    if (lower.includes('confirmar') || lower.includes('ok')) {
      return { type: 'confirm' };
    }

    const dateMatch = message.match(/\d{2}\/\d{2}\/\d{4}|\d{4}-\d{2}-\d{2}/);
    if (dateMatch) {
      return {
        type: 'reschedule',
        date: this.validateAndNormalizeDate(dateMatch[0])
      };
    }

    if (lower.includes('endereço') || lower.includes('endereco') || this.CEP_REGEX.test(message)) {
      this.validateAddress(message);
      return { type: 'address', address: message.trim() };
    }

    throw new Error('Unable to parse SMS response');
  }
}