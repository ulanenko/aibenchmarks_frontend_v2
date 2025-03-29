import {CATEGORIES} from '@/config/categories';
import {Categorizer} from '@/types/category';
import { isAcceptOrReject, isCompleted, isError, isInProgress, isInQueue, isUnsuccessful } from '../utils';





const AcceptRejectCategorizer: Categorizer = [
	// If the company has not completed web search, it cannot be analyzed
	(company) => {
		if (company.categoryValues?.WEBSEARCH.category.status !== 'completed') {
			return {
				category: CATEGORIES.ACCEPT_REJECT.NOT_READY,
				categoryKey: CATEGORIES.ACCEPT_REJECT.NOT_READY.categoryKey,
				label: 'Search Required',	
				description: 'Web search must be completed first',
			};
		}
		return false;
	},
	// Default state - ready for analysis
	(company) => {
		const key = CATEGORIES.WEBSEARCH.FAILED.categoryKey;
		const websearchCategory = company.categoryValues?.WEBSEARCH
		if(websearchCategory?.categoryKey === key || websearchCategory?.category.status === 'decision') {
			return websearchCategory;
		}
		const comparabilityStatus = company.searchedCompanyData?.comparability_analysis_status!;
		
		// Check the status in the searchedCompanyData to determine if it was successful or failed
		if (isCompleted(comparabilityStatus)) {
			const disabledIndependence = false;
			const acceptRejectValues = [
				company.searchedCompanyData?.productservicecomparability_status,
				company.searchedCompanyData?.functionalprofilecomparability_status,
			]
			if(disabledIndependence) {
				acceptRejectValues.push(company.searchedCompanyData?.independence_status);
			}
			const accept = acceptRejectValues.every(item => isAcceptOrReject(item));
			if(accept) {
				return CATEGORIES.ACCEPT_REJECT.ACCEPTED.toCategoryValue();
			} else {
				return CATEGORIES.ACCEPT_REJECT.REJECTED.toCategoryValue();
			}

		} else if (isUnsuccessful(comparabilityStatus)) {
			return CATEGORIES.ACCEPT_REJECT.FAILED.toCategoryValue({description: comparabilityStatus});
		} else if (isError(comparabilityStatus)) {
			return CATEGORIES.ACCEPT_REJECT.FAILED.toCategoryValue({description: comparabilityStatus});
		} else if (isInProgress(comparabilityStatus)) {
			return CATEGORIES.ACCEPT_REJECT.IN_PROGRESS.toCategoryValue();
		} else if (isInQueue(comparabilityStatus)) {
			return CATEGORIES.ACCEPT_REJECT.IN_QUEUE.toCategoryValue();
		}
		if(company.frontendState?.acceptRejectInitialized) {
			return CATEGORIES.ACCEPT_REJECT.IN_QUEUE.toCategoryValue();
		}
		return  CATEGORIES.ACCEPT_REJECT.READY.toCategoryValue();
	},
];

export default AcceptRejectCategorizer; 