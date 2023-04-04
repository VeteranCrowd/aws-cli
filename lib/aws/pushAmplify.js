// npm imports
import { Amplify } from '@aws-sdk/client-amplify';
import { Logger } from '@karmaniverous/edge-logger';
import { getDotenv } from '@karmaniverous/get-dotenv';
import { Command } from 'commander';
import _ from 'lodash';

// lib imports
import { dotenvExpand } from '../dotenvExpand.js';

export const pushAmplify = new Command()
  .name('push-amplify')
  .description('Update Amplify app from local private environment variables.')
  .enablePositionalOptions()
  .passThroughOptions()
  .requiredOption(
    '-a, --app-name <string>',
    'amplify app name (prefix with $ to use env var)',
    '$SERVICE_NAME'
  )
  .option(
    '-b, --branch-name <string>',
    'branch name (prefix with $ to use env var)',
    '$BRANCH_NAME'
  )
  .action(async ({ appName, branchName }) => {
    const logger = new Logger({ maxLevel: process.env.LOG_LEVEL });

    try {
      // Validate app name.
      appName = dotenvExpand(appName);
      if (!appName) throw new Error('appName is undefined.');

      logger.info(
        `Pushing matching environment variables to Amplify app '${appName}'...`
      );

      // Retrieve Amplify app.
      logger.debug(`  Retrieving Amplify app...`);

      const amplify = new Amplify({ region: process.env.AWS_DEFAULT_REGION });
      const listAppsResponse = await amplify.listApps({});
      var matchingApp = (listAppsResponse.apps ?? []).find(
        (app) => app.name === appName
      );

      if (!matchingApp) {
        throw new Error(`Unable to find a matching Amplify app.`);
      }

      logger.debug(`  Done.`);

      // Update Amplify app branch environment variables.
      logger.debug(`\n  Updating Amplify app environment variables...`);

      const dotenvOptions = JSON.parse(
        process.env['__getdotenvOptions'] ?? '{}'
      );
      delete dotenvOptions.outputPath;
      const dotenvGlobal = await getDotenv({
        ...dotenvOptions,
        excludeEnv: true,
        excludeGlobal: false,
        excludePublic: false,
        excludePrivate: false,
      });

      _.forOwn(matchingApp.environmentVariables, (value, key, obj) => {
        if (dotenvGlobal[key]) obj[key] = dotenvGlobal[key];
      });

      await amplify.updateApp({
        appId: matchingApp.appId,
        environmentVariables: matchingApp.environmentVariables,
      });

      logger.debug(`  Done`);

      // Resolve branch name.
      branchName = dotenvExpand(branchName);
      if (branchName) {
        // Retrieve Amplify app branch.
        logger.debug(`\n  Retrieving Amplify app branch '${branchName}'...`);

        const listBranchesResponse = await amplify.listBranches({
          appId: matchingApp.appId,
        });

        const matchingBranch = listBranchesResponse.branches.find(
          (b) => b.branchName === branchName
        );

        if (!matchingBranch) {
          throw new Error(`Unable to find a matching branch.`);
        }

        logger.debug(`  Done.`);

        // Update Amplify app branch environment variables.
        logger.debug(`\n  Updating Amplify app environment variables...`);

        const dotenvEnv = await getDotenv({
          ...dotenvOptions,
          excludeEnv: false,
          excludeGlobal: true,
          excludePublic: false,
          excludePrivate: false,
        });

        _.forOwn(matchingBranch.environmentVariables, (value, key, obj) => {
          if (dotenvEnv[key]) obj[key] = dotenvEnv[key];
        });

        await amplify.updateBranch({
          appId: matchingApp.appId,
          branchName: matchingBranch.branchName,
          environmentVariables: matchingBranch.environmentVariables,
        });

        logger.debug(`  Done`);
      }
      logger.info(`Done.`);
      console.log('');
    } catch (error) {
      logger.error(error.message);
    }
  });
