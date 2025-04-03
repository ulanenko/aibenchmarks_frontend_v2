import { secondaryDb } from '../../database/secondaryConnection';
import { ComparabilityAnalysisResultsRaw } from '../../models/comparabilityAnalysisResults';
import { eq, and, desc } from 'drizzle-orm';
import { comparabilityAnalysisResults } from '../../database/secondarySchema';

/**
 * Retrieves raw comparability analysis results for a given search ID and test type
 * @param searchId - The search_id to retrieve results for
 * @param testType - The type of test (e.g., 'product_service', 'functional_profile', 'independence')
 * @returns The raw response data or null if not found
 */
export async function getComparabilityAnalysisResults(
    searchId: string,
    testType: string
): Promise<ComparabilityAnalysisResultsRaw | null> {
    try {
        // Use typed query with schema
        const result = await secondaryDb
            .select({ raw_response: comparabilityAnalysisResults.raw_response })
            .from(comparabilityAnalysisResults)
            .where(
                and(
                    eq(comparabilityAnalysisResults.search_id, searchId),
                    eq(comparabilityAnalysisResults.test_type, testType)
                )
            )
            .orderBy(desc(comparabilityAnalysisResults.updated_at))
            .limit(1);

        // Check if we got a result
        if (result.length > 0) {
            return {
                raw_response: result[0].raw_response as string
            };
        }
        
        return null;
    } catch (error) {
        console.error('Error retrieving comparability analysis results:', error);
        throw new Error(`Failed to retrieve comparability analysis results for search_id: ${searchId} and test_type: ${testType}`);
    }
} 