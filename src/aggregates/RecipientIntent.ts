import { v4 as uuidv4 } from 'uuid';

export type IntentType = 'confirm' | 'reschedule' | 'change_address' | 'ambiguous';
export type IntentStatus = 'pending' | 'applied' | 'rejected' | 'expired';

export interface ReschedulePayload {
  newDate: Date;
  reason?: string;
}

export interface ChangeAddressPayload {
  newAddress: string;
  complement?: string;
  reference?: string;
}

export type IntentPayload = ReschedulePayload | ChangeAddressPayload | null;

export interface RecipientIntentProps {
  id: string;
  deliveryId: string;
  recipientId: string;
  type: IntentType;
  payload: IntentPayload;
  rawMessage: string;
  status: IntentStatus;
  parsingAttempts: number;
  createdAt: Date;
  processedAt?: Date;
  expiresAt: Date;
  rejectionReason?: string;
}

export class RecipientIntent {
  private props: RecipientIntentProps;

  constructor(props: RecipientIntentProps) {
    this.props = props;
  }

  static create(deliveryId: string, recipientId: string, rawMessage: string, type: IntentType, payload: IntentPayload): RecipientIntent {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    return new RecipientIntent({
      id: uuidv4(),
      deliveryId,
      recipientId,
      type,
      payload,
      rawMessage,
      status: 'pending',
      parsingAttempts: 1,
      createdAt: now,
      expiresAt
    });
  }

  incrementParsingAttempt(): void {
    this.props.parsingAttempts += 1;
  }

  markAsAmbiguous(): void {
    this.props.type = 'ambiguous';
    this.props.payload = null;
  }

  apply(): void {
    if (this.isExpired()) {
      throw new Error('Cannot apply expired intent');
    }
    this.props.status = 'applied';
    this.props.processedAt = new Date();
  }

  reject(reason: string): void {
    this.props.status = 'rejected';
    this.props.rejectionReason = reason;
    this.props.processedAt = new Date();
  }

  expire(): void {
    if (this.props.status === 'pending') {
      this.props.status = 'expired';
    }
  }

  isExpired(): boolean {
    return new Date() > this.props.expiresAt;
  }

  canRetryParsing(): boolean {
    return this.props.parsingAttempts < 3 && this.props.status === 'pending' && !this.isExpired();
  }

  get id(): string {
    return this.props.id;
  }

  get deliveryId(): string {
    return this.props.deliveryId;
  }

  get type(): IntentType {
    return this.props.type;
  }

  get payload(): IntentPayload {
    return this.props.payload;
  }

  get status(): IntentStatus {
    return this.props.status;
  }

  get parsingAttempts(): number {
    return this.props.parsingAttempts;
  }

  get expiresAt(): Date {
    return this.props.expiresAt;
  }

  toJSON(): RecipientIntentProps {
    return { ...this.props };
  }
}