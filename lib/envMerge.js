// npm imports
import _ from 'lodash';

export const envMerge = (value) =>
  !_.isUndefined(value) && value.startsWith('$')
    ? process.env[value.slice(1)]
    : value;
