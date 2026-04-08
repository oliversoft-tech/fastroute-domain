import { Entity } from './Entity';
import { Result } from '../shared/Result';

export enum NotificationState {
  PENDING = 'pending',
  SENT = 'sent',
  CONFIRMED = 'confirmed',
  RESCHEDULED = 'rescheduled',
  ADDRESS_CHANGED = 'address_changed',
  FAILED = 'failed'
}

export interface DeliveryNotificationProps {
  parcelNumber: string;
  phoneNumber: string;
  deliveryDate: Date;
  state: NotificationState;
  address?: string;
  sentAt?: Date;
  confirmedAt?: Date;
}

const STATE_TRANSITIONS: Record<NotificationState, NotificationState[]> = {
  [NotificationState.PENDING]: [NotificationState.SENT, NotificationState.FAILED],
  [NotificationState.SENT]: [NotificationState.CONFIRMED, NotificationState.RESCHEDULED, NotificationState.ADDRESS_CHANGED, NotificationState.FAILED],
  [NotificationState.CONFIRMED]: [],
  [NotificationState.RESCHEDULED]: [NotificationState.SENT, NotificationState.FAILED],
  [NotificationState.ADDRESS_CHANGED]: [NotificationState.SENT, NotificationState.FAILED],
  [NotificationState.FAILED]: []
};

export class DeliveryNotification extends Entity<DeliveryNotificationProps> {
  private constructor(props: DeliveryNotificationProps, id?: string) {
    super(props, id);
  }

  public static create(props: DeliveryNotificationProps, id?: string): Result<DeliveryNotification> {
    const guardResult = this.validate(props);
    if (!guardResult.isSuccess) {
      return Result.fail<DeliveryNotification>(guardResult.error!);
    }
    return Result.ok<DeliveryNotification>(new DeliveryNotification(props, id));
  }

  private static validate(props: DeliveryNotificationProps): Result<void> {
    if (!props.parcelNumber || props.parcelNumber.trim().length === 0) {
      return Result.fail<void>('Parcel number is required');
    }
    const phoneValidation = this.validatePhone(props.phoneNumber);
    if (!phoneValidation.isSuccess) {
      return phoneValidation;
    }
    if (!props.deliveryDate || props.deliveryDate <= new Date()) {
      return Result.fail<void>('Delivery date must be in the future');
    }
    const sendWindow = this.calculateSendWindow(props.deliveryDate);
    const now = new Date();
    if (now < sendWindow.start || now > sendWindow.end) {
      return Result.fail<void>('Notification can only be sent D-1 or on delivery day');
    }
    return Result.ok<void>();
  }

  private static validatePhone(phone: string): Result<void> {
    const normalized = phone.replace(/\D/g, '');
    if (normalized.length < 10 || normalized.length > 15) {
      return Result.fail<void>('Invalid phone number format');
    }
    return Result.ok<void>();
  }

  private static calculateSendWindow(deliveryDate: Date): { start: Date; end: Date } {
    const start = new Date(deliveryDate);
    start.setDate(start.getDate() - 1);
    start.setHours(0, 0, 0, 0);
    const end = new Date(deliveryDate);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  public normalizePhone(): string {
    return this.props.phoneNumber.replace(/\D/g, '');
  }

  public transitionTo(newState: NotificationState): Result<void> {
    const allowedTransitions = STATE_TRANSITIONS[this.props.state];
    if (!allowedTransitions.includes(newState)) {
      return Result.fail<void>(`Invalid transition from ${this.props.state} to ${newState}`);
    }
    this.props.state = newState;
    if (newState === NotificationState.SENT) {
      this.props.sentAt = new Date();
    }
    if (newState === NotificationState.CONFIRMED) {
      this.props.confirmedAt = new Date();
    }
    return Result.ok<void>();
  }

  get parcelNumber(): string {
    return this.props.parcelNumber;
  }

  get phoneNumber(): string {
    return this.props.phoneNumber;
  }

  get deliveryDate(): Date {
    return this.props.deliveryDate;
  }

  get state(): NotificationState {
    return this.props.state;
  }

  get address(): string | undefined {
    return this.props.address;
  }
}