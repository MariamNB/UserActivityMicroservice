import { IUserActivityRepository } from '../../domain/repositories/IUserActivityRepository';
import {
  GetActivitiesQueryDto,
  UserActivityResponseDto,
  UserActivityMapper,
} from '../dtos/UserActivityDto';

interface GetActivitiesResult {
  data: UserActivityResponseDto[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface ActivityStatsResult {
  totalActivities: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
}

export class GetUserActivitiesUseCase {
  constructor(private readonly repository: IUserActivityRepository) {}


  async execute(query: GetActivitiesQueryDto): Promise<GetActivitiesResult> {
    try {
      const filters = {
        userId: query.userId,
        activityType: query.activityType,
        status: query.status,
        sessionId: query.sessionId,
        startDate: query.startDate ? new Date(query.startDate) : undefined,
        endDate: query.endDate ? new Date(query.endDate) : undefined,
      };

      const pagination = {
        page: query.page ?? 1,
        limit: query.limit ?? 10,
        sortBy: query.sortBy ?? 'timestamp',
        sortOrder: query.sortOrder ?? 'desc',
      };

      const result = await this.repository.findAll(filters, pagination);

      return {
        data: UserActivityMapper.toResponseDtoArray(result.data),
        pagination: result.pagination,
      };
    } catch (error: any) {
      console.error('Failed to get user activities:', error);
      throw new Error(
        `Failed to retrieve activities: ${error.message ?? error}`
      );
    }
  }

  
  async getById(id: string): Promise<UserActivityResponseDto | null> {
    try {
      const activity = await this.repository.findById(id);
      return activity ? UserActivityMapper.toResponseDto(activity) : null;
    } catch (error: any) {
      console.error('Failed to get activity by id:', error);
      throw new Error(
        `Failed to retrieve activity: ${error.message ?? error}`
      );
    }
  }

  async getActivityStats(userId: string): Promise<ActivityStatsResult> {
    try {
      const allActivities = await this.repository.findAll(
        { userId },
        { page: 1, limit: 10_000 }
      );

      const byType: Record<string, number> = {};
      const byStatus: Record<string, number> = {};

      allActivities.data.forEach((activity) => {
        byType[activity.activityType] =
          (byType[activity.activityType] || 0) + 1;

        byStatus[activity.status] =
          (byStatus[activity.status] || 0) + 1;
      });

      return {
        totalActivities: allActivities.pagination.total,
        byType,
        byStatus,
      };
    } catch (error: any) {
      console.error('Failed to get activity stats:', error);
      throw new Error(
        `Failed to retrieve stats: ${error.message ?? error}`
      );
    }
  }
}
