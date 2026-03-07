import { InvalidStateTransitionError } from './DeliveryNotificationState';

export interface OperationalWindow {
  startHour: number;
  endHour: number;
  daysOfWeek: number[];
  holidays: Date[];
}

export interface AlternativeAddress {
  street: string;
  number: string;
  city: string;
  state: string;
  zipCode: string;
  complement?: string;
}

export class InvalidRescheduleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidRescheduleError';
  }
}

export class InvalidAddressError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidAddressError';
  }
}

export function validateRescheduleDate(newDate: Date, window: OperationalWindow): void {
  const now = new Date();
  if (newDate <= now) {
    throw new InvalidRescheduleError('Data de reagendamento não pode ser retroativa');
  }

  const dayOfWeek = newDate.getDay();
  if (!window.daysOfWeek.includes(dayOfWeek)) {
    throw new InvalidRescheduleError('Data fora dos dias operacionais');
  }

  const isHoliday = window.holidays.some(h => 
    h.getFullYear() === newDate.getFullYear() &&
    h.getMonth() === newDate.getMonth() &&
    h.getDate() === newDate.getDate()
  );
  if (isHoliday) {
    throw new InvalidRescheduleError('Data coincide com feriado cadastrado');
  }

  const hour = newDate.getHours();
  if (hour < window.startHour || hour >= window.endHour) {
    throw new InvalidRescheduleError(`Horário fora da janela operacional (${window.startHour}h-${window.endHour}h)`);
  }
}

export function validateAlternativeAddress(address: Partial<AlternativeAddress>): AlternativeAddress {
  if (!address.street || address.street.trim().length < 3) {
    throw new InvalidAddressError('Rua deve ter pelo menos 3 caracteres');
  }
  if (!address.number || address.number.trim().length === 0) {
    throw new InvalidAddressError('Número é obrigatório');
  }
  if (!address.city || address.city.trim().length < 2) {
    throw new InvalidAddressError('Cidade deve ter pelo menos 2 caracteres');
  }
  if (!address.state || address.state.trim().length !== 2) {
    throw new InvalidAddressError('Estado deve ter 2 caracteres (UF)');
  }
  if (!address.zipCode || !/^\d{5}-?\d{3}$/.test(address.zipCode)) {
    throw new InvalidAddressError('CEP inválido (formato: 00000-000)');
  }

  return {
    street: address.street.trim(),
    number: address.number.trim(),
    city: address.city.trim(),
    state: address.state.trim().toUpperCase(),
    zipCode: address.zipCode.replace(/\D/g, '').replace(/(\d{5})(\d{3})/, '$1-$2'),
    complement: address.complement?.trim()
  };
}