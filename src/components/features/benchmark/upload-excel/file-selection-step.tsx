'use client';

import * as React from 'react';
import {useRef, useState} from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {FileUpIcon, Loader2} from 'lucide-react';
import {StepProps} from './types';
import {readExcelFileAsJson, supportedDatabases, extractDbTableFromSheet} from '@/lib/excel/excel-parser';
import {LoadingButton} from '@/components/ui/loading-button';

export function FileSelectionStep({state, updateState, onNext}: StepProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [isExtracting, setIsExtracting] = useState(false);

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFile = e.target.files?.[0];
		updateState({error: null});

		if (selectedFile) {
			updateState({isLoading: true, file: selectedFile});

			try {
				// Load the Excel file and get sheet names
				const excelData = await readExcelFileAsJson(selectedFile);
				const sheetNames = Object.keys(excelData);

				updateState({sheets: sheetNames});

				// Auto-select the first sheet if available
				if (sheetNames.length > 0) {
					updateState({sheet: sheetNames[0]});
				}
			} catch (err) {
				console.error('Error reading Excel file:', err);
				updateState({
					error: 'Failed to read Excel file. Please make sure it is a valid Excel file.',
					file: null,
					sheets: [],
				});
				if (fileInputRef.current) {
					fileInputRef.current.value = '';
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
		<div className="grid gap-6 py-4 px-2">
			{state.error && <div className="bg-destructive/15 text-destructive p-3 rounded-md text-sm">{state.error}</div>}

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
						disabled={state.isLoading || state.isProcessing}
					/>
					<LoadingButton
						variant="outline"
						onClick={() => fileInputRef.current?.click()}
						type="button"
						disabled={state.isProcessing}
						isLoading={state.isLoading}
						loadingText="Loading..."
						loadingIcon={<Loader2 className="h-4 w-4 mr-2 animate-spin" />}
					>
						<FileUpIcon className="h-4 w-4 mr-2" />
						Choose file
					</LoadingButton>
				</div>
				{state.file && <p className="text-sm text-muted-foreground">{state.file.name}</p>}
			</div>

			<div className="grid gap-2">
				<Label htmlFor="database">Select File Type:</Label>
				<Select
					value={state.database}
					onValueChange={handleDatabaseChange}
					disabled={state.isLoading || state.isProcessing}
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
				<Label htmlFor="sheet">Select Sheet:</Label>
				<Select
					value={state.sheet}
					onValueChange={handleSheetChange}
					disabled={!state.file || state.isLoading || state.isProcessing || state.sheets.length === 0}
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

			<div className="flex justify-end mt-4">
				<LoadingButton
					onClick={handleNext}
					disabled={!state.file || !state.sheet || !state.database || state.isLoading || state.isProcessing}
					isLoading={isExtracting}
					loadingText="Extracting..."
				>
					Next →
				</LoadingButton>
			</div>
		</div>
	);
}
