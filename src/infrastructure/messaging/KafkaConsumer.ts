import { Consumer, EachMessagePayload } from 'kafkajs';
import { kafka } from './kafka.config';
import config from '../../config';

export type MessageHandler = (payload: EachMessagePayload) => Promise <void>;

export class KafkaConsumer {
  private consumer: Consumer;
  private isConnected: boolean = false;

  constructor(groupId?: string) {
    this.consumer = kafka.consumer({
      groupId: groupId || config.kafka.groupId,
      sessionTimeout: 30000,
      heartbeatInterval: 3000,
    });
  }

  async connect(): Promise <void> {
    try {
      await this.consumer.connect();
      this.isConnected = true;
      console.log('***** Kafka Consumer connected *******');
    } catch (error) {
      console.error('**** Failed to connect Kafka Consumer:', error, '******');
      throw error;
    }
  }

  async disconnect(): Promise <void> {
    try {
      await this.consumer.disconnect();
      this.isConnected = false;
      console.log('***** Kafka Consumer disconnected ****');
    } catch (error) {
      console.error('**** Error disconnecting Kafka Consumer:', error, '****');
      throw error;
    }
  }

  async subscribe(topics: string[]): Promise <void> {
    if (!this.isConnected) {
      throw new Error('Kafka Consumer is not connected');
    }

    try {
      await this.consumer.subscribe({
        topics,
        fromBeginning: false,
      });
      console.log(' Subscribed to topics:', topics);
    } catch (error) {
      console.error(' Failed to subscribe to topics:', error);
      throw error;
    }
  }

  async consume(messageHandler: MessageHandler): Promise <void> {
    if (!this.isConnected) {
      throw new Error('Kafka Consumer is not connected');
    }

    try {
      await this.consumer.run({
        eachMessage: async (payload: EachMessagePayload) => {
          const { topic, partition, message } = payload;
          
          console.log(' Received message:', {
            topic,
            partition,
            offset: message.offset,
            timestamp: message.timestamp,
          });

          try {
            await messageHandler(payload);
          } catch (error) {
            console.error(' Error processing message:', error);
          }
        },
      });
    } catch (error) {
      console.error(' Failed to consume messages:', error);
      throw error;
    }
  }

  isConsumerConnected(): boolean {
    return this.isConnected;
  }
}