import {
  CloudFormationClient,
  DescribeStackResourceCommand,
} from '@aws-sdk/client-cloudformation';
import {
  CloudWatchLogsClient,
  CreateLogGroupCommand,
  DescribeLogGroupsCommand,
  PutRetentionPolicyCommand,
} from '@aws-sdk/client-cloudwatch-logs';
import {
  dotenvExpand,
  getDotenvCliOptions2Options,
} from '@karmaniverous/get-dotenv';
import { Command } from 'commander';

export const createOrUpdateApiGatewayExecutionLog = new Command()
  .name('create-or-update-api-gateway-execution-log')
  .description('Create or Update API Gateway Execution Log Group.')
  .enablePositionalOptions()
  .passThroughOptions()
  .option(
    '-s, --stack-name <string>',
    'stack name (prefix with $ to use env var)',
    '$STACK_NAME',
  )
  .option(
    '-r, --retention-policy <number>',
    'retention policy in days (prefix with $ to use env var)',
    '$RETENTION_POLICY',
  )
  .action(async ({ stackName, retentionPolicy }, command) => {
    const { logger = console } = getDotenvCliOptions2Options(
      command.parent?.parent?.getDotenvCliOptions ?? {},
    );

    try {
      stackName = dotenvExpand(stackName);
      if (!stackName) throw new Error('stackName is undefined.');

      let retentionInDays = 5;
      if (retentionPolicy) {
        retentionPolicy = dotenvExpand(retentionPolicy);
        retentionInDays = parseInt(retentionPolicy);
      }

      const cloudFormationClient = new CloudFormationClient({
        region: process.env.AWS_DEFAULT_REGION,
      });

      const cloudWatchLogsClient = new CloudWatchLogsClient({
        region: process.env.AWS_DEFAULT_REGION,
      });

      logger.info(
        `Getting ApiGatewayRestApi cloudformation resource for stack '${stackName}'...`,
      );

      const describeStackResourceCommand = new DescribeStackResourceCommand({
        StackName: stackName,
        LogicalResourceId: 'ApiGatewayRestApi',
      });

      const apiGatewayRestApiResource = await cloudFormationClient.send(
        describeStackResourceCommand,
      );

      const apiGatewayID =
        apiGatewayRestApiResource?.StackResourceDetail?.PhysicalResourceId;

      logger.debug(apiGatewayRestApiResource);
      logger.info(`Done.`);

      logger.info(
        `\nGetting execution log groups for API Gateway Rest API resource for '${apiGatewayID}'...`,
      );

      const logGroupName = `API-Gateway-Execution-Logs_${apiGatewayID}/${process.env.INSTANCE_NAME}`;
      logger.info(`\nLooking for log group with prefix '${logGroupName}'...`);

      const describeExecutionLogGroupsCommand = new DescribeLogGroupsCommand({
        logGroupNamePrefix: logGroupName,
        limit: 1,
      });

      const logGroups = await cloudWatchLogsClient.send(
        describeExecutionLogGroupsCommand,
      );

      let logGroup = logGroups?.logGroups?.[0];

      // create if not exists, instead waiting for incoming request to create it
      if (!logGroup) {
        logger.info(`\nAPI Gateway Execution Log Group not found.`);
        logger.info(`\nCreating log group with name ${logGroupName}...`);

        const createLogGroupCommand = new CreateLogGroupCommand({
          logGroupName: logGroupName,
          logGroupClass: 'STANDARD',
        });

        await cloudWatchLogsClient.send(createLogGroupCommand);

        logger.info(`\nDone.`);

        // Get the created log group.
        const logGroups = await cloudWatchLogsClient.send(
          describeExecutionLogGroupsCommand,
        );

        logGroup = logGroups?.logGroups?.[0];
      }

      logger.debug(logGroup);
      logger.info(`\nDone.`);

      // Update retention policy for API Gateway execution log groups.
      logger.info(
        `\nUpdating retention policy for log group '${logGroup.logGroupName}'...`,
      );

      const putRetentionPolicyCommand = new PutRetentionPolicyCommand({
        logGroupName: logGroup.logGroupName,
        retentionInDays,
      });

      await cloudWatchLogsClient.send(putRetentionPolicyCommand);

      logger.info('\nDone.');
    } catch (error) {
      logger.error(error.message);
    }
  });
