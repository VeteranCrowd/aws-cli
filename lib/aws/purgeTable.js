/*
******************* DO NOT EDIT THIS NOTICE *****************
This code and all related intellectual property is owned by  
Veteran Crowd Rewards, LLC. It is not to be disclosed, copied
or used without written permission.                          
*************************************************************
*/

// npm imports
import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { SERVICE_CONFIG_KEY } from '@veterancrowd/aws-service';
import { WrappedDynamoDbClient } from '@veterancrowd/wrapped-dynamodb-client';
import {
  dotenvExpand,
  getDotenvCliOptions2Options,
} from '@karmaniverous/get-dotenv';
import confirm from '@inquirer/confirm';
import { Command } from 'commander';

// lib imports
import { disableCrud, enableCrud } from './crudGuard.js';

export const purgeTable = new Command()
  .name('purge-table')
  .description('Purge all records from a DynamoDB table.')
  .enablePositionalOptions()
  .passThroughOptions()
  .option(
    '-t, --table-name <string>',
    'DynamoDB table name (prefix with $ to use env var)',
    '$TABLE_NAME'
  )
  .option(
    '--keys <string>',
    'space-delimited list of key attributes',
    'entityPK entitySK'
  )
  .option('-f, --force', 'proceed without confirmation (not recommended)')
  .action(async ({ force, keys, tableName }, command) => {
    const { logger = console } = getDotenvCliOptions2Options(
      command.parent?.parent?.getDotenvCliOptions ?? {}
    );

    try {
      // Validate table name.
      tableName = dotenvExpand(tableName);
      if (!tableName) throw new Error('table name is undefined.');

      keys = keys.split(' ');

      if (!force) {
        const confirmed = await confirm({
          message: `Are you sure you want to purge all records from DynamoDB table '${tableName}'? This action cannot be undone!`,
          default: false,
        });

        if (!confirmed) {
          logger.info(`Purge cancelled.`);
          process.exit(0);
        }
      }

      // Configure DynamoDB client.
      const db = new WrappedDynamoDbClient({
        logger,
      });

      // Protect the service from its own purge: the REMOVE events this produces
      // must not become journals or messages.
      const dynamodb = new DynamoDB({});

      const disabledCrud = await disableCrud({
        dynamodb,
        tableName,
        updater: 'purge-table',
        logger,
      });

      try {
        logger.info(`Purging DynamoDB table '${tableName}'...`);

        await db.purgeItems(tableName, keys, {
          // The config record has to survive the purge: the window it holds is
          // what suppresses these REMOVEs.
          excludeKeys: [SERVICE_CONFIG_KEY],
        });

        logger.info(`Done.`);
        console.log('');
      } finally {
        // Failing to re-enable stays visible: it fails the run.
        if (disabledCrud)
          await enableCrud({
            dynamodb,
            tableName,
            updater: 'purge-table',
            logger,
          });
      }
    } catch (error) {
      logger.error(error.message);
      process.exitCode = 1;
    }
  });
