import {CATEGORIES} from '@/config/categories';
import {Categorizer} from '@/types/category';
import { isAcceptOrReject, isCompleted, isError, isInProgress, isInQueue, isUnsuccessful } from '../utils';





const AcceptRejectCategorizer: Categorizer = [
	// If the company has not completed web search, it cannot be analyzed
	(company) => {
		const websearchCategory = company.categoryValues?.WEBSEARCH;
		if (websearchCategory?.category.passed === undefined) {
			return {
				category: CATEGORIES.ACCEPT_REJECT.NOT_READY,
				categoryKey: CATEGORIES.ACCEPT_REJECT.NOT_READY.categoryKey,
				label: 'Search Required',	
				description: 'Web search must be completed first',
			};
			// so this means that a decision has been made
		}else if(websearchCategory?.category.passed === false){
			return websearchCategory;
		}
		return false;
	},
	// Default state - ready for analysis or analysis in progress/completed
	(company) => {
		const comparabilityStatus = company.searchedCompanyData?.comparability_analysis_status!;
		
		// Check the status in the searchedCompanyData to determine if it was successful or failed
		if (isCompleted(comparabilityStatus)) {
			const disabledIndependence = false;
			const acceptRejectValues = [
				company.searchedCompanyData?.productservicecomparability_status,
				company.searchedCompanyData?.functionalprofilecomparability_status,
			]
			if(!disabledIndependence) {
				acceptRejectValues.push(company.searchedCompanyData?.independence_status);
			}
			const accept = acceptRejectValues.every(item => isAcceptOrReject(item));

			if(accept) {
				return CATEGORIES.ACCEPT_REJECT.ACCEPTED.toCategoryValue();
			} else {
				// reasons 
				const reasons  =['products', 'functions'].concat(disabledIndependence ? [] : ['independence']);
				const rejectReason = reasons.filter((reason, index)=> !isAcceptOrReject(acceptRejectValues[index]))
				const reasonLabel = rejectReason.length > 1 ? `Reject: ${rejectReason.length} reasons` : `Reject: ${rejectReason[0]}`;
				const reasonDescription = `Rejected because incomparable ${rejectReason.join(', ')}`;
				return CATEGORIES.ACCEPT_REJECT.REJECTED.toCategoryValue({label: reasonLabel, description: reasonDescription});
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