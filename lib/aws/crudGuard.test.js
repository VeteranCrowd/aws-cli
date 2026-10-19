/*
******************* DO NOT EDIT THIS NOTICE *****************
This code and all related intellectual property is owned by
Veteran Crowd Rewards, LLC. It is not to be disclosed, copied
or used without written permission.
*************************************************************
*/

/* eslint-env mocha */

// npm imports
import {
  PURGE_SENTINEL_KEY,
  SERVICE_CONFIG_KEY,
} from '@veterancrowd/aws-service';
import { expect } from 'chai';

// lib imports
import { isStateRecord } from './crudGuard.js';

describe('crudGuard', function () {
  describe('isStateRecord', function () {
    it('recognises the config record', function () {
      expect(
        isStateRecord({ ...SERVICE_CONFIG_KEY, crudDisabled: true })
      ).to.be.true;
    });

    it('recognises a legacy purge sentinel', function () {
      expect(isStateRecord({ ...PURGE_SENTINEL_KEY, purgeFrom: 1000 })).to.be
        .true;
    });

    it('recognises a numeric key in place of the string one', function () {
      expect(isStateRecord({ entityPK: 'config', entitySK: 0 })).to.be.true;
    });

    it('treats entity records as entities', function () {
      expect(isStateRecord({ entityPK: 'user!0', entitySK: '1' })).to.be.false;
      expect(isStateRecord({ entityPK: 'config', entitySK: '1' })).to.be.false;
      expect(isStateRecord({ entityPK: 'purge', entitySK: '1' })).to.be.false;
    });

    it('handles a missing item', function () {
      expect(isStateRecord(undefined)).to.be.false;
      expect(isStateRecord({})).to.be.false;
    });
  });
});
