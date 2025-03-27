import React, {ReactNode, useEffect} from 'react';
import {Card} from '@/components/ui/card';
import {StepsHeader} from './steps-header';
import {ActionsFooter} from './actions-footer';
import {Company} from '@/lib/company/company';
import {CategoryColumn} from '@/lib/column-definition';
import Handsontable from 'handsontable';
import {LoadingSpinner} from '@/components/ui/loading-spinner';
import {BENCHMARK_STEPS} from '@/config/steps';
import {useRouter} from 'next/navigation';
import {Button} from '@/components/ui/button';
import {useBenchmarkStore} from '@/stores/use-benchmark-store2';

/**
 * Configuration for a benchmark step page
 */
export interface BenchmarkStepConfig {
	// Basic information
	benchmarkId: number;
	stepNumber: number;
	pageTitle: string;
	pageDescription: string;

	// Help content
	helpSheetTitle: string;
	helpSheetContent: ReactNode;

	// Data and state
	companies: Company[];
	isLoading: boolean;
	categoryColumn: CategoryColumn;
	hotInstance?: Handsontable;

	// Custom elements
	toolbarContent?: ReactNode;
	mainContent: ReactNode;
	footerActions: ReactNode;

	// Optional modal dialogs or other elements
	additionalContent?: ReactNode;

	// Required navigation handler
	onNext?: () => void;
}

/**
 * Get the URL for the next step
 */
export function getNextStepUrl(currentStepNumber: number, benchmarkId: number): string | null {
	// Find the current step index
	const currentStepIndex = BENCHMARK_STEPS.findIndex((step) => step.number === currentStepNumber);

	// If current step is found and not the last step
	if (currentStepIndex >= 0 && currentStepIndex < BENCHMARK_STEPS.length - 1) {
		const nextStep = BENCHMARK_STEPS[currentStepIndex + 1];

		// Map step IDs to URL paths
		const stepPaths: Record<string, string> = {
			upload: 'companies',
			websearch: 'websearch',
			review: 'review',
			humanreview: 'humanreview',
		};

		const nextPath = stepPaths[nextStep.id] || nextStep.id;
		return `/benchmarks/${benchmarkId}/steps/${nextPath}`;
	}

	return null;
}

/**
 * Layout component for benchmark step pages
 * Provides consistent structure while allowing for step-specific customization
 */
export function BenchmarkStepLayout({
	benchmarkId,
	stepNumber,
	pageTitle,
	pageDescription,
	helpSheetTitle,
	helpSheetContent,
	companies,
	isLoading: pageIsLoading,
	categoryColumn,
	hotInstance,
	toolbarContent,
	mainContent,
	footerActions,
	additionalContent,
	onNext,
}: BenchmarkStepConfig) {
	// Use the benchmark store to load and access benchmark data
	const {benchmark, isLoading: benchmarkIsLoading, loadBenchmark} = useBenchmarkStore();
	
	// Load benchmark data when the component mounts or benchmarkId changes
	useEffect(() => {
		if (benchmarkId) {
			loadBenchmark(benchmarkId);
		}
	}, [benchmarkId, loadBenchmark]);
	
	// Combine loading states from page and benchmark loading
	const isLoading = pageIsLoading || benchmarkIsLoading;

	return (
		<div className="min-h-screen flex flex-col h-screen">
			{/* Steps Header */}
			<StepsHeader
				currentStep={stepNumber}
				className="flex-none"
				helpSheetTitle={helpSheetTitle}
				helpSheetContent={helpSheetContent}
				benchmarkId={benchmarkId}
			/>

			{/* Main Content */}
			<div className="flex-1 p-4 overflow-auto">
				<Card className="h-full">
					<div className="h-full flex flex-col">
						<div className="p-6 flex items-center justify-between">
							<div>
								<h2 className="text-lg font-semibold">{pageTitle} {benchmark ? ` - ${benchmark.name}` : ''}</h2>
								<p className="text-sm text-muted-foreground">{pageDescription}</p>
								
							</div>
							{toolbarContent && <div className="flex items-center space-x-2">{toolbarContent}</div>}
						</div>
						<div className="flex-1 p-4 min-h-0">
							{isLoading ? <LoadingSpinner message={`Loading ${pageTitle.toLowerCase()}...`} /> : mainContent}
						</div>
					</div>
				</Card>
			</div>

			{/* Actions Footer */}
			<ActionsFooter companies={companies} categoryColumn={categoryColumn} hotInstance={hotInstance}>
				{footerActions}
			</ActionsFooter>

			{/* Additional content (modals, etc.) */}
			{additionalContent}
		</div>
	);
}
