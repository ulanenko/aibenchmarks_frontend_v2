'use server';

import {
    buildComparabilityAnalysisInput,
    initiateComparabilityAnalysis,
    ComparabilityAnalysisInput,
    ComparabilityAnalysis,
} from '@/services/backend/api/comparability';
import { CompanyDTO } from '@/lib/company/type';
import * as companyService from '@/services/server/company-service.server';
import * as benchmarkService from '@/services/server/benchmark-service.server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getMultipleSearchedCompanies } from '@/services/backend/queries/searchedcompany/getMultipleSearchedCompanies';
import { SearchedCompany } from '@/services/backend/models/searchedCompany';

/**
 * Server action to initiate comparability analysis for a list of companies
 *
 * @param companyIds - Array of company IDs to analyze
 * @param benchmarkId - The benchmark ID containing the strategy information
 * @returns Response with search IDs, initialized company IDs, or error information
 */
export async function initiateComparabilityAnalysisAction(
    companyIds: number[],
    benchmarkId: number,
): Promise<{success: boolean; message: string; searchedCompanies?: SearchedCompany[]; initializedCompanyIds?: number[]}> {
    try {
        // Get auth session for user
        const session = await getServerSession(authOptions);
        const authCode = session?.user?.authCode ? parseInt(session.user.authCode) : 6666666; // Default auth code if no user

        // Validate input
        if (!companyIds || companyIds.length === 0) {
            return {
                success: false,
                message: 'No company IDs provided for analysis',
            };
        }

        // Get the benchmark to retrieve strategy information
        const benchmark = await benchmarkService.getBenchmarkById(benchmarkId);
        
        if (!benchmark) {
            return {
                success: false,
                message: `Benchmark with ID ${benchmarkId} not found`,
            };
        }
        
        if (!benchmark.strategy) {
            return {
                success: false,
                message: 'Benchmark has no strategy information',
            };
        }

        // Get the strategy data
        const { idealProducts, idealFunctionalProfile } = benchmark.strategy;
        if (!idealProducts || !idealFunctionalProfile) {
            return {
                success: false,
                message: 'Benchmark strategy is missing required product/service or functional profile descriptions',
            };
        }

        // Get companies with their search IDs directly from the database
        const companiesData = await companyService.getCompanySearchIds(benchmarkId);
        
        // Filter to only include the requested company IDs and ensure they have search IDs
        const filteredCompanies = companiesData
            .filter(company => companyIds.includes(company.id) && company.searchId);
            
        // Store company IDs that were successfully initialized
        const initializedCompanyIds = filteredCompanies.map(company => company.id);
        
        const companiesForAnalysis = filteredCompanies
            .map(company => ({
                search_id: company.searchId!,
                ideal_product_service: idealProducts,
                ideal_functional_profile: idealFunctionalProfile,
                lang: benchmark.lang || 'en',
                relaxed_product: benchmark.strategy?.relaxedProduct || false,
                relaxed_function: benchmark.strategy?.relaxedFunction || false,
            }));

        if (companiesForAnalysis.length === 0) {
            return {
                success: false,
                message: 'No companies with valid search IDs found for the provided company IDs',
            };
        }

        // Build the full analysis request
        const analysisInput: ComparabilityAnalysisInput = {
            auth_code: authCode,
            analysis: companiesForAnalysis,
        };

        // Initiate the analysis
        const result = await initiateComparabilityAnalysis(analysisInput);

        if (!result) {
            return {
                success: false,
                message: 'Failed to initiate comparability analysis. The API returned no response.',
            };
        }

        // Extract search IDs from the response (if available)
        const searchIds = result.search_ids;

        if (!searchIds || searchIds.length === 0) {
            return {
                success: false,
                message: 'The API returned no search IDs',
            };
        }
        // If we have company IDs, save the search IDs to the companies
		const companyIdsWithSearchIds: Record<number, SearchedCompany> = {};

		const searchedCompanies  = await getMultipleSearchedCompanies(searchIds);
		
        return {
            success: true,
            message: `Successfully initiated comparability analysis for ${companiesForAnalysis.length} companies`,
            searchedCompanies,
            initializedCompanyIds,
        };
    } catch (error) {
        console.error('Error in initiateComparabilityAnalysisAction:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'An unknown error occurred',
        };
    }
} 