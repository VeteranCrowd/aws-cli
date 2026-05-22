/*
******************* DO NOT EDIT THIS NOTICE *****************
This code and all related intellectual property is owned by
Veteran Crowd Rewards, LLC. It is not to be disclosed, copied
or used without written permission.
*************************************************************
*/

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

const retentionPolicyValidValues = [
  1, 3, 5, 7, 14, 30, 60, 90, 120, 150, 180, 365, 400, 545, 731, 1096, 1827,
  2192, 2557, 2922, 3288, 3653,
];

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

        if (retentionPolicy) {
          retentionInDays = parseInt(retentionPolicy);

          if (isNaN(retentionInDays)) {
            throw new Error('Invalid retention policy: ' + retentionPolicy);
          }

          if (!retentionPolicyValidValues.includes(retentionInDays)) {
            throw new Error(
              `Invalid retention policy: ${retentionInDays}.\nValid values are: ${retentionPolicyValidValues.join(', ')}.`,
            );
          }
        }
      }

      logger.info(`\nUsing retention policy of ${retentionInDays} days.`);

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

      if (!apiGatewayID) {
        throw new Error(
          `Could not find PhysicalResourceId for ApiGatewayRestApi in stack '${stackName}'.`,
        );
      }

      logger.debug(apiGatewayRestApiResource);
      logger.info(`Done.`);

      logger.info(
        `\nGetting execution log groups for API Gateway Rest API resource for '${apiGatewayID}'...`,
      );

      if (!process.env.INSTANCE_NAME) {
        throw new Error('Environment variable INSTANCE_NAME is undefined.');
      }

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

      if (!logGroup?.logGroupName) {
        throw new Error(`Log group '${logGroupName}' not found.`);
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
