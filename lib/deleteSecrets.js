// npm imports
import { Logger } from '@karmaniverous/edge-logger';
import { WrappedSecretsManagerClient } from '@veterancrowd/wrapped-secrets-manager-client';
import { Command } from 'commander';

export const deleteSecrets = new Command()
  .name('delete-secrets')
  .description('Delete stack secrets.')
  .enablePositionalOptions()
  .passThroughOptions()
  .action(async () => {
    const logger = new Logger({ maxLevel: process.env.LOG_LEVEL });

    // Configure WrappedSecretsManagerClient.
    const wrappedSecretsManagerClient = new WrappedSecretsManagerClient({
      logger,
    });

    logger.info(`Deleting stack '${process.env.STACK_NAME}' secrets.`);

    // Delete secrets.
    await wrappedSecretsManagerClient.deleteSecret({
      secretId: process.env.STACK_NAME,
      forceDeleteWithoutRecovery: true,
    });

    logger.info('Done.');
  });
