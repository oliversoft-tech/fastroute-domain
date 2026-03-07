import { DeliveryNotificationState, validateTransition, InvalidStateTransitionError } from './DeliveryNotificationState';
import { validateRescheduleDate, validateAlternativeAddress, OperationalWindow, AlternativeAddress, InvalidRescheduleError, InvalidAddressError } from './DeliveryNotificationValidation';

export interface DeliveryNotificationEvent {
  type: 'send' | 'confirm' | 'reschedule' | 'changeAddress' | 'fail' | 'retry';
  timestamp: Date;
  metadata?: {
    newDate?: Date;
    alternativeAddress?: Partial<AlternativeAddress>;
    reason?: string;
  };
}

export class DeliveryNotificationFSM {
  private currentState: DeliveryNotificationState;
  private history: DeliveryNotificationEvent[] = [];

  constructor(
    private readonly operationalWindow: OperationalWindow,
    initialState: DeliveryNotificationState = DeliveryNotificationState.Pendente
  ) {
    this.currentState = initialState;
  }

  getState(): DeliveryNotificationState {
    return this.currentState;
  }

  getHistory(): DeliveryNotificationEvent[] {
    return [...this.history];
  }

  transition(event: DeliveryNotificationEvent): void {
    const targetState = this.mapEventToState(event);
    validateTransition(this.currentState, targetState);

    if (event.type === 'reschedule' && event.metadata?.newDate) {
      validateRescheduleDate(event.metadata.newDate, this.operationalWindow);
    }

    if (event.type === 'changeAddress' && event.metadata?.alternativeAddress) {
      validateAlternativeAddress(event.metadata.alternativeAddress);
    }

    this.currentState = targetState;
    this.history.push(event);
  }

  private mapEventToState(event: DeliveryNotificationEvent): DeliveryNotificationState {
    switch (event.type) {
      case 'send': return DeliveryNotificationState.Enviado;
      case 'confirm': return DeliveryNotificationState.Confirmado;
      case 'reschedule': return DeliveryNotificationState.Reagendado;
      case 'changeAddress': return DeliveryNotificationState.EnderecoAlterado;
      case 'fail': return DeliveryNotificationState.Falhou;
      case 'retry': return DeliveryNotificationState.Pendente;
      default: throw new Error(`Tipo de evento desconhecido: ${event.type}`);
    }
  }
}

export { DeliveryNotificationState, InvalidStateTransitionError, InvalidRescheduleError, InvalidAddressError };