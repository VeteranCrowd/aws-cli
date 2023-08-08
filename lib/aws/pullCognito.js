// npm imports
import { CognitoIdentityProvider } from '@aws-sdk/client-cognito-identity-provider';
import { dotenvExpand } from '@karmaniverous/get-dotenv';
import { Command } from 'commander';
import _ from 'lodash';
import { resolve } from 'path';

// lib imports
import { updateDotenv } from '../updateDotenv.js';

export const pullCognito = new Command()
  .name('pull-cognito')
  .description(
    'Create or update local environment variables from Cognito User Pool details.'
  )
  .enablePositionalOptions()
  .passThroughOptions()
  .option(
    '-c, --client-name <string>',
    'Cognito User Pool client name (prefix with $ to use env var)',
    'web-app'
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
  .action(async ({ clientName, targetPaths, templateExtension }, command) => {
    const {
      dotenvToken,
      logger = console,
      paths,
      privateToken,
    } = command.parent?.parent?.getdotenvOptions ?? {};

    try {
      // Validate environment.
      if (!process.env.ENV) throw new Error('environment not specified.');

      // Validate client name.
      clientName = dotenvExpand(clientName);
      if (!clientName) throw new Error('client name is undefined.');

      // Configure CognitoIdentityProvider.
      const cognito = new CognitoIdentityProvider({
        region: process.env.AWS_DEFAULT_REGION,
      });

      logger.info(
        `Merging Cognito User Pool details with local private environment variables...`
      );

      logger.debug(
        `  Retrieving Cognito user pool details for '${process.env.ENV}' environment...`
      );

      // Find Cognito user pool matching environment.
      const cognitoPoolsResponse = await cognito.listUserPools({
        MaxResults: 60, // Max is 60
      });

      const matchingCognitoPool = (cognitoPoolsResponse.UserPools ?? []).find(
        (userPool) => userPool.Name.endsWith(`-${process.env.ENV}`)
      );

      if (!matchingCognitoPool) {
        throw new Error(`Unable to find matching Cognito User Pool.`);
      }

      logger.debug(`  Done.`);

      // Get user pool info.
      logger.debug(
        `\n  Describing Cognito user pool with id: ${matchingCognitoPool.Id}...`
      );

      const describeUserPoolResponse = await cognito.describeUserPool({
        UserPoolId: matchingCognitoPool.Id,
      });

      const describedUserPool = describeUserPoolResponse.UserPool;
      if (!describedUserPool) {
        throw new Error(`Failed!`);
      }
      if (!describedUserPool.Domain) {
        throw new Error('Cognito user pool does not have a custom domain.');
      }

      logger.debug('  Done.');

      // Find user pool client.
      logger.debug(`\n  Finding User Pool client '${clientName}'...`);

      const listUserPoolClientsResponse = await cognito.listUserPoolClients({
        // arbitrary, can change if needed
        MaxResults: 4,
        UserPoolId: matchingCognitoPool.Id,
      });

      const matchingUserPoolClient = (
        listUserPoolClientsResponse.UserPoolClients ?? []
      ).find((client) => client.ClientName === clientName);

      if (!matchingUserPoolClient) {
        throw new Error('Failed!');
      }

      logger.debug(`  Done.`);

      // Get client info.
      logger.debug('\n  Retrieving details for Cognito user pool client...');

      const describeUserPoolClientResponse =
        await cognito.describeUserPoolClient({
          ClientId: matchingUserPoolClient.ClientId,
          UserPoolId: matchingUserPoolClient.UserPoolId,
        });

      const responseUserPoolClient =
        describeUserPoolClientResponse.UserPoolClient;

      if (!responseUserPoolClient) {
        throw new Error(
          `Unable to retrieve details for Cognito user pool client: ${clientName}`
        );
      }

      logger.debug(`  Done.`);

      // Extract & validate secrets.
      logger.debug('\n  Extracting & validating Cognito details...');

      const dotenv = {
        [`${process.env.ENV}`]: {
          NEXT_PUBLIC_NEXTAUTH_COGNITO_CLIENT_ID:
            responseUserPoolClient.ClientId,
          NEXT_PUBLIC_NEXTAUTH_COGNITO_DOMAIN: describedUserPool.Domain,
          NEXTAUTH_COGNITO_REGION: process.env.AWS_DEFAULT_REGION,
          NEXTAUTH_COGNITO_USER_POOL_ID: responseUserPoolClient.UserPoolId,
          NEXTAUTH_COGNITO_USER_POOL_ARN: describedUserPool.Arn,
        },
        [`${process.env.ENV}.${privateToken}`]: {
          NEXTAUTH_COGNITO_CLIENT_SECRET: responseUserPoolClient.ClientSecret,
        },
      };

      _.forOwn(dotenv, (values) =>
        _.forOwn(values, (value, key) => {
          if (!value) throw new Error(`Value not found: ${key}`);
        })
      );

      logger.debug(`  Done.`);

      // Update dotenv files.
      logger.debug(`\n  Creating/updating .env files...`);

      _.forOwn(dotenv, async (values, extension) => {
        await updateDotenv(
          (targetPaths ?? paths).map((p) =>
            resolve(p, `${dotenvToken}.${extension}`)
          ),
          values,
          templateExtension
        );
      });

      logger.debug(`  Done.`);

      logger.info(`Done.`);
      console.log('');
    } catch (error) {
      logger.error(error.message);
    }
  });
