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
    let {
      dotenvToken,
      logger = console,
      paths,
      privateToken,
    } = getDotenvCliOptions2Options(
      command.parent?.parent?.getDotenvCliOptions ?? {}
    );

    try {
      // Validate environment.
      if (!process.env.ENV) throw new Error('environment not specified.');

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
        resolve(p, `${dotenvToken}.${process.env.ENV}.${privateToken}`)
      );

      // Update dotenv files.
      await updateDotenv(resolvedPaths, secrets, templateExtension);

      logger.info(`Done.`);
      console.log('');
    } catch (error) {
      logger.error(error.message);
    }
  });
