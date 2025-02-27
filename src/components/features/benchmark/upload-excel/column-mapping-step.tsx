'use client';

import * as React from 'react';
import {useEffect, useMemo, useState} from 'react';
import {Button} from '@/components/ui/button';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {CheckCircle2, Circle, Loader2, Wand2} from 'lucide-react';
import {StepProps} from './types';
import {companyColumns} from '@/lib/company/company-columns';
import {supportedDatabases, DatabaseConfig} from '@/lib/excel/excel-parser';
import {Label} from '@/components/ui/label';
import {TableBody, TableCell, Table, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {LoadingButton} from '@/components/ui/loading-button';
import {mapColumnsWithAI} from '@/app/actions/ai-mapper-actions';
import {toast} from 'sonner';
import {SourceColumn, TargetColumn, ColumnMapping} from '@/app/actions/dto/mapper-types';
import {CreateCompanyDTO} from '@/lib/company/type';
// Local column mapping used in the UI
interface LocalColumnMapping {
	targetColumn: keyof CreateCompanyDTO;
	sourceColumn: string | null;
	required: boolean;
	title: string;
}

// Use a constant for the "none" value to ensure consistency
const NONE_VALUE = '__none__';

const REQUIRED_FIELDS = ['name', 'country'];
const COLUMN_MAPPING_FIELDS = Object.keys(companyColumns).filter((key) => key !== 'inputStatus');

function createColumnMapping(columnMappings?: {[key: string]: string}): LocalColumnMapping[] {
	return COLUMN_MAPPING_FIELDS.map((key) => {
		const column = companyColumns[key as keyof typeof companyColumns];
		const sourceColumn = Object.entries(columnMappings || {}).find(([_, value]) => value === key)?.[0] || null;
		return {
			targetColumn: key as keyof CreateCompanyDTO,
			sourceColumn,
			required: REQUIRED_FIELDS.includes(key),
			title: column.title,
		};
	});
}

export function ColumnMappingStep({state, updateState, onNext, onBack}: StepProps) {
	// const [availableColumns, setAvailableColumns] = useState<string[]>(state.extractedData?.headers || []);
	const sourceRowSample = state.extractedData?.jsonData?.[0] || {};
	const sourceColumnHeaders = state.extractedData?.headers || [];
	// const [sampleData, setSampleData] = useState<Record<string, any>>(state.extractedData?.jsonData?.[0] || {});
	const [mappings, setMappings] = useState<LocalColumnMapping[]>(createColumnMapping(state.columnMappings));
	const [processes, setProcesses] = useState({
		aiMapping: false,
		loading: false,
	});
	const [error, setError] = useState<string | null>(null);

	useMemo(() => {
		const simpleMapping = mappings.reduce((acc, mapping) => {
			if (mapping.sourceColumn) {
				acc[mapping.sourceColumn] = mapping.targetColumn;
			}
			return acc;
		}, {} as {[key: string]: keyof CreateCompanyDTO});
		updateState({columnMappings: simpleMapping});
	}, [mappings]);

	const handleMappingChange = (targetColumn: string, sourceColumn: string) => {
		// Convert the NONE_VALUE back to null
		const actualValue = sourceColumn === NONE_VALUE ? null : sourceColumn;

		setMappings((prevMappings) =>
			prevMappings.map((mapping) =>
				mapping.targetColumn === targetColumn ? {...mapping, sourceColumn: actualValue} : mapping,
			),
		);
	};

	const handleNext = () => {
		// Check if all required mappings are set
		const missingRequiredMappings = mappings.filter((mapping) => mapping.required && !mapping.sourceColumn);

		if (missingRequiredMappings.length > 0) {
			setError(`Please map all required fields: ${missingRequiredMappings.map((m) => m.title).join(', ')}`);
			return;
		}
		onNext();
	};

	const handleAiMapping = async () => {
		try {
			setProcesses({...processes, aiMapping: true});
			setError(null);

			// Prepare source and target columns
			const sourceColumns: SourceColumn[] = sourceColumnHeaders.map((column) => ({
				key: column,
				title: column,
				sample: sourceRowSample[column],
			}));

			const targetColumns: TargetColumn[] = mappings.map((mapping) => ({
				key: mapping.targetColumn,
				title: mapping.title,
				required: mapping.required,
			}));

			// Call the server action to get AI mappings
			const result = await mapColumnsWithAI(sourceColumns, targetColumns);

			if (!result?.success || !result?.mappings) {
				toast.error('AI mapping failed. Please try mapping columns manually.');
				return;
			}

			// Apply the AI mappings to our local state
			const updatedMappings = mappings.map((mapping) => {
				const sourceColumn = result.mappings?.[mapping.targetColumn] || null;
				return sourceColumn ? {...mapping, sourceColumn} : mapping;
			});

			setMappings(updatedMappings);
			toast.success('AI mapping completed successfully!');
		} catch (error) {
			console.error('Error during AI mapping:', error);
			toast.error('Error during AI mapping. Please try mapping columns manually.');
		} finally {
			setProcesses({...processes, aiMapping: false});
		}
	};

	return (
		<div className="flex flex-col min-h-0 h-full">
			{error && <div className="bg-destructive/15 text-destructive p-3 rounded-md text-sm mb-4">{error}</div>}

			{state.isLoading ? (
				<div className="flex justify-center items-center flex-1">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
				</div>
			) : (
				<>
					<div className="text-sm text-muted-foreground mb-4">
						Map columns from your Excel file to the required fields in our system. Required fields are marked with an
						asterisk (*).
					</div>

					{/* Main content area */}
					<div className="flex gap-6 flex-1 min-h-0">
						{/* Left column - mapping table */}
						<div className="flex-1 min-h-0 border rounded-md overflow-y-auto">
							<Table className="min-h-0">
								<TableHeader>
									<TableRow className="sticky top-0 bg-background z-10 border-b">
										<TableHead>Source Excel Column</TableHead>
										<TableHead className="text-right">Target Field</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{sourceColumnHeaders.map((column) => (
										<TableRow key={column} className="hover:bg-transparent">
											<TableCell className="align-top p-3">
												<div className="font-medium">{column}</div>
												<div className="text-sm text-muted-foreground truncate max-w-[300px]">
													{sourceRowSample[column] ? String(sourceRowSample[column]) : 'No sample data'}
												</div>
											</TableCell>
											<TableCell className="p-3">
												<div className="flex justify-end">
													<Select
														value={mappings.find((m) => m.sourceColumn === column)?.targetColumn || NONE_VALUE}
														onValueChange={(value) => {
															setMappings((prevMappings) =>
																prevMappings.map((mapping) =>
																	mapping.sourceColumn === column ? {...mapping, sourceColumn: null} : mapping,
																),
															);

															if (value !== NONE_VALUE) {
																handleMappingChange(value, column);
															}
														}}
													>
														<SelectTrigger className="w-full min-w-[200px]">
															<SelectValue placeholder="Not mapped" />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value={NONE_VALUE}>Not mapped</SelectItem>
															{mappings.map((mapping) => (
																<SelectItem
																	key={mapping.targetColumn}
																	value={mapping.targetColumn}
																	disabled={!!mapping.sourceColumn && mapping.sourceColumn !== column}
																>
																	{mapping.title}
																	{mapping.required && <span className="text-destructive ml-1">*</span>}
																</SelectItem>
															))}
														</SelectContent>
													</Select>
												</div>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>

						{/* Right column - AI Mapper */}
						<div className="w-80 shrink-0">
							<div className="border rounded-md p-4  flex flex-col">
								<h3 className="text-lg font-medium mb-4 border-b pb-2">AI Mapper and checks</h3>

								<div className="flex-1">
									{mappings.map((mapping) => {
										const isMapped = !!mapping.sourceColumn;
										return (
											<div
												key={mapping.targetColumn}
												className="flex items-center space-x-2 py-1 border-b border-border/40"
											>
												{isMapped ? (
													<CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
												) : (
													<Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
												)}
												<Label className="text-sm font-normal flex-grow">{mapping.title}</Label>
												<span className="text-xs text-muted-foreground/70">
													{mapping.required ? 'Required' : 'Optional'}
												</span>
											</div>
										);
									})}
								</div>

								<LoadingButton
									className="w-full mt-4"
									variant="default"
									size="sm"
									onClick={handleAiMapping}
									disabled={sourceColumnHeaders.length === 0}
									isLoading={processes.aiMapping}
									loadingText="AI Mapping..."
									loadingIcon={<Loader2 className="h-4 w-4 mr-2 animate-spin" />}
								>
									<Wand2 className="h-4 w-4 mr-2" />
									Start AI mapper
								</LoadingButton>
							</div>
						</div>
					</div>

					{/* Bottom navigation */}
					<div className="flex justify-between pt-4 mt-4 border-t">
						<LoadingButton variant="outline" onClick={onBack} disabled={processes.loading}>
							← Back
						</LoadingButton>
						<LoadingButton onClick={handleNext} isLoading={processes.loading} loadingText="Processing...">
							Next →
						</LoadingButton>
					</div>
				</>
			)}
		</div>
	);
}
