import { Kafka, logLevel } from 'kafkajs';
import config from '../../config';

export const kafka = new Kafka({
  clientId: config.kafka.clientId,
  brokers: config.kafka.brokers,
  logLevel: logLevel.INFO,
  retry: {
    initialRetryTime: 100,
    retries: 8,
  },
});

export const kafkaAdmin = kafka.admin();