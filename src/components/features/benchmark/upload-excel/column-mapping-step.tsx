'use client';

import * as React from 'react';
import {useEffect, useState} from 'react';
import {Button} from '@/components/ui/button';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup} from '@/components/ui/select';
import {CheckCircle2, Circle, Loader2, Wand2} from 'lucide-react';
import {StepProps, UploadState} from './types';
import {companyColumns, inputColumnDefinitions} from '@/lib/company/company-columns';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {LoadingButton} from '@/components/ui/loading-button';
import {mapColumnsWithAI} from '@/app/actions/ai-mapper-actions';
import {toast} from 'sonner';
import {SourceColumn, TargetColumn, ColumnMapping} from '@/app/actions/dto/mapper-types';
import {CreateCompanyDTO} from '@/lib/company/type';
import {Label} from '@/components/ui/label';
import {HeaderGroup} from '@/lib/excel/excel-parser';

// Local column mapping used in the UI
interface LocalColumnMapping {
	targetColumn: keyof CreateCompanyDTO;
	sourceColumn: string | null;
	required: boolean;
	title: string;
}

// Value used to represent "not mapped" in the UI
const NONE_VALUE = 'NONE';

const REQUIRED_FIELDS = ['name', 'country'];
const COLUMN_MAPPING_FIELDS = Object.keys(inputColumnDefinitions);

function createColumnMapping(
	columnMappings?: {[key: string]: string},
	headersAvailable?: string[],
): LocalColumnMapping[] {
	return COLUMN_MAPPING_FIELDS.map((key) => {
		const column = companyColumns[key as keyof typeof companyColumns];
		let sourceColumn = Object.entries(columnMappings || {}).find(([_, value]) => value === key)?.[0] || null;
		sourceColumn = headersAvailable?.includes(sourceColumn || '') ? sourceColumn : null;
		return {
			targetColumn: key as keyof CreateCompanyDTO,
			sourceColumn,
			required: REQUIRED_FIELDS.includes(key),
			title: column.title,
		};
	});
}

export function ColumnMappingStep({state, updateState, onNext, onBack}: StepProps) {
	// Use the sample data from the first row

	// Group similar columns by their base name (without year)
	const headerGroups = state.headerGroups || [];

	function updateStateMapping(state: UploadState, mappings: LocalColumnMapping[]) {
		const columnMappings = mappings.reduce((acc, mapping) => {
			if (mapping.sourceColumn) {
				acc[mapping.sourceColumn] = mapping.targetColumn as keyof CreateCompanyDTO;
			}
			return acc;
		}, {} as {[key: string]: keyof CreateCompanyDTO});
		console.log('columnMappings', columnMappings);
		updateState({columnMappings});
	}
	const headersAvailable = headerGroups.map((group) => group.cleanedKey);

	const [mappings, setMappings] = useState<LocalColumnMapping[]>(
		createColumnMapping(state.columnMappings, headersAvailable),
	);
	const [processes, setProcesses] = useState({
		aiMapping: false,
		loading: false,
	});
	const [error, setError] = useState<string | null>(null);

	// Add useEffect to update the parent state when mappings change
	useEffect(() => {
		if (mappings.length > 0) {
			// Only update parent state when mappings change, not during initial render
			updateStateMapping(state, mappings);
		}
	}, [mappings]);

	const handleMappingChange = (targetColumn: string, sourceColumn: string) => {
		// Convert the NONE_VALUE back to null
		const actualSourceColumn = sourceColumn === NONE_VALUE ? null : sourceColumn;
		const resetMapping = targetColumn === NONE_VALUE;
		// Update the mappings state
		setMappings((currentMappings) => {
			const updatedMapping = currentMappings.map((mapping) => {
				if (mapping.targetColumn === targetColumn) {
					return {...mapping, sourceColumn: actualSourceColumn};
				} else if (resetMapping && mapping.sourceColumn === sourceColumn) {
					return {...mapping, sourceColumn: null};
				}
				return mapping;
			});
			console.log('updatedMapping', updatedMapping);
			return updatedMapping;
		});
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

			// Prepare source and target columns - optimize to use HeaderGroup's methods
			const sourceColumns: SourceColumn[] = headerGroups.map((group) => {
				return {
					key: group.cleanedKey,
					title: group.cleanedKey,
					sample: group.getSampleValue(),
				};
			});

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

			// Update local state
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
									{headerGroups.map((group) => (
										<TableRow key={group.cleanedKey} className="hover:bg-transparent">
											<TableCell className="align-top p-3">
												<div className="font-medium">{group.cleanedKey}</div>
												<div className="text-sm text-muted-foreground truncate max-w-[300px]">
													{group.getSampleValue()}
												</div>
											</TableCell>
											<TableCell className="p-3">
												<div className="flex justify-end">
													<Select
														value={
															mappings.find((m) => m.sourceColumn === group.cleanedKey)?.targetColumn || NONE_VALUE
														}
														onValueChange={(value) => {
															// Set the new mapping
															handleMappingChange(value, group.cleanedKey);
														}}
													>
														<SelectTrigger className="w-full min-w-[200px]">
															<SelectValue placeholder="Not mapped" />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value={NONE_VALUE}>Not mapped</SelectItem>
															<SelectGroup>
																{mappings.map((mapping) => (
																	<SelectItem
																		key={mapping.targetColumn}
																		value={mapping.targetColumn}
																		disabled={mapping.sourceColumn !== null}
																	>
																		{mapping.title}
																		{mapping.required && <span className="text-destructive ml-1">*</span>}
																	</SelectItem>
																))}
															</SelectGroup>
														</SelectContent>
													</Select>
												</div>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>

						{/* Right column - target fields checklist */}
						<div className="w-[280px] border rounded-md p-4 h-min">
							<h3 className="font-medium text-sm mb-2">AI Mapper and checks</h3>
							<div className="flex flex-col gap-1 mb-4">
								{mappings.map((mapping) => (
									<div key={mapping.targetColumn} className="flex items-center gap-2 text-sm">
										{mapping.sourceColumn ? (
											<CheckCircle2 className="h-5 w-5 text-green-500" />
										) : (
											<Circle className="h-5 w-5 text-muted-foreground" />
										)}
										<span className="flex-1">
											{mapping.title} {mapping.required && <span className="text-red-500">*</span>}
										</span>
										<span className="text-muted-foreground">{mapping.required ? 'Required' : 'Optional'}</span>
									</div>
								))}
							</div>

							<LoadingButton
								variant="default"
								className="w-full gap-2"
								disabled={processes.aiMapping}
								isLoading={processes.aiMapping}
								onClick={handleAiMapping}
							>
								<Wand2 className="h-4 w-4" />
								Start AI mapper
							</LoadingButton>
						</div>
					</div>

					{/* Footer with navigation */}
					<div className="flex justify-between items-center mt-6">
						<Button variant="outline" onClick={onBack}>
							Back
						</Button>
						<LoadingButton
							variant="default"
							onClick={handleNext}
							isLoading={processes.loading}
							disabled={processes.loading}
						>
							Next
						</LoadingButton>
					</div>
				</>
			)}
		</div>
	);
}
