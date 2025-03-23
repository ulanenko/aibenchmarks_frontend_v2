'use client';

import {use, useEffect, useState} from 'react';
import {Button} from '@/components/ui/button';
import {toast} from 'sonner';
import {useCompanyStore} from '@/stores/use-company-store';
import {useShallow} from 'zustand/react/shallow';
import {companyColumns, defaultColumns, websearchColumns} from '@/lib/company/company-columns';
import Handsontable from 'handsontable';
import {Loader2, Search, RefreshCw, Settings2} from 'lucide-react';
import {BenchmarkStepLayout, getNextStepUrl} from '@/components/features/benchmark/benchmark-step-layout';
import {CompanyTable} from '@/components/features/benchmark/company-table';
import {ColumnVisibility} from '@/components/features/benchmark/column-visibility';
import {useRouter} from 'next/navigation';
import {Switch} from '@/components/ui/switch';
import {Label} from '@/components/ui/label';

interface Props {
	params: Promise<{
		id: string;
	}>;
}

export default function BenchmarkWebSearchPage({params}: Props) {
	const {id} = use(params);
	const benchmarkId = parseInt(id);
	const router = useRouter();
	const [hotInstance, setHotInstance] = useState<Handsontable | undefined>(undefined);
	const [isSearching, setIsSearching] = useState<boolean>(false);
	const [isColumnsOpen, setIsColumnsOpen] = useState<boolean>(false);

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

	// Columns specific to the websearch step
	const websearchColumnConfigs = [...defaultColumns, ...websearchColumns];

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
		const nextUrl = getNextStepUrl(2, benchmarkId);
		if (nextUrl) {
			router.push(nextUrl);
		} else {
			toast.info('This is the last step');
		}
	};

	const handleStartSearch = async () => {
		setIsSearching(true);
		try {
			// Here you would implement the actual web search logic
			await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulating search process
			toast.success('Web search completed for all companies');
		} catch (error) {
			toast.error('Failed to complete web search');
			console.error(error);
		} finally {
			setIsSearching(false);
		}
	};

	const handleRefreshSearchData = async () => {
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

	// Custom help content for the websearch step
	const websearchHelpContent = (
		<div className="prose prose-sm">
			<h3>Web Search Step</h3>
			<p>This step automatically searches the web for additional information about your companies, including:</p>
			<ul>
				<li>Company websites</li>
				<li>Social media profiles</li>
				<li>Business directories</li>
				<li>News articles</li>
			</ul>
			<h4>How it works:</h4>
			<ol>
				<li>Click "Start Web Search" to begin the automated search process</li>
				<li>The system will search for each company in your list</li>
				<li>Review the search results and make any necessary adjustments</li>
				<li>Save your changes and proceed to the next step</li>
			</ol>
			<p>
				<strong>Note:</strong> Web search results are based on available online data and may require verification.
			</p>
		</div>
	);

	// Main content
	const mainContent = (
		<CompanyTable
			benchmarkId={benchmarkId}
			columnConfigs={websearchColumnConfigs}
			onHotInstanceReady={setHotInstance}
		/>
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
					onClick={handleRefreshSearchData}
					disabled={isLoading || isRefreshing}
					size="icon"
					className="h-9 w-9 bg-primary text-primary-foreground hover:bg-primary/90"
				>
					<RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
				</Button>
				<ColumnVisibility benchmarkId={benchmarkId} columnConfigs={websearchColumnConfigs} />
		</div>
	);

	// Footer actions
	const footerActions = (
		<>
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<Button
						onClick={handleStartSearch}
						disabled={isLoading || isRefreshing}
						className="bg-primary hover:bg-primary/90"
						size="sm"
					>
						<Search className="mr-2 h-4 w-4" />
						Start Search
					</Button>
				</div>
			</div>
			<Button onClick={handleNext} size="sm" disabled={isSearching}>
				Next Step →
			</Button>
		</>
	);

	return (
		<BenchmarkStepLayout
			benchmarkId={benchmarkId}
			stepNumber={2}
			pageTitle="Web Search"
			pageDescription="Automatically search and fetch information about your companies."
			helpSheetTitle="Web Search Help"
			helpSheetContent={websearchHelpContent}
			companies={companies}
			isLoading={isLoading}
			categoryColumn={companyColumns.websearchStatus}
			hotInstance={hotInstance}
			toolbarContent={toolbarContent}
			mainContent={mainContent}
			footerActions={footerActions}
			onNext={handleNext}
		/>
	);
}
