import { HelpSheet } from '@/components/layout/helpsheet/help-sheet';
import { BENCHMARK_STEPS } from '@/config/steps';
import { ReactNode, useMemo } from 'react';
import Link from 'next/link';
import { useCompanyStore } from '@/stores/use-company-store';
import { numberFormatOptions } from '@/lib/formatters';
import { Home, Download, PanelLeft } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';

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
	const progressByStep = useCompanyStore(state => state.progressByStep);

	// Determine which steps should be accessible based on progress
	const steps = useMemo(() => {
		return BENCHMARK_STEPS.map((step, index) => {
			const progress = progressByStep[step.id] || { percentage: 0, completedCount: 0, totalCount: 0 };

			// A step is accessible if it's the first step or if the previous step is at least 90% complete
			let isAccessible = index === 0; // First step is always accessible
			if (index > 0) {
				const prevStepId = BENCHMARK_STEPS[index - 1].id;
				const prevStepProgress = progressByStep[prevStepId]?.percentage || 0;
				isAccessible = prevStepProgress >= 0.9;
			}

			// If this step is the current step being viewed, consider it accessible
			const isActive = currentStep === step.number;
			if (isActive) {
				isAccessible = true;
			}

			return {
				...step,
				isActive,
				isCompleted: currentStep > step.number,
				isAccessible,
				progress,
			};
		});
	}, [currentStep, progressByStep]);

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

	// Function to create SVG circular progress
	const CircularProgress = ({
		percentage,
		size = 40,
		strokeWidth = 4,
		isActive = false,
		isCompleted = false,
		isDisabled = false
	}: {
		percentage: number;
		size?: number;
		strokeWidth?: number;
		isActive?: boolean;
		isCompleted?: boolean;
		isDisabled?: boolean;
	}) => {
		const radius = (size - strokeWidth) / 2;
		const circumference = 2 * Math.PI * radius;
		const progress = (percentage) * circumference;
		const dashoffset = circumference - progress;

		// Determine color based on state - make progress ring and inner circle consistent
		let progressColor = 'stroke-blue-400';
		if (isActive) progressColor = 'stroke-blue-600';
		else if (isDisabled) progressColor = 'stroke-gray-400';

		return (
			<svg className="absolute inset-0" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
				{/* Background circle */}
				<circle
					className="stroke-gray-200"
					cx={size / 2}
					cy={size / 2}
					r={radius}
					strokeWidth={strokeWidth}
					fill="none"
				/>
				{/* Progress circle */}
				<circle
					className={progressColor}
					cx={size / 2}
					cy={size / 2}
					r={radius}
					strokeWidth={strokeWidth}
					fill="none"
					strokeLinecap="round"
					strokeDasharray={circumference}
					strokeDashoffset={dashoffset}
					transform={`rotate(-90 ${size / 2} ${size / 2})`}
				/>
			</svg>
		);
	};

	return (
		<div className={`border-b ${className}`}>
			<div className="flex items-center gap-4 px-4 py-2">
				{/* Sidebar toggle button */}
				<SidebarTrigger className="-ml-1" />

				{/* Vertical divider between toggle and overview */}
				<div className="w-px h-10 bg-gray-200 shrink-0" />

				<Link
					href={`/benchmarks/${benchmarkId}`}
					className="flex items-center gap-3 group text-blue-600 hover:text-blue-800 text-sm whitespace-nowrap shrink-0"
				>
					<div className="relative w-10 h-10 flex items-center justify-center shrink-0">
						<div className="absolute inset-0 rounded-full bg-blue-100"></div>
						<Home className="w-5 h-5 z-10 text-blue-600" />
					</div>
					<span className="font-medium">Overview</span>
				</Link>

				{/* Vertical divider between overview and steps */}
				<div className="w-px h-10 bg-gray-200 shrink-0" />

				<div className="flex-1 min-w-0">
					<div className="overflow-x-auto no-scrollbar">
						<div className="flex items-center gap-4">
							{steps.map((step, index) => (
								<div key={step.id} className="flex items-center shrink-0">
									{index > 0 && <div className="w-6 h-px bg-gray-200 mx-2 shrink-0" />}

									{/* All steps are now clickable */}
									<Link
										href={`/benchmarks/${benchmarkId}/steps/${step.id}`}
										className={`flex items-center gap-3 group ${step.isAccessible ? '' : 'opacity-70'}`}
									>
										<div className="relative w-10 h-10 shrink-0">
											{/* Progress circle for all steps */}
											{step.progress.totalCount > 0 && (
												<CircularProgress
													percentage={step.progress.percentage}
													isActive={step.isActive}
													isCompleted={step.isCompleted}
													isDisabled={!step.isAccessible}
												/>
											)}

											{/* Number */}
											<div
												className={`absolute inset-0 m-1.5 flex items-center justify-center rounded-full text-base font-medium ${step.isActive
													? 'bg-blue-600 text-white'
													: step.isCompleted || step.isAccessible
														? 'bg-blue-400 text-white'
														: 'bg-gray-300 text-gray-600'
													}`}
											>
												{step.number}
											</div>
										</div>
										<div className="flex flex-col">
											<span className={`text-sm whitespace-nowrap font-medium ${step.isActive
												? 'text-blue-600'
												: step.isAccessible
													? 'text-gray-600 group-hover:text-gray-800'
													: 'text-gray-500'
												}`}>
												{step.label}
											</span>
										</div>
									</Link>
								</div>
							))}

							{/* Vertical divider between steps and export */}
							<div className="w-px h-10 bg-gray-200 ml-2 shrink-0" />

							{/* Export link */}
							<Link
								href={`/benchmarks/${benchmarkId}/exports`}
								className="flex items-center gap-3 group text-blue-600 hover:text-blue-800 text-sm whitespace-nowrap"
							>
								<div className="relative w-10 h-10 flex items-center justify-center shrink-0">
									<div className="absolute inset-0 rounded-full bg-blue-100"></div>
									<Download className="w-5 h-5 z-10 text-blue-600" />
								</div>
								<span className="font-medium">Exports</span>
							</Link>
						</div>
					</div>
				</div>

				<div className="flex items-center gap-4 shrink-0">
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
