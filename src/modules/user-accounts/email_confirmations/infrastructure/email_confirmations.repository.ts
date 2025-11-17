import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailConfirmations } from '../domain/email_confirmations.entity';

@Injectable()
export class EmailConfirmationsRepository {
  constructor(
    @InjectRepository(EmailConfirmations)
    private readonly emailConfirmationsRepository: Repository<EmailConfirmations>,
  ) {}

  async save(confirmation: EmailConfirmations) {
    await this.emailConfirmationsRepository.save(confirmation);
  }

  async findByConfirmationCode(
    confirmationCode: string,
  ): Promise<EmailConfirmations | null> {
    return await this.emailConfirmationsRepository.findOne({
      where: { confirmationCode },
    });
  }

  async getConfirmation(userId: number): Promise<EmailConfirmations | null> {
    return await this.emailConfirmationsRepository.findOne({
      where: { userId },
    });
  }
}
