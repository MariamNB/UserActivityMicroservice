import { Request, Response } from 'express';
import { PublishUserActivityUseCase } from '../../../application/useCases/PublishUserActivity';
import { GetUserActivitiesUseCase } from '../../../application/useCases/GetUserActivities';
import { AppError } from '../middlewares/errorHandler';

export class ActivityController {
  constructor(
    private publishActivityUseCase: PublishUserActivityUseCase,
    private getActivitiesUseCase: GetUserActivitiesUseCase
  ) {}

  publishActivity = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId, activityType, metadata, sessionId } = req.body;
      
      const result = await this.publishActivityUseCase.execute({
        userId,
        activityType,
        metadata: metadata || {},
        ipAddress: req.ip || req.socket.remoteAddress,
        userAgent: req.get('user-agent'),
        sessionId,
      });

      res.status(202).json({
        status: 'success',
        message: 'Activity published successfully',
        data: result,
      });
    } catch (error: any) {
      throw new AppError(error.message || 'Failed to publish activity', 500);
    }
  };

  publishBatchActivities = async (req: Request, res: Response): Promise<void> => {
    try {
      const { activities } = req.body;

      if (!Array.isArray(activities) || activities.length === 0) {
        throw new AppError('activities must be a non-empty array', 400);
      }

      if (activities.length > 100) {
        throw new AppError('Maximum 100 activities per batch', 400);
      }

      const result = await this.publishActivityUseCase.executeBatch(activities);

      res.status(202).json({
        status: 'success',
        message: 'Batch activities published successfully',
        data: result,
      });
    } catch (error: any) {
      throw new AppError(error.message || 'Failed to publish batch activities', 500);
    }
  };

  getActivities = async (req: Request, res: Response): Promise <void>=> {
    try {
      const query = {
        userId: req.query.userId as string,
        activityType: req.query.activityType as string,
        status: req.query.status as string,
        sessionId: req.query.sessionId as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
        sortBy: (req.query.sortBy as string) || 'timestamp',
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc',
      };

      const result = await this.getActivitiesUseCase.execute(query);

      res.status(200).json({
        status: 'success',
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error: any) {
      throw new AppError(error.message || 'Failed to retrieve activities', 500);
    }
  };

  getActivityById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id as string;
      
      const activity = await this.getActivitiesUseCase.getById(id);

      if (!activity) {
        throw new AppError('Activity not found', 404);
      }

      res.status(200).json({
        status: 'success',
        data: activity,
      });
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      throw new AppError(error.message || 'Failed to retrieve activity', 500);
    }
  };

  getActivityStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.params.userId as string;

      if (!userId) {
        throw new AppError('userId is required', 400);
      }

      const stats = await this.getActivitiesUseCase.getActivityStats(userId);

      res.status(200).json({
        status: 'success',
        data: stats,
      });
    } catch (error: any) {
      throw new AppError(error.message || 'Failed to retrieve stats', 500);
    }
  };
}