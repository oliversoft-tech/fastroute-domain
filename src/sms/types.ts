export type SmsCommandType = 'CONFIRMED' | 'RESCHEDULE' | 'ADDRESS_CHANGE';

export interface SmsCommand {
  type: SmsCommandType;
  rawText: string;
  parsedAt: Date;
}

export interface ConfirmedCommand extends SmsCommand {
  type: 'CONFIRMED';
}

export interface RescheduleCommand extends SmsCommand {
  type: 'RESCHEDULE';
  newDate: string;
}

export interface AddressChangeCommand extends SmsCommand {
  type: 'ADDRESS_CHANGE';
  newAddress: string;
}

export type ParsedSmsCommand = ConfirmedCommand | RescheduleCommand | AddressChangeCommand;