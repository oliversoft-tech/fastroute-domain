export enum DeliveryNotificationState {
  Pendente = 'Pendente',
  Enviado = 'Enviado',
  Confirmado = 'Confirmado',
  Reagendado = 'Reagendado',
  EnderecoAlterado = 'EnderecoAlterado',
  Falhou = 'Falhou'
}

export interface DeliveryNotificationTransition {
  from: DeliveryNotificationState;
  to: DeliveryNotificationState;
  allowed: boolean;
}

const ALLOWED_TRANSITIONS: Record<DeliveryNotificationState, DeliveryNotificationState[]> = {
  [DeliveryNotificationState.Pendente]: [DeliveryNotificationState.Enviado, DeliveryNotificationState.Falhou],
  [DeliveryNotificationState.Enviado]: [DeliveryNotificationState.Confirmado, DeliveryNotificationState.Reagendado, DeliveryNotificationState.EnderecoAlterado, DeliveryNotificationState.Falhou],
  [DeliveryNotificationState.Confirmado]: [],
  [DeliveryNotificationState.Reagendado]: [DeliveryNotificationState.Enviado, DeliveryNotificationState.Falhou],
  [DeliveryNotificationState.EnderecoAlterado]: [DeliveryNotificationState.Enviado, DeliveryNotificationState.Falhou],
  [DeliveryNotificationState.Falhou]: [DeliveryNotificationState.Pendente]
};

export class InvalidStateTransitionError extends Error {
  constructor(from: DeliveryNotificationState, to: DeliveryNotificationState) {
    super(`Transição inválida de ${from} para ${to}`);
    this.name = 'InvalidStateTransitionError';
  }
}

export function validateTransition(from: DeliveryNotificationState, to: DeliveryNotificationState): void {
  const allowed = ALLOWED_TRANSITIONS[from] || [];
  if (!allowed.includes(to)) {
    throw new InvalidStateTransitionError(from, to);
  }
}

export function canTransition(from: DeliveryNotificationState, to: DeliveryNotificationState): boolean {
  const allowed = ALLOWED_TRANSITIONS[from] || [];
  return allowed.includes(to);
}