'use client';

import {use, useEffect, useState} from 'react';
import {Button} from '@/components/ui/button';
import {toast} from 'sonner';
import {useCompanyStore} from '@/stores/use-company-store';
import {useShallow} from 'zustand/react/shallow';
import {companyColumns} from '@/lib/company/company-columns';
import Handsontable from 'handsontable';
import {Loader2, ThumbsUp, RefreshCw, Settings2} from 'lucide-react';
import {BenchmarkStepLayout, getNextStepUrl} from '@/components/features/benchmark/benchmark-step-layout';
import {CompanyTable} from '@/components/features/benchmark/company-table';
import {ColumnVisibility} from '@/components/features/benchmark/column-visibility';
import {AcceptRejectModal} from '@/components/features/accept-reject-modal';
import {useRouter} from 'next/navigation';
import {Switch} from '@/components/ui/switch';
import {Label} from '@/components/ui/label';
import {ColumnConfig} from '@/lib/company/company-columns';
import {BenchmarkStrategyButton} from '@/components/features/benchmark/benchmark-strategy-button';

interface Props {
	params: Promise<{
		id: string;
	}>;
}

export default function BenchmarkAcceptRejectPage({params}: Props) {
	const {id} = use(params);
	const benchmarkId = parseInt(id);
	const router = useRouter();
	const [hotInstance, setHotInstance] = useState<Handsontable | undefined>(undefined);
	const [isColumnsOpen, setIsColumnsOpen] = useState<boolean>(false);
	const [analysisModalOpen, setAnalysisModalOpen] = useState(false);
	const [selectedCompanyIds, setSelectedCompanyIds] = useState<number[]>([]);

	const {
		loadCompanies, 
		saveChanges, 
		companies, 
		isLoading, 
		isSaving, 
		refreshSearchData, 
		isRefreshing,
		autoRefreshEnabled,
		startAutoRefresh,
		stopAutoRefresh
	} = useCompanyStore(
		useShallow((state) => ({
			loadCompanies: state.loadCompanies,
			saveChanges: state.saveChanges,
			companies: state.companies,
			isLoading: state.isLoading,
			isSaving: state.isSaving,
			refreshSearchData: state.refreshSearchData,
			isRefreshing: state.isRefreshing,
			autoRefreshEnabled: state.autoRefreshEnabled,
			startAutoRefresh: state.startAutoRefresh,
			stopAutoRefresh: state.stopAutoRefresh
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
		
 		
		// Accept-reject specific columns
		{column: companyColumns.acceptRejectStatus, show: 'yes', editable: false},
		{column: companyColumns.analysisBusinessDescription, show: 'yes', editable: false},
		{column: companyColumns.analysisProductServiceDescription, show: 'yes', editable: false},
		{column: companyColumns.analysisFunctionalProfileDescription, show: 'yes', editable: false},
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
		const nextUrl = getNextStepUrl(3, benchmarkId);
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

	const handleToggleAutoRefresh = (checked: boolean) => {
		if (checked) {
			startAutoRefresh();
			toast.info('Auto-refresh enabled - checking every 30 seconds');
		} else {
			stopAutoRefresh();
			toast.info('Auto-refresh disabled');
		}
	};

	// Custom help content for the accept-reject step
	const acceptRejectHelpContent = (
		<div className="prose prose-sm">
			<h3>Comparability Analysis Step</h3>
			<p>This step analyzes companies for their comparability based on:</p>
			<ul>
				<li>Product/service profiles</li>
				<li>Functional profiles</li>
			</ul>
			<h4>How it works:</h4>
			<ol>
				<li>Click "Start Analysis" to begin the comparability analysis</li>
				<li>Enter your ideal product/service and functional profile descriptions</li>
				<li>Choose to analyze all companies or only selected ones</li>
				<li>The system will analyze the comparability of each company</li>
				<li>Review the results and proceed to the next step</li>
			</ol>
			<p>
				<strong>Note:</strong> Companies must have completed the web search step before they can be analyzed for comparability.
			</p>
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
			<AcceptRejectModal 
                open={analysisModalOpen} 
                onOpenChange={setAnalysisModalOpen} 
                selectedCompanyIds={selectedCompanyIds} 
            />
		</>
	);

	// Toolbar content
	const toolbarContent = (
		<div className="flex items-center justify-between w-full gap-3">
				<div className="flex items-center space-x-2">
					<Label htmlFor="auto-refresh" className="text-xs">Auto-updates</Label>
					<Switch
						id="auto-refresh"
						checked={autoRefreshEnabled}
						onCheckedChange={handleToggleAutoRefresh}
						disabled={isLoading}
					/>
				</div>
				<Button
					variant="outline"
					onClick={handleRefreshData}
					disabled={isLoading || isRefreshing}
					size="icon"
					className="h-9 w-9 bg-primary text-primary-foreground hover:bg-primary/90"
				>
					<RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
				</Button>
				<ColumnVisibility benchmarkId={benchmarkId} columnConfigs={columnConfigs} />
		</div>
	);

	// Footer actions
	const footerActions = (
		<>
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<BenchmarkStrategyButton />
					<Button
						onClick={() => setAnalysisModalOpen(true)}
						disabled={isLoading || isRefreshing}
						className="bg-primary hover:bg-primary/90"
						size="sm"
					>
						<ThumbsUp className="mr-2 h-4 w-4" />
						Start Analysis
					</Button>
				</div>
			</div>
			<Button onClick={handleNext} size="sm">
				Next Step →
			</Button>
		</>
	);

	// Event listener for category onClick
	useEffect(() => {
		const handleOpenModal = (event: CustomEvent) => {
			setAnalysisModalOpen(true);
			
			// If a company was provided in the event, select it
			if (event.detail?.company?.id) {
				setSelectedCompanyIds([event.detail.company.id]);
			}
		};

		window.addEventListener('openAcceptRejectModal', handleOpenModal as EventListener);
		
		return () => {
			window.removeEventListener('openAcceptRejectModal', handleOpenModal as EventListener);
		};
	}, []);

	return (
		<BenchmarkStepLayout
			benchmarkId={benchmarkId}
			stepNumber={3}
			pageTitle="Comparability Analysis"
			pageDescription="Analyze company comparability based on product/service and functional profiles."
			helpSheetTitle="Comparability Analysis Help"
			helpSheetContent={acceptRejectHelpContent}
			companies={companies}
			isLoading={isLoading}
			categoryColumn={companyColumns.acceptRejectStatus}
			hotInstance={hotInstance}
			toolbarContent={toolbarContent}
			mainContent={mainContent}
			footerActions={footerActions}
			onNext={handleNext}
		/>
	);
} 