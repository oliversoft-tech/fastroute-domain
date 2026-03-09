export enum DeliveryConfirmationStatus {
  Pending = 'Pending',
  Confirmed = 'Confirmed',
  Rescheduled = 'Rescheduled',
  AddressChanged = 'AddressChanged',
  Expired = 'Expired'
}

export interface DeliveryConfirmation {
  id: string;
  status: DeliveryConfirmationStatus;
  deliveryWindowStart: Date;
  responseReceivedAt?: Date;
  newDate?: Date;
  newAddress?: string;
}

export class DeliveryConfirmationFSM {
  private static readonly CUTOFF_HOURS = 2;

  static transition(
    confirmation: DeliveryConfirmation,
    targetStatus: DeliveryConfirmationStatus,
    data?: { newDate?: Date; newAddress?: string }
  ): DeliveryConfirmation {
    if (confirmation.status === DeliveryConfirmationStatus.Expired) {
      throw new Error('Cannot transition from Expired state');
    }

    if (confirmation.status !== DeliveryConfirmationStatus.Pending) {
      throw new Error(`Invalid transition from ${confirmation.status}`);
    }

    const now = new Date();
    const cutoffTime = new Date(confirmation.deliveryWindowStart);
    cutoffTime.setHours(cutoffTime.getHours() - this.CUTOFF_HOURS);

    if (now >= cutoffTime) {
      return { ...confirmation, status: DeliveryConfirmationStatus.Expired };
    }

    const validTransitions = [
      DeliveryConfirmationStatus.Confirmed,
      DeliveryConfirmationStatus.Rescheduled,
      DeliveryConfirmationStatus.AddressChanged
    ];

    if (!validTransitions.includes(targetStatus)) {
      throw new Error(`Invalid target status: ${targetStatus}`);
    }

    return {
      ...confirmation,
      status: targetStatus,
      responseReceivedAt: now,
      newDate: data?.newDate,
      newAddress: data?.newAddress
    };
  }

  static isExpired(confirmation: DeliveryConfirmation): boolean {
    const now = new Date();
    const cutoffTime = new Date(confirmation.deliveryWindowStart);
    cutoffTime.setHours(cutoffTime.getHours() - this.CUTOFF_HOURS);
    return now >= cutoffTime;
  }
}