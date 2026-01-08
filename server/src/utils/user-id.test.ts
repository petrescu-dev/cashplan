/**
 * Tests for User ID utilities
 */

import { expect } from 'chai';
import { describe, it } from 'mocha';
import {
  generateUnauthenticatedUserId,
  isUnauthenticatedUserId,
  isAuthenticatedUserId,
} from './user-id';

describe('User ID Utilities', () => {
  describe('generateUnauthenticatedUserId', () => {
    it('should generate a negative user ID', () => {
      const userId = generateUnauthenticatedUserId();
      expect(userId).to.be.lessThan(0);
    });

    it('should generate ID within valid range', () => {
      const userId = generateUnauthenticatedUserId();
      expect(userId).to.be.at.least(-100000000);
      expect(userId).to.be.at.most(-1000);
    });

    it('should generate different IDs on multiple calls', () => {
      const id1 = generateUnauthenticatedUserId();
      const id2 = generateUnauthenticatedUserId();
      const id3 = generateUnauthenticatedUserId();

      // Not guaranteed to be different, but very likely
      // Test multiple times to ensure randomness
      const ids = [id1, id2, id3];
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).to.be.greaterThan(1);
    });
  });

  describe('isUnauthenticatedUserId', () => {
    it('should return true for valid unauthenticated IDs', () => {
      expect(isUnauthenticatedUserId(-1000)).to.be.true;
      expect(isUnauthenticatedUserId(-50000000)).to.be.true;
      expect(isUnauthenticatedUserId(-100000000)).to.be.true;
    });

    it('should return false for positive IDs', () => {
      expect(isUnauthenticatedUserId(1)).to.be.false;
      expect(isUnauthenticatedUserId(100)).to.be.false;
      expect(isUnauthenticatedUserId(999999)).to.be.false;
    });

    it('should return false for IDs outside valid range', () => {
      expect(isUnauthenticatedUserId(-999)).to.be.false;
      expect(isUnauthenticatedUserId(-100000001)).to.be.false;
      expect(isUnauthenticatedUserId(0)).to.be.false;
    });
  });

  describe('isAuthenticatedUserId', () => {
    it('should return true for positive IDs', () => {
      expect(isAuthenticatedUserId(1)).to.be.true;
      expect(isAuthenticatedUserId(100)).to.be.true;
      expect(isAuthenticatedUserId(999999)).to.be.true;
    });

    it('should return false for negative IDs', () => {
      expect(isAuthenticatedUserId(-1)).to.be.false;
      expect(isAuthenticatedUserId(-1000)).to.be.false;
      expect(isAuthenticatedUserId(-100000000)).to.be.false;
    });

    it('should return false for zero', () => {
      expect(isAuthenticatedUserId(0)).to.be.false;
    });
  });
});

