// import {
//   Injectable,
//   Logger,
//   OnModuleDestroy,
//   OnModuleInit,
// } from '@nestjs/common';
// import { Db, MongoClient, MongoClientOptions } from 'mongodb';
// import { ConstantsService } from './constants.service';

// @Injectable()
// export class MongoConnectionService implements OnModuleInit, OnModuleDestroy {
//   private readonly logger = new Logger(MongoConnectionService.name);
//   private client: MongoClient;
//   private db: Db;

//   constructor(private readonly constants: ConstantsService) {
//     this.logger.log(
//       `MongoConnectionService instantiated on ${constants.databaseUrl}`,
//     );
//     if (!constants.databaseUrl) {
//       throw new Error('Database URL is not defined');
//     }

//     const options: MongoClientOptions = {
//       connectTimeoutMS: 10000,
//       socketTimeoutMS: 45000,
//       serverSelectionTimeoutMS: 5000,
//       retryWrites: true,
//       retryReads: true,
//       maxPoolSize: 10,
//       minPoolSize: 5,
//     };

//     this.client = new MongoClient(constants.databaseUrl, options);
//   }

//   async onModuleInit() {
//     try {
//       await this.client.connect();
//       const dbName = 'healthPinger';
//       this.db = this.client.db(dbName);

//       // Test connection
//       await this.db.command({ ping: 1 });
//       this.logger.log('MongoDB connection established successfully');

//       // Setup event listeners
//       this.client.addListener('serverHeartbeatStarted', () => {
//         this.logger.debug('Server heartbeat started');
//       });

//       this.client.addListener('serverHeartbeatSucceeded', () => {
//         this.logger.debug('Server heartbeat succeeded');
//       });

//       this.client.addListener('serverHeartbeatFailed', (error) => {
//         this.logger.error(`Server heartbeat failed: ${error}`);
//         this.tryReconnect();
//       });
//     } catch (error) {
//       this.logger.error(`MongoDB connection error: ${error.message}`);
//       if (error.code) {
//         this.logger.error(`Error code: ${error.code}`);
//       }
//       throw error;
//     }
//   }

//   private async tryReconnect(retries = 5, delay = 5000) {
//     let attempts = 0;
//     while (attempts < retries) {
//       try {
//         attempts++;
//         this.logger.log(`Attempting reconnection (${attempts}/${retries})`);

//         await this.client.close(true); // Force close existing connection
//         await this.client.connect();
//         this.db = this.client.db('healthPinger');

//         await this.db.command({ ping: 1 }); // Verify connection
//         this.logger.log('MongoDB reconnected successfully');
//         return true;
//       } catch (error) {
//         this.logger.warn(
//           `Reconnection attempt ${attempts} failed: ${error.message}`,
//         );
//         if (attempts < retries) {
//           await new Promise((resolve) => setTimeout(resolve, delay));
//         }
//       }
//     }

//     this.logger.error('Failed to reconnect after maximum attempts');
//     return false;
//   }

//   async onModuleDestroy() {
//     try {
//       await this.client.close(true);
//       this.logger.log('MongoDB connection closed');
//     } catch (error) {
//       this.logger.error(`Error closing MongoDB connection: ${error.message}`);
//     }
//   }

//   getDatabase(): Db {
//     if (!this.db) {
//       throw new Error('Database connection not established');
//     }
//     return this.db;
//   }
// }
