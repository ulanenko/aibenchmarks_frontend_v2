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

// Local column mapping used in the UI
interface LocalColumnMapping {
	targetColumn: string;
	sourceColumn: string | null;
	required: boolean;
	title: string;
}

// Use a constant for the "none" value to ensure consistency
const NONE_VALUE = '__none__';

const REQUIRED_FIELDS = ['name', 'country'];
const COLUMN_MAPPING_FIELDS = Object.keys(companyColumns).filter((key) => key !== 'inputStatus');

function createColumnMapping(): LocalColumnMapping[] {
	return COLUMN_MAPPING_FIELDS.map((key) => {
		const column = companyColumns[key as keyof typeof companyColumns];
		return {
			targetColumn: key,
			sourceColumn: null,
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
	const [mappings, setMappings] = useState<LocalColumnMapping[]>(createColumnMapping());
	const [processes, setProcesses] = useState({
		aiMapping: false,
		loading: false,
	});
	const [error, setError] = useState<string | null>(null);

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

		// Update the state with the mappings - convert to the expected format
		setProcesses({...processes, loading: true});

		// Convert mappings and update state - ensure sourceColumn is never null
		const columnMappings: ColumnMapping[] = mappings
			.filter((mapping) => mapping.sourceColumn !== null)
			.map((mapping) => ({
				targetColumn: mapping.targetColumn,
				sourceColumn: mapping.sourceColumn as string, // We've filtered out null values
			}));

		updateState({columnMappings});

		// Use setTimeout to allow the UI to update before proceeding
		setTimeout(() => {
			onNext();
			setProcesses({...processes, loading: false});
		}, 100);
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
		<div className="grid gap-6 py-4">
			{error && <div className="bg-destructive/15 text-destructive p-3 rounded-md text-sm">{error}</div>}

			{state.isLoading ? (
				<div className="flex justify-center items-center py-8">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
				</div>
			) : (
				<>
					<div className="text-sm text-muted-foreground">
						Map columns from your Excel file to the required fields in our system. Required fields are marked with an
						asterisk (*).
					</div>

					<div className="relative grid grid-cols-3 gap-6">
						<div className="col-span-2 relative">
							<div className="sticky top-0 bg-background z-10 shadow-sm pr-2">
								<Table>
									<TableHeader>
										<TableRow className="hover:bg-transparent">
											<TableHead className="w-1/2">Source Excel Column</TableHead>
											<TableHead className="w-1/2 text-right">Target Field</TableHead>
										</TableRow>
									</TableHeader>
								</Table>
							</div>
							<div className="max-h-[calc(70vh-220px)] overflow-y-auto pr-2">
								<Table>
									<TableBody>
										{sourceColumnHeaders.map((column) => (
											<TableRow key={column} className="hover:bg-transparent">
												<TableCell className="align-top p-3">
													<div className="font-medium">{column}</div>
													<div className="text-sm text-muted-foreground truncate max-w-[300px]">
														{sourceRowSample[column] ? String(sourceRowSample[column]) : 'No sample data'}
													</div>
												</TableCell>
												<TableCell className=" p-3">
													<div className="flex justify-end">
														<Select
															value={mappings.find((m) => m.sourceColumn === column)?.targetColumn || NONE_VALUE}
															onValueChange={(value) => {
																// First, clear any existing mapping for this source column
																setMappings((prevMappings) =>
																	prevMappings.map((mapping) =>
																		mapping.sourceColumn === column ? {...mapping, sourceColumn: null} : mapping,
																	),
																);

																// Then, if a target was selected, update that target's source
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
						</div>

						<div className="sticky top-0 self-start">
							<div className="border rounded-md p-4">
								<h3 className="text-lg font-medium mb-4 border-b pb-2">AI Mapper and checks</h3>

								<div className=" max-h-[calc(70vh-250px)] overflow-y-auto pr-1">
									{mappings.map((mapping, index) => {
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
									className="w-full mt-6"
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

					<div className="flex justify-between mt-4 sticky bottom-0 bg-background pt-4 pb-2 z-10 border-t-2 border-border/40">
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
