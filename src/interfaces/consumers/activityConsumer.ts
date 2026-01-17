import { EachMessagePayload } from 'kafkajs';
import { KafkaConsumer } from '../../infrastructure/messaging/KafkaConsumer';
import { UserActivityRepository } from '../../infrastructure/repositories/UserActivityRepository';
import { UserActivityService } from '../../domain/services/UserActivityService';
import { UserActivity } from '../../domain/entities/UserActivity';
import { connectToDatabase } from '../../infrastructure/database/mongodb';
import config from '../../config';

class ActivityConsumerService {
  private consumer: KafkaConsumer;
  private repository: UserActivityRepository;
  private service: UserActivityService;

  constructor() {
    this.consumer = new KafkaConsumer();
    this.repository = new UserActivityRepository();
    this.service = new UserActivityService(this.repository);
  }

  async start(): Promise <void>{
    try {
      // Connect to MongoDB
      await connectToDatabase();
      console.log('***** Consumer: Connected to MongoDB **********');

      // Connect to Kafka
      await this.consumer.connect();
      console.log(' ***** Consumer: Connected to Kafka *********');

      // Subscribe to topics
      await this.consumer.subscribe([config.kafka.topic]);
      console.log(`**** Consumer: Subscribed to topic: ${config.kafka.topic} *****`);

      // Start consuming messages
      await this.consumer.consume(this.handleMessage.bind(this));
      console.log(' Consumer: Started processing messages...');
    } catch (error) {
      console.error('****** Consumer: Failed to start:', error, '**********');
      process.exit(1);
    }
  }

  private async handleMessage(payload: EachMessagePayload): Promise<void> {
    const { topic, partition, message } = payload;

    try {
      if (!message.value) {
        console.warn(' Received empty message');
        return;
      }

      const activityData = JSON.parse(message.value.toString());
      console.log(' Processing activity:', {
        userId: activityData.userId,
        type: activityData.activityType,
      });

      const activity = UserActivity.fromJSON(activityData);

      if (!this.service.validateActivity(activity)) {
        console.error(' Invalid activity data:', activityData);
        return;
      }

      const processedActivity = await this.service.processActivity(activity);
      
      console.log('Activity processed successfully:', {
        id: processedActivity.id,
        userId: processedActivity.userId,
        status: processedActivity.status,
      });
    } catch (error: any) {
      console.error(' Error processing message:', {
        error: error.message,
        topic,
        partition,
        offset: message.offset,
      });
      // 1. Send to dead letter queue
      // 2. Retry with exponential backoff
      // 3. Alert monitoring system
    }
  }

  async stop(): Promise <void>{
    await this.consumer.disconnect();
    console.log(' Consumer: Disconnected');
  }
}

// Start consumer
const consumerService = new ActivityConsumerService();

consumerService.start().catch((error) => {
  console.error('Failed to start consumer:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received');
  await consumerService.stop();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received');
  await consumerService.stop();
  process.exit(0);
});

export default consumerService;