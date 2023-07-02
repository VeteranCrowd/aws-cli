// npm imports
import { Logger } from '@karmaniverous/edge-logger';
import { WrappedSqsClient } from '@veterancrowd/wrapped-sqs-client';
import { Command, InvalidArgumentError } from 'commander';

export const redrive = new Command()
  .name('redrive')
  .description('Redrive a CRUD operation DLQ message.')
  .configureHelp({ showGlobalOptions: true })
  .enablePositionalOptions()
  .passThroughOptions()
  .requiredOption(
    '-d, --dlq-name <string>',
    '* DLQ name (message source)',
    `${process.env.STACK_NAME}-crud-dlq.fifo`
  )
  .requiredOption(
    '-t, --target-name <string>',
    '* Target queue name',
    `${process.env.STACK_NAME}-crud-queue.fifo`
  )
  .option(
    '-l, --limit <integer>',
    'Number of messages to receive from head of queue (1-10). If message-ids not specified, will redrive all.',
    (value) => {
      const parsedValue = parseInt(value, 10);
      if (isNaN(parsedValue)) {
        throw new InvalidArgumentError('message-count not a number');
      }
      if (parsedValue < 1 || parsedValue > 10)
        throw new InvalidArgumentError('message-count out of range');
      return parsedValue;
    },
    1
  )
  .option(
    '-m, --message-ids <string...>',
    'Space-separated list of message ids. Must be within message-count of head of queue. If specified will only redrive these.'
  )
  .action(async ({ dlqName, limit, messageIds, targetName }) => {
    const logger = new Logger({ maxLevel: 'info' });

    // Get messages from DLQ.
    const dlq = await new WrappedSqsClient({ logger }).getQueue(dlqName);
    const messages = (await dlq.receiveMessages({ limit })).filter((message) =>
      messageIds ? messageIds.includes(message.messageId) : true
    );

    if (!messages.length) {
      logger.info('No messages to redrive.');
      process.exit();
    } else
      logger.info(
        `Redriving ${messages.length} messages from ${dlqName} to ${targetName}.`
      );

    // Send messages to target queue.
    const target = await new WrappedSqsClient({ logger }).getQueue(targetName);
    await target.sendMessageBatch(
      messages.map(({ attributes, body, messageId }) => ({
        attributes,
        body,
        deduplicationId: messageId,
        groupId: messageId,
        id: messageId,
      }))
    );

    // Delete messages from DLQ.
    logger.info(`Deleting ${messages.length} messages from ${dlqName}.`);
    await dlq.deleteMessageBatch(messages);
  });
