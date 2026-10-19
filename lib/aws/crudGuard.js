/*
******************* DO NOT EDIT THIS NOTICE *****************
This code and all related intellectual property is owned by
Veteran Crowd Rewards, LLC. It is not to be disclosed, copied
or used without written permission.
*************************************************************
*/

// npm imports
import {
  PURGE_SENTINEL_KEY,
  SERVICE_CONFIG_KEY,
  awaitConfigBoundary,
  readServiceConfig,
  writeServiceConfig,
} from '@veterancrowd/aws-service';

/*
 * CRUD protection for tools that write straight to a service's stack table.
 *
 * A service's CRUD handler runs behind the table's stream, so a migration's own
 * writes look exactly like a request's: without protection, copying a table
 * would replay its whole history as journals and messages. These helpers open
 * and close the same window the service's own endpoints use, which suppresses
 * the tool's historical writes while leaving requests served during the run
 * alone.
 */

/**
 * Whether a scanned item is a service state record rather than an entity one.
 *
 * Tools copy entities, never state: the target's state belongs to the run that
 * is protecting it, not to the table it came from.
 * @param {object} item - Scanned item.
 * @return {boolean} True for the config record and for legacy purge sentinels.
 */
export const isStateRecord = (item) => {
  const stateKeys = [SERVICE_CONFIG_KEY, PURGE_SENTINEL_KEY];

  return stateKeys.some(
    (stateKey) =>
      item?.entityPK === stateKey.entityPK &&
      String(item?.entitySK) === String(stateKey.entitySK),
  );
};

/**
 * Disable CRUD on a table, and wait out the boundary second.
 *
 * A service an operator already disabled is left alone: this run only undoes its
 * own work.
 * @param {object} options - Tool options.
 * @param {object} options.dynamodb - DynamoDB client instance.
 * @param {string} options.tableName - Table holding the service's config record.
 * @param {string} options.updater - Identifier recorded as the updater.
 * @param {object} options.logger - Logger instance.
 * @return {Promise<boolean>} True when this call is what disabled CRUD.
 */
export const disableCrud = async ({ dynamodb, tableName, updater, logger }) => {
  const current = await readServiceConfig(dynamodb, tableName);

  if (current?.crudDisabled === true) {
    logger.info(`CRUD is already disabled on '${tableName}'.`);

    return false;
  }

  const config = await writeServiceConfig(
    dynamodb,
    tableName,
    { crudDisabled: true },
    { updater },
  );

  await awaitConfigBoundary(config);

  logger.info(`CRUD disabled on '${tableName}'.`);

  return true;
};

/**
 * Clear the CRUD flag, and wait out the boundary second.
 * @param {object} options - Tool options.
 * @param {object} options.dynamodb - DynamoDB client instance.
 * @param {string} options.tableName - Table holding the service's config record.
 * @param {string} options.updater - Identifier recorded as the updater.
 * @param {object} options.logger - Logger instance.
 * @return {Promise<void>}
 */
export const enableCrud = async ({ dynamodb, tableName, updater, logger }) => {
  const config = await writeServiceConfig(
    dynamodb,
    tableName,
    { crudDisabled: false },
    { updater },
  );

  await awaitConfigBoundary(config);

  logger.info(`CRUD re-enabled on '${tableName}'.`);
};
