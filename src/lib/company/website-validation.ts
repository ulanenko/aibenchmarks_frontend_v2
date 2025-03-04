/**
 * Interface for website validation status
 */
export interface WebsiteValidationStatus {
	// Input settings used for validation (to check if inputs have changed)
	input_settings: string; // Combination of company name, country, and URL
	is_validating?: boolean;
	// Validation results
	url_validated: string | null; // The URL that was validated
	url_validated_and_accessible: boolean | null; // Whether the URL is valid and accessible
}

/**
 * Helper function to create input settings string
 */
export function createInputSettings(name: string, country: string, url: string | null): string {
	return `${name}|${country}|${url || ''}`;
}

/**
 * Helper function to check if validation is up to date
 */
export function isValidationUpToDate(
	status: WebsiteValidationStatus | null | undefined,
	name: string,
	country: string,
	url: string | null,
): boolean {
	if (!status) return false;

	const currentInputSettings = createInputSettings(name, country, url);
	return status.input_settings === currentInputSettings;
}

/**
 * Helper function to get validation status
 */
export function getValidationStatus(
	status: WebsiteValidationStatus | null | undefined,
	name: string,
	country: string,
	url: string | null,
): 'valid' | 'invalid' | 'not-validated' {
	if (!isValidationUpToDate(status, name, country, url)) {
		return 'not-validated';
	}

	return status?.url_validated_and_accessible ? 'valid' : 'invalid';
}
