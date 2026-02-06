/**
 * Environment Configuration
 * 
 * Detects the current environment and provides helpers.
 */

export const ENV = {
  /**
   * True in development mode (Vite dev server)
   */
  isDevelopment: import.meta.env.DEV,
  
  /**
   * True in production mode
   */
  isProduction: import.meta.env.PROD,
  
  /**
   * Current mode string: 'development' | 'production'
   */
  mode: import.meta.env.MODE,
} as const;

/**
 * Helper to conditionally return mock data only in development
 */
export function getInitialData<T>(mockData: T[], emptyData: T[] = []): T[] {
  return ENV.isDevelopment ? mockData : emptyData;
}
