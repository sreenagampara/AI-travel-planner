// src/utils/appError.ts
/**
 * Simple error class that carries an HTTP status code.
 * Used by the centralized error handling middleware.
 */
export default class AppError extends Error {
  public status: number;
  constructor(message: string, status: number = 500) {
    super(message);
    this.status = status;
    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
