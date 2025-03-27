import { Company, CompanyHotCopy } from "./company";

/**
 * Interface for website validation status
 */

export interface WebsiteValidationStatus {
	// Input settings used for validation (to check if inputs have changed)
	urlValidationInput: string; // Combination of company name, country, and URL
	urlValidationUrl: string;
	urlValidationValid: boolean | null;
}

	
/**
 * Helper function to create input settings string
 */
export function createInputSettings(name: string , country: string, url: string | null): string {
	return `${name}|${country}|${url || ''}`;
}

/**
 * Helper function to check if validation is up to date
 */
export function isValidationUpToDate(
	company: Company | CompanyHotCopy
): boolean {
	if (!company.inputValues) return false;
	const {name, country, url} = company.inputValues
	if (!name || !country) return false;
	const settings = company.backendState?.urlValidationInput

	const currentInputSettings = createInputSettings(name, country, url);
	return settings === currentInputSettings;
}

/**
 * Helper function to get validation status
 */
export function getValidationStatus(
	company: Company | CompanyHotCopy
): 'valid' | 'invalid' | 'not-validated' {
	if (!isValidationUpToDate(company)) {
		return 'not-validated';
	}
	return company.backendState?.urlValidationValid ? 'valid' : 'invalid';
}
