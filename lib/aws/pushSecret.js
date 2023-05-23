// npm imports
import { Logger } from '@karmaniverous/edge-logger';
import { getDotenv } from '@karmaniverous/get-dotenv';
import { WrappedSecretsManagerClient } from '@veterancrowd/wrapped-secrets-manager-client';
import { Command, Option } from 'commander';
import _ from 'lodash';

// lib imports
import { dotenvExpand } from '../dotenvExpand.js';

export const pushSecret = new Command()
  .name('push-secret')
  .description(
    'Create or update AWS Secrets Manager secret from local private environment variables.'
  )
  .enablePositionalOptions()
  .passThroughOptions()
  .option(
    '-s, --secret-name <string>',
    'secret name (prefix with $ to use env var)',
    '$STACK_NAME'
  )
  .addOption(
    new Option(
      '-e, --exclude <strings...>',
      'space-delimited list of environment variables to exclude (conflicts with --exclude)'
    ).conflicts('include')
  )
  .addOption(
    new Option(
      '-i, --include <strings...>',
      'space-delimited list of environment variables to include (conflicts with --exclude)'
    ).conflicts('exclude')
  )
  .action(async ({ exclude, include, secretName }) => {
    const logger = new Logger({ maxLevel: process.env.LOG_LEVEL });

    try {
      // Validate secret name.
      secretName = dotenvExpand(secretName);
      if (!secretName) throw new Error('secretName is undefined.');

      // Get environment secrets.
      const dotenvOptions = JSON.parse(process.env['getdotenvOptions'] ?? '{}');
      delete dotenvOptions.outputPath;

      let secrets = await getDotenv({
        ...dotenvOptions,
        excludeDynamic: true,
        excludeEnv: false,
        excludeGlobal: true,
        excludePublic: true,
        excludePrivate: false,
      });

      if (exclude) secrets = _.omit(secrets, exclude);
      if (include) secrets = _.pick(secrets, include);

      // Configure WrappedSecretsManagerClient.
      const secretsClient = new WrappedSecretsManagerClient({
        logger,
      });

      // Push secrets.
      logger.info(`Pushing secret '${secretName}' to AWS Secrets Manager...`);

      try {
        // Create or update secret.
        await secretsClient.putSecretValue({
          secretId: secretName,
          value: secrets,
        });
      } catch (error) {
        await secretsClient.createSecret({
          name: secretName,
          value: secrets,
        });
      }

      logger.info(`Done.`);
      console.log('');
    } catch (error) {
      logger.error(error.message);
    }
  });
