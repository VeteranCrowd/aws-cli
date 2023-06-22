// npm imports
import { APIGateway } from '@aws-sdk/client-api-gateway';
import { dotenvExpand } from '@karmaniverous/get-dotenv';
import { Logger } from '@karmaniverous/edge-logger';
import { Command } from 'commander';

export const flushApiCache = new Command()
  .name('flush-api-cache')
  .description('Flushes a REST API stage cache.')
  .enablePositionalOptions()
  .passThroughOptions()
  .option(
    '-a, --api-name <string>',
    'REST API name (prefix with $ to use env var)',
    '$STACK_NAME'
  )
  .option('-s, --stage-name <string>', 'Stage name', '$INSTANCE_NAME')
  .action(async ({ apiName, stageName }) => {
    const logger = new Logger({ maxLevel: process.env.LOG_LEVEL });

    try {
      // Validate inputs.
      apiName = dotenvExpand(apiName);
      if (!apiName) throw new Error('api name is undefined.');

      stageName = dotenvExpand(stageName);
      if (!stageName) throw new Error('stage name is undefined.');

      // Configure APIGateway.
      const apiGateway = new APIGateway({
        region: process.env.AWS_DEFAULT_REGION,
      });

      logger.info(`Flushing API Cache...`);

      logger.debug(`  Retreiving '${apiName}' REST API Id...`);

      const { items: apis } = await apiGateway.getRestApis({ limit: 500 });
      const { id: restApiId } = apis.find((a) => a.name === apiName) ?? {};

      if (!restApiId) {
        throw new Error(`Unable to find REST API Id.`);
      }

      logger.debug(`  Found Rest API Id '${restApiId}'.`);

      logger.debug(`\n  Flushing stage '${stageName}' cache...`);

      await apiGateway.flushStageCache({ restApiId, stageName });

      logger.debug(`  Done`);

      logger.info(`Done.`);
      console.log('');
    } catch (error) {
      logger.error(error.message);
    }
  });
