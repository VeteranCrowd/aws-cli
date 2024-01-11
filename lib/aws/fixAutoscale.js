// npm imports
import {
  CloudWatchClient,
  DescribeAlarmsCommand,
  PutMetricAlarmCommand,
  TagResourceCommand,
} from '@aws-sdk/client-cloudwatch';
import { dotenvExpand } from '@karmaniverous/get-dotenv';
import { Command } from 'commander';
import { backOff } from 'exponential-backoff';

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

      // Update alarm missing data policy.
      logger.info(
        `\nUpdating alarm missing data policy for stack '${stackName}'...`
      );

      for (let alarm of alarms)
        await backOff(
          () =>
            cloudWatchClient.send(
              new PutMetricAlarmCommand({
                ...alarm,
                TreatMissingData: alarm.AlarmName.includes('AlarmLow')
                  ? 'breaching'
                  : 'notBreaching',
              })
            ),
          { delayFirstAttempt: true, startingDelay: 340 }
        );

      logger.info('Done.');

      // Tag alarms.
      logger.info(`\nTagging alarms for stack '${stackName}'...`);

      const pattern =
        /^TargetTracking-function:(?<API_SUBDOMAIN>\w+)-(?<API_CONTEXT>[\w-]+)-(?<API_VERSION>v\d+)-(?<ENV>\w+)/;

      for (let { AlarmArn, AlarmName } of alarms)
        await backOff(
          () => {
            const { API_SUBDOMAIN, API_CONTEXT, API_VERSION, ENV } =
              AlarmName.match(pattern)?.groups ?? {};
            return cloudWatchClient.send(
              new TagResourceCommand({
                ResourceARN: AlarmArn,
                Tags: [
                  { Key: 'API_SUBDOMAIN', Value: API_SUBDOMAIN },
                  { Key: 'API_CONTEXT', Value: API_CONTEXT },
                  { Key: 'API_VERSION', Value: API_VERSION },
                  { Key: 'ENV', Value: ENV },
                  { Key: 'INSTANCE_NAME', Value: `${API_VERSION}-${ENV}` },
                  {
                    Key: 'SERVICE_NAME',
                    Value: `${API_SUBDOMAIN}-${API_CONTEXT}`,
                  },
                  {
                    Key: 'STACK_NAME',
                    Value: `${API_SUBDOMAIN}-${API_CONTEXT}-${API_VERSION}-${ENV}`,
                  },
                  {
                    Key: 'STAGE',
                    Value: `${API_VERSION}-${ENV}`,
                  },
                ],
              })
            );
          },
          { delayFirstAttempt: true, startingDelay: 340 }
        );

      logger.info('Done.');

      console.log('');
    } catch (error) {
      logger.error(error.message);
    }
  });
