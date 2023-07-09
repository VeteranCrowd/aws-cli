// npm imports
import { Amplify } from '@aws-sdk/client-amplify';
import { dotenvExpand, getDotenv } from '@karmaniverous/get-dotenv';
import { Command, Option } from 'commander';
import _ from 'lodash';

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
    '$ENV_BRANCH'
  )
  .addOption(
    new Option(
      '-e, --exclude <strings...>',
      'space-delimited list of environment variables to exclude (conflicts with --exclude)'
    ).conflicts('include')
  )
  .addOption(
    new Option(
      '-i, --include <strings...>',
      'space-delimited list of environment variables to include (conflicts with --exclude)'
    ).conflicts('exclude')
  )
  .action(async ({ appName, branchName, exclude, include }, command) => {
    const { logger = console, ...getdotenvOptions } =
      command.parent?.parent?.getdotenvOptions ?? {};

    try {
      // Validate app name.
      appName = dotenvExpand(appName);
      if (!appName) throw new Error('appName is undefined.');

      // Validate branch name.
      branchName = dotenvExpand(branchName);
      if (!branchName) throw new Error('branchName is undefined.');

      logger.info(
        `Pushing matching environment variables to Amplify app '${appName}' branch '${branchName}'...`
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

      delete getdotenvOptions.outputPath;
      let dotenvGlobal = await getDotenv({
        ...getdotenvOptions,
        excludeEnv: true,
        excludeGlobal: false,
        excludePublic: false,
        excludePrivate: false,
      });

      if (exclude) dotenvGlobal = _.omit(dotenvGlobal, exclude);
      if (include) dotenvGlobal = _.pick(dotenvGlobal, include);

      _.forOwn(matchingApp.environmentVariables, (value, key, obj) => {
        if (dotenvGlobal[key]) obj[key] = dotenvGlobal[key];
        else delete obj[key];
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

        let dotenvEnv = await getDotenv({
          ...getdotenvOptions,
          excludeEnv: false,
          excludeGlobal: true,
          excludePublic: false,
          excludePrivate: false,
        });

        if (exclude) dotenvEnv = _.omit(dotenvEnv, exclude);
        if (include) dotenvEnv = _.pick(dotenvEnv, include);

        _.forOwn(matchingBranch.environmentVariables, (value, key, obj) => {
          if (dotenvEnv[key]) obj[key] = dotenvEnv[key];
          else delete obj[key];
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
