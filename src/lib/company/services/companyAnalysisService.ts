import {Company, CompanyHotCopy, DynamicInputValues} from '@/lib/company/company';
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
	companyData: (Company | CompanyHotCopy)[] | Company | CompanyHotCopy,
	options: {
		takeScreenshot?: boolean;
		language?: string;
		useDbDescriptions?: boolean;
		authCode?: number;
	} = {},
): Promise<{success: boolean; message: string; searchIds?: string[]}> {

	const companyDataArray = Array.isArray(companyData) ? companyData : [companyData];

	// check if any company doesnt have completed input values
	const hasCompletedInputValues = companyDataArray.every(company => company.categoryValues?.INPUT.category.status === 'completed');
	if (!hasCompletedInputValues) {
		return {
			success: false,
			message: 'Companies have not completed the input values',
		};
		const hasId = companyDataArray.every(company => company.id !== null);
		if (!hasId) {
			return {
				success: false,
				message: 'Companies have no ID',
			};
		}
	}


	const companyIds = companyDataArray.map(company => company.id!);
	// Update the web search state in the store if we have a company ID
	useCompanyStore.getState().updateWebSearchState(companyIds, true, null);

	// Extract necessary fields and ensure required ones are never null
	const companiesForAnalysis = companyDataArray.map(company => ({	
		id: company.id!,
		name: company.inputValues?.name || '',
		country: company.inputValues?.country || '',
		website: (company.dynamicInputValues as DynamicInputValues).url || '',
		// Include other relevant fields that match our API needs
		streetAndNumber: company.inputValues?.streetAndNumber || '',
		addressLine: company.inputValues?.addressLine1 || '',
		tradeDescription: company.inputValues?.tradeDescriptionEnglish || company.inputValues?.tradeDescriptionOriginal,
		fullOverview: company.inputValues?.fullOverview || company.inputValues?.fullOverviewManual,
	}));

	// Call the server action with the formatted data
	const result = await initiateCompanyAnalysisAction(companiesForAnalysis, options.authCode || 6666666, {
		takeScreenshot: options.takeScreenshot,
		language: options.language || 'en',
		useDbDescriptions: options.useDbDescriptions,
	});

	// If we got a search ID, update it in the store
	if (result.success && result.searchIds && result.searchIds.length > 0 && companyIds) {
		useCompanyStore.getState().updateWebSearchState(companyIds, false, result.searchIds);
	}

	return result;
}

