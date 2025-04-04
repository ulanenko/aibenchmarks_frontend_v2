'use client';

import * as React from 'react';
import { useRef, useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileUpIcon, Loader2, HelpCircle, HistoryIcon, FileIcon, CheckCircle2, DownloadIcon } from 'lucide-react';
import { StepProps, UploadState } from './types';
import { readExcelFileAsJson, supportedDatabases, extractDbTableFromSheet, HeaderGroup } from '@/lib/excel/excel-parser';
import { LoadingButton } from '@/components/ui/loading-button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useCompanyStore } from '@/stores/use-company-store';
import { useToast } from '@/hooks/use-toast';

export function FileSelectionStep({ state, updateState, onNext }: StepProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const loadingRef = useRef(false); // Ref to track loading state without causing re-renders
	const hasInitializedRef = useRef(false); // Ref to track if we've already initialized
	const [isExtracting, setIsExtracting] = useState(false);
	const [isLoadingBenchmark, setIsLoadingBenchmark] = useState(false);
	// New refs to store pending extraction data
	const pendingExtractionRef = useRef<{ file: File; sheet: string; database: string } | null>(null);
	const { loadMappingSettings, benchmarkId } = useCompanyStore();
	const { toast } = useToast();

	// Only load benchmark data once when component mounts
	useEffect(() => {
		// Only run once and avoid dependencies that might change
		if (benchmarkId && !hasInitializedRef.current && !loadingRef.current) {
			hasInitializedRef.current = true;
			loadSavedBenchmarkData();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [benchmarkId]); // Only depend on benchmarkId, explicitly ignore other dependencies

	// Function to queue up extraction for the useEffect to handle
	const queueExtraction = useCallback((file: File, sheet: string, database: string) => {
		pendingExtractionRef.current = { file, sheet, database };
	}, []);

	// Extract table data function (moved up before it's used in useEffect)
	const extractTableData = useCallback(async (file: File, sheet: string, database: string) => {
		// Early return if we're already extracting
		if (isExtracting) {
			// Queue this extraction for later
			queueExtraction(file, sheet, database);
			return;
		}

		setIsExtracting(true);
		updateState({ error: null });

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
			const headerGroups = extractDbTableFromSheet(
				excelData[sheet],
				dbConfig.skipRows,
				dbConfig.headerRows,
				dbConfig.copyRight,
			);

			// Store the extracted data in the state
			updateState({ headerGroups });
		} catch (err) {
			console.error('Error extracting table data:', err);
			updateState({
				error: 'Failed to extract table data from the Excel file. ' + (err instanceof Error ? err.message : ''),
			});
		} finally {
			setIsExtracting(false);
		}
	}, [isExtracting, queueExtraction, updateState]);

	// Effect to handle pending extraction when not currently extracting
	useEffect(() => {
		if (!isExtracting && pendingExtractionRef.current && !isLoadingBenchmark) {
			const { file, sheet, database } = pendingExtractionRef.current;
			pendingExtractionRef.current = null; // Clear the pending extraction
			extractTableData(file, sheet, database);
		}
	}, [isExtracting, isLoadingBenchmark, extractTableData]);

	// Function to load an Excel file and extract sheet names
	const loadExcelFile = useCallback(async (file: File): Promise<{ success: boolean; selectedSheet: string }> => {
		try {
			// Load the Excel file and get sheet names
			const excelData = await readExcelFileAsJson(file);
			const sheetNames = Object.keys(excelData);

			if (sheetNames.length === 0) {
				updateState({
					error: 'No sheets found in the Excel file.',
					sheets: [],
				});
				return { success: false, selectedSheet: '' };
			}

			// Prepare updates to make in a single batch
			const updates: Partial<UploadState> = { sheets: sheetNames };

			// Determine which sheet to use
			let selectedSheet = '';

			// First priority: Use existing sheet if it exists in the file
			if (state.sheet && sheetNames.includes(state.sheet)) {
				selectedSheet = state.sheet;
			}
			// Second priority: Find a sheet with "sheet" in the name
			else if (sheetNames.length > 1) {
				const sheetWithName = sheetNames.find((name) => name.toLowerCase().includes('sheet'));
				if (sheetWithName) {
					selectedSheet = sheetWithName;
				}
			}
			// Last resort: Use the first sheet
			if (!selectedSheet && sheetNames.length > 0) {
				selectedSheet = sheetNames[0];
			}

			// Add selected sheet to batch update if we found one
			if (selectedSheet) {
				updates.sheet = selectedSheet;
			}

			// Update state with all changes in one go
			updateState(updates);

			// Return true for successful load, but don't extract table data here
			return { success: true, selectedSheet };
		} catch (err) {
			console.error('Error reading Excel file:', err);
			updateState({
				error: 'Failed to read Excel file. Please make sure it is a valid Excel file.',
				sheets: [],
			});
			return { success: false, selectedSheet: '' };
		}
	}, [state.sheet, updateState]);

	// Function to load saved benchmark data (settings and file) in a single operation
	const loadSavedBenchmarkData = useCallback(async () => {
		// Use ref to prevent concurrent loading
		if (loadingRef.current || !benchmarkId) return;

		loadingRef.current = true;
		setIsLoadingBenchmark(true);

		try {
			const result = await loadMappingSettings(benchmarkId);
			let settingsLoaded = false;
			let fileLoaded = false;
			let selectedSheet = '';
			let selectedDatabase = '';
			let loadedFile: File | null = null;

			// Prepare a batch update object
			const stateUpdates: Partial<UploadState> = {};

			if (result.settings) {
				const settings = result.settings;
				settingsLoaded = true;

				// Add settings to batch update
				stateUpdates.database = settings.dbName || '';
				stateUpdates.sheet = settings.sourceSheet || '';
				stateUpdates.columnMappings = settings.generalMapping as any;

				selectedSheet = settings.sourceSheet || '';
				selectedDatabase = settings.dbName || '';
			}

			// If we have file data, process it
			if (result.fileData && result.fileData.data) {
				// Create a File object from the ArrayBuffer
				const file = new File([result.fileData.data], result.fileData.fileName, {
					type: result.fileData.contentType || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
				});

				// Add file to batch update
				stateUpdates.file = file;
				fileLoaded = true;
				loadedFile = file;

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

				// Load the Excel file and get sheet names first, but don't extract yet
				const loadResult = await loadExcelFile(file);

				// Apply all state updates in one go
				updateState(stateUpdates);

				// If excel load was successful and we have both sheet and database, queue extraction
				if (loadResult.success && selectedSheet && selectedDatabase && loadedFile) {
					queueExtraction(loadedFile, selectedSheet, selectedDatabase);
				}
			} else {
				// Apply state updates if we only had settings
				updateState(stateUpdates);
			}

			// Show appropriate toast messages
			if (fileLoaded && settingsLoaded) {
				toast({
					title: 'Benchmark data loaded',
					description: 'Previously saved settings and file have been loaded successfully.',
				});
			} else if (settingsLoaded) {
				toast({
					title: 'Mapping settings loaded',
					description: 'Previously saved mapping settings have been loaded.',
				});
			}

			// Show warning if there was an error but we still loaded some data
			if (result.error && (settingsLoaded || fileLoaded)) {
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
			loadingRef.current = false;
		}
	}, [benchmarkId, loadExcelFile, loadMappingSettings, queueExtraction, toast, updateState]);

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFile = e.target.files?.[0];
		updateState({ error: null });

		if (selectedFile) {
			updateState({ isLoading: true, file: selectedFile });

			try {
				const result = await loadExcelFile(selectedFile);

				if (!result.success && fileInputRef.current) {
					fileInputRef.current.value = '';
					updateState({ file: null });
				} else if (result.success && state.database && result.selectedSheet) {
					// If we have database selected, queue table data extraction
					queueExtraction(selectedFile, result.selectedSheet, state.database);
				}
			} finally {
				updateState({ isLoading: false });
			}
		}
	};

	const handleDatabaseChange = async (value: string) => {
		updateState({ database: value });

		// If file and sheet are already selected, queue the table data extraction
		if (state.file && state.sheet) {
			queueExtraction(state.file, state.sheet, value);
		}
	};

	const handleSheetChange = async (value: string) => {
		updateState({ sheet: value });

		// If file and database are already selected, queue the table data extraction
		if (state.file && state.database) {
			queueExtraction(state.file, value, state.database);
		}
	};

	const handleNext = async () => {
		if (state.file && state.sheet && state.database) {
			// If we don't have extracted data yet, extract it now
			if (!state.headerGroups) {
				// Extract directly, no need to queue since we're waiting for this operation
				await extractTableData(state.file, state.sheet, state.database);
			}

			// Only proceed if we have extracted data or no errors
			if (state.headerGroups || !state.error) {
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
