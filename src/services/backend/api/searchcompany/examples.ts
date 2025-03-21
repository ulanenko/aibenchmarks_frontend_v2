/**
 * Examples of how to use the company analysis API functions
 *
 * This file is meant for demonstration purposes only and shouldn't be used in production.
 */

import {
	buildCompanyAnalysisRequest,
	buildCompanyAnalysisInput,
	initiateCompanyAnalysis,
	ComparabilityCompanyAPIResponse,
} from './index';

/**
 * Example: Initiating analysis for a single company
 */
async function exampleSingleCompanyAnalysis() {
	try {
		// Create an analysis request for a single company
		const companyToAnalyze = buildCompanyAnalysisRequest(
			'Acme Corporation',
			'United States',
			'https://www.acme.example.com',
			'en',
			true, // Take screenshots
			{
				useDbDescriptions: true,
				tradeDatabaseDescription: 'Acme produces various products for consumers.',
				fullDatabaseOverview: 'Acme Corporation is a fictional company that produces various products.',
				siteMatch: {
					bvdId: 'BVD12345',
					streetAndNumber: '123 Acme Street',
					addressLine: '123 Acme Street, Anytown, USA',
				},
			},
		);

		// Build the complete input with authorization code
		const analysisInput = buildCompanyAnalysisInput(
			6666666, // Auth code
			[companyToAnalyze],
		);

		// Initiate the analysis
		const result = await initiateCompanyAnalysis(analysisInput);

		if (result) {
			console.log('Analysis initiated successfully!');
			console.log(`Message: ${result.message}`);
			console.log(`Search IDs: ${result.search_ids.join(', ')}`);

			// The search_ids can be used to fetch analysis results later
			return result.search_ids;
		} else {
			console.error('Failed to initiate analysis');
			return [];
		}
	} catch (error) {
		console.error('Error in example single company analysis:', error);
		return [];
	}
}

/**
 * Example: Initiating analysis for multiple companies
 */
async function exampleMultipleCompanyAnalysis() {
	try {
		// Create analysis requests for multiple companies
		const companies = [
			buildCompanyAnalysisRequest('Acme Corporation', 'United States', 'https://www.acme.example.com'),
			buildCompanyAnalysisRequest('Globex Corporation', 'United Kingdom', 'https://www.globex.example.com'),
			buildCompanyAnalysisRequest(
				'Initech',
				'Germany',
				'https://www.initech.example.com',
				'de', // German language
			),
		];

		// Build the complete input with authorization code
		const analysisInput = buildCompanyAnalysisInput(
			12345, // Auth code
			companies,
		);

		// Initiate the analysis
		const result = await initiateCompanyAnalysis(analysisInput);

		if (result) {
			console.log('Multiple company analysis initiated successfully!');
			console.log(`Message: ${result.message}`);
			console.log(`Number of search IDs: ${result.search_ids.length}`);
			console.log(`Search IDs: ${result.search_ids.join(', ')}`);

			// The search_ids can be used to fetch analysis results later
			return result.search_ids;
		} else {
			console.error('Failed to initiate multiple company analysis');
			return [];
		}
	} catch (error) {
		console.error('Error in example multiple company analysis:', error);
		return [];
	}
}

// How to use the examples
// async function runExamples() {
//   console.log('Running single company analysis example:');
//   const singleSearchIds = await exampleSingleCompanyAnalysis();
//
//   console.log('\nRunning multiple company analysis example:');
//   const multipleSearchIds = await exampleMultipleCompanyAnalysis();
// }
//
// runExamples().catch(console.error);
