'use server';

import { ComparabilityAnalysisResultsDTO } from '@/services/backend/models/comparabilityAnalysisResults';
import { fetchComparabilityAnalysisResults } from '@/services/backend/api/comparability/results';

interface SearchedCompany {
    id: number;
    search_id: string;
    // other fields omitted for brevity
}

interface CompAnalysisResult {
    isLoading: boolean;
    data?: ComparabilityAnalysisResultsDTO;
    error?: string;
    errorStatus?: number;
}

/**
 * Server action to fetch and process comparability analysis results
 * 
 * @param searchId - The search ID to retrieve results for
 * @param testType - The test type (e.g., 'product_service', 'functional_profile', 'independence')
 * @returns A result object containing data or error information
 */
export async function getComparabilityAnalysisResults(
    searchId: string,
    testType: string
): Promise<{
    data: ComparabilityAnalysisResultsDTO | null;
    error: string | null;
    status: number;
}> {
    try {
        // Validate required parameters
        if (!searchId || !testType) {
            return {
                data: null,
                error: 'Missing required parameters: searchId and testType are required',
                status: 400
            };
        }
        
        // Fetch and process the comparability analysis results
        const [data, error, errorStatus] = await fetchComparabilityAnalysisResults(searchId, testType);
        
        // Return structured response
        if (error) {
            return {
                data: null,
                error,
                status: errorStatus || 500
            };
        }
        
        return {
            data,
            error: null,
            status: 200
        };
    } catch (error) {
        console.error('Error processing comparability analysis results:', error);
        return {
            data: null,
            error: error instanceof Error ? error.message : 'Internal server error',
            status: 500
        };
    }
}
