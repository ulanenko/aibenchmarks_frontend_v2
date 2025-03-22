'use client';

import {use, useEffect, useState} from 'react';
import {Button} from '@/components/ui/button';
import {toast} from 'sonner';
import {useCompanyStore} from '@/stores/use-company-store';
import {useShallow} from 'zustand/react/shallow';
import {companyColumns, defaultColumns, websearchColumns} from '@/lib/company/company-columns';
import Handsontable from 'handsontable';
import {Loader2, Search} from 'lucide-react';
import {BenchmarkStepLayout, getNextStepUrl} from '@/components/features/benchmark/benchmark-step-layout';
import {CompanyTable} from '@/components/features/benchmark/company-table';
import {ColumnVisibility} from '@/components/features/benchmark/column-visibility';
import {useRouter} from 'next/navigation';

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
	const toolbarContent = <ColumnVisibility benchmarkId={benchmarkId} columnConfigs={websearchColumnConfigs} />;

	// Footer actions
	const footerActions = (
		<>
			<Button variant="outline" onClick={handleStartSearch} size="sm" disabled={isSearching || isSaving}>
				{isSearching ? (
					<>
						<Loader2 className="h-4 w-4 mr-2 animate-spin" />
						Searching...
					</>
				) : (
					<>
						<Search className="h-4 w-4 mr-2" />
						Start Web Search
					</>
				)}
			</Button>
			<Button variant="outline" onClick={handleSave} disabled={isSaving || isSearching} size="sm">
				{isSaving ? 'Saving...' : 'Save Changes'}
			</Button>
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
