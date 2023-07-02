// npm imports
import branch from 'git-branch';
import _ from 'lodash';

export const parseBranch = async (branchName) => {
  try {
    branchName ??= (await branch()) ?? '';
  } catch {
    branchName ??= '';
  }

  return _.omitBy(
    branchName.match(
      /^(?:(?<branchType>[^/\s]+)\/(?:(?<branchLabel>[^/\s]+)))?(?:\/?(?<envToken>[^/\s]+))?$/
    )?.groups ?? {},
    _.isNil
  );
};
