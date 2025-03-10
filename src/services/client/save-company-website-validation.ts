import {CompanyValidationState} from '@/components/features/website-validation/results-dialog';
import {api} from '@/lib/api';

/**
 * Save the validation results for company websites
 *
 * @param results The validation results to save
 * @returns Promise that resolves when saving is complete
 */
export const saveCompanyWebsiteValidationResults = async (results: CompanyValidationState[]): Promise<void> => {
	try {
		// Format the results for the API if needed
		const formattedResults = results.map((result) => ({
			companyId: result.companyId,
			name: result.name,
			originalWebsite: result.originalWebsite,
			newWebsite: result.newWebsite,
			isValid: result.isValid,
		}));

		// Call the API endpoint
		await api.post('/api/companies/website-validation/save', {
			results: formattedResults,
		});
	} catch (error) {
		console.error('Error saving website validation results:', error);
		throw error;
	}
};
