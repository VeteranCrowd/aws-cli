/* eslint-env mocha */

// npm imports
import { expect } from 'chai';

// lib imports
import { parseEnvFromBranch } from './parseEnvFromBranch.js';

describe('parseEnvFromBranch', function () {
  it('parses empty string', async function () {
    const result = await parseEnvFromBranch('');
    expect(result).not.to.exist;
  });

  it('parses 1-part branch name', async function () {
    const result = await parseEnvFromBranch('env');
    expect(result).to.equal('env');
  });

  it('parses 2-part branch name', async function () {
    const result = await parseEnvFromBranch('type/env');
    expect(result).to.equal('env');
  });

  it('parses 3-part branch name', async function () {
    const result = await parseEnvFromBranch('type/label/env');
    expect(result).to.equal('env');
  });
});
