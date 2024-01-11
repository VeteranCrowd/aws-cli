// npm imports
import { dotenvExpand } from '@karmaniverous/get-dotenv';
import {
  CloudWatchClient,
  DescribeAlarmsCommand,
  PutMetricAlarmCommand,
} from '@aws-sdk/client-cloudwatch';
import { Command } from 'commander';

export const fixAutoscale = new Command()
  .name('fix-autoscale')
  .description(
    'Update target tracking alarms to handle zero invocations properly.'
  )
  .enablePositionalOptions()
  .passThroughOptions()
  .option(
    '-s, --stack-name <string>',
    'stack name (prefix with $ to use env var)',
    '$STACK_NAME'
  )
  .action(async ({ stackName }, command) => {
    const { logger = console } = command.parent?.parent?.getdotenvOptions ?? {};

    try {
      // Validate stack name.
      stackName = dotenvExpand(stackName);
      if (!stackName) throw new Error('stackName is undefined.');

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

      // Update alarms.
      logger.info(`\nUpdating alarms for stack '${stackName}'...`);

      await Promise.all(
        alarms.map((alarm) =>
          cloudWatchClient.send(
            new PutMetricAlarmCommand({
              ...alarm,
              TreatMissingData: alarm.AlarmName.includes('AlarmLow')
                ? 'breaching'
                : 'notBreaching',
            })
          )
        )
      );

      logger.info('Done.');
      console.log('');
    } catch (error) {
      logger.error(error.message);
    }
  });
