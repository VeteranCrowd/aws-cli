// npm imports
import { dotenvExpand } from '@karmaniverous/get-dotenv';
import { WrappedSecretsManagerClient } from '@veterancrowd/wrapped-secrets-manager-client';
import { Command } from 'commander';
import { resolve } from 'path';

// lib imports
import { updateDotenv } from '../updateDotenv.js';

export const pullSecret = new Command()
  .name('pull-secret')
  .description(
    'Create or update local private environment variables from AWS Secrets Manager secret.'
  )
  .configureHelp({ showGlobalOptions: true })
  .enablePositionalOptions()
  .passThroughOptions()
  .requiredOption(
    '-s, --secret-name <string>',
    'secret name (prefix with $ to use env var)',
    '$STACK_NAME'
  )
  .option(
    '-t, --template-extension <string>',
    'extension indicating a dotenv template file',
    'template'
  )
  .action(async ({ secretName, templateExtension }, command) => {
    const {
      dotenvToken,
      env,
      logger = console,
      paths,
      privateToken,
    } = command.parent?.parent?.getdotenvOptions ?? {};

    try {
      // Validate environment.
      if (!env) throw new Error('environment not specified.');

      // Validate secret name.
      secretName = dotenvExpand(secretName);
      if (!secretName) throw new Error('secret name not specified.');

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
      const resolvedPaths = paths.map((p) =>
        resolve(p, `${dotenvToken}.${env}.${privateToken}`)
      );

      // Update dotenv files.
      await updateDotenv(resolvedPaths, secrets, templateExtension);

      logger.info(`Done.`);
      console.log('');
    } catch (error) {
      logger.error(error.message);
    }
  });
