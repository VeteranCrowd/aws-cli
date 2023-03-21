// npm imports
import { CognitoIdentityProvider } from '@aws-sdk/client-cognito-identity-provider';
import { Logger } from '@karmaniverous/edge-logger';
import { Command } from 'commander';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// lib imports
import { updateDotenvContentsForEnvironmentVariable } from './util/dotenv.js';

export const retrieveCognito = new Command()
  .name('retrieve-cognito')
  .description(
    "Updates an environment's .env.local file with Cognito user pool details"
  )
  .enablePositionalOptions()
  .passThroughOptions()
  .action(async () => {
    const env = process.env.ENV;
    const logger = new Logger({ maxLevel: process.env.LOG_LEVEL });

    const cognito = new CognitoIdentityProvider({
      region: process.env.AWS_DEFAULT_REGION,
    });

    logger.info(`Retrieving Cognito user pool details for environment: ${env}`);

    // only list 4 because we can have up to 4 in a stack
    const cognitoPoolsResponse = await cognito.listUserPools({
      MaxResults: 4,
    });
    const matchingCognitoPool = (cognitoPoolsResponse.UserPools ?? []).find(
      (userPool) => userPool.Name.endsWith(env)
    );
    if (!matchingCognitoPool) {
      throw new Error(
        `Unable to find a matching Cognito pool for environment: ${env}`
      );
    }

    logger.debug(
      `Found Cognito user pool for environment: ${matchingCognitoPool.Name}`
    );
    logger.debug(`Describing Cognito user pool: ${matchingCognitoPool.Id}`);

    const describeUserPoolResponse = await cognito.describeUserPool({
      UserPoolId: matchingCognitoPool.Id,
    });
    const describedUserPool = describeUserPoolResponse.UserPool;
    if (!describedUserPool) {
      throw new Error(
        `Unable to describe Cognito user pool: ${matchingCognitoPool.Id}`
      );
    }
    if (!describedUserPool.Domain) {
      throw new Error('Cognito user pool does not have a custom domain');
    }

    logger.debug('Listing Cognito user pool clients');

    const listUserPoolClientsResponse = await cognito.listUserPoolClients({
      // arbitrary, can change if needed
      MaxResults: 4,
      UserPoolId: matchingCognitoPool.Id,
    });
    const matchingUserPoolClient = (
      listUserPoolClientsResponse.UserPoolClients ?? []
    ).find((client) => client.ClientName === 'web-app');
    if (!matchingUserPoolClient) {
      throw new Error(
        `Unable to find a matching Cognito web-app client on the user pool for environment: ${env}`
      );
    }

    logger.debug(
      `Found Cognito user pool client for web-app: ${matchingUserPoolClient.ClientName}`
    );
    logger.debug('Retrieving details for Cognito user pool client');

    const describeUserPoolClientResponse = await cognito.describeUserPoolClient(
      {
        ClientId: matchingUserPoolClient.ClientId,
        UserPoolId: matchingUserPoolClient.UserPoolId,
      }
    );
    const responseUserPoolClient =
      describeUserPoolClientResponse.UserPoolClient;
    if (!responseUserPoolClient) {
      throw new Error(
        `Unable to retrieve details for Cognito user pool client: ${env}`
      );
    }

    logger.debug(`Retrieved details for Cognito user pool client`);
    logger.debug(`Validating details for Cognito user pool client`);

    const poolId = responseUserPoolClient.UserPoolId;
    if (!poolId) {
      throw new Error(
        `Unable to retrieve user pool ID for Cognito web-app client on the user pool for environment: ${env}`
      );
    }
    const clientId = responseUserPoolClient.ClientId;
    if (!clientId) {
      throw new Error(
        `Unable to retrieve client ID for Cognito web-app client on the user pool for environment: ${env}`
      );
    }
    const clientSecret = responseUserPoolClient.ClientSecret;
    if (!clientSecret) {
      throw new Error(
        `Unable to retrieve client secret for Cognito web-app client on the user pool for environment: ${env}`
      );
    }

    logger.debug(`Writing configuration to .env files for environment: ${env}`);

    const pathToDotenvForEnv = join(process.cwd(), 'env', `.env.${env}`);
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

    let dotenvForEnvContents = readFileSync(pathToDotenvForEnv, {
      encoding: 'utf-8',
    }).split('\n');

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

    dotenvForEnvContents = updateDotenvContentsForEnvironmentVariable(
      dotenvForEnvContents,
      'NEXTAUTH_COGNITO_CLIENT_ID',
      clientId
    );
    dotenvForEnvContents = updateDotenvContentsForEnvironmentVariable(
      dotenvForEnvContents,
      'NEXTAUTH_COGNITO_DOMAIN',
      describedUserPool.Domain
    );
    dotenvForEnvContents = updateDotenvContentsForEnvironmentVariable(
      dotenvForEnvContents,
      'NEXTAUTH_COGNITO_REGION',
      process.env.AWS_DEFAULT_REGION
    );
    dotenvForEnvContents = updateDotenvContentsForEnvironmentVariable(
      dotenvForEnvContents,
      'NEXTAUTH_COGNITO_USER_POOL_ID',
      poolId
    );
    dotenvLocalForEnvContents = updateDotenvContentsForEnvironmentVariable(
      dotenvLocalForEnvContents,
      'NEXTAUTH_COGNITO_CLIENT_SECRET',
      clientSecret
    );

    writeFileSync(pathToDotenvForEnv, dotenvForEnvContents.join('\n'), {
      encoding: 'utf-8',
    });
    writeFileSync(
      pathToDotenvLocalForEnv,
      dotenvLocalForEnvContents.join('\n'),
      {
        encoding: 'utf-8',
      }
    );

    logger.info(`Wrote configuration to .env files for environment: ${env}`);
  });
