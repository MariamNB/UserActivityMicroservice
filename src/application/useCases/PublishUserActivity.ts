import { UserActivity, ActivityStatus } from '../../domain/entities/UserActivity';
import { KafkaProducer } from '../../infrastructure/messaging/KafkaProducer';
import { CreateUserActivityDto } from '../dtos/UserActivityDto';
import config from '../../config';

interface PublishActivityResult {
  success: boolean;
}


interface PublishBatchResult {
  success: boolean;
  count: number;
}

export class PublishUserActivityUseCase {
  constructor(private readonly kafkaProducer: KafkaProducer) {}


  async execute(dto: CreateUserActivityDto): Promise<PublishActivityResult> {
    try {
      const activity = new UserActivity({
        userId: dto.userId,
        activityType: dto.activityType,
        metadata: dto.metadata ?? {},
        ipAddress: dto.ipAddress,
        userAgent: dto.userAgent,
        sessionId: dto.sessionId,
        status: ActivityStatus.PENDING,
        timestamp: new Date(),
      });

      await this.kafkaProducer.sendUserActivity(activity.toJSON());

      return { success: true };
    } catch (error: any) {
      console.error('Failed to publish user activity:', error);
      throw new Error(
        `Failed to publish activity: ${error.message ?? error}`
      );
    }
  }

 
  async executeBatch(
    dtos: CreateUserActivityDto[]
  ): Promise<PublishBatchResult> {
    try {
      const activities = dtos.map(
        (dto) =>
          new UserActivity({
            userId: dto.userId,
            activityType: dto.activityType,
            metadata: dto.metadata ?? {},
            ipAddress: dto.ipAddress,
            userAgent: dto.userAgent,
            sessionId: dto.sessionId,
            status: ActivityStatus.PENDING,
            timestamp: new Date(),
          })
      );

      const messages = activities.map((activity) => activity.toJSON());

      await this.kafkaProducer.sendBatch(config.kafka.topic, messages);

      return {
        success: true,
        count: messages.length,
      };
    } catch (error: any) {
      console.error('Failed to publish batch activities:', error);
      throw new Error(
        `Failed to publish batch: ${error.message ?? error}`
      );
    }
  }
}
