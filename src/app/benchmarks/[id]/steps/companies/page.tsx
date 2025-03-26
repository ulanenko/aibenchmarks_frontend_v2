'use client';

import {use, useEffect, useState} from 'react';
import {Button} from '@/components/ui/button';
import {toast} from 'sonner';
import {useCompanyStore} from '@/stores/use-company-store';
import {useUpload} from '@/components/features/benchmark/upload-excel/hooks';
import {useValidation} from '@/components/features/website-validation/hooks';
import {CompanyTable} from '@/components/features/benchmark/company-table';
import {ColumnVisibility} from '@/components/features/benchmark/column-visibility';
import {useShallow} from 'zustand/react/shallow';
import {companyColumns} from '@/lib/company/company-columns';
import Handsontable from 'handsontable';
import {FileUpIcon, Loader2} from 'lucide-react';
import {BenchmarkStepLayout, getNextStepUrl} from '@/components/features/benchmark/benchmark-step-layout';
import {useRouter} from 'next/navigation';
import {ColumnConfig} from '@/lib/company/company-columns';

interface Props {
	params: Promise<{
		id: string;
	}>;
}

export default function BenchmarkStep1Page({params}: Props) {
	const {id} = use(params);
	const benchmarkId = parseInt(id);
	const router = useRouter();
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
	}, [benchmarkId, loadCompanies]);

	// Define column configuration for this page
	const columnConfigs: ColumnConfig[] = [
		// Default columns that are always shown
		{column: companyColumns.selected, show: 'yes', editable: true},
		{column: companyColumns.expandToggle, show: 'yes', editable: false},
		{column: companyColumns.inputStatus, show: 'yes', editable: false},
		{column: companyColumns.name, show: 'always', editable: true},
		{column: companyColumns.country, show: 'yes', editable: true},
		{column: companyColumns.url, show: 'yes', editable: true},
		{column: companyColumns.websiteValidation, show: 'yes', editable: false},
		
		// Additional input columns
		{column: companyColumns.streetAndNumber, show: 'yes', editable: true},
		{column: companyColumns.addressLine1, show: 'yes', editable: true},
		{column: companyColumns.consolidationCode, show: 'no', editable: true},
		{column: companyColumns.independenceIndicator, show: 'no', editable: true},
		{column: companyColumns.naceRev2, show: 'yes', editable: true},
		{column: companyColumns.fullOverview, show: 'yes', editable: true},
		{column: companyColumns.tradeDescriptionEnglish, show: 'yes', editable: true},
		{column: companyColumns.tradeDescriptionOriginal, show: 'no', editable: true},
		{column: companyColumns.mainActivity, show: 'yes', editable: true},
		{column: companyColumns.mainProductsAndServices, show: 'yes', editable: true},
	];

	const handleSave = async () => {
		if (isSaving) return;

		try {
			await saveChanges();
			toast.success('Companies data saved successfully');
		} catch (error) {
			console.error('Error details:', error);
			toast.error(error instanceof Error ? error.message : 'Error saving companies');
		}
	};

	const handleNext = () => {
		const nextUrl = getNextStepUrl(1, benchmarkId);
		if (nextUrl) {
			router.push(nextUrl);
		} else {
			toast.info('This is the last step');
		}
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

	// Main content
	const mainContent = (
		<CompanyTable benchmarkId={benchmarkId} columnConfigs={columnConfigs} onHotInstanceReady={setHotInstance} />
	);

	// Toolbar content
	const toolbarContent = <ColumnVisibility benchmarkId={benchmarkId} columnConfigs={columnConfigs} />;

	// Footer actions
	const footerActions = (
		<>
			<Button variant="outline" onClick={() => setIsUploadModalOpen(true)} size="sm" disabled={isUploading || isSaving}>
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
		</>
	);

	// Additional content
	const additionalContent = (
		<>
			<UploadModal />
			<ValidationDialogs />
		</>
	);

	return (
		<BenchmarkStepLayout
			benchmarkId={benchmarkId}
			stepNumber={1}
			pageTitle="Uploaded Companies"
			pageDescription="Add, manage and validate companies here."
			helpSheetTitle="Companies Step Help"
			helpSheetContent={companiesHelpContent}
			companies={companies}
			isLoading={isLoading}
			categoryColumn={companyColumns.inputStatus}
			hotInstance={hotInstance}
			toolbarContent={toolbarContent}
			mainContent={mainContent}
			footerActions={footerActions}
			additionalContent={additionalContent}
			onNext={handleNext}
		/>
	);
}
