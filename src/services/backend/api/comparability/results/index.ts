import { getComparabilityAnalysisResults as getResultsQuery } from '../../../queries/comparability/getComparabilityAnalysisResults';
import { ComparabilityAnalysisData, ComparabilityAnalysisResultsDTO } from '../../../models/comparabilityAnalysisResults';

/**
 * ComparabilityAnalyzer - Processes and transforms raw comparability analysis data
 */
export class ComparabilityAnalyzer {
    private processedData: ComparabilityAnalysisResultsDTO;
    
    constructor(jsonData: ComparabilityAnalysisData) {
        this.processedData = {
            checklist: {
                acceptable: [],
                rejectable: [],
                other: [],
            },
            conclusion: {
                status: '',
                confidence: '',
                explanation: '',
                confidenceExplanation: '',
            },
        };
        
        this.process(jsonData);
    }

    /**
     * Process JSON data in any of the three formats and standardize the output
     * @param jsonData - The input JSON data
     * @returns Standardized data structure
     */
    process(jsonData: ComparabilityAnalysisData): ComparabilityAnalysisResultsDTO {
        if (!jsonData.ComparabilityAnalysis) {
            throw new Error('Invalid input: ComparabilityAnalysis not found');
        }

        const analysis = jsonData.ComparabilityAnalysis;

        // Determine which type of analysis we're working with
        if (analysis.ChecklistVerification && analysis.ChecklistVerification.AcceptableProductsServices) {
            this.processProductServiceAnalysis(analysis);
        } else if (analysis.ChecklistVerification && analysis.ChecklistVerification.AcceptableFunctions) {
            this.processFunctionAnalysis(analysis);
        } else if (analysis.NotNonIndependenceFactors || analysis.NonIndependenceFactors) {
            this.processIndependenceAnalysis(analysis);
        } else {
            throw new Error('Unknown analysis type');
        }

        return this.processedData;
    }

    /**
     * Process product/service analysis
     * @param analysis - The ComparabilityAnalysis object
     */
    private processProductServiceAnalysis(analysis: ComparabilityAnalysisData['ComparabilityAnalysis']): void {
        const verification = analysis.ChecklistVerification;
        if (!verification) return;

        // Process acceptable items
        if (verification.AcceptableProductsServices) {
            verification.AcceptableProductsServices.forEach((item) => {
                this.processedData.checklist.acceptable.push({
                    name: item.ProductService,
                    present: item.PresentInComparable === 'Yes',
                    isAncillary: item.IsAncillary === 'Yes',
                });
            });
        }

        // Process rejectable items
        if (verification.RejectableProductsServices) {
            verification.RejectableProductsServices.forEach((item) => {
                this.processedData.checklist.rejectable.push({
                    name: item.ProductService,
                    present: item.PresentInComparable === 'Yes',
                    isAncillary: item.IsAncillary === 'Yes',
                });
            });
        }

        // Process other items
        if (verification.OtherProductsServices) {
            verification.OtherProductsServices.forEach((item) => {
                this.processedData.checklist.other.push({
                    name: item.ProductService,
                    similarTo: item.SimilarTo,
                    isAncillary: item.IsAncillary === 'Yes',
                });
            });
        }

        // Process conclusion
        if (analysis.ProductServiceComparability) {
            const comparability = analysis.ProductServiceComparability;
            this.processedData.conclusion = {
                status: comparability.Status || '',
                confidence: comparability.Confidence || '',
                explanation: comparability.Explanation || '',
                confidenceExplanation: comparability.ConfidenceExplanation || '',
                concerns: comparability.Concerns,
            };
        }
    }

    /**
     * Process function analysis
     * @param analysis - The ComparabilityAnalysis object
     */
    private processFunctionAnalysis(analysis: ComparabilityAnalysisData['ComparabilityAnalysis']): void {
        const verification = analysis.ChecklistVerification;
        if (!verification) return;

        // Process acceptable items
        if (verification.AcceptableFunctions) {
            verification.AcceptableFunctions.forEach((item) => {
                this.processedData.checklist.acceptable.push({
                    name: item.Function,
                    present: item.PresentInComparable === 'Yes',
                    isAncillary: item.IsAncillary === 'Yes',
                });
            });
        }

        // Process rejectable items
        if (verification.RejectableFunctions) {
            verification.RejectableFunctions.forEach((item) => {
                this.processedData.checklist.rejectable.push({
                    name: item.Function,
                    present: item.PresentInComparable === 'Yes',
                    isAncillary: item.IsAncillary === 'Yes',
                });
            });
        }

        // Process other items
        if (verification.OtherFunctions) {
            verification.OtherFunctions.forEach((item) => {
                this.processedData.checklist.other.push({
                    name: item.Function,
                    similarTo: item.SimilarTo,
                    isAncillary: item.IsAncillary === 'Yes',
                });
            });
        }

        // Process conclusion
        if (analysis.FunctionalProfileComparability) {
            const comparability = analysis.FunctionalProfileComparability;
            this.processedData.conclusion = {
                status: comparability.Status || '',
                confidence: comparability.Confidence || '',
                explanation: comparability.Explanation || '',
                confidenceExplanation: comparability.ConfidenceExplanation || '',
            };
        }
    }

    /**
     * Process independence analysis
     * @param analysis - The ComparabilityAnalysis object
     */
    private processIndependenceAnalysis(analysis: ComparabilityAnalysisData['ComparabilityAnalysis']): void {
        // For independence analysis, convert the factors into checklist items

        // Process non-independence factors (rejectable)
        if (analysis.NonIndependenceFactors) {
            const nonIndependenceFactors = analysis.NonIndependenceFactors;

            // Flatten the nested structure into a list
            const flattenedFactors = this.flattenObject(nonIndependenceFactors);

            Object.entries(flattenedFactors).forEach(([key, value]) => {
                this.processedData.checklist.rejectable.push({
                    name: this.formatKeyName(key),
                    present: value === true,
                    isAncillary: false,
                });
            });
        }

        // Process not-non-independence factors (acceptable)
        if (analysis.NotNonIndependenceFactors) {
            const notNonIndependenceFactors = analysis.NotNonIndependenceFactors;

            // Flatten the nested structure into a list
            const flattenedFactors = this.flattenObject(notNonIndependenceFactors);

            Object.entries(flattenedFactors).forEach(([key, value]) => {
                this.processedData.checklist.acceptable.push({
                    name: this.formatKeyName(key),
                    present: value === true,
                    isAncillary: false,
                });
            });
        }

        // Process conclusion
        this.processedData.conclusion = {
            status: analysis.Status || '',
            confidence: '',
            explanation: analysis.Explanation || '',
            confidenceExplanation: '',
        };
    }

    /**
     * Helper method to flatten nested objects
     * @param obj - Nested object
     * @param prefix - Prefix for nested property names
     * @returns Flattened object
     */
    private flattenObject(obj: Record<string, any>, prefix = ''): Record<string, any> {
        return Object.keys(obj).reduce((acc: Record<string, any>, key) => {
            const pre = prefix.length ? `${prefix}.` : '';

            if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
                Object.assign(acc, this.flattenObject(obj[key], pre + key));
            } else {
                acc[pre + key] = obj[key];
            }

            return acc;
        }, {});
    }

    /**
     * Format camelCase or dot-separated key names into readable text
     * @param key - The key to format
     * @returns Formatted key
     */
    private formatKeyName(key: string): string {
        return key
            .replace(/\./g, ' - ')
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, (str) => str.toUpperCase());
    }

    /**
     * Get the processed data
     * @returns The processed comparability analysis data
     */
    getProcessedData(): ComparabilityAnalysisResultsDTO {
        return this.processedData;
    }
}

/**
 * Fetch and transform raw comparability analysis results
 * 
 * @param searchId - The search ID to retrieve results for
 * @param testType - The test type (e.g., 'product_service', 'functional_profile', 'independence')
 * @returns Processed comparability analysis results or error information
 */
export async function fetchComparabilityAnalysisResults(
    searchId: string,
    testType: string
): Promise<[ComparabilityAnalysisResultsDTO | null, string | null, number | null]> {
    try {
        // Get raw response data
        const rawResponse = await getResultsQuery(searchId, testType);
        
        if (!rawResponse) {
            return [null, 'No analysis results found', 404];
        }
        
        // Parse the raw JSON response
        const jsonData = JSON.parse(rawResponse.raw_response) as ComparabilityAnalysisData;
        
        // Process the data
        const analyzer = new ComparabilityAnalyzer(jsonData);
        const processedData = analyzer.getProcessedData();
        
        return [processedData, null, null];
    } catch (error) {
        console.error('Error fetching comparability analysis results:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return [null, errorMessage, 500];
    }
} 