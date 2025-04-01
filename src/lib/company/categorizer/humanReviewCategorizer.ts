import {CATEGORIES} from '@/config/categories';
import {Categorizer} from '@/types/category';
import {isAcceptOrReject} from '../utils';

/**
 * Categorizer for the final decision based on comparability factors
 * The decision is Accept only if ALL factors are accepted, otherwise it's Reject
 * The (HR) or (AI) suffix depends on whether any human review decisions were made
 */
const HumanReviewCategorizer: Categorizer = [
  // Determine the overall decision based on all comparability factors
  (company) => {
    // Check all comparability factors to determine overall decision
    const productsAiDecision = company.searchedCompanyData?.productservicecomparability_status;
    const functionsAiDecision = company.searchedCompanyData?.functionalprofilecomparability_status;
    const independenceAiDecision = company.searchedCompanyData?.independence_status;
    
    const productsHumanDecision = company.inputValues.cfProductsServicesHRDecision;
    const functionsHumanDecision = company.inputValues.cfFunctionalProfileHRDecision;
    const independenceHumanDecision = company.inputValues.cfIndependenceHRDecision;

    // Determine if any factor has a human decision
    const hasHumanDecision = productsHumanDecision || functionsHumanDecision || independenceHumanDecision;
    
    // Determine final decisions for each factor (human overrides AI)
    const productsDecision = productsHumanDecision || productsAiDecision;
    const functionsDecision = functionsHumanDecision || functionsAiDecision;
    const independenceDecision = independenceHumanDecision || independenceAiDecision;
    
    // Check if all factors are available
    const hasAllFactors = productsDecision && functionsDecision && independenceDecision;
    
    if (!hasAllFactors) {
      // Not enough data to determine decision
      return CATEGORIES.HUMAN_REVIEW.NO_DECISION.toCategoryValue();
    }
    
    // Determine overall decision - if any factor is rejected, overall decision is reject
    const isProductsAccepted = isAcceptOrReject(productsDecision);
    const isFunctionsAccepted = isAcceptOrReject(functionsDecision);
    const isIndependenceAccepted = isAcceptOrReject(independenceDecision);
    
    const isAccepted = isProductsAccepted && isFunctionsAccepted && isIndependenceAccepted;
    
    // If accepted, return the appropriate category based on whether human review was done
    if (isAccepted) {
      if (hasHumanDecision) {
        return CATEGORIES.HUMAN_REVIEW.ACCEPT_HR.toCategoryValue();
      } else {
        return CATEGORIES.HUMAN_REVIEW.ACCEPT_AI.toCategoryValue();
      }
    } 
    // If rejected, return the appropriate category based on whether human review was done
    else {
      if (hasHumanDecision) {
        return CATEGORIES.HUMAN_REVIEW.REJECT_HR.toCategoryValue();
      } else {
        return CATEGORIES.HUMAN_REVIEW.REJECT_AI.toCategoryValue();
      }
    }
  }
];

export default HumanReviewCategorizer; 