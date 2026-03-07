import { DeliveryConfirmationFSM, RescheduleData, AddressChangeData } from '../types/delivery-confirmation';
import { DeliveryConfirmationValidator } from '../validators/delivery-confirmation-validator';

export class DeliveryConfirmationService {
  confirmDelivery(fsm: DeliveryConfirmationFSM): void {
    fsm.transition('confirmed');
  }

  rescheduleDelivery(fsm: DeliveryConfirmationFSM, data: RescheduleData): void {
    DeliveryConfirmationValidator.validateReschedule(data);
    fsm.transition('rescheduled', { newDate: data.newDate, reason: data.reason });
  }

  changeAddress(fsm: DeliveryConfirmationFSM, data: AddressChangeData): void {
    DeliveryConfirmationValidator.validateAddressChange(data);
    fsm.transition('address_changed', {
      newAddress: data.newAddress,
      coordinates: { lat: data.latitude, lng: data.longitude }
    });
  }
}