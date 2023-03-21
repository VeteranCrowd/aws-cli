// npm imports
import { Logger } from '@karmaniverous/edge-logger';
import { WrappedSecretsManagerClient } from '@veterancrowd/wrapped-secrets-manager-client';
import { Command } from 'commander';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

export const retrieveSecrets = new Command()
  .name('retrieve-secrets')
  .description('Retrieve stack secrets and store in .env files.')
  .enablePositionalOptions()
  .passThroughOptions()
  .action(async () => {
    const env = process.env.ENV;
    const logger = new Logger({ maxLevel: process.env.LOG_LEVEL });

    // Configure WrappedSecretsManagerClient.
    const wrappedSecretsManagerClient = new WrappedSecretsManagerClient({
      logger,
    });

    logger.info(
      `Retrieving stack '${process.env.STACK_NAME}' secrets to store in .env.${env}.local.`
    );

    const updateDotenvContentsForEnvironmentVariable = (
      dotenvContents,
      key,
      value
    ) => {
      const toModify = [...dotenvContents];
      const indexOfCognitoSecret = toModify.findIndex((line) =>
        line.startsWith(`${key}=`)
      );
      if (indexOfCognitoSecret >= 0) {
        toModify[indexOfCognitoSecret] = `${key}=${value}`;
      } else {
        toModify.push(`${key}=${value}`);
      }
      return toModify;
    };

    logger.debug(
      `Retrieving Cognito user pool details for environment: ${env}`
    );

    // Get secrets.
    const { value } = await wrappedSecretsManagerClient.getSecretValue({
      secretId: process.env.STACK_NAME,
    });

    logger.debug(`Writing configuration to .env files for environment: ${env}`);

    const pathToDotenvLocalForEnv = join(
      process.cwd(),
      'env',
      `.env.${env}.local`
    );
    const pathToDotenvLocalTemplateForEnv = join(
      process.cwd(),
      'env',
      `.env.${env}.local.template`
    );

    let dotenvLocalForEnvContents;
    if (existsSync(pathToDotenvLocalForEnv)) {
      dotenvLocalForEnvContents = readFileSync(pathToDotenvLocalForEnv, {
        encoding: 'utf-8',
      }).split('\n');
    } else {
      dotenvLocalForEnvContents = readFileSync(
        pathToDotenvLocalTemplateForEnv,
        {
          encoding: 'utf-8',
        }
      ).split('\n');
    }

    dotenvLocalForEnvContents = Object.entries(value).reduce(
      (dotenv, [key, value]) =>
        updateDotenvContentsForEnvironmentVariable(dotenv, key, value),
      dotenvLocalForEnvContents
    );

    writeFileSync(
      pathToDotenvLocalForEnv,
      dotenvLocalForEnvContents.join('\n'),
      {
        encoding: 'utf-8',
      }
    );

    logger.info(`Wrote configuration to .env files for environment: ${env}`);
  });
