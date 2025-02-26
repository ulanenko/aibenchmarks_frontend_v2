/**
 * Environment variables configuration
 * This file provides type-safe access to environment variables
 */

// Support services configuration
export const SUPPORT_SERVICES_CONFIG = {
	URL: process.env.SUPPORT_SERVICES_URL || 'https://aibenchmarks-supplementary-services.azurewebsites.net',
	AUTH_TOKEN: process.env.SUPPORT_SERVICES_AUTH_TOKEN,
};

// Database configuration
export const DATABASE_CONFIG = {
	URL: process.env.DATABASE_URL || '',
};

// Auth configuration
export const AUTH_CONFIG = {
	NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
	NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || '',
};
