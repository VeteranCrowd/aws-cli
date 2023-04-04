// npm imports
import { Logger } from '@karmaniverous/edge-logger';
import { WrappedSecretsManagerClient } from '@veterancrowd/wrapped-secrets-manager-client';
import { Command } from 'commander';
import { resolve } from 'path';

// lib imports
import { dotenvExpand } from '../dotenvExpand.js';
import { updateDotenv } from '../updateDotenv.js';

export const pullSecret = new Command()
  .name('pull-secret')
  .description(
    'Create or update local private environment variables from AWS Secrets Manager secret.'
  )
  .enablePositionalOptions()
  .passThroughOptions()
  .option(
    '-s, --secret-name <string>',
    'secret name (prefix with $ to use env var)',
    '$STACK_NAME'
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
  .action(async ({ secretName, targetPath, templateExtension }) => {
    const logger = new Logger({ maxLevel: process.env.LOG_LEVEL });

    try {
      // Validate environment.
      const { env, paths, dotenvToken, privateToken } = JSON.parse(
        process.env['aws-cli-dotenvoptions'] ?? '{}'
      );

      if (!env) throw new Error('environment not specified.');

      // Validate secret name.
      secretName = dotenvExpand(secretName);
      if (!secretName) throw new Error('secret name is undefined.');

      // Configure WrappedSecretsManagerClient.
      const secretsClient = new WrappedSecretsManagerClient({
        logger,
      });

      // Pull secrets.
      logger.info(`Pulling secret '${secretName}' from AWS Secrets Manager...`);
      try {
        var secrets = (
          await secretsClient.getSecretValue({
            secretId: secretName,
          })
        ).value;
      } catch {
        throw new Error('Secret not found.');
      }

      // Resolve paths.
      const resolvedPaths = targetPath
        ? [resolve(targetPath)]
        : paths.map((p) => resolve(p, `${dotenvToken}.${env}.${privateToken}`));

      // Update dotenv files.
      await updateDotenv(resolvedPaths, secrets, templateExtension);

      logger.info(`Done.`);
      console.log('');
    } catch (error) {
      logger.error(error.message);
    }
  });
