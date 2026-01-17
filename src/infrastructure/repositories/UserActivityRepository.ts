import { UserActivity } from '../../domain/entities/UserActivity';
import {
  IUserActivityRepository,
  FilterOptions,
  PaginationOptions,
  PaginatedResult,
} from '../../domain/repositories/IUserActivityRepository';
import { UserActivityModel, IUserActivityDocument } from '../database/models/UserActivityModel';

export class UserActivityRepository implements IUserActivityRepository {
  private toDomain(doc: IUserActivityDocument): UserActivity {
    return new UserActivity({
      id: doc._id.toString(),
      userId: doc.userId,
      activityType: doc.activityType,
      metadata: doc.metadata,
      timestamp: doc.timestamp,
      status: doc.status,
      ipAddress: doc.ipAddress,
      userAgent: doc.userAgent,
      sessionId: doc.sessionId,
      processedAt: doc.processedAt,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  private toPersistence(activity: UserActivity): Partial<IUserActivityDocument> {
    return {
      userId: activity.userId,
      activityType: activity.activityType,
      metadata: activity.metadata,
      timestamp: activity.timestamp,
      status: activity.status,
      ipAddress: activity.ipAddress,
      userAgent: activity.userAgent,
      sessionId: activity.sessionId,
      processedAt: activity.processedAt,
    };
  }

  async save(activity: UserActivity): Promise<UserActivity> {
    try {
      if (activity.id) {       // Update existing
        const doc = await UserActivityModel.findByIdAndUpdate(
          activity.id,
          this.toPersistence(activity),
          { new: true, runValidators: true }
        );

        if (!doc) throw new Error('Activity not found for update');
        return this.toDomain(doc as IUserActivityDocument);
      } else {         // Create new
        const doc = await UserActivityModel.create(this.toPersistence(activity));
        return this.toDomain(doc as IUserActivityDocument);
      }
    } catch (error) {
      throw new Error(`Failed to save activity: ${error}`);
    }
  }

  async findById(id: string): Promise<UserActivity | null> {
    try {
        const doc = await UserActivityModel.findById(id);
        if (!doc) { return null; }
        return this.toDomain(doc as IUserActivityDocument);
    } catch (error) {
        throw new Error(`Failed to find activity by id: ${error}`);
    }
  }

  async findAll(
  filters: FilterOptions, pagination: PaginationOptions): Promise<PaginatedResult<UserActivity>> {
    try {
        const query = this.buildQuery(filters);
        const { page, limit, sortBy = 'timestamp', sortOrder = 'desc' } = pagination;
        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
        UserActivityModel.find(query)
            .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
            .skip(skip)
            .limit(limit),
        UserActivityModel.countDocuments(query),
        ]);

        return {
        data: data.map((doc) =>
            this.toDomain(doc as IUserActivityDocument)
        ),
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
        };
    } catch (error) {
        throw new Error(`Failed to find activities: ${error}`);
    }
  }


   async update(id: string, activity: Partial<UserActivity>): Promise<UserActivity | null> {
        try {
            const doc = await UserActivityModel.findByIdAndUpdate(
            id,{ $set: activity },{ new: true, runValidators: true }) as IUserActivityDocument | null;
            if (!doc) return null;
            return this.toDomain(doc);
        } catch (error: any) {
            throw new Error(`Failed to update activity: ${error.message || error}`);
        }
   }


    async delete(id: string): Promise  <boolean>{
        try {
        const result = await UserActivityModel.findByIdAndDelete(id);
        return result !== null;
        } catch (error) {
        throw new Error(`Failed to delete activity: ${error}`);
        }
    }

  async countByFilters(filters: FilterOptions): Promise<number>{
    try {
      const query = this.buildQuery(filters);
      return await UserActivityModel.countDocuments(query);
    } catch (error) {
      throw new Error(`Failed to count activities: ${error}`);
    }
  }

  private buildQuery(filters: FilterOptions): any {
    const query: any = {};

    if (filters.userId) {
      query.userId = filters.userId;
    }

    if (filters.activityType) {
      query.activityType = filters.activityType;
    }

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.sessionId) {
      query.sessionId = filters.sessionId;
    }

    if (filters.startDate || filters.endDate) {
      query.timestamp = {};
      if (filters.startDate) {
        query.timestamp.$gte = filters.startDate;
      }
      if (filters.endDate) {
        query.timestamp.$lte = filters.endDate;
      }
    }

    return query;
  }
}