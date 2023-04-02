// npm imports
import { Logger } from '@karmaniverous/edge-logger';
import { WrappedSecretsManagerClient } from '@veterancrowd/wrapped-secrets-manager-client';
import { Command } from 'commander';

export const deleteSecret = new Command()
  .name('delete-secret')
  .description('Delete AWS Secrets Manager secret.')
  .enablePositionalOptions()
  .passThroughOptions()
  .option(
    '-s, --secret-name <string>',
    'Secret name. Prefix with $ to use environment variable.',
    '$STACK_NAME'
  )
  .action(async ({ secretName }) => {
    const logger = new Logger({ maxLevel: process.env.LOG_LEVEL });

    try {
      // Resolve secret name.
      if (secretName?.startsWith('$'))
        secretName = process.env[secretName.slice(1)];
      if (!secretName) throw new Error('Secret name not specified.');

      // Configure WrappedSecretsManagerClient.
      const secretsClient = new WrappedSecretsManagerClient({
        logger,
      });

      // Delete secrets.
      logger.info(
        `Deleting secret '${secretName}' from AWS Secrets Manager...`
      );

      await secretsClient.deleteSecret({
        secretId: secretName,
        forceDeleteWithoutRecovery: true,
      });

      logger.info('Done.');
    } catch (error) {
      logger.error(error.message);
    }
  });
