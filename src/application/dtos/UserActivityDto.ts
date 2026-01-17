import { ActivityType, ActivityStatus } from '../../domain/entities/UserActivity';

export interface CreateUserActivityDto {
  userId: string;
  activityType: ActivityType;
  metadata?: Record <string, any>;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
}

export interface UpdateUserActivityDto {
  status?: ActivityStatus;
  metadata?: Record<string, any>;
}

export interface UserActivityResponseDto {
  id: string;
  userId: string;
  activityType: ActivityType;
  metadata: Record<string, any>;
  timestamp: string;
  status: ActivityStatus;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetActivitiesQueryDto {
  userId?: string;
  activityType?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  sessionId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class UserActivityMapper {
  static toResponseDto(activity: any): UserActivityResponseDto {
    return {
      id: activity.id,
      userId: activity.userId,
      activityType: activity.activityType,
      metadata: activity.metadata,
      timestamp: activity.timestamp.toISOString(),
      status: activity.status,
      ipAddress: activity.ipAddress,
      userAgent: activity.userAgent,
      sessionId: activity.sessionId,
      processedAt: activity.processedAt?.toISOString(),
      createdAt: activity.createdAt?.toISOString(),
      updatedAt: activity.updatedAt?.toISOString(),
    };
  }

  static toResponseDtoArray(activities: any[]): UserActivityResponseDto[] {
    return activities.map(this.toResponseDto);
  }
}