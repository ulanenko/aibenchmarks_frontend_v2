'use client';

import * as React from 'react';
import {useRef, useState, useEffect} from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {FileUpIcon, Loader2, HelpCircle, HistoryIcon, FileIcon, CheckCircle2, DownloadIcon} from 'lucide-react';
import {StepProps} from './types';
import {readExcelFileAsJson, supportedDatabases, extractDbTableFromSheet} from '@/lib/excel/excel-parser';
import {LoadingButton} from '@/components/ui/loading-button';
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from '@/components/ui/tooltip';
import {useCompanyStore} from '@/stores/use-company-store';
import {MappingSettings} from '@/lib/benchmark/type';
import {useToast} from '@/hooks/use-toast';
import {downloadFileFromStorage} from '@/app/actions/download-file';

export function FileSelectionStep({state, updateState, onNext}: StepProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [isExtracting, setIsExtracting] = useState(false);
	const [isLoadingBenchmark, setIsLoadingBenchmark] = useState(false);
	const {loadMappingSettings} = useCompanyStore();
	const {toast} = useToast();
	const {benchmarkId} = useCompanyStore();

	// Load saved benchmark data when component mounts
	useEffect(() => {
		if (benchmarkId) {
			loadSavedBenchmarkData();
		}
	}, [benchmarkId]);

	// Function to load saved benchmark data (settings and file) in a single operation
	const loadSavedBenchmarkData = async () => {
		if (!benchmarkId) return;

		setIsLoadingBenchmark(true);
		try {
			const result = await loadMappingSettings(benchmarkId);

			if (result.settings) {
				const settings = result.settings;

				// Update state with saved settings
				updateState({
					database: settings.dbName || '',
					sheet: settings.sourceSheet || '',
					columnMappings: settings.generalMapping as any,
				});
			}

			// If we have file data, process it
			if (result.fileData && result.fileData.data) {
				// Create a File object from the ArrayBuffer
				const file = new File([result.fileData.data], result.fileData.fileName, {
					type: result.fileData.contentType || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
				});

				// Set the file in the state
				updateState({file});

				// Set the file in the file input element using DataTransfer API
				if (fileInputRef.current) {
					try {
						// Create a DataTransfer object and add the file
						const dataTransfer = new DataTransfer();
						dataTransfer.items.add(file);

						// Set the files property of the file input
						fileInputRef.current.files = dataTransfer.files;
					} catch (error) {
						console.error('Error setting file in input element:', error);
					}
				}

				// Load the Excel file and get sheet names
				await loadExcelFile(file);

				toast({
					title: 'Benchmark data loaded',
					description: 'Previously saved settings and file have been loaded successfully.',
				});
			} else if (result.settings) {
				// If we have settings but no file, still show a success message for the settings
				toast({
					title: 'Mapping settings loaded',
					description: 'Previously saved mapping settings have been loaded.',
				});
			}

			// Show warning if there was an error but we still loaded some data
			if (result.error && (result.settings || result.fileData)) {
				toast({
					title: 'Partial data loaded',
					description: `Some data was loaded, but there was an issue: ${result.error}`,
					variant: 'destructive',
				});
			}
		} catch (error) {
			console.error('Error loading benchmark data:', error);
			toast({
				variant: 'destructive',
				title: 'Error loading benchmark data',
				description: error instanceof Error ? error.message : 'Failed to load benchmark data',
			});
		} finally {
			setIsLoadingBenchmark(false);
		}
	};

	// Function to load an Excel file and extract sheet names
	const loadExcelFile = async (file: File) => {
		try {
			// Load the Excel file and get sheet names
			const excelData = await readExcelFileAsJson(file);
			const sheetNames = Object.keys(excelData);

			updateState({sheets: sheetNames});

			// If we have a saved sheet setting and it exists in this file, use it
			if (state.sheet && sheetNames.includes(state.sheet)) {
				// Keep the existing sheet selection
				// If database is also set, extract the table data
				if (state.database) {
					await extractTableData(file, state.sheet, state.database);
				}
			}
			// Auto-select the first sheet if available
			else if (sheetNames.length === 1) {
				const sheet = sheetNames[0];
				updateState({sheet});
				// If database is set, extract the table data
				if (state.database) {
					await extractTableData(file, sheet, state.database);
				}
			} else if (sheetNames.length > 1) {
				// if sheet name exists use it, otherwise set to undefined
				const sheetName = sheetNames.find((name) => name.toLowerCase().includes('sheet')) || undefined;
				if (sheetName && state.database) {
					updateState({sheet: sheetName});
					await extractTableData(file, sheetName, state.database);
				} else if (sheetName) {
					updateState({sheet: sheetName});
				}
			}

			return true;
		} catch (err) {
			console.error('Error reading Excel file:', err);
			updateState({
				error: 'Failed to read Excel file. Please make sure it is a valid Excel file.',
				sheets: [],
			});
			return false;
		}
	};

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFile = e.target.files?.[0];
		updateState({error: null});

		if (selectedFile) {
			updateState({isLoading: true, file: selectedFile});

			try {
				const success = await loadExcelFile(selectedFile);

				if (!success && fileInputRef.current) {
					fileInputRef.current.value = '';
					updateState({file: null});
				}
			} finally {
				updateState({isLoading: false});
			}
		}
	};

	const handleDatabaseChange = async (value: string) => {
		updateState({database: value});

		// If file and sheet are already selected, extract the table data
		if (state.file && state.sheet) {
			await extractTableData(state.file, state.sheet, value);
		}
	};

	const handleSheetChange = async (value: string) => {
		updateState({sheet: value});

		// If file and database are already selected, extract the table data
		if (state.file && state.database) {
			await extractTableData(state.file, value, state.database);
		}
	};

	const extractTableData = async (file: File, sheet: string, database: string) => {
		setIsExtracting(true);
		updateState({error: null});

		try {
			// Get the database config
			const dbConfig = supportedDatabases[database];
			if (!dbConfig) {
				throw new Error(`Database type "${database}" not supported`);
			}

			// Load the Excel file
			const excelData = await readExcelFileAsJson(file);

			// Check if the requested sheet exists
			if (!excelData[sheet]) {
				throw new Error(`Sheet "${sheet}" not found in the Excel file`);
			}

			// Extract the table data
			const {headers, content} = extractDbTableFromSheet(
				excelData[sheet],
				dbConfig.skipRows,
				dbConfig.headerRows,
				dbConfig.copyRight,
			);

			// Convert array data to objects with headers as keys
			const jsonData = content.map((row) => {
				const obj: Record<string, any> = {};
				headers.forEach((header, index) => {
					if (header) {
						obj[header] = row[index];
					}
				});
				return obj;
			});

			// Store the extracted data in the state
			updateState({
				extractedData: {
					headers,
					content,
					jsonData,
				},
			});
		} catch (err) {
			console.error('Error extracting table data:', err);
			updateState({
				error: 'Failed to extract table data from the Excel file.',
			});
		} finally {
			setIsExtracting(false);
		}
	};

	const handleNext = async () => {
		if (state.file && state.sheet && state.database) {
			// If we don't have extracted data yet, extract it now
			if (!state.extractedData) {
				await extractTableData(state.file, state.sheet, state.database);
			}

			// Only proceed if we have extracted data or no errors
			if (state.extractedData || !state.error) {
				onNext();
			}
		}
	};

	return (
		<div className=" px-2  ">
			{state.error && <div className="bg-destructive/15 text-destructive p-3 rounded-md text-sm">{state.error}</div>}

			<div className="max-w-2xl mx-auto mb-12 mt-6 grid gap-6">
				{/* Show loading indicator when loading benchmark data */}
				{isLoadingBenchmark && (
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<Loader2 className="h-4 w-4 animate-spin" />
						<span>Loading benchmark data...</span>
					</div>
				)}

				{/* Show message if saved settings were loaded */}
				{state.columnMappings && Object.keys(state.columnMappings).length > 0 && !isLoadingBenchmark && (
					<div className="flex items-center gap-2 text-sm bg-primary/10 p-3 rounded-md">
						<HistoryIcon className="h-4 w-4" />
						<span>Previously saved mapping settings have been loaded.</span>
					</div>
				)}

				<div className="grid gap-2">
					<Label htmlFor="file">Selected File:</Label>
					<div className="flex items-center gap-2">
						<Input
							id="file"
							type="file"
							accept=".xlsx,.xls"
							onChange={handleFileChange}
							ref={fileInputRef}
							className="flex-1"
							disabled={state.isLoading || state.isProcessing || isLoadingBenchmark}
						/>
						<LoadingButton
							variant="outline"
							onClick={() => fileInputRef.current?.click()}
							type="button"
							disabled={state.isProcessing || isLoadingBenchmark}
							isLoading={state.isLoading}
							loadingText="Loading..."
							loadingIcon={<Loader2 className="h-4 w-4 mr-2 animate-spin" />}
						>
							<FileUpIcon className="h-4 w-4 mr-2" />
							Choose file
						</LoadingButton>
					</div>
				</div>

				<div className="grid gap-2">
					<Label htmlFor="database" className="flex items-center">
						Select File Type:
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<HelpCircle className="ml-1 h-4 w-4 text-muted-foreground cursor-help" />
								</TooltipTrigger>
								<TooltipContent>
									<p>
										Select the type of file you are uploading (database). This will help us determine the correct format
										for your data.
									</p>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					</Label>
					<Select
						value={state.database}
						onValueChange={handleDatabaseChange}
						disabled={state.isLoading || state.isProcessing || isLoadingBenchmark}
					>
						<SelectTrigger id="database">
							<SelectValue placeholder="Select database" />
						</SelectTrigger>
						<SelectContent>
							{Object.entries(supportedDatabases).map(([key, config]) => (
								<SelectItem key={key} value={key}>
									{config.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="grid gap-2">
					<Label htmlFor="sheet" className="flex items-center">
						Select Sheet:
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<HelpCircle className="ml-1 h-4 w-4 text-muted-foreground cursor-help" />
								</TooltipTrigger>
								<TooltipContent>
									<p>Sheet of your file from which the data will be taken.</p>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					</Label>
					<Select
						value={state.sheet}
						onValueChange={handleSheetChange}
						disabled={
							!state.file || state.isLoading || state.isProcessing || state.sheets.length === 0 || isLoadingBenchmark
						}
					>
						<SelectTrigger id="sheet">
							<SelectValue placeholder={state.sheets.length === 0 ? 'No sheets available' : 'Select a sheet'} />
						</SelectTrigger>
						<SelectContent>
							{state.sheets.map((sheetName) => (
								<SelectItem key={sheetName} value={sheetName}>
									{sheetName}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					{state.sheets.length > 0 && (
						<p className="text-sm text-muted-foreground">
							{state.sheets.length} sheet{state.sheets.length !== 1 ? 's' : ''} found in the Excel file.
						</p>
					)}
				</div>
			</div>

			<div className="flex justify-end mt-4 border-t pt-4">
				<LoadingButton
					onClick={handleNext}
					disabled={
						!state.file ||
						!state.sheet ||
						!state.database ||
						state.isLoading ||
						state.isProcessing ||
						isLoadingBenchmark
					}
					isLoading={isExtracting}
					loadingText="Extracting..."
				>
					Next →
				</LoadingButton>
			</div>
		</div>
	);
}
