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

  it('parses simple name', async function () {
    const result = await parseEnvFromBranch('env');
    expect(result).to.equal('env');
  });

  it('parses preview', async function () {
    const result = await parseEnvFromBranch('preview/env');
    expect(result).to.equal('env');
  });

  it('parses release', async function () {
    const result = await parseEnvFromBranch('release');
    expect(result).to.equal('release');
  });

  it('parses release version', async function () {
    const result = await parseEnvFromBranch('release/version');
    expect(result).to.equal('release');
  });
});
