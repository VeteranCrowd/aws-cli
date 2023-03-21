// npm imports
import { Logger } from '@karmaniverous/edge-logger';
import { WrappedSecretsManagerClient } from '@veterancrowd/wrapped-secrets-manager-client';
import { Command } from 'commander';

export const updateSecrets = new Command()
  .name('update-secrets')
  .description('Update stack secrets from environment variables.')
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
      `Updating stack '${process.env.STACK_NAME}' secrets from environment variables: ${variables}.`
    );

    // Get secrets.
    const { value } = await wrappedSecretsManagerClient.getSecretValue({
      secretId: process.env.STACK_NAME,
    });

    // Update secrets.
    const updatedSecrets = variables.reduce(
      (updatedSecrets, variable) => {
        if (process.env[variable]) {
          updatedSecrets[variable] = process.env[variable];
        }
        return updatedSecrets;
      },
      { ...value }
    );

    // Put secrets.
    await wrappedSecretsManagerClient.putSecretValue({
      secretId: process.env.STACK_NAME,
      value: updatedSecrets,
    });

    logger.info('Done.');
  });
