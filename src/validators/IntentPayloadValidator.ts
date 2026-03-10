import { IntentPayload, IntentType, ReschedulePayload, ChangeAddressPayload } from '../aggregates/RecipientIntent';

export class IntentPayloadValidator {
  static validate(type: IntentType, payload: IntentPayload): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (type === 'confirm') {
      if (payload !== null) {
        errors.push('Confirm intent must have null payload');
      }
      return { valid: errors.length === 0, errors };
    }

    if (type === 'ambiguous') {
      return { valid: true, errors: [] };
    }

    if (type === 'reschedule') {
      if (!payload) {
        errors.push('Reschedule intent requires payload');
        return { valid: false, errors };
      }
      const reschedule = payload as ReschedulePayload;
      if (!reschedule.newDate || !(reschedule.newDate instanceof Date)) {
        errors.push('Reschedule requires valid newDate');
      }
      if (reschedule.newDate && reschedule.newDate <= new Date()) {
        errors.push('Reschedule newDate must be in the future');
      }
      const maxFuture = new Date();
      maxFuture.setDate(maxFuture.getDate() + 30);
      if (reschedule.newDate && reschedule.newDate > maxFuture) {
        errors.push('Reschedule newDate cannot exceed 30 days');
      }
      return { valid: errors.length === 0, errors };
    }

    if (type === 'change_address') {
      if (!payload) {
        errors.push('Change address intent requires payload');
        return { valid: false, errors };
      }
      const address = payload as ChangeAddressPayload;
      if (!address.newAddress || address.newAddress.trim().length < 10) {
        errors.push('New address must have at least 10 characters');
      }
      if (address.newAddress && address.newAddress.length > 200) {
        errors.push('New address cannot exceed 200 characters');
      }
      return { valid: errors.length === 0, errors };
    }

    errors.push(`Unknown intent type: ${type}`);
    return { valid: false, errors };
  }
}