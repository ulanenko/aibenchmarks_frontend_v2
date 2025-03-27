import {Company, CompanyHotCopy} from '@/lib/company/company';
import {initiateComparabilityAnalysisAction} from '@/app/actions/comparabilityAnalysis';
import {useCompanyStore} from '@/stores/use-company-store';
import { useBenchmarkStore } from '@/stores/use-benchmark-store';
import { CATEGORIES } from '@/config/categories';

/**
 * Service function to initiate comparability analysis from a Company or CompanyHotCopy object
 *
 * @param companyData The Company or CompanyHotCopy object
 * @returns Promise with the result of the analysis including company IDs for which analysis was initialized
 */
export async function comparabilityAnalysisService(
	companyData: (Company | CompanyHotCopy)[] | Company | CompanyHotCopy,
): Promise<{success: boolean; message: string; searchIds?: string[]; initializedCompanyIds?: number[]}> {
	const companyDataArray = Array.isArray(companyData) ? companyData : [companyData];

	// Check if any company doesn't have a search ID (which is required for this analysis)
	const completedKey = CATEGORIES.WEBSEARCH.COMPLETED.categoryKey;
	const allSearchCompleted = companyDataArray.every(company => 
		company.categoryValues?.WEBSEARCH.categoryKey === completedKey);
	if (!allSearchCompleted) {
		return {
			success: false,
			message: 'All companies must have completed the web search step to perform comparability analysis',
		};
	}


	// Get the benchmark ID from the store
	const benchmarkId = useCompanyStore.getState().benchmarkId;
	if (!benchmarkId) {
		return {
			success: false,
			message: 'No benchmark ID found in the store',
		};
	}

	const companyIds = companyDataArray.map(company => company.id!);
	
	// Update the accept-reject analysis state in the store
	// Mark companies as having analysis in progress
	useCompanyStore.getState().updateCompaniesWithAction(companyIds, (company) => {
		company.markAsAcceptRejectStarted(true);
	});

	// Call the server action with company IDs and benchmark ID
	const result = await initiateComparabilityAnalysisAction(companyIds, benchmarkId);

	// If successful, mark the companies as no longer in progress
	// Only mark the companies that were actually initialized for analysis
	if (result.success && result.initializedCompanyIds?.length) {
		// TODO: UPdate this with the recent search data
		useCompanyStore.getState().updateCompaniesWithAction(result.initializedCompanyIds, (company) => {
			company.markAsAcceptRejectStarted(false);
		});
	}else{
		useCompanyStore.getState().updateCompaniesWithAction(companyIds, (company) => {
			company.markAsAcceptRejectStarted(false);
		});
	}

	return result;
} 