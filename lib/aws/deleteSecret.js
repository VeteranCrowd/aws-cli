/*
****************************** DO NOT EDIT ****************************** 
This code and all related intellectual property is owned by Veteran Crowd 
Rewards, LLC. It is not to be disclosed, copied or used without written 
permission.
*************************************************************************
*/

// npm imports
import {
  dotenvExpand,
  getDotenvCliOptions2Options,
} from '@karmaniverous/get-dotenv';
import { WrappedSecretsManagerClient } from '@veterancrowd/wrapped-secrets-manager-client';
import { Command } from 'commander';

export const deleteSecret = new Command()
  .name('delete-secret')
  .description('Delete AWS Secrets Manager secret.')
  .enablePositionalOptions()
  .passThroughOptions()
  .option(
    '-s, --secret-name <string>',
    'secret name (prefix with $ to use env var)',
    '$STACK_NAME'
  )
  .action(async ({ secretName }, command) => {
    const { logger = console } = getDotenvCliOptions2Options(
      command.parent?.parent?.getDotenvCliOptions ?? {}
    );

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
