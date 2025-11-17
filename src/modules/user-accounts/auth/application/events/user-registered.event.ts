import { DomainEvent } from '../../../user/entity/event/domane.event';

export class UserRegisteredEvent extends DomainEvent {
  constructor(
    public userId: number,
    public email: string,
    public code: string,
    public passwordRecovery?: boolean,
  ) {
    super();
  }
  getName(): string {
    return 'UserRegisteredEvent';
  }
}
