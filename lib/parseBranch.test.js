/* eslint-env mocha */

// npm imports
import { expect } from 'chai';

// lib imports
import { parseBranch } from './parseBranch.js';

describe('parseBranch', function () {
  it('parses 1-part branch name', function () {
    const result = parseBranch('envToken');
    console.log(result);
    expect(result).to.deep.equal({ envToken: 'envToken' });
  });

  it('parses 2-part branch name', function () {
    const result = parseBranch('branchType-envToken');
    console.log(result);
    expect(result).to.deep.equal({
      branchType: 'branchType',
      envToken: 'envToken',
    });
  });

  it('parses 3-part branch name', function () {
    const result = parseBranch('branchType-branchLabel-envToken');
    console.log(result);
    expect(result).to.deep.equal({
      branchType: 'branchType',
      branchLabel: 'branchLabel',
      envToken: 'envToken',
    });
  });

  it('handles internal dashes', function () {
    const result = parseBranch('branch-Type-branch-Label-env-Token');
    console.log(result);
    expect(result).to.deep.equal({
      branchType: 'branch',
      branchLabel: 'Type-branch-Label-env',
      envToken: 'Token',
    });
  });
});
