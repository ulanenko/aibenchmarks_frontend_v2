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

/**
 * Helper function to update comparability analysis results in a component's state
 * This function should be called client-side and manages the state while fetching results
 * 
 * @param resultsByCompanyAndColumn - State object to store results by company and column
 * @param selectedCompany - The selected company 
 * @param compColumn - The column key to retrieve results for
 */
export async function updateComparabilityAnalysisResults(
    resultsByCompanyAndColumn: Record<number, Record<string, CompAnalysisResult>>,
    selectedCompany: SearchedCompany | null,
    compColumn: { key: string }
): Promise<void> {
    if (!selectedCompany || !compColumn) {
        return;
    }
    
    const compColumnKey = compColumn.key;
    
    // Skip if we already have results for this company and column
    if (resultsByCompanyAndColumn[selectedCompany.id]?.[compColumnKey] !== undefined) {
        return;
    }
    
    // Initialize the result storage if needed
    if (!resultsByCompanyAndColumn[selectedCompany.id]) {
        resultsByCompanyAndColumn[selectedCompany.id] = {
            [compColumnKey]: {
                isLoading: true,
            },
        };
    } else {
        resultsByCompanyAndColumn[selectedCompany.id][compColumnKey] = {
            isLoading: true,
        };
    }

    try {
        // Fetch the results using await
        const result = await getComparabilityAnalysisResults(selectedCompany.search_id, compColumnKey);
        
        // Create a temporary clone to ensure reactivity
        const updatedResults = {...resultsByCompanyAndColumn};
        
        if (!updatedResults[selectedCompany.id]) {
            updatedResults[selectedCompany.id] = {};
        }
        
        // Update with results
        updatedResults[selectedCompany.id][compColumnKey] = {
            isLoading: false,
            data: result.data || undefined,
            error: result.error || undefined,
            errorStatus: result.status !== 200 ? result.status : undefined,
        };
        
        // Update the reference to trigger reactivity
        Object.assign(resultsByCompanyAndColumn, updatedResults);
    } catch (error) {
        console.error('Error fetching comparability analysis results:', error);
        
        // Update state with error
        const updatedResults = {...resultsByCompanyAndColumn};
        
        if (!updatedResults[selectedCompany.id]) {
            updatedResults[selectedCompany.id] = {};
        }
        
        updatedResults[selectedCompany.id][compColumnKey] = {
            isLoading: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            errorStatus: 500,
        };
        
        Object.assign(resultsByCompanyAndColumn, updatedResults);
    }
} 