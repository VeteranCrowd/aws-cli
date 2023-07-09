/* eslint-env mocha */

// npm imports
import { expect } from 'chai';

// lib imports
import { getAwsSsoCredentials } from './getAwsSsoCredentials.js';

describe('getAwsSsoCredentials', function () {
  it('with local profile', async function () {
    // assumes the existence of a local AWS SSO profile named VC-DEV
    await getAwsSsoCredentials('VC-DEV');

    expect(process.env.AWS_ACCESS_KEY_ID).to.exist;
    expect(process.env.AWS_SECRET_ACCESS_KEY).to.exist;
    expect(process.env.AWS_SESSION_TOKEN).to.exist;
  });

  it('with a bogus local profile', function () {
    expect(async () => await getAwsSsoCredentials('XXX')).to.throw;
  });

  it('without local profile', async function () {
    await getAwsSsoCredentials();

    expect(process.env.AWS_ACCESS_KEY_ID).not.to.exist;
    expect(process.env.AWS_SECRET_ACCESS_KEY).not.to.exist;
    expect(process.env.AWS_SESSION_TOKEN).not.to.exist;
  });
});
