import { Injectable } from '@nestjs/common';

@Injectable()
export class TokenBlacklistService {
  private readonly blacklistedTokens = new Map<string, number>();

  revoke(token: string, expiresAtMs?: number): void {
    const expiry = expiresAtMs ?? Date.now() + 24 * 60 * 60 * 1000;
    this.blacklistedTokens.set(token, expiry);
    this.cleanup();
  }

  isRevoked(token: string): boolean {
    const expiry = this.blacklistedTokens.get(token);
    if (!expiry) {
      return false;
    }

    if (Date.now() > expiry) {
      this.blacklistedTokens.delete(token);
      return false;
    }

    return true;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [token, expiry] of this.blacklistedTokens.entries()) {
      if (now > expiry) {
        this.blacklistedTokens.delete(token);
      }
    }
  }
}
