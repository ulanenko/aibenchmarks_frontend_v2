'use client';

import {use, useEffect, useMemo, useRef, useState} from 'react';
import {Card} from '@/components/ui/card';
import {toast} from 'sonner';
import {useCompanyStore} from '@/stores/use-company-store';
import {StepsHeader} from '@/components/features/benchmark/steps-header';
import {LoadingSpinner} from '@/components/ui/loading-spinner';
import {ActionsFooter} from '@/components/features/benchmark/actions-footer';
import {CompanyTable} from '@/components/features/benchmark/company-table';
import {ColumnVisibility} from '@/components/features/benchmark/column-visibility';
import {useShallow} from 'zustand/react/shallow';
import {companyColumns, defaultColumns, inputColumns} from '@/lib/company/company-columns';
import Handsontable from 'handsontable';

interface Props {
	params: Promise<{
		id: string;
	}>;
}

export default function BenchmarkStep1Page({params}: Props) {
	const {id} = use(params);
	console.log('BenchmarkStep1Page', id);
	const benchmarkId = parseInt(id);
	const [hotInstance, setHotInstance] = useState<Handsontable | undefined>(undefined);

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

	return (
		<div className="min-h-screen flex flex-col h-screen">
			{/* Steps Header */}
			<StepsHeader currentStep={1} className="flex-none" />

			{/* Main Content */}
			<div className="flex-1 p-4 overflow-auto">
				<Card className="h-full">
					<div className="h-full flex flex-col">
						<div className="p-6 flex items-center justify-between">
							<div>
								<h2 className="text-lg font-semibold">Uploaded Companies</h2>
								<p className="text-sm text-muted-foreground">Add, manage and validate companies here.</p>
							</div>
							<ColumnVisibility benchmarkId={benchmarkId} columnConfigs={uniqueColumnConfigs} />
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
			<ActionsFooter
				onSave={handleSave}
				onNext={handleNext}
				isSaving={isSaving}
				companies={companies}
				categoryColumn={companyColumns.inputStatus}
				className="border-t flex-none"
				hotInstance={hotInstance}
			/>
		</div>
	);
}
