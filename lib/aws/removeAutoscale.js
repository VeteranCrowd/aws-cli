/*
******************* DO NOT EDIT THIS NOTICE *****************
This code and all related intellectual property is owned by  
Veteran Crowd Rewards, LLC. It is not to be disclosed, copied
or used without written permission.                          
*************************************************************
*/

// npm imports
import {
  ApplicationAutoScalingClient,
  DeregisterScalableTargetCommand,
  DescribeScalableTargetsCommand,
} from '@aws-sdk/client-application-auto-scaling';
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

      // Configure ApplicationAutoscalingCLient.
      const applicationAutoscalingCLient = new ApplicationAutoScalingClient({
        region: process.env.AWS_DEFAULT_REGION,
      });

      // Get scalable targets.
      logger.info(`Getting scalable targets for stack '${stackName}'...`);

      let targets = [];
      let nextToken;
      do {
        let newTargets;

        ({ ScalableTargets: newTargets = [], NextToken: nextToken } =
          await applicationAutoscalingCLient.send(
            new DescribeScalableTargetsCommand({
              NextToken: nextToken,
              ServiceNamespace: `lambda`,
            })
          ));

        targets = [
          ...targets,
          ...newTargets.filter((t) => t.ResourceId.includes(stackName)),
        ];

        logger.info(`  Found ${targets.length} scalable targets so far.`);
      } while (nextToken);

      logger.info('Done.');
      logger.debug(targets);

      // Deregister targets.
      logger.info(
        `\nDeregistering ${targets.length} scalable targets from stack '${stackName}'...`
      );

      for (let i = 0; i < targets.length; i++) {
        const { ResourceId, ScalableDimension, ServiceNamespace } = targets[i];

        await backOff(
          () =>
            applicationAutoscalingCLient.send(
              new DeregisterScalableTargetCommand({
                ResourceId,
                ScalableDimension,
                ServiceNamespace,
              })
            ),
          { delayFirstAttempt: true, startingDelay: 340 }
        );

        logger.info(
          `  Deregistered target '${ResourceId}' [${i + 1} of ${
            targets.length
          }].`
        );
      }

      logger.info('Done.');

      console.log('');
    } catch (error) {
      logger.error(error.message);
    }
  });
