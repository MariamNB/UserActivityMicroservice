import { Producer, ProducerRecord, RecordMetadata } from 'kafkajs';
import { kafka } from './kafka.config';
import config from '../../config';

export class KafkaProducer {
  private producer: Producer;
  private isConnected: boolean = false;

  constructor() {
    this.producer = kafka.producer({
      allowAutoTopicCreation: true,
      transactionTimeout: 30000,
    });
  }

  async connect(): Promise <void>{
    try {
      await this.producer.connect();
      this.isConnected = true;
      console.log('*****Kafka Producer connected*********');
    } catch (error) {
      console.error('******Failed to connect Kafka Producer:', error, '**********');
      throw error;
    }
  }

  async disconnect(): Promise <void>{
    try {
      await this.producer.disconnect();
      this.isConnected = false;
      console.log('********* Kafka Producer disconnected******');
    } catch (error) {
      console.error('*******Error disconnecting Kafka Producer:', error, '******');
      throw error;
    }
  }

  async sendMessage(topic: string, message: any, key?: string): Promise<RecordMetadata[]> {
    if (!this.isConnected) {
      throw new Error('Kafka Producer is not connected');
    }

    try {
      const record: ProducerRecord = {
        topic,
        messages: [
          {
            key: key || null,
            value: JSON.stringify(message),
            timestamp: Date.now().toString(),
          },
        ],
      };

      const metadata = await this.producer.send(record);
      console.log(' Message sent to Kafka:', { topic, partition: metadata[0].partition });
      return metadata;
    } catch (error) {
      console.error(' Failed to send message to Kafka:', error);
      throw error;
    }
  }

  async sendUserActivity(activity: any): Promise<RecordMetadata[]>{
    return this.sendMessage(config.kafka.topic, activity, activity.userId);
  }

  async sendBatch(topic: string, messages: any[]):  Promise<RecordMetadata[]> {
    if (!this.isConnected) {
      throw new Error('Kafka Producer is not connected');
    }

    try {
      const record: ProducerRecord = {
        topic,
        messages: messages.map((msg) => ({
          key: msg.userId || null,
          value: JSON.stringify(msg),
          timestamp: Date.now().toString(),
        })),
      };

      const metadata = await this.producer.send(record);
      console.log(` Batch of ${messages.length} messages sent to Kafka`);
      return metadata;
    } catch (error) {
      console.error(' Failed to send batch to Kafka:', error);
      throw error;
    }
  }

  isProducerConnected(): boolean {
    return this.isConnected;
  }
}
export const kafkaProducer = new KafkaProducer();