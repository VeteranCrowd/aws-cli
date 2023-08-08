// npm imports
import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { dotenvExpand } from '@karmaniverous/get-dotenv';
import confirm from '@inquirer/confirm';
import { Command } from 'commander';
import _ from 'lodash';

export const purgeTable = new Command()
  .name('purge-table')
  .description('Purge all records from a DynamoDB table.')
  .enablePositionalOptions()
  .passThroughOptions()
  .option(
    '-t, --table-name <string>',
    'DynamoDB table name (prefix with $ to use env var)',
    '$STACK_NAME'
  )
  .option(
    '-k, --keys <string>',
    'space-delimited list of key attributes',
    'entityPK entitySK'
  )
  .option('-f, --force', 'proceed without confirmation (not recommended)')
  .action(async ({ force, keys, tableName }, command) => {
    const { logger = console } = command.parent?.parent?.getdotenvOptions ?? {};

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
      const db = new DynamoDB({
        region: process.env.AWS_DEFAULT_REGION,
      });

      logger.info(`Purging DynamoDB table '${tableName}'...`);

      logger.info(`  Retrieving table details...`);

      // Get table details.
      const { Table: table } = await db.describeTable({
        TableName: tableName,
      });

      logger.info(`  Table has ${table.ItemCount} records.`);

      logger.info(`\n  Purging records...`);

      let purged = 0;
      let item;
      do {
        purged++;

        ({
          Items: [item],
        } = await db.scan({ Limit: 1, TableName: tableName }));

        if (item) {
          const itemKeys = _.pick(item, keys);

          await db.deleteItem({
            Key: itemKeys,
            TableName: tableName,
          });

          logger.info(
            `    Deleted item ${JSON.stringify(itemKeys)} [${purged}].`
          );
        }
      } while (item);

      logger.info(`  Done.`);

      logger.info(`Done.`);
      console.log('');
    } catch (error) {
      logger.error(error.message);
    }
  });
