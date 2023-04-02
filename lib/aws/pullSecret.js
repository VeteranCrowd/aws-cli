// npm imports
import { Logger } from '@karmaniverous/edge-logger';
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
  .enablePositionalOptions()
  .passThroughOptions()
  .option(
    '-e, --env <string>',
    'Environment. Defaults to dotenv setting. Prefix with $ to use environment variable.'
  )
  .option(
    '-s, --secret-name <string>',
    'Secret name. Prefix with $ to use environment variable.',
    '$STACK_NAME'
  )
  .option(
    '-p, --target-path <string>',
    'Target file path. If not specified, will use the first matching dotenv file or template found in specified paths.'
  )
  .option(
    '-t, --template-extension <string>',
    'Extension indicating a dotenv template file.',
    'template'
  )
  .action(async ({ env, secretName, targetPath, templateExtension }) => {
    const logger = new Logger({ maxLevel: process.env.LOG_LEVEL });

    try {
      // Resolve environment.
      const {
        env: defaultEnv,
        paths,
        dotenvToken,
        privateToken,
      } = JSON.parse(process.env['aws-cli-dotenvoptions'] ?? '{}');

      if (env?.startsWith('$')) env = process.env[env.slice(1)];
      env ??= defaultEnv;
      if (!env) throw new Error('Environment not specified.');

      // Resolve secret name.
      if (secretName?.startsWith('$'))
        secretName = process.env[secretName.slice(1)];
      if (!secretName) throw new Error('Secret name not specified.');

      // Configure WrappedSecretsManagerClient.
      const secretsClient = new WrappedSecretsManagerClient({
        logger,
      });

      // Pull secrets.
      logger.info(`Pulling secret '${secretName}' from AWS Secrets Manager...`);
      try {
        var secrets = JSON.parse(
          (
            await secretsClient.getSecretValue({
              secretId: secretName,
            })
          ).value
        );
      } catch {
        throw new Error('Secret not found.');
      }

      // Resolve paths.
      const resolvedPaths = targetPath
        ? [resolve(targetPath)]
        : paths.map((p) => resolve(p, `${dotenvToken}.${env}.${privateToken}`));

      // Update dotenv files.
      await updateDotenv(resolvedPaths, templateExtension, secrets);

      logger.info(`Done.`);
    } catch (error) {
      logger.error(error.message);
    }
  });
