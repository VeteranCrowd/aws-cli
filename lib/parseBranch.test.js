/* eslint-env mocha */

// npm imports
import { expect } from 'chai';

// lib imports
import { parseBranch } from './parseBranch.js';

describe('parseBranch', function () {
  it('parses empty string', async function () {
    const result = await parseBranch('');
    expect(result).not.to.exist;
  });

  it('parses 1-part branch name', async function () {
    const result = await parseBranch('env');
    expect(result).to.equal('env');
  });

  it('parses 2-part branch name', async function () {
    const result = await parseBranch('type/env');
    expect(result).to.equal('env');
  });

  it('parses 3-part branch name', async function () {
    const result = await parseBranch('type/label/env');
    expect(result).to.equal('env');
  });
});
