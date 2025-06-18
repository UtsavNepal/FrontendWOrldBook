interface EnvConfig {
  apiUrl: string;
  apiVersion: string;
  appName: string;
  appUrl: string;
  enableAnalytics: boolean;
  enableDebug: boolean;
  authTokenKey: string;
  authRefreshTokenKey: string;
  cachePrefix: string;
  cacheExpiry: number;
  isDevelopment: boolean;
  isProduction: boolean;
}

const env: EnvConfig = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  apiVersion: import.meta.env.VITE_API_VERSION || 'v1',
  appName: import.meta.env.VITE_APP_NAME || 'WorldBook',
  appUrl: import.meta.env.VITE_APP_URL || 'http://localhost:3000',
  enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  enableDebug: import.meta.env.VITE_ENABLE_DEBUG === 'true',
  authTokenKey: import.meta.env.VITE_AUTH_TOKEN_KEY || 'worldbook_auth_token',
  authRefreshTokenKey: import.meta.env.VITE_AUTH_REFRESH_TOKEN_KEY || 'worldbook_refresh_token',
  cachePrefix: import.meta.env.VITE_CACHE_PREFIX || 'worldbook_',
  cacheExpiry: parseInt(import.meta.env.VITE_CACHE_EXPIRY || '3600', 10),
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};

// Validate required environment variables
const requiredEnvVars = ['VITE_API_URL', 'VITE_APP_URL'];
const missingEnvVars = requiredEnvVars.filter(
  (envVar) => !import.meta.env[envVar]
);

if (missingEnvVars.length > 0) {
  console.error(
    `Missing required environment variables: ${missingEnvVars.join(', ')}`
  );
}

export default env; 