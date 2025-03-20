import {HelpSheet} from '@/components/layout/helpsheet/help-sheet';
import {BENCHMARK_STEPS} from '@/config/steps';
import {ReactNode} from 'react';
import Link from 'next/link';

interface StepsHeaderProps {
	currentStep: number;
	className?: string;
	helpSheetTitle?: string;
	helpSheetContent?: ReactNode;
	benchmarkId: number;
}

export function StepsHeader({
	currentStep,
	className = '',
	helpSheetTitle = 'Benchmark Steps',
	helpSheetContent,
	benchmarkId,
}: StepsHeaderProps) {
	const steps = BENCHMARK_STEPS.map((step) => ({
		...step,
		isActive: currentStep === step.number,
		isCompleted: currentStep > step.number,
	}));

	// Generate step URL based on step ID
	const getStepUrl = (stepId: string) => {
		// Map step IDs to URL paths
		const stepPaths: Record<string, string> = {
			upload: 'companies',
			websearch: 'websearch',
			review: 'review',
			humanreview: 'humanreview',
		};

		const path = stepPaths[stepId] || stepId;
		return `/benchmarks/${benchmarkId}/steps/${path}`;
	};

	// Default help sheet content if none is provided
	const defaultHelpSheetContent = (
		<div className="prose prose-sm">
			<h3>Overview</h3>
			<p>The benchmark process consists of {steps.length} main steps:</p>
			<ol>
				{steps.map((step) => (
					<li key={step.id}>
						<strong>{step.label}</strong> - {step.description}
					</li>
				))}
			</ol>
			<p>
				You can track your progress through the steps using the progress bar above. Each step must be completed before
				moving to the next.
			</p>
		</div>
	);

	// Use provided content or default
	const content = helpSheetContent || defaultHelpSheetContent;

	return (
		<div className={`border-b ${className}`}>
			{/* Spacer to maintain height */}
			<div className="flex items-center gap-4 px-4 py-2">
				<Link
					href={`/benchmarks/${benchmarkId}`}
					className="text-blue-600 hover:text-blue-800 text-sm whitespace-nowrap shrink-0"
				>
					Overview
				</Link>
				<div className="flex-1 min-w-0">
					<div className="overflow-x-auto no-scrollbar">
						<div className="flex items-center gap-4">
							{steps.map((step, index) => (
								<div key={step.id} className="flex items-center shrink-0">
									{index > 0 && <div className="w-4 h-px bg-gray-200 mx-2 shrink-0" />}
									{/* Make completed steps clickable, current step and future steps not clickable */}
									{step.isCompleted ? (
										<Link href={getStepUrl(step.id)} className={`flex items-center gap-2 text-gray-600`}>
											<div
												className={`flex items-center justify-center w-5 h-5 rounded-full text-sm shrink-0 bg-gray-600 text-white`}
											>
												{step.number}
											</div>
											<span className="text-sm whitespace-nowrap">{step.label}</span>
										</Link>
									) : (
										<div className={`flex items-center gap-2 ${step.isActive ? 'text-blue-600' : 'text-gray-400'}`}>
											<div
												className={`flex items-center justify-center w-5 h-5 rounded-full text-sm shrink-0 ${
													step.isActive ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
												}`}
											>
												{step.number}
											</div>
											<span className="text-sm whitespace-nowrap">{step.label}</span>
										</div>
									)}
								</div>
							))}
						</div>
					</div>
				</div>
				<div className="flex items-center gap-4 shrink-0">
					<Link
						href={`/benchmarks/${benchmarkId}/exports`}
						className="text-blue-600 hover:text-blue-800 text-sm whitespace-nowrap"
					>
						Exports
					</Link>
					<div className="px-3 py-1 rounded bg-gray-50 text-sm text-gray-600 whitespace-nowrap">
						IQ range N/A: no completed companies in set
					</div>
					<HelpSheet title={helpSheetTitle}>{content}</HelpSheet>
					<button className="p-1.5 hover:bg-gray-50 rounded shrink-0">
						<span className="sr-only">Menu</span>
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
						</svg>
					</button>
				</div>
			</div>
		</div>
	);
}
