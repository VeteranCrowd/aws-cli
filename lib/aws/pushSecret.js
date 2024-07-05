// npm imports
import {
  dotenvExpand,
  getDotenv,
  getDotenvCliOptions2Options,
} from '@karmaniverous/get-dotenv';
import { WrappedSecretsManagerClient } from '@veterancrowd/wrapped-secrets-manager-client';
import { Command, Option } from 'commander';
import _ from 'lodash';

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
      'space-delimited list of environment variables to exclude (conflicts with --include)'
    ).conflicts('include')
  )
  .addOption(
    new Option(
      '-i, --include <strings...>',
      'space-delimited list of environment variables to include (conflicts with --exclude)'
    ).conflicts('exclude')
  )
  .action(async ({ exclude, include, secretName }, command) => {
    const { logger = console, ...getDotenvOptions } =
      getDotenvCliOptions2Options(
        command.parent?.parent?.getDotenvCliOptions ?? {}
      );

    try {
      // Validate secret name.
      secretName = dotenvExpand(secretName);
      if (!secretName) throw new Error('secretName is undefined.');

      // Get environment secrets.
      delete getDotenvOptions.outputPath;

      let secrets = await getDotenv({
        ...getDotenvOptions,
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
