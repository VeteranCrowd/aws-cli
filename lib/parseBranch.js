// npm imports
import branch from 'git-branch';
import _ from 'lodash';

export const parseBranch = (branchName) => {
  try {
    branchName ??= branch.sync();
  } catch {
    branchName ?? '';
  }

  return _.omitBy(
    branchName.match(
      /^(?:(?<branchType>[^-]+)-(?:(?<branchLabel>.+)-)?)?(?<envToken>[^-]+)$/
    )?.groups ?? {},
    _.isNil
  );
};
