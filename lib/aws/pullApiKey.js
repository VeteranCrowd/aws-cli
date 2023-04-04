// npm imports
import { APIGateway } from '@aws-sdk/client-api-gateway';
import { Logger } from '@karmaniverous/edge-logger';
import { Command } from 'commander';
import _ from 'lodash';
import { resolve } from 'path';

// lib imports
import { dotenvExpand } from '../dotenvExpand.js';
import { updateDotenv } from '../updateDotenv.js';

export const pullApiKey = new Command()
  .name('pull-apikey')
  .description('Create or update local environment variable from API Key.')
  .enablePositionalOptions()
  .passThroughOptions()
  .option(
    '-k, --key-name <string>',
    'API Key name (prefix with $ to use env var)',
    '$STACK_NAME'
  )
  .option(
    '-v, --variable-name <string>',
    'Environment variable name',
    'API_KEY'
  )
  .option(
    '-p, --target-paths <string...>',
    'space-delimited paths to target dotenv dirs (defaults to CLI paths)'
  )
  .option(
    '-t, --template-extension <string>',
    'extension indicating a dotenv template file',
    'template'
  )
  .action(async ({ keyName, targetPaths, templateExtension, variableName }) => {
    const logger = new Logger({ maxLevel: process.env.LOG_LEVEL });

    try {
      // Validate environment.
      const { env, paths, dotenvToken, privateToken } = JSON.parse(
        process.env['getdotenvOptions'] ?? '{}'
      );
      if (!env) throw new Error('environment not specified.');

      // Validate key name.
      keyName = dotenvExpand(keyName);
      if (!keyName) throw new Error('key name is undefined.');

      // Configure APIGateway.
      const apiGateway = new APIGateway({
        region: process.env.AWS_DEFAULT_REGION,
      });

      logger.info(
        `Merging API Key with local private environment variables...`
      );

      logger.debug(`  Retreiving '${keyName}' API Key...`);

      const { items: apiKeys } = await apiGateway.getApiKeys({
        includeValues: true,
        nameQuery: keyName,
      });

      if (!apiKeys.length) {
        throw new Error(`Unable to find API Key.`);
      }

      logger.debug(`  Done.`);

      // Update dotenv files.
      logger.debug(`\n  Creating/updating .env files...`);

      const dotenv = {
        [`${env}.${privateToken}`]: {
          [variableName]: apiKeys[0].value,
        },
      };

      _.forOwn(dotenv, async (values, extension) => {
        await updateDotenv(
          (targetPaths ?? paths).map((p) =>
            resolve(p, `${dotenvToken}.${extension}`)
          ),
          values,
          templateExtension
        );
      });

      logger.debug(`  Done.`);

      logger.info(`Done.`);
      console.log('');
    } catch (error) {
      logger.error(error.message);
    }
  });
