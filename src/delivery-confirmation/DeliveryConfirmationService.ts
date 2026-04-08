import { DeliveryConfirmation, DeliveryConfirmationFSM, DeliveryConfirmationStatus } from './DeliveryConfirmationState';
import { SMSResponseValidator } from './validators';

export class DeliveryConfirmationService {
  processSMSResponse(confirmation: DeliveryConfirmation, smsMessage: string): DeliveryConfirmation {
    if (DeliveryConfirmationFSM.isExpired(confirmation)) {
      throw new Error('Confirmation window expired (less than 2h before delivery)');
    }

    const parsed = SMSResponseValidator.parseSMSResponse(smsMessage);

    switch (parsed.type) {
      case 'confirm':
        return DeliveryConfirmationFSM.transition(confirmation, DeliveryConfirmationStatus.Confirmed);
      
      case 'reschedule':
        if (!parsed.date) {
          throw new Error('Reschedule requires valid date');
        }
        return DeliveryConfirmationFSM.transition(
          confirmation,
          DeliveryConfirmationStatus.Rescheduled,
          { newDate: parsed.date }
        );
      
      case 'address':
        if (!parsed.address) {
          throw new Error('Address change requires valid address');
        }
        return DeliveryConfirmationFSM.transition(
          confirmation,
          DeliveryConfirmationStatus.AddressChanged,
          { newAddress: parsed.address }
        );
      
      default:
        throw new Error('Unknown SMS response type');
    }
  }
}