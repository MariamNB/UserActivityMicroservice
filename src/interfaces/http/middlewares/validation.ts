import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';
import { ActivityType, ActivityStatus } from '../../../domain/entities/UserActivity';

export const validateCreateActivity = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const { userId, activityType } = req.body;

  if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
    throw new AppError('userId is required and must be a non-empty string', 400);
  }

  if (!activityType || !Object.values(ActivityType).includes(activityType)) {
    throw new AppError(
      `activityType must be one of: ${Object.values(ActivityType).join(', ')}`,
      400
    );
  }

  next();
};

export const validateGetActivities = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const { page, limit, sortOrder, activityType, status } = req.query;

  if (page && (isNaN(Number(page)) || Number(page) < 1)) {
    throw new AppError('page must be a positive number', 400);
  }

  if (limit && (isNaN(Number(limit)) || Number(limit) < 1 || Number(limit) > 100)) {
    throw new AppError('limit must be between 1 and 100', 400);
  }

  if (sortOrder && sortOrder !== 'asc' && sortOrder !== 'desc') {
    throw new AppError('sortOrder must be either "asc" or "desc"', 400);
  }

  if (activityType && !Object.values(ActivityType).includes(activityType as ActivityType)) {
    throw new AppError(
      `activityType must be one of: ${Object.values(ActivityType).join(', ')}`,
      400
    );
  }

  if (status && !Object.values(ActivityStatus).includes(status as ActivityStatus)) {
    throw new AppError(
      `status must be one of: ${Object.values(ActivityStatus).join(', ')}`,
      400
    );
  }

  next();
};

export const validateObjectId = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const id = req.params.id as string;

  const objectIdRegex = /^[0-9a-fA-F]{24}$/;

  if (!id || !objectIdRegex.test(id)) {
    throw new AppError('Invalid ID format', 400);
  }

  next();
};
