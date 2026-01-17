
export enum ActivityType {
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  PAGE_VIEW = 'PAGE_VIEW',
  BUTTON_CLICK = 'BUTTON_CLICK',
  FORM_SUBMIT = 'FORM_SUBMIT',
  API_CALL = 'API_CALL',
}

export enum ActivityStatus {
  PENDING = 'PENDING',
  PROCESSED = 'PROCESSED',
  FAILED = 'FAILED',
}

export interface UserActivityProps {
  id?: string;
  userId: string;
  activityType: ActivityType;
  metadata: Record<string, any>;
  timestamp: Date;
  status: ActivityStatus;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  processedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export class UserActivity {
  private props: UserActivityProps;

  constructor(props: UserActivityProps) {
    this.props = {
      ...props,
      status: props.status || ActivityStatus.PENDING,
      timestamp: props.timestamp || new Date(),
      createdAt: props.createdAt || new Date(),
      updatedAt: props.updatedAt || new Date(),
    };
    this.validate();
  }

  private validate(): void {
    if (!this.props.userId || this.props.userId.trim().length === 0) {
      throw new Error('User ID is required');
    }
    if (!this.props.activityType) {
      throw new Error('Activity type is required');
    }
    if (!Object.values(ActivityType).includes(this.props.activityType)) {
      throw new Error('Invalid activity type');
    }
  }

  // Getters
  get id(): string | undefined {
    return this.props.id;
  }

  get userId(): string {
    return this.props.userId;
  }

  get activityType(): ActivityType {
    return this.props.activityType;
  }

  get metadata(): Record <string, any>{
    return this.props.metadata;
  }

  get timestamp(): Date {
    return this.props.timestamp;
  }

  get status(): ActivityStatus {
    return this.props.status;
  }

  get ipAddress(): string | undefined {
    return this.props.ipAddress;
  }

  get userAgent(): string | undefined {
    return this.props.userAgent;
  }

  get sessionId(): string | undefined {
    return this.props.sessionId;
  }

  get processedAt(): Date | undefined {
    return this.props.processedAt;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  // Business Methods
  markAsProcessed(): void {
    this.props.status = ActivityStatus.PROCESSED;
    this.props.processedAt = new Date();
    this.props.updatedAt = new Date();
  }

  markAsFailed(): void {
    this.props.status = ActivityStatus.FAILED;
    this.props.updatedAt = new Date();
  }

  updateMetadata(metadata: Record<string, any>): void {
    this.props.metadata = { ...this.props.metadata, ...metadata };
    this.props.updatedAt = new Date();
  }

  toJSON(): UserActivityProps {
    return { ...this.props };
  }

  static fromJSON(data: UserActivityProps): UserActivity {
    return new UserActivity(data);
  }
}

