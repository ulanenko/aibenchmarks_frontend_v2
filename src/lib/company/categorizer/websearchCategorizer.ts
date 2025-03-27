import { CATEGORIES } from "@/config/categories";
import { Categorizer } from "@/types/category";
import { isCompleted, isError, isInProgress, isInQueue, isUnsuccessful } from "../utils";


/**
 * Categorizer for web search status
 */
export const WebSearchCategorizer: Categorizer = [
	(company) => {
		// If we have searchedCompanyData, the search is completed
		if (company.searchedCompanyData !== null) {
			const overallStatus = company.searchedCompanyData.overall_status!;
			// Check the status in the searchedCompanyData to determine if it was successful or failed
			if (isCompleted(overallStatus)) {
				return CATEGORIES.WEBSEARCH.COMPLETED.toCategoryValue();
			} else if (isUnsuccessful(overallStatus)) {
				return CATEGORIES.WEBSEARCH.FAILED.toCategoryValue({description: overallStatus});
			} else if (isError(overallStatus)) {
				return CATEGORIES.WEBSEARCH.FAILED.toCategoryValue({description: overallStatus});
			} else if (isInProgress(overallStatus)) {
				return CATEGORIES.WEBSEARCH.IN_PROGRESS.toCategoryValue();
			} else if (isInQueue(overallStatus)) {
				return CATEGORIES.WEBSEARCH.IN_QUEUE.toCategoryValue();
			}
		}

		// If web search is initialized but no search ID, show as "Frontend initialized"
		if (company.frontendState?.webSearchInitialized && !company.backendState?.searchId) {
			return CATEGORIES.WEBSEARCH.FRONTEND_INITIALIZED.toCategoryValue();
		}

		// If we have a search ID, show as "In queue"
		if (company.backendState?.searchId) {
			return CATEGORIES.WEBSEARCH.IN_QUEUE.toCategoryValue();
		}

		// If no search initiated, check if the INPUT category is completed
		const inputStatus = company.categoryValues?.INPUT;
		if (inputStatus && inputStatus.category.status === 'completed') {
			return CATEGORIES.WEBSEARCH.READY.toCategoryValue();
		}

		return CATEGORIES.WEBSEARCH.NOT_READY.toCategoryValue();
	},
];
