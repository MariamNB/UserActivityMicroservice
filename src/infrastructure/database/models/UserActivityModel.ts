import mongoose, { Schema, Document } from 'mongoose';
import { ActivityType, ActivityStatus } from '../../../domain/entities/UserActivity';

export interface IUserActivityDocument extends Document {
  userId: string;
  activityType: ActivityType;
  metadata: Record<string, any>;
  timestamp: Date;
  status: ActivityStatus;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserActivitySchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    activityType: {
      type: String,
      required: true,
      enum: Object.values(ActivityType),
      index: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    timestamp: {
      type: Date,
      required: true,
      index: true,
      default: Date.now,
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(ActivityStatus),
      default: ActivityStatus.PENDING,
      index: true,
    },
    ipAddress: {
      type: String,
      index: true,
    },
    userAgent: String,
    sessionId: {
      type: String,
      index: true,
    },
    processedAt: Date,
  },
  {
    timestamps: true,
    collection: 'useractivities',
  }
);

UserActivitySchema.index({ userId: 1, timestamp: -1 });
UserActivitySchema.index({ status: 1, timestamp: -1 });
UserActivitySchema.index({ activityType: 1, timestamp: -1 });
UserActivitySchema.index({ sessionId: 1, timestamp: -1 });

export const UserActivityModel = mongoose.model(
  'UserActivity',
  UserActivitySchema
);