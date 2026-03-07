export type DeliveryConfirmationState = 'pending_confirmation' | 'confirmed' | 'rescheduled' | 'address_changed';

export interface DeliveryConfirmationTransition {
  from: DeliveryConfirmationState;
  to: DeliveryConfirmationState;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface RescheduleData {
  newDate: Date;
  reason?: string;
}

export interface AddressChangeData {
  newAddress: string;
  latitude: number;
  longitude: number;
}

export class DeliveryConfirmationFSM {
  private currentState: DeliveryConfirmationState;
  private transitions: DeliveryConfirmationTransition[] = [];

  constructor(initialState: DeliveryConfirmationState = 'pending_confirmation') {
    this.currentState = initialState;
  }

  getState(): DeliveryConfirmationState {
    return this.currentState;
  }

  canTransition(to: DeliveryConfirmationState): boolean {
    const validTransitions: Record<DeliveryConfirmationState, DeliveryConfirmationState[]> = {
      pending_confirmation: ['confirmed', 'rescheduled', 'address_changed'],
      confirmed: [],
      rescheduled: ['confirmed', 'address_changed'],
      address_changed: ['confirmed', 'rescheduled']
    };
    return validTransitions[this.currentState]?.includes(to) ?? false;
  }

  transition(to: DeliveryConfirmationState, metadata?: Record<string, any>): void {
    if (!this.canTransition(to)) {
      throw new Error(`Invalid transition from ${this.currentState} to ${to}`);
    }
    this.transitions.push({
      from: this.currentState,
      to,
      timestamp: new Date(),
      metadata
    });
    this.currentState = to;
  }

  getHistory(): DeliveryConfirmationTransition[] {
    return [...this.transitions];
  }
}