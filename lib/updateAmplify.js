// npm imports
import { Amplify } from '@aws-sdk/client-amplify';
import { Logger } from '@karmaniverous/edge-logger';
import { Command } from 'commander';

export const updateAmplify = new Command()
  .name('update-amplify')
  .description('Update Amplify secrets from environment variables.')
  .enablePositionalOptions()
  .passThroughOptions()
  .requiredOption(
    '-v, --variables <string...>',
    '* Space-separated list of environment variables to update.'
  )
  .action(async ({ variables }) => {
    const env = process.env.ENV;
    const logger = new Logger({ maxLevel: process.env.LOG_LEVEL });

    const amplify = new Amplify({ region: process.env.AWS_DEFAULT_REGION });

    const branchName = env === 'prod' ? 'main' : env;

    logger.info(`Retrieving Amplify app`);

    const listAppsResponse = await amplify.listApps({});
    var matchingApp = (listAppsResponse.apps ?? []).find(
      (app) => app.name === process.env.SERVICE_NAME
    );
    if (!matchingApp) {
      throw new Error(`Unable to find a matching Amplify app`);
    }

    logger.debug(`Retrieving branches of Amplify app for environment: ${env}`);

    const listBranchesResponse = await amplify.listBranches({
      appId: matchingApp.appId,
    });
    const matchingBranch = listBranchesResponse.branches.find(
      (branch) => branch.branchName === branchName
    );
    if (!matchingBranch) {
      throw new Error(
        `Unable to find a matching branch on Amplify amp for environment: ${env}`
      );
    }

    logger.debug(`Found branch of Amplify app for environment: ${env}`);
    logger.debug(
      `Updating environment variables of Amplify app for environment: ${env}`
    );

    const updatedEnvironmentVariables = variables.reduce(
      (acc, variable) => {
        if (process.env[variable]) {
          acc[variable] = process.env[variable];
        }
        return acc;
      },
      { ...matchingBranch.environmentVariables }
    );

    await amplify.updateBranch({
      appId: matchingApp.appId,
      branchName: matchingBranch.branchName,
      environmentVariables: updatedEnvironmentVariables,
    });

    logger.info(
      `Updated environment variables of Amplify app for environment: ${env}`
    );
  });
