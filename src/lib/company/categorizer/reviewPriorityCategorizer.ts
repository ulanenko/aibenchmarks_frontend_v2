import {CATEGORIES} from '@/config/categories';
import {Categorizer} from '@/types/category';
import {isAcceptOrReject} from '../utils';

/**
 * Categorizer for human review status
 * Priority levels are determined based on:
 * - HIGH: Companies marked as accepted by AI
 * - MEDIUM: Companies marked for human review or rejected for one reason
 * - LOW: Other companies (rejected for multiple reasons)
 * - REVIEWED: Companies with at least one confirmed human decision
 */
const ReviewPriorityCategorizer: Categorizer = [
    // If the company has not completed comparability analysis, it cannot be reviewed
    (company) => {
        const acceptRejectCategory = company.categoryValues?.ACCEPT_REJECT;
        if (!acceptRejectCategory || !acceptRejectCategory.category.isDone()) {
            return CATEGORIES.REVIEW_PRIORITY.NOT_READY.toCategoryValue();
        }
        return false;
    },
    
    // Check if the company has been reviewed by a human
    (company) => {
        const hasHumanReview = company.inputValues.cfProductsServicesHRDecision || 
                              company.inputValues.cfFunctionalProfileHRDecision || 
                              company.inputValues.cfIndependenceHRDecision;
        
        if (hasHumanReview) {
            return CATEGORIES.REVIEW_PRIORITY.REVIEWED.toCategoryValue();
        }
        return false;
    },
    
    // Determine priority level based on AI decisions
    (company) => {
        const acceptRejectCategory = company.categoryValues?.ACCEPT_REJECT;
        const aiResults = [
            company.searchedCompanyData?.productservicecomparability_status,
            company.searchedCompanyData?.functionalprofilecomparability_status,
            company.searchedCompanyData?.independence_status
        ].filter(Boolean);
        
        // Count how many factors were accepted
        const acceptCount = aiResults.filter(result => isAcceptOrReject(result)).length;
        const rejectCount = aiResults.filter(result => !isAcceptOrReject(result)).length;
        
        // If all factors are accepted, high priority
        if (acceptCount === aiResults.length && aiResults.length > 0) {
            return CATEGORIES.REVIEW_PRIORITY.HIGH_PRIORITY.toCategoryValue();
        }
        
        // If only one factor is rejected, medium priority
        if (rejectCount === 1 && aiResults.length > 1) {
            return CATEGORIES.REVIEW_PRIORITY.MEDIUM_PRIORITY.toCategoryValue();
        }
        
        // If the comparability analysis failed or marked for human review, medium priority
        if (acceptRejectCategory?.category.categoryKey === CATEGORIES.ACCEPT_REJECT.FAILED.categoryKey) {
            return CATEGORIES.REVIEW_PRIORITY.MEDIUM_PRIORITY.toCategoryValue();
        }
        
        // Otherwise, low priority (rejected for multiple reasons)
        return CATEGORIES.REVIEW_PRIORITY.LOW_PRIORITY.toCategoryValue();
    },
];

export default ReviewPriorityCategorizer; 