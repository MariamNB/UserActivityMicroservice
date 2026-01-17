import { UserActivity } from '../entities/UserActivity';
import { IUserActivityRepository } from '../repositories/IUserActivityRepository';

export class UserActivityService {
  constructor(private repository: IUserActivityRepository) {}

  async processActivity(activity: UserActivity): Promise<UserActivity> {
    try {
        activity.markAsProcessed();
        return await this.repository.save(activity);
    } catch (error) {
        activity.markAsFailed();
        await this.repository.save(activity);
        throw error;
    }
  }

  async enrichActivityData(activity: UserActivity, enrichmentData: Record<string, any>): Promise<void> {
    activity.updateMetadata(enrichmentData);
  }

  validateActivity(activity: UserActivity): boolean {
    return (
      activity.userId !== undefined &&
      activity.activityType !== undefined &&
      activity.timestamp !== undefined
    );
  }
}