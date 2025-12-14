import * as bcrypt from 'bcrypt';

/**
 * Password Service
 * Handles password hashing and comparison using bcrypt
 */
export class PasswordService {
  private static readonly SALT_ROUNDS = 10; // Cost factor for bcrypt

  /**
   * Hash a password using bcrypt with cost factor of 10
   * @param password - Plain text password to hash
   * @returns Promise<string> - Hashed password
   */
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  /**
   * Compare a plain text password with a hashed password
   * @param password - Plain text password
   * @param hash - Hashed password to compare against
   * @returns Promise<boolean> - True if passwords match, false otherwise
   */
  static async comparePassword(
    password: string,
    hash: string
  ): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Verify that a hash was created with sufficient cost factor (minimum 10 rounds)
   * @param hash - Bcrypt hash to verify
   * @returns boolean - True if cost factor is >= 10
   */
  static verifyCostFactor(hash: string): boolean {
    try {
      // Bcrypt hash format: $2b$10$... where 10 is the cost factor
      const costFactor = parseInt(hash.split('$')[2], 10);
      return costFactor >= 10;
    } catch {
      return false;
    }
  }
}
