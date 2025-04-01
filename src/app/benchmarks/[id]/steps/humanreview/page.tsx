'use client';

import {use, useEffect, useState} from 'react';
import {Button} from '@/components/ui/button';
import {toast} from 'sonner';
import {useCompanyStore} from '@/stores/use-company-store';
import {useShallow} from 'zustand/react/shallow';
import {companyColumns, comparabilityColumnDefinitionNew} from '@/lib/company/company-columns';
import Handsontable from 'handsontable';
import {Loader2, ThumbsUp, RefreshCw, Settings2, Save} from 'lucide-react';
import {BenchmarkStepLayout, getNextStepUrl} from '@/components/features/benchmark/benchmark-step-layout';
import {CompanyTable} from '@/components/features/benchmark/company-table';
import {ColumnVisibility} from '@/components/features/benchmark/column-visibility';
import {useRouter} from 'next/navigation';
import {Switch} from '@/components/ui/switch';
import {Label} from '@/components/ui/label';
import {ColumnConfig} from '@/lib/company/company-columns';
import { ComparabilityReviewModal } from '@/components/features/comparability-review-modal';

interface Props {
	params: Promise<{
		id: string;
	}>;
}

export default function BenchmarkHumanReviewPage({params}: Props) {
	const {id} = use(params);
	const benchmarkId = parseInt(id);
	const router = useRouter();
	const [hotInstance, setHotInstance] = useState<Handsontable | undefined>(undefined);
	const [isColumnsOpen, setIsColumnsOpen] = useState<boolean>(false);
	const [reviewModalOpen, setReviewModalOpen] = useState(false);
	const [selectedCompanyId, setSelectedCompanyId] = useState<number | undefined>(undefined);
	const [selectedFactor, setSelectedFactor] = useState<'products' | 'functions' | 'independence'>('products');

	const {
		loadCompanies, 
		saveChanges, 
		companies, 
		isLoading, 
		isSaving, 
		refreshSearchData, 
		isRefreshing,
		updateHumanReview
	} = useCompanyStore(
		useShallow((state) => ({
			loadCompanies: state.loadCompanies,
			saveChanges: state.saveChanges,
			companies: state.companies,
			isLoading: state.isLoading,
			isSaving: state.isSaving,
			refreshSearchData: state.refreshSearchData,
			isRefreshing: state.isRefreshing,
			updateHumanReview: state.updateHumanReview
		})),
	);

	// Load companies data
	useEffect(() => {
		loadCompanies(benchmarkId, {includeSearchData: true});
	}, [benchmarkId, loadCompanies]);

	// Define column configuration for this page
	const columnConfigs: ColumnConfig[] = [
		// Default columns that are always shown
		{column: companyColumns.selected, show: 'yes', editable:true},
		{column: companyColumns.expandToggle, show: 'yes', editable: true},
		{column: companyColumns.name, show: 'always', editable: false},
		{column: companyColumns.country, show: 'yes', editable: false},
		{column: companyColumns.url, show: 'yes', editable: false},
		
		// Human review specific columns
		{column: companyColumns.siteMatchStatus, show: 'always', editable: false},
		{column: companyColumns.humanReviewStatus, show: 'always', editable: false},
		{column: companyColumns.decision, show: 'always', editable: false},
		{column: comparabilityColumnDefinitionNew.cfProducts, show: 'yes', editable: true},
		{column: comparabilityColumnDefinitionNew.cfFunctions, show: 'yes', editable: true},
		{column: comparabilityColumnDefinitionNew.cfIndependence, show: 'yes', editable: true},
		
		// Optional metadata columns
		{column: companyColumns.acceptRejectStatus, show: 'no', editable: false},
	];

	const handleSave = async () => {
		if (isSaving) return;

		try {
			await saveChanges();
			toast.success('Human review decisions saved successfully');
		} catch (error) {
			console.error('Error details:', error);
			toast.error(error instanceof Error ? error.message : 'Error saving decisions');
		}
	};

	const handleNext = () => {
		const nextUrl = getNextStepUrl(4, benchmarkId);
		if (nextUrl) {
			router.push(nextUrl);
		} else {
			toast.info('This is the last step');
		}
	};

	const handleRefreshData = async () => {
		if (isRefreshing) return;
		await refreshSearchData();
	};

	// Event listener for updateHumanReview events
	useEffect(() => {
		const handleHumanReviewUpdate = (event: CustomEvent) => {
			const {companyId, factor, decision} = event.detail;
			// if (decision === null) {
				// Open the modal for review
				setSelectedCompanyId(companyId);
				setSelectedFactor(factor);
				setReviewModalOpen(true);
			// } else {
			// 	// Direct update from button click
			// 	updateHumanReview(companyId, factor, decision);
			// }
		};

		window.addEventListener('updateHumanReview', handleHumanReviewUpdate as EventListener);
		
		return () => {
			window.removeEventListener('updateHumanReview', handleHumanReviewUpdate as EventListener);
		};
	}, [updateHumanReview]);

	// Custom help content for the human review step
	const humanReviewHelpContent = (
		<div className="prose prose-sm">
			<h3>Human Review Step</h3>
			<p>This step allows you to review and modify AI decisions about company comparability:</p>
			<ul>
				<li>Double-click on a decision to toggle between Accept and Reject</li>
				<li>Companies are prioritized based on the AI decisions:</li>
				<ul>
					<li><strong>High priority:</strong> Companies accepted by AI</li>
					<li><strong>Medium priority:</strong> Companies rejected for one reason or marked for human review</li>
					<li><strong>Low priority:</strong> Companies rejected for multiple reasons</li>
				</ul>
				<li>When you make a decision, the company will be marked as "Reviewed"</li>
			</ul>
			<h4>Review workflow:</h4>
			<ol>
				<li>Start with high priority companies</li>
				<li>Review medium priority companies</li>
				<li>Finally, check low priority companies if necessary</li>
				<li>Click "Save Changes" when your review is complete</li>
			</ol>
		</div>
	);

	// Main content
	const mainContent = (
		<>
			<CompanyTable
				benchmarkId={benchmarkId}
				columnConfigs={columnConfigs}
				onHotInstanceReady={setHotInstance}
			/>
			<ComparabilityReviewModal
				open={reviewModalOpen}
				onOpenChange={setReviewModalOpen}
				companyId={selectedCompanyId}
				initialFactor={selectedFactor}
			/>
		</>
	);

	// Toolbar content
	const toolbarContent = (
		<div className="flex items-center justify-between w-full gap-3">
			<div className="flex items-center space-x-2">
				<Button
					variant="outline"
					onClick={handleRefreshData}
					disabled={isLoading || isRefreshing}
					size="icon"
					className="h-9 w-9 bg-primary text-primary-foreground hover:bg-primary/90"
				>
					<RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
				</Button>
			</div>
			<ColumnVisibility benchmarkId={benchmarkId} columnConfigs={columnConfigs} />
		</div>
	);

	// Footer actions
	const footerActions = (
		<>
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<Button
						onClick={handleSave}
						disabled={isLoading || isSaving}
						className="bg-primary hover:bg-primary/90"
						size="sm"
					>
						<Save className="mr-2 h-4 w-4" />
						Save Changes
					</Button>
				</div>
			</div>
			<Button onClick={handleNext} size="sm">
				Next Step →
			</Button>
		</>
	);

	return (
		<BenchmarkStepLayout
			benchmarkId={benchmarkId}
			stepNumber={4}
			pageTitle="Human Review"
			pageDescription="Review and modify AI decisions about company comparability."
			helpSheetTitle="Human Review Help"
			helpSheetContent={humanReviewHelpContent}
			companies={companies}
			isLoading={isLoading}
			categoryColumn={companyColumns.decisionStatus}
			hotInstance={hotInstance}
			toolbarContent={toolbarContent}
			mainContent={mainContent}
			footerActions={footerActions}
			onNext={handleNext}
		/>
	);
} 