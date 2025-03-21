import {AnalyzeCompanyInput, AnalyzeCompanyAPIResponse} from './types';

// Benchmark API URL
const BENCHMARK_API_URL = 'https://aibenchmarks-experimental-2.azurewebsites.net';

// API Token for authorization

/**
 * Initiates company analysis on the Benchmark API
 *
 * @param analyzeCompanyInput - Input data for company analysis
 * @returns A Promise that resolves to the API response with company analysis results or null if the request fails
 */
export async function initiateCompanyAnalysis(
	analyzeCompanyInput: AnalyzeCompanyInput,
): Promise<AnalyzeCompanyAPIResponse[] | null> {
	try {
		// Send the POST request to the Benchmark API
		// Include the API token in the URL as a query parameter
		const response = await fetch(`${BENCHMARK_API_URL}/company-analysis`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(analyzeCompanyInput),
		});

		// Check if the request was successful
		if (!response.ok) {
			throw new Error(`API returned status ${response.status}: ${response.statusText}`);
		}

		// Parse the response
		const data = await response.json();
		return data as AnalyzeCompanyAPIResponse[];
	} catch (error) {
		console.error('Error initiating company analysis:', error);
		return null;
	}
}
