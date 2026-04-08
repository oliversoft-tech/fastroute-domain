import { RecipientIntent, IntentType, IntentPayload } from '../aggregates/RecipientIntent';
import { IntentPayloadValidator } from '../validators/IntentPayloadValidator';

export interface IRecipientIntentRepository {
  save(intent: RecipientIntent): Promise<void>;
  findById(id: string): Promise<RecipientIntent | null>;
  findPendingExpired(): Promise<RecipientIntent[]>;
}

export class RecipientIntentService {
  constructor(private repository: IRecipientIntentRepository) {}

  async createIntent(deliveryId: string, recipientId: string, rawMessage: string, type: IntentType, payload: IntentPayload): Promise<RecipientIntent> {
    const validation = IntentPayloadValidator.validate(type, payload);
    
    if (!validation.valid) {
      throw new Error(`Invalid payload: ${validation.errors.join(', ')}`);
    }

    const intent = RecipientIntent.create(deliveryId, recipientId, rawMessage, type, payload);
    await this.repository.save(intent);
    return intent;
  }

  async retryParsing(intentId: string, newType: IntentType, newPayload: IntentPayload): Promise<RecipientIntent> {
    const intent = await this.repository.findById(intentId);
    if (!intent) {
      throw new Error('Intent not found');
    }

    if (!intent.canRetryParsing()) {
      throw new Error('Intent cannot be retried');
    }

    intent.incrementParsingAttempt();

    const validation = IntentPayloadValidator.validate(newType, newPayload);
    if (!validation.valid) {
      if (intent.parsingAttempts >= 3) {
        intent.markAsAmbiguous();
      }
      await this.repository.save(intent);
      throw new Error(`Parsing failed: ${validation.errors.join(', ')}`);
    }

    await this.repository.save(intent);
    return intent;
  }

  async applyIntent(intentId: string): Promise<void> {
    const intent = await this.repository.findById(intentId);
    if (!intent) {
      throw new Error('Intent not found');
    }

    intent.apply();
    await this.repository.save(intent);
  }

  async rejectIntent(intentId: string, reason: string): Promise<void> {
    const intent = await this.repository.findById(intentId);
    if (!intent) {
      throw new Error('Intent not found');
    }

    intent.reject(reason);
    await this.repository.save(intent);
  }

  async expireStaleIntents(): Promise<number> {
    const expiredIntents = await this.repository.findPendingExpired();
    for (const intent of expiredIntents) {
      intent.expire();
      await this.repository.save(intent);
    }
    return expiredIntents.length;
  }
}