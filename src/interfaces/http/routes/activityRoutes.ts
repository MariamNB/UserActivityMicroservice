import { Router } from 'express';
import { ActivityController } from '../controllers/ActivityController';
import { PublishUserActivityUseCase } from '../../../application/useCases/PublishUserActivity';
import { GetUserActivitiesUseCase } from '../../../application/useCases/GetUserActivities';
import { UserActivityRepository } from '../../../infrastructure/repositories/UserActivityRepository';
import { kafkaProducer } from '../../../infrastructure/messaging/KafkaProducer';
import {
  validateCreateActivity,
  validateGetActivities,
  validateObjectId,
} from '../middlewares/validation';
import { asyncHandler } from '../middlewares/errorHandler';

const router = Router();

// Initialize dependencies
const repository = new UserActivityRepository();
const publishUseCase = new PublishUserActivityUseCase(kafkaProducer);
const getActivitiesUseCase = new GetUserActivitiesUseCase(repository);
const controller = new ActivityController(publishUseCase, getActivitiesUseCase);

// Routes
router.post(
  '/',
  validateCreateActivity,
  asyncHandler(controller.publishActivity)
);

router.post(
  '/batch',
  asyncHandler(controller.publishBatchActivities)
);

router.get(
  '/',
  validateGetActivities,
  asyncHandler(controller.getActivities)
);

// IMPORTANT: Specific routes must come before dynamic routes
router.get(
  '/stats/:userId',
  asyncHandler(controller.getActivityStats)
);

router.get(
  '/:id',
  validateObjectId,
  asyncHandler(controller.getActivityById)
);

export default router;