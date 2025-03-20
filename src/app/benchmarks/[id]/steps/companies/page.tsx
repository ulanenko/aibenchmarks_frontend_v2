'use client';

import {use, useEffect, useMemo, useRef, useState} from 'react';
import {Card} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {toast} from 'sonner';
import {useCompanyStore} from '@/stores/use-company-store';
import {StepsHeader} from '@/components/features/benchmark/steps-header';
import {LoadingSpinner} from '@/components/ui/loading-spinner';
import {ActionsFooter} from '@/components/features/benchmark/actions-footer';
import {useUpload} from '@/components/features/benchmark/upload-excel/hooks';
import {useValidation} from '@/components/features/website-validation/hooks';
import {CompanyTable} from '@/components/features/benchmark/company-table';
import {ColumnVisibility} from '@/components/features/benchmark/column-visibility';
import {useShallow} from 'zustand/react/shallow';
import {companyColumns, defaultColumns, inputColumns} from '@/lib/company/company-columns';
import Handsontable from 'handsontable';
import {FileUpIcon, Loader2} from 'lucide-react';

interface Props {
	params: Promise<{
		id: string;
	}>;
}

export default function BenchmarkStep1Page({params}: Props) {
	const {id} = use(params);
	const benchmarkId = parseInt(id);
	const [hotInstance, setHotInstance] = useState<Handsontable | undefined>(undefined);

	// Get validation and upload utilities
	const {isValidating, canValidate, openValidationModal, ValidationDialogs} = useValidation();
	const {isUploading, isUploadModalOpen, setIsUploadModalOpen, UploadModal} = useUpload();

	const {loadCompanies, saveChanges, companies, isLoading, isSaving} = useCompanyStore(
		useShallow((state) => ({
			loadCompanies: state.loadCompanies,
			saveChanges: state.saveChanges,
			companies: state.companies,
			isLoading: state.isLoading,
			isSaving: state.isSaving,
		})),
	);

	// Load companies data
	useEffect(() => {
		loadCompanies(benchmarkId);
	}, [benchmarkId]);

	// Deduplicate column configs before passing them
	const uniqueColumnConfigs = [...defaultColumns, ...inputColumns];

	const handleSave = async () => {
		if (isSaving) return;

		try {
			await saveChanges();
		} catch (error) {
			console.error('Error details:', error);
			toast.error(error instanceof Error ? error.message : 'Error saving companies');
		}
	};

	const handleNext = () => {
		// Implement navigation to next step
		toast.info('Navigation to next step not implemented');
	};

	const handleValidationClick = () => {
		openValidationModal();
	};

	// Custom help content for the companies step
	const companiesHelpContent = (
		<div className="prose prose-sm">
			<h3>Companies Step</h3>
			<p>
				This is the first step in the benchmark process where you can upload and manage companies to be included in the
				benchmark.
			</p>
			<h4>Key Actions:</h4>
			<ul>
				<li>
					<strong>Upload Excel</strong> - Import companies from an Excel file
				</li>
				<li>
					<strong>Validate Companies</strong> - Verify company websites and data
				</li>
				<li>
					<strong>Save Changes</strong> - Save any edits made to the companies
				</li>
			</ul>
			<p>
				You can track the validation status of companies using the progress bar at the bottom of the screen. All
				companies must be validated before proceeding to the next step.
			</p>
		</div>
	);

	return (
		<div className="min-h-screen flex flex-col h-screen">
			{/* Steps Header */}
			<StepsHeader
				currentStep={1}
				className="flex-none"
				helpSheetTitle="Companies Step Help"
				helpSheetContent={companiesHelpContent}
			/>

			{/* Main Content */}
			<div className="flex-1 p-4 overflow-auto">
				<Card className="h-full">
					<div className="h-full flex flex-col">
						<div className="p-6 flex items-center justify-between">
							<div>
								<h2 className="text-lg font-semibold">Uploaded Companies</h2>
								<p className="text-sm text-muted-foreground">Add, manage and validate companies here.</p>
							</div>
							<div className="flex items-center space-x-2">
								<ColumnVisibility benchmarkId={benchmarkId} columnConfigs={uniqueColumnConfigs} />
							</div>
						</div>
						<div className="flex-1 p-4 min-h-0">
							{isLoading ? (
								<LoadingSpinner message="Loading companies..." />
							) : (
								<CompanyTable
									benchmarkId={benchmarkId}
									columnConfigs={uniqueColumnConfigs}
									onHotInstanceReady={setHotInstance}
								/>
							)}
						</div>
					</div>
				</Card>
			</div>

			{/* Actions Footer */}
			<ActionsFooter companies={companies} categoryColumn={companyColumns.inputStatus} hotInstance={hotInstance}>
				<Button
					variant="outline"
					onClick={() => setIsUploadModalOpen(true)}
					size="sm"
					disabled={isUploading || isSaving}
				>
					{isUploading ? (
						<>
							<Loader2 className="h-4 w-4 mr-2 animate-spin" />
							Uploading...
						</>
					) : (
						<>
							<FileUpIcon className="h-4 w-4 mr-2" />
							Upload Excel
						</>
					)}
				</Button>
				<Button
					variant="outline"
					onClick={handleValidationClick}
					size="sm"
					disabled={isUploading || isSaving || isValidating || !canValidate}
				>
					{isValidating ? (
						<>
							<Loader2 className="h-4 w-4 mr-2 animate-spin" />
							Validating...
						</>
					) : (
						<>Validate Companies</>
					)}
				</Button>
				<Button variant="outline" onClick={handleSave} disabled={isSaving || isUploading} size="sm">
					{isSaving ? 'Saving...' : 'Save Changes'}
				</Button>
				<Button onClick={handleNext} size="sm" disabled={isUploading}>
					Next Step →
				</Button>
			</ActionsFooter>

			{/* Render the modals */}
			<UploadModal />
			<ValidationDialogs />
		</div>
	);
}
