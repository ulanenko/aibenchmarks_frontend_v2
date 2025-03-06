/**
 * Validation configuration constants
 * These values are used throughout the application to maintain consistent validation rules
 */

export const VALIDATION = {
	/**
	 * Minimum number of words required for a company description to be considered valid
	 * Used in the description modal UI and in the source categorizer
	 */
	COMPANY_DESCRIPTION_MIN_WORDS: 50,

	/**
	 * Other validation constants can be added here
	 */
} as const;
