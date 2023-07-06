// npm imports
import { dotenvExpand } from '@karmaniverous/get-dotenv';
import { WrappedSecretsManagerClient } from '@veterancrowd/wrapped-secrets-manager-client';
import { Command } from 'commander';

export const deleteSecret = new Command()
  .name('delete-secret')
  .description('Delete AWS Secrets Manager secret.')
  .configureHelp({ showGlobalOptions: true })
  .enablePositionalOptions()
  .passThroughOptions()
  .option(
    '-s, --secret-name <string>',
    'secret name (prefix with $ to use env var)',
    '$STACK_NAME'
  )
  .action(async ({ secretName }, command) => {
    const { logger = console } = command.parent?.parent?.getdotenvOptions ?? {};

    try {
      // Validate secret name.
      secretName = dotenvExpand(secretName);
      if (!secretName) throw new Error('secretName is undefined.');

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
      console.log('');
    } catch (error) {
      logger.error(error.message);
    }
  });
