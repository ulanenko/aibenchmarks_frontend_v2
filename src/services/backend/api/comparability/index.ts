export interface ComparabilityAnalysis {
    search_id: string;
    ideal_product_service: string;
    ideal_functional_profile: string;
    lang: string;
    relaxed_product: boolean;
    relaxed_function: boolean;
}

export interface ComparabilityAnalysisInput {
    auth_code: number;
    analysis: ComparabilityAnalysis[];
}

export interface ComparabilityAnalysisResponse {
    message: string;
    search_ids: string[];
}

/**
 * Builds a comparability analysis input object
 * 
 * @param authCode - Authorization code for the API
 * @param analysis - List of comparability analysis parameters
 * @returns ComparabilityAnalysisInput object
 */
export function buildComparabilityAnalysisInput(
    authCode: number,
    analysis: ComparabilityAnalysis[]
): ComparabilityAnalysisInput {
    return {
        auth_code: authCode,
        analysis
    };
}

/**
 * Initiates a comparability analysis via the API
 * 
 * @param input - The input for the comparability analysis
 * @returns A promise resolving to the API response
 */
export async function initiateComparabilityAnalysis(
    input: ComparabilityAnalysisInput
): Promise<ComparabilityAnalysisResponse | null> {
    try {
        const response = await fetch('/api/comparability-analysis/initiate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(input),
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error initiating comparability analysis:', error);
        return null;
    }
} 