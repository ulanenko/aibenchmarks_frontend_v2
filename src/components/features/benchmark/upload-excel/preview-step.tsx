'use client';

import * as React from 'react';
import {useState, useEffect} from 'react';
import {Button} from '@/components/ui/button';
import {Loader2} from 'lucide-react';
import {StepProps} from './types';
import {Company} from '@/lib/company/company';
import {CompanyDTO} from '@/lib/company/type';

export function PreviewStep({state, updateState, onNext, onBack}: StepProps) {
	const [companies, setCompanies] = useState<Company[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [previewCount, setPreviewCount] = useState(5); // Number of rows to preview

	// Load preview data
	useEffect(() => {
		const loadPreview = async () => {
			if (!state.file || !state.sheet || !state.database) {
				return;
			}

			setIsLoading(true);
			try {
				// Use the extracted data from the state instead of processing the file again
				if (!state.extractedData || !state.extractedData.jsonData) {
					throw new Error('No extracted data available. Please go back and select a file again.');
				}

				// Convert the extracted data to Company objects
				const allCompanies = state.extractedData.jsonData.map((row, index) => {
					// Create a basic company object
					const dto: CompanyDTO = {
						id: -(index + 1), // Negative ID for new companies
						name: row.CompanyName || row['Company Name'] || row.Name || '',
						createdAt: new Date(),
						updatedAt: null,
						benchmarkId: 0,
						databaseId: null,
						country: row.Country || row.CountryOfDomicile || '',
						url: row.Website || row.WebsiteURL || row.URL || row.Url || '',
						streetAndNumber: null,
						addressLine1: null,
						consolidationCode: null,
						independenceIndicator: null,
						naceRev2: null,
						fullOverview: null,
						fullOverviewManual: null,
						tradeDescriptionEnglish: null,
						tradeDescriptionOriginal: null,
						mainActivity: null,
						mainProductsAndServices: null,
						sourceData: row,
						mappedSourceData: null,
						dataStatus: null,
					};

					// Apply column mappings if available
					if (state.columnMappings && state.columnMappings.length > 0) {
						const mappedData: Record<string, any> = {};

						// Apply each mapping
						state.columnMappings.forEach((mapping) => {
							if (mapping.sourceColumn && mapping.targetColumn) {
								// Get the value from the source column
								const value = row[mapping.sourceColumn];
								// Set it to the target field in mappedSourceData
								mappedData[mapping.targetColumn] = value;
							}
						});

						dto.mappedSourceData = mappedData;
					}

					return new Company(dto);
				});

				// Take the first few companies for preview
				setCompanies(allCompanies.slice(0, 10));
			} catch (error) {
				console.error('Error loading preview data:', error);
				updateState({
					error: 'Failed to load preview data from the Excel file.',
				});
			} finally {
				setIsLoading(false);
			}
		};

		loadPreview();
	}, [state.file, state.sheet, state.database, state.columnMappings, state.extractedData]);

	const handleImport = async () => {
		if (!state.file || !state.sheet || !state.database || !state.extractedData) {
			return;
		}

		updateState({isProcessing: true, error: null});
		try {
			// Use the extracted data from the state
			const allCompanies =
				state.extractedData.jsonData?.map((row, index) => {
					// Create a basic company object
					const dto: CompanyDTO = {
						id: -(index + 1), // Negative ID for new companies
						name: row.CompanyName || row['Company Name'] || row.Name || '',
						createdAt: new Date(),
						updatedAt: null,
						benchmarkId: 0,
						databaseId: null,
						country: row.Country || row.CountryOfDomicile || '',
						url: row.Website || row.WebsiteURL || row.URL || row.Url || '',
						streetAndNumber: null,
						addressLine1: null,
						consolidationCode: null,
						independenceIndicator: null,
						naceRev2: null,
						fullOverview: null,
						fullOverviewManual: null,
						tradeDescriptionEnglish: null,
						tradeDescriptionOriginal: null,
						mainActivity: null,
						mainProductsAndServices: null,
						sourceData: row,
						mappedSourceData: null,
						dataStatus: null,
					};

					// Apply column mappings if available
					if (state.columnMappings && state.columnMappings.length > 0) {
						const mappedData: Record<string, any> = {};

						// Apply each mapping
						state.columnMappings.forEach((mapping) => {
							if (mapping.sourceColumn && mapping.targetColumn) {
								// Get the value from the source column
								const value = row[mapping.sourceColumn];
								// Set it to the target field in mappedSourceData
								mappedData[mapping.targetColumn] = value;
							}
						});

						dto.mappedSourceData = mappedData;
					}

					return new Company(dto);
				}) || [];

			// Pass the companies to the parent component
			onNext();

			// In a real implementation, you would pass these companies
			// back to the parent component for further processing
			return allCompanies;
		} catch (error) {
			console.error('Error processing file:', error);
			updateState({
				error: 'Failed to process the Excel file. Please try again.',
			});
		} finally {
			updateState({isProcessing: false});
		}
	};

	if (isLoading) {
		return (
			<div className="flex flex-col items-center justify-center py-12">
				<Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
				<p className="text-muted-foreground">Loading preview data...</p>
			</div>
		);
	}

	return (
		<div className="grid gap-6 py-4">
			{state.error && <div className="bg-destructive/15 text-destructive p-3 rounded-md text-sm">{state.error}</div>}

			<div className="space-y-4">
				<h3 className="text-lg font-medium">Preview Data</h3>
				<p className="text-sm text-muted-foreground">
					Review the data before importing. Showing {Math.min(previewCount, companies.length)} of {companies.length}{' '}
					rows.
				</p>
			</div>

			<div className="border rounded-md overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full text-sm">
						<thead>
							<tr className="bg-muted">
								<th className="px-4 py-2 text-left font-medium">Company Name</th>
								<th className="px-4 py-2 text-left font-medium">Country</th>
								<th className="px-4 py-2 text-left font-medium">Website</th>
							</tr>
						</thead>
						<tbody>
							{companies.slice(0, previewCount).map((company, index) => (
								<tr key={index} className="border-t">
									<td className="px-4 py-2">{company.name}</td>
									<td className="px-4 py-2">{company.inputValues.country}</td>
									<td className="px-4 py-2">{company.inputValues.url}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			{companies.length > previewCount && (
				<Button
					variant="outline"
					onClick={() => setPreviewCount((prev) => Math.min(prev + 5, companies.length))}
					className="w-full"
				>
					Show more rows
				</Button>
			)}

			<div className="flex justify-between mt-4">
				<Button variant="outline" onClick={onBack} disabled={state.isProcessing}>
					← Back
				</Button>
				<Button onClick={handleImport} disabled={companies.length === 0 || state.isProcessing}>
					{state.isProcessing ? (
						<>
							<Loader2 className="h-4 w-4 mr-2 animate-spin" />
							Importing...
						</>
					) : (
						<>Import Data</>
					)}
				</Button>
			</div>
		</div>
	);
}
