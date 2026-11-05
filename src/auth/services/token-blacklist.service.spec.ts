import { describe, expect, it } from 'vitest';
import { TokenBlacklistService } from './token-blacklist.service.js';

describe('TokenBlacklistService', () => {
  it('should initially not report a token as revoked', () => {
    const service = new TokenBlacklistService();
    expect(service.isRevoked('sample-token')).toBe(false);
  });

  it('should report a revoked token as revoked', () => {
    const service = new TokenBlacklistService();
    service.revoke('sample-token');
    expect(service.isRevoked('sample-token')).toBe(true);
  });

  it('should not report an expired revoked token as revoked', () => {
    const service = new TokenBlacklistService();
    // Revoked in the past
    service.revoke('expired-token', Date.now() - 1000);
    expect(service.isRevoked('expired-token')).toBe(false);
  });
});
