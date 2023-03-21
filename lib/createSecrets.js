// npm imports
import { Logger } from '@karmaniverous/edge-logger';
import { WrappedSecretsManagerClient } from '@veterancrowd/wrapped-secrets-manager-client';
import { Command } from 'commander';

export const createSecrets = new Command()
  .name('create-secrets')
  .description('Create stack secrets from environment variables.')
  .enablePositionalOptions()
  .passThroughOptions()
  .requiredOption(
    '-v, --variables <string...>',
    '* Space-separated list of environment variables to update.'
  )
  .action(async ({ variables }) => {
    const logger = new Logger({ maxLevel: process.env.LOG_LEVEL });

    // Configure WrappedSecretsManagerClient.
    const wrappedSecretsManagerClient = new WrappedSecretsManagerClient({
      logger,
    });

    logger.info(
      `Creating stack '${process.env.STACK_NAME}' secrets from environment variables: ${variables}.`
    );

    // Update secrets.
    const updatedSecrets = variables.reduce((updatedSecrets, variable) => {
      if (process.env[variable]) {
        updatedSecrets[variable] = process.env[variable];
      }
      return updatedSecrets;
    }, {});

    // Put secrets.
    await wrappedSecretsManagerClient.createSecret({
      name: process.env.STACK_NAME,
      description: `${process.env.SERVICE_NAME} environment secrets`,
      value: updatedSecrets,
    });

    logger.info('Done.');
  });
