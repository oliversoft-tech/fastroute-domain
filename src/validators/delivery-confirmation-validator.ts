import { RescheduleData, AddressChangeData } from '../types/delivery-confirmation';

export class DeliveryConfirmationValidator {
  static validateReschedule(data: RescheduleData): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newDate = new Date(data.newDate);
    newDate.setHours(0, 0, 0, 0);

    if (newDate < today) {
      throw new Error('Cannot reschedule to a date in the past');
    }
  }

  static validateAddressChange(data: AddressChangeData): void {
    if (!data.newAddress || data.newAddress.trim().length === 0) {
      throw new Error('New address is required');
    }

    if (typeof data.latitude !== 'number' || data.latitude < -90 || data.latitude > 90) {
      throw new Error('Valid latitude is required (-90 to 90)');
    }

    if (typeof data.longitude !== 'number' || data.longitude < -180 || data.longitude > 180) {
      throw new Error('Valid longitude is required (-180 to 180)');
    }
  }
}