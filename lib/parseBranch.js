// npm imports
import branch from 'git-branch';
import _ from 'lodash';

export const parseBranch = (branchName = branch.sync()) => {
  try {
    _.omitBy(
      branchName.match(
        /^(?:(?<branchType>[^-]+)-(?:(?<branchLabel>.+)-)?)?(?<envToken>[^-]+)$/
      )?.groups ?? {},
      _.isNil
    );
  } catch {
    return {};
  }
};
