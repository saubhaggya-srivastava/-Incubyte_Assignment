import { PasswordService } from './password.service';

describe('PasswordService', () => {
  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'testPassword123';
      const hash = await PasswordService.hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(0);
    });

    it('should create different hashes for the same password', async () => {
      const password = 'testPassword123';
      const hash1 = await PasswordService.hashPassword(password);
      const hash2 = await PasswordService.hashPassword(password);

      expect(hash1).not.toBe(hash2); // Bcrypt uses random salt
    });

    it('should create a valid bcrypt hash', async () => {
      const password = 'testPassword123';
      const hash = await PasswordService.hashPassword(password);

      // Bcrypt hash format: $2b$10$...
      expect(hash).toMatch(/^\$2[aby]\$\d{2}\$/);
    });

    it('should hash passwords with minimum 8 characters', async () => {
      const password = 'pass1234';
      const hash = await PasswordService.hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash.length).toBeGreaterThan(0);
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching password and hash', async () => {
      const password = 'testPassword123';
      const hash = await PasswordService.hashPassword(password);

      const result = await PasswordService.comparePassword(password, hash);

      expect(result).toBe(true);
    });

    it('should return false for non-matching password and hash', async () => {
      const password = 'testPassword123';
      const wrongPassword = 'wrongPassword456';
      const hash = await PasswordService.hashPassword(password);

      const result = await PasswordService.comparePassword(wrongPassword, hash);

      expect(result).toBe(false);
    });

    it('should be case-sensitive', async () => {
      const password = 'TestPassword123';
      const hash = await PasswordService.hashPassword(password);

      const result = await PasswordService.comparePassword(
        'testpassword123',
        hash
      );

      expect(result).toBe(false);
    });

    it('should handle empty password comparison', async () => {
      const password = 'testPassword123';
      const hash = await PasswordService.hashPassword(password);

      const result = await PasswordService.comparePassword('', hash);

      expect(result).toBe(false);
    });
  });

  describe('verifyCostFactor', () => {
    it('should return true for hash with cost factor 10', async () => {
      const password = 'testPassword123';
      const hash = await PasswordService.hashPassword(password);

      const result = PasswordService.verifyCostFactor(hash);

      expect(result).toBe(true);
    });

    it('should return true for hash with cost factor >= 10', async () => {
      // Manually create a hash with cost factor 12
      const bcrypt = require('bcrypt');
      const hash = await bcrypt.hash('testPassword123', 12);

      const result = PasswordService.verifyCostFactor(hash);

      expect(result).toBe(true);
    });

    it('should return false for invalid hash format', () => {
      const invalidHash = 'not-a-valid-hash';

      const result = PasswordService.verifyCostFactor(invalidHash);

      expect(result).toBe(false);
    });

    it('should extract correct cost factor from hash', async () => {
      const password = 'testPassword123';
      const hash = await PasswordService.hashPassword(password);

      // Extract cost factor from hash (format: $2b$10$...)
      const costFactor = parseInt(hash.split('$')[2], 10);

      expect(costFactor).toBe(10);
    });
  });

  describe('Integration tests', () => {
    it('should hash and verify password in complete flow', async () => {
      const originalPassword = 'mySecurePassword123!';

      // Hash the password
      const hash = await PasswordService.hashPassword(originalPassword);

      // Verify the hash has sufficient cost factor
      expect(PasswordService.verifyCostFactor(hash)).toBe(true);

      // Verify correct password matches
      const correctMatch = await PasswordService.comparePassword(
        originalPassword,
        hash
      );
      expect(correctMatch).toBe(true);

      // Verify incorrect password doesn't match
      const incorrectMatch = await PasswordService.comparePassword(
        'wrongPassword',
        hash
      );
      expect(incorrectMatch).toBe(false);
    });

    it('should never store plaintext password', async () => {
      const password = 'plainTextPassword123';
      const hash = await PasswordService.hashPassword(password);

      // Hash should not contain the original password
      expect(hash).not.toContain(password);
      expect(hash).not.toBe(password);
    });
  });
});
