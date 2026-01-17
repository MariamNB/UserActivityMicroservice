import { UserActivity } from '../entities/UserActivity';

export interface FilterOptions {
  userId?: string;
  activityType?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
  sessionId?: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface IUserActivityRepository {
  save(activity: UserActivity): Promise<UserActivity>;

  findById(id: string): Promise<UserActivity | null>;

  findAll(
    filters: FilterOptions,
    pagination: PaginationOptions
  ): Promise<PaginatedResult<UserActivity>>;

  update(
    id: string,
    activity: Partial<UserActivity>
  ): Promise<UserActivity | null>;

  delete(id: string): Promise<boolean>;

  countByFilters(filters: FilterOptions): Promise<number>;
}