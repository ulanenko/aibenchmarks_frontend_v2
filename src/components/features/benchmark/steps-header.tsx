import {HelpSheet} from '@/components/layout/helpsheet/help-sheet';

interface Step {
	number: number;
	label: string;
	isActive: boolean;
	isCompleted: boolean;
}

interface StepsHeaderProps {
	currentStep: number;
	className?: string;
}

export function StepsHeader({currentStep, className = ''}: StepsHeaderProps) {
	const steps: Step[] = [
		{
			number: 1,
			label: 'Upload Data',
			isActive: currentStep === 1,
			isCompleted: currentStep > 1,
		},
		{
			number: 2,
			label: 'Web Search',
			isActive: currentStep === 2,
			isCompleted: currentStep > 2,
		},
		{
			number: 3,
			label: 'Accept/Reject',
			isActive: currentStep === 3,
			isCompleted: currentStep > 3,
		},
		{
			number: 4,
			label: 'Human Review',
			isActive: currentStep === 4,
			isCompleted: currentStep > 4,
		},
	];

	return (
		<div className={`border-b ${className}`}>
			{/* Spacer to maintain height */}
			<div className="flex items-center gap-4 px-4 py-2">
				<a href="#" className="text-blue-600 hover:text-blue-800 text-sm whitespace-nowrap shrink-0">
					Overview
				</a>
				<div className="flex-1 min-w-0">
					<div className="overflow-x-auto no-scrollbar">
						<div className="flex items-center gap-4">
							{steps.map((step, index) => (
								<div key={step.number} className="flex items-center shrink-0">
									{index > 0 && <div className="w-4 h-px bg-gray-200 mx-2 shrink-0" />}
									<div
										className={`flex items-center gap-2 ${
											step.isActive ? 'text-blue-600' : step.isCompleted ? 'text-gray-600' : 'text-gray-400'
										}`}
									>
										<div
											className={`flex items-center justify-center w-5 h-5 rounded-full text-sm shrink-0 ${
												step.isActive
													? 'bg-blue-600 text-white'
													: step.isCompleted
													? 'bg-gray-600 text-white'
													: 'bg-gray-100 text-gray-600'
											}`}
										>
											{step.number}
										</div>
										<span className="text-sm whitespace-nowrap">{step.label}</span>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
				<div className="flex items-center gap-4 shrink-0">
					<a href="#" className="text-blue-600 hover:text-blue-800 text-sm whitespace-nowrap">
						Exports
					</a>
					<div className="px-3 py-1 rounded bg-gray-50 text-sm text-gray-600 whitespace-nowrap">
						IQ range N/A: no completed companies in set
					</div>
					<HelpSheet title="Benchmark Steps">
						<div className="prose prose-sm">
							<h3>Overview</h3>
							<p>The benchmark process consists of 4 main steps:</p>
							<ol>
								<li>
									<strong>Upload Data</strong> - Upload your company data in Excel format. The system will validate and
									process your data.
								</li>
								<li>
									<strong>Web Search</strong> - The system will automatically search for additional company information
									from reliable web sources.
								</li>
								<li>
									<strong>Accept/Reject</strong> - Review the found data and accept or reject the matches for each
									company.
								</li>
								<li>
									<strong>Human Review</strong> - Perform a final review of the data and make any necessary manual
									adjustments.
								</li>
							</ol>
							<p>
								You can track your progress through the steps using the progress bar above. Each step must be completed
								before moving to the next.
							</p>
						</div>
					</HelpSheet>
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
