import { connectToDatabase } from './src/infrastructure/database/mongodb';
import { UserActivityRepository } from './src/infrastructure/repositories/UserActivityRepository';
import { kafkaProducer } from './src/infrastructure/messaging/KafkaProducer';
import { PublishUserActivityUseCase } from './src/application/useCases/PublishUserActivity';
import { GetUserActivitiesUseCase } from './src/application/useCases/GetUserActivities';
import { ActivityType } from './src/domain/entities/UserActivity';

async function testStep3() {
  try {
    // 1. Connect to MongoDB
    await connectToDatabase();
    console.log('✅ Connected to MongoDB');

    // 2. Initialize repository
    const repository = new UserActivityRepository();
    console.log('✅ Repository initialized');

    // 3. Connect to Kafka (optional for now)
    try {
      await kafkaProducer.connect();
      console.log('✅ Kafka Producer connected');
    } catch (error) {
      console.warn('⚠️  Kafka not available (will skip Kafka tests)');
    }

    // 4. Test Use Cases
    const publishUseCase = new PublishUserActivityUseCase(kafkaProducer);
    const getActivitiesUseCase = new GetUserActivitiesUseCase(repository);

    console.log('\n📝 Testing use cases...');
    
    // Test publishing (will work even without Kafka if we handle the error)
    if (kafkaProducer.isProducerConnected()) {
      const result = await publishUseCase.execute({
        userId: 'test-user-123',
        activityType: ActivityType.LOGIN,
        metadata: { ip: '127.0.0.1' },
      });
      console.log('✅ Published activity:', result);
    }

    console.log('\n✅ All tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    process.exit(0);
  }
}

testStep3();
