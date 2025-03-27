import {Company, CompanyHotCopy} from '@/lib/company/company';
import {initiateComparabilityAnalysisAction} from '@/app/actions/comparabilityAnalysis';
import {useCompanyStore} from '@/stores/use-company-store';

/**
 * Service function to initiate comparability analysis from a Company or CompanyHotCopy object
 *
 * @param companyData The Company or CompanyHotCopy object
 * @param options Required parameters for the analysis
 * @returns Promise with the result of the analysis
 */
export async function comparabilityAnalysisService(
	companyData: (Company | CompanyHotCopy)[] | Company | CompanyHotCopy,
	options: {
		idealProductService: string;
		idealFunctionalProfile: string;
		language?: string;
		relaxedProduct?: boolean;
		relaxedFunction?: boolean;
		authCode?: number;
	},
): Promise<{success: boolean; message: string; searchIds?: string[]}> {
	const companyDataArray = Array.isArray(companyData) ? companyData : [companyData];

	// Check if any company doesn't have a search ID (which is required for this analysis)
	const hasSearchId = companyDataArray.every(company => 
		company.backendState?.searchId !== null && 
		company.backendState?.searchId !== undefined && 
		company.backendState?.searchId !== '');
	if (!hasSearchId) {
		return {
			success: false,
			message: 'All companies must have completed the web search step to perform comparability analysis',
		};
	}

	// Check if companies have IDs
	const hasId = companyDataArray.every(company => company.id !== null);
	if (!hasId) {
		return {
			success: false,
			message: 'Companies have no ID',
		};
	}

	const companyIds = companyDataArray.map(company => company.id!);
	
	// Update the accept-reject analysis state in the store
	// Mark companies as having analysis in progress
	useCompanyStore.getState().updateAcceptRejectState(companyIds, true);

	// Extract necessary fields for the API
	const companiesForAnalysis = companyDataArray.map(company => ({	
		id: company.id!,
		name: company.inputValues?.name || '',
		searchId: company.backendState?.searchId || '',
	}));

	// Call the server action with the formatted data
	const result = await initiateComparabilityAnalysisAction(
		companiesForAnalysis, 
		options.authCode || 6666666, 
		{
			idealProductService: options.idealProductService,
			idealFunctionalProfile: options.idealFunctionalProfile,
			language: options.language || 'en',
			relaxedProduct: options.relaxedProduct,
			relaxedFunction: options.relaxedFunction,
		}
	);

	// If successful, mark the companies as no longer in progress
	if (result.success && companyIds) {
		useCompanyStore.getState().updateAcceptRejectState(companyIds, false);
	}

	return result;
} 