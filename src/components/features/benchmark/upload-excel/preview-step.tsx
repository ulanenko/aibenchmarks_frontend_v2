'use client';

import * as React from 'react';
import {useState, useEffect} from 'react';
import {Button} from '@/components/ui/button';
import {Loader2} from 'lucide-react';
import {StepProps} from './types';
import {Company} from '@/lib/company/company';
import {CompanyDTO, CreateCompanyDTO} from '@/lib/company/type';
import {useCompanyStore} from '@/stores/use-company-store';
import {MappingSettings} from '@/lib/benchmark/type';
import {useToast} from '@/hooks/use-toast';
import {uploadBenchmarkFile} from '@/app/actions/upload-file';

export function PreviewStep({state, updateState, onNext, onBack}: StepProps) {
	const {toast} = useToast();
	const {addMappedSourceData, saveMappingSettings, benchmarkId} = useCompanyStore();
	const [previewCount, setPreviewCount] = useState(5); // Number of rows to preview
	const {columnMappings} = state;
	const companiesMapped =
		state.extractedData?.jsonData?.map((row) => {
			return Object.entries(row).reduce((acc, [key, value]) => {
				const mappedKey = columnMappings?.[key];
				if (mappedKey) {
					acc[mappedKey] = value;
				}
				return acc;
			}, {} as CreateCompanyDTO);
		}) || [];

	const handleImport = async () => {
		updateState({isProcessing: true});

		try {
			// Save the mapped companies using the company store
			if (companiesMapped.length > 0) {
				await addMappedSourceData(companiesMapped);

				// Save the mapping settings for future use
				if (columnMappings && Object.keys(columnMappings).length > 0 && benchmarkId) {
					// Create mapping settings object
					const mappingSettings: MappingSettings = {
						dbName: state.database,
						sourceFileName: state.file?.name || '',
						sourceSheet: state.sheet,
						generalMapping: columnMappings,
						financialMapping: {}, // Currently empty, can be populated in future
					};

					// Upload the file to Supabase if it exists
					if (state.file) {
						const fileName = `${Date.now()}_${state.file.name}`;
						console.log('Attempting to upload file:', fileName);
						const {path, error} = await uploadBenchmarkFile(benchmarkId, state.file, fileName);

						if (error) {
							console.error('File upload error details:', error);
							toast({
								title: 'File upload warning',
								description: `The data was imported, but there was an issue uploading the file: ${error}`,
								variant: 'destructive',
							});
						} else {
							console.log('File uploaded successfully, path:', path);
							// Add the file path to the mapping settings
							mappingSettings.pathToFile = path;
						}
					}

					// Save the mapping settings
					await saveMappingSettings(mappingSettings);
				}

				toast({
					title: 'Upload Successful',
					description: `Successfully imported ${companiesMapped.length} companies.`,
				});
			} else {
				toast({
					title: 'No companies to import',
					description: 'No companies were found to import.',
					variant: 'destructive',
				});
			}

			// Continue to next step (which will close the modal)
			onNext();
		} catch (error) {
			console.error('Error importing companies:', error);
			toast({
				title: 'Error importing companies',
				description: error instanceof Error ? error.message : 'Failed to import companies',
				variant: 'destructive',
			});

			// Reset processing state but stay on current step
			updateState({isProcessing: false});
		}
	};

	if (state.isLoading) {
		return (
			<div className="flex flex-col items-center justify-center py-12">
				<Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
				<p className="text-muted-foreground">Loading preview data...</p>
			</div>
		);
	}

	return (
		<div className="flex flex-col flex-1 min-h-0">
			{state.error && (
				<div className="bg-destructive/15 text-destructive p-3 rounded-md text-sm mb-4">{state.error}</div>
			)}

			<div className="mb-4">
				<h3 className="text-lg font-medium mb-2">Preview Data</h3>
				<p className="text-sm text-muted-foreground">
					Review the data before importing. Showing {Math.min(previewCount, companiesMapped.length)} of{' '}
					{companiesMapped.length} rows.
				</p>
				<p className="text-sm text-muted-foreground mt-1">
					<strong>Note:</strong> Your mapping settings and file will be saved with this benchmark for future use.
				</p>
			</div>

			<div className="flex-1 min-h-0 border rounded-md mb-4 overflow-y-auto">
				<table className="w-full text-sm">
					<thead className="sticky top-0 bg-muted z-10">
						<tr>
							<th className="px-4 py-2 text-left font-medium">Company Name</th>
							<th className="px-4 py-2 text-left font-medium">Country</th>
							<th className="px-4 py-2 text-left font-medium">Website</th>
						</tr>
					</thead>
					<tbody>
						{companiesMapped.slice(0, previewCount).map((company, index) => (
							<tr key={index} className="border-t">
								<td className="px-4 py-2">{company.name}</td>
								<td className="px-4 py-2">{company.country}</td>
								<td className="px-4 py-2">{company.url}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{companiesMapped.length > previewCount && (
				<Button
					variant="outline"
					onClick={() => setPreviewCount((prev) => Math.min(prev + 5, companiesMapped.length))}
					className="w-full mb-4"
				>
					Show more rows
				</Button>
			)}

			<div className="flex justify-between mt-auto pt-4 border-t">
				<Button variant="outline" onClick={onBack} disabled={state.isProcessing}>
					← Back
				</Button>
				<Button onClick={handleImport} disabled={companiesMapped.length === 0 || state.isProcessing}>
					{state.isProcessing ? (
						<>
							<Loader2 className="h-4 w-4 mr-2 animate-spin" />
							Importing...
						</>
					) : (
						'Import Data'
					)}
				</Button>
			</div>
		</div>
	);
}
