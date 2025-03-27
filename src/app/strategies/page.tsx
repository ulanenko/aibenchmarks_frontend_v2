import {PageHeader} from '@/components/layout/page-header';
import {Metadata} from 'next';
import {StrategiesList} from './components/strategies-list';

export const metadata: Metadata = {
	title: 'Criteria & Strategies',
};

const helpContent = (
	<>
		<h3 className="text-lg font-semibold">About Criteria & Strategies</h3>
		<p className="text-sm text-muted-foreground">
			Define comprehensive evaluation frameworks and testing approaches for your AI models.
		</p>

		<h3 className="text-lg font-semibold mt-6">Key Features</h3>
		<ul className="text-sm text-muted-foreground list-disc pl-4 space-y-2">
			<li>
				<strong>Evaluation Criteria:</strong> Define metrics and standards
			</li>
			<li>
				<strong>Testing Strategies:</strong> Create systematic testing approaches
			</li>
			<li>
				<strong>Templates:</strong> Use and customize pre-built frameworks
			</li>
			<li>
				<strong>Version Control:</strong> Track changes in your evaluation methods
			</li>
		</ul>

		<h3 className="text-lg font-semibold mt-6">Best Practices</h3>
		<ul className="text-sm text-muted-foreground list-disc pl-4 space-y-2">
			<li>Start with clear, measurable criteria</li>
			<li>Consider both quantitative and qualitative metrics</li>
			<li>Document your testing methodology</li>
			<li>Review and update strategies regularly</li>
		</ul>
	</>
);

export default function Page() {
	return (
		<>
			<header className="border-b">
				<div className="container py-6">
					<PageHeader
						title="Criteria & Strategies"
						description="Define evaluation criteria and testing strategies for AI models."
						helpContent={helpContent}
					/>
				</div>
			</header>
			<main className="flex-1">
				<div className="container py-6">
					<StrategiesList />
				</div>
			</main>
		</>
	);
}
