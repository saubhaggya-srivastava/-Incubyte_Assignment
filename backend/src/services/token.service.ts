import * as jwt from 'jsonwebtoken';
import { JwtPayload } from '../types';

/**
 * Token Service
 * Handles JWT token generation and verification
 */
export class TokenService {
  private static readonly JWT_SECRET = process.env.JWT_SECRET || '';
  private static readonly JWT_EXPIRATION = process.env.JWT_EXPIRATION || '24h';

  /**
   * Generate a JWT token with user ID and role
   * @param userId - User's unique identifier
   * @param role - User's role (user or admin)
   * @returns string - JWT token
   */
  static generateToken(userId: string, role: string): string {
    if (!this.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    const payload: JwtPayload = {
      userId,
      role,
    };

    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRATION,
    } as jwt.SignOptions);
  }

  /**
   * Verify and decode a JWT token
   * @param token - JWT token to verify
   * @returns JwtPayload - Decoded token payload
   * @throws Error if token is invalid or expired
   */
  static verifyToken(token: string): JwtPayload {
    if (!this.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as JwtPayload;
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token has expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid token');
      }
      throw error;
    }
  }

  /**
   * Decode a token without verifying (useful for debugging)
   * @param token - JWT token to decode
   * @returns JwtPayload | null - Decoded payload or null if invalid
   */
  static decodeToken(token: string): JwtPayload | null {
    try {
      return jwt.decode(token) as JwtPayload;
    } catch {
      return null;
    }
  }
}
