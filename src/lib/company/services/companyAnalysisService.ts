import {Company, CompanyHotCopy} from '@/lib/company/company';
import {initiateCompanyAnalysisAction} from '@/app/actions/companyAnalysis';
import {useCompanyStore} from '@/stores/use-company-store';

/**
 * Service function to initiate company analysis from a Company or CompanyHotCopy object
 *
 * @param companyData The Company or CompanyHotCopy object
 * @param options Optional parameters for the analysis
 * @returns Promise with the result of the analysis
 */
export async function analyzeCompanyService(
	companyData: Company | CompanyHotCopy,
	options: {
		takeScreenshot?: boolean;
		language?: string;
		useDbDescriptions?: boolean;
		authCode?: number;
	} = {},
): Promise<{success: boolean; message: string; searchIds?: string[]}> {
	// Extract input values based on the type of object
	const inputValues = 'inputValues' in companyData ? companyData.inputValues : companyData;
	// Get company ID if available (only use positive IDs)
	let companyId: number | undefined = undefined;
	if ('id' in companyData && companyData.id && companyData.id > -1) {
		companyId = companyData.id;
	}

	// Skip if missing required fields
	if (!inputValues || !inputValues.name || !inputValues.country) {
		return {
			success: false,
			message: 'Company data is missing required fields (name, country)',
		};
	}

	// Update the web search state in the store if we have a company ID
	if (companyId) {
		useCompanyStore.getState().updateWebSearchState(companyId, {
			webSearchInitialized: true,
		});
	}

	// Extract necessary fields and ensure required ones are never null
	const companyForAnalysis = {
		id: companyId,
		name: inputValues.name,
		country: inputValues.country || '',
		website: inputValues.url || '',
		// Include other relevant fields that match our API needs
		streetAndNumber: inputValues.streetAndNumber,
		addressLine: inputValues.addressLine1,
		tradeDescription: inputValues.tradeDescriptionEnglish || inputValues.tradeDescriptionOriginal,
		fullOverview: inputValues.fullOverview || inputValues.fullOverviewManual,
	};

	// Call the server action with the formatted data
	const result = await initiateCompanyAnalysisAction([companyForAnalysis], options.authCode || 6666666, {
		takeScreenshot: options.takeScreenshot,
		language: options.language || 'en',
		useDbDescriptions: options.useDbDescriptions,
	});

	// If we got a search ID, update it in the store
	if (result.success && result.searchIds && result.searchIds.length > 0 && companyId) {
		useCompanyStore.getState().updateWebSearchState(companyId, {
			searchId: result.searchIds[0],
		});
	}

	return result;
}
