/*
******************* DO NOT EDIT THIS NOTICE *****************
This code and all related intellectual property is owned by  
Veteran Crowd Rewards, LLC. It is not to be disclosed, copied
or used without written permission.                          
*************************************************************
*/

// npm imports
import {
  CloudWatchClient,
  DeleteAlarmsCommand,
  DescribeAlarmsCommand,
} from '@aws-sdk/client-cloudwatch';
import confirm from '@inquirer/confirm';
import {
  dotenvExpand,
  getDotenvCliOptions2Options,
} from '@karmaniverous/get-dotenv';
import { Command } from 'commander';
import { backOff } from 'exponential-backoff';

export const removeAutoscale = new Command()
  .name('remove-autoscale')
  .description('Remove all autoscale tracking alarms from service.')
  .enablePositionalOptions()
  .passThroughOptions()
  .option(
    '-s, --stack-name <string>',
    'stack name (prefix with $ to use env var)',
    '$STACK_NAME'
  )
  .option('-f, --force', 'proceed without confirmation (not recommended)')
  .action(async ({ force, stackName }, command) => {
    const { logger = console } = getDotenvCliOptions2Options(
      command.parent?.parent?.getDotenvCliOptions ?? {}
    );

    try {
      // Validate stack name.
      stackName = dotenvExpand(stackName);
      if (!stackName) throw new Error('stackName is undefined.');

      if (!force) {
        const confirmed = await confirm({
          message: `Are you sure you want to remove all autoscaling alarms from stack '${stackName}'? This action cannot be undone!`,
          default: false,
        });

        if (!confirmed) {
          logger.info(`Autoscale removal cancelled.`);
          process.exit(0);
        }
      }

      // Configure CloudWatchClient.
      const cloudWatchClient = new CloudWatchClient({
        region: process.env.AWS_DEFAULT_REGION,
      });

      // Get alarms.
      logger.info(`Getting alarms for stack '${stackName}'...`);

      const alarms =
        (
          await cloudWatchClient.send(
            new DescribeAlarmsCommand({
              AlarmNamePrefix: `TargetTracking-function:${stackName}`,
            })
          )
        )?.MetricAlarms ?? [];

      logger.debug(alarms);
      logger.info('Done.');

      // Delete alarms.
      logger.info(
        `\nDeleting ${alarms.length} alarms from stack '${stackName}'...`
      );

      for (let i = 0; i < alarms.length; i++) {
        await backOff(
          () =>
            cloudWatchClient.send(
              new DeleteAlarmsCommand({ AlarmNames: [alarms[i].AlarmName] })
            ),
          { delayFirstAttempt: true, startingDelay: 340 }
        );

        logger.info(
          `  Deleted alarm '${alarms[i].AlarmName}' [${i} of ${alarms.length}].`
        );
      }

      logger.info('Done.');

      console.log('');
    } catch (error) {
      logger.error(error.message);
    }
  });
