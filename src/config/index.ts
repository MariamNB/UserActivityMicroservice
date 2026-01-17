import dotenv from 'dotenv';

dotenv.config();

interface Config {
  server: {
    port: number;
    nodeEnv: string;
    apiVersion: string;
  };
  mongodb: {
    uri: string;
  };
  kafka: {
    brokers: string[];
    clientId: string;
    groupId: string;
    topic: string;
  };
}

const config: Config = {
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    apiVersion: process.env.API_VERSION || 'v1',
  },
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/user-activities',
  },
  kafka: {
    brokers: process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'],
    clientId: process.env.KAFKA_CLIENT_ID || 'event-driven-microservice',
    groupId: process.env.KAFKA_GROUP_ID || 'activity-consumer-group',
    topic: process.env.KAFKA_TOPIC || 'user-activities',
  },
};

export default config;