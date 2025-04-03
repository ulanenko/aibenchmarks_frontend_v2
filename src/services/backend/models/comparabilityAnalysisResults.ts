// Define interfaces for the comparability analysis results

export interface ComparabilityAnalysisResultsRaw {
    raw_response: string;
}

export interface ComparabilityAnalysisResultsDTO {
    checklist: {
        acceptable: Array<{
            name: string;
            present: boolean;
            isAncillary: boolean;
        }>;
        rejectable: Array<{
            name: string;
            present: boolean;
            isAncillary: boolean;
        }>;
        other: Array<{
            name: string;
            similarTo?: string;
            isAncillary: boolean;
        }>;
    };
    conclusion: {
        status: string;
        confidence: string;
        explanation: string;
        confidenceExplanation: string;
        concerns?: string;
    };
}

// Types for data parsed from JSON
export interface ComparabilityAnalysisData {
    ComparabilityAnalysis: {
        ChecklistVerification?: {
            AcceptableProductsServices?: Array<{
                ProductService: string;
                PresentInComparable: string;
                IsAncillary: string;
            }>;
            RejectableProductsServices?: Array<{
                ProductService: string;
                PresentInComparable: string;
                IsAncillary: string;
            }>;
            OtherProductsServices?: Array<{
                ProductService: string;
                SimilarTo?: string;
                IsAncillary: string;
            }>;
            AcceptableFunctions?: Array<{
                Function: string;
                PresentInComparable: string;
                IsAncillary: string;
            }>;
            RejectableFunctions?: Array<{
                Function: string;
                PresentInComparable: string;
                IsAncillary: string;
            }>;
            OtherFunctions?: Array<{
                Function: string;
                SimilarTo?: string;
                IsAncillary: string;
            }>;
        };
        ProductServiceComparability?: {
            Status: string;
            Confidence: string;
            Explanation: string;
            ConfidenceExplanation: string;
            Concerns?: string;
        };
        FunctionalProfileComparability?: {
            Status: string;
            Confidence: string;
            Explanation: string;
            ConfidenceExplanation: string;
        };
        NonIndependenceFactors?: Record<string, any>;
        NotNonIndependenceFactors?: Record<string, any>;
        Status?: string;
        Explanation?: string;
    };
} 