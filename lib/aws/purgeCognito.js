// npm imports
import { CognitoIdentityProvider } from '@aws-sdk/client-cognito-identity-provider';
import confirm from '@inquirer/confirm';
import { Command } from 'commander';

export const purgeCognito = new Command()
  .name('purge-cognito')
  .description('Purge all users from a Cognito User Pool.')
  .enablePositionalOptions()
  .passThroughOptions()
  .option('-f, --force', 'proceed without confirmation (not recommended)')
  .action(async ({ force }, command) => {
    const { logger = console } = command.parent?.parent?.getdotenvOptions ?? {};

    try {
      // Validate environment.
      if (!process.env.ENV) throw new Error('environment not specified.');

      if (!force) {
        const confirmed = await confirm({
          message: `Are you sure you want to purge all users from the ${process.env.ENV} User Pool? This action cannot be undone!`,
          default: false,
        });

        if (!confirmed) {
          logger.info(`Purge cancelled.`);
          process.exit(0);
        }
      }

      // Configure CognitoIdentityProvider.
      const cognito = new CognitoIdentityProvider({
        region: process.env.AWS_DEFAULT_REGION,
      });

      logger.info(`Purging the ${process.env.ENV} User Pool...`);

      logger.info(
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

      logger.info(`  Done.`);

      // Get user pool info.
      logger.info(
        `\n  Describing Cognito user pool with id: ${matchingCognitoPool.Id}...`
      );

      const describeUserPoolResponse = await cognito.describeUserPool({
        UserPoolId: matchingCognitoPool.Id,
      });

      const describedUserPool = describeUserPoolResponse.UserPool;
      if (!describedUserPool) {
        throw new Error(`Failed!`);
      }

      const userCount = describedUserPool.EstimatedNumberOfUsers;
      logger.info(`  User Pool has about ${userCount} users.`);

      logger.info(`\n  Purging users...`);

      let purged = 0;
      let user;
      do {
        purged++;

        ({
          Users: [user],
        } = await cognito.listUsers({
          Limit: 1,
          UserPoolId: matchingCognitoPool.Id,
        }));

        if (user) {
          await cognito.adminDeleteUser({
            UserPoolId: matchingCognitoPool.Id,
            Username: user.Username,
          });

          logger.info(`    Deleted user '${user.Username}' [${purged}].`);
        }
      } while (user);

      logger.info(`  Done.`);

      logger.info(`Done.`);
      console.log('');
    } catch (error) {
      logger.error(error.message);
    }
  });
