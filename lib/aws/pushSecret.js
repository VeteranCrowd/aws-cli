// npm imports
import { Logger } from '@karmaniverous/edge-logger';
import { getDotenv } from '@karmaniverous/get-dotenv';
import { WrappedSecretsManagerClient } from '@veterancrowd/wrapped-secrets-manager-client';
import { Command } from 'commander';

// lib imports
import { envMerge } from '../envMerge.js';

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
  .action(async ({ secretName }) => {
    const logger = new Logger({ maxLevel: process.env.LOG_LEVEL });

    try {
      // Validate secret name.
      secretName = envMerge(secretName);
      if (!secretName) throw new Error('secretName is undefined.');

      // Get environment secrets.
      const dotenvOptions = JSON.parse(
        process.env['aws-cli-dotenvoptions'] ?? '{}'
      );
      delete dotenvOptions.outputPath;

      const secrets = await getDotenv({
        ...dotenvOptions,
        excludeDynamic: true,
        excludeEnv: false,
        excludeGlobal: true,
        excludePublic: true,
        excludePrivate: false,
      });

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
          value: JSON.stringify(secrets),
        });
      } catch (error) {
        await secretsClient.createSecret({
          name: secretName,
          value: JSON.stringify(secrets),
        });
      }

      logger.info(`Done.`);
      console.log('');
    } catch (error) {
      logger.error(error.message);
    }
  });
