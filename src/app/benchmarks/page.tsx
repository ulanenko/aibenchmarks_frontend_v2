import {BenchmarkList} from '@/components/features/benchmarks/benchmark-list';
import {PageHeader} from '@/components/layout/page-header';
import {Metadata} from 'next';

export const metadata: Metadata = {
	title: 'Benchmarks',
};

const helpContent = (
	<>
		<h3 className="text-lg font-semibold">About Benchmarks</h3>
		<p className="text-sm text-muted-foreground">Create and manage benchmarks to evaluate AI model performance.</p>

		<h3 className="text-lg font-semibold mt-6">Key Features</h3>
		<ul className="text-sm text-muted-foreground list-disc pl-4 space-y-2">
			<li>
				<strong>Create Benchmarks:</strong> Set up new evaluation frameworks
			</li>
			<li>
				<strong>Track Performance:</strong> Monitor model metrics
			</li>
			<li>
				<strong>Compare Results:</strong> Analyze different models
			</li>
			<li>
				<strong>Export Data:</strong> Generate detailed reports
			</li>
		</ul>

		<h3 className="text-lg font-semibold mt-6">Best Practices</h3>
		<ul className="text-sm text-muted-foreground list-disc pl-4 space-y-2">
			<li>Define clear evaluation criteria</li>
			<li>Use consistent testing environments</li>
			<li>Document test conditions</li>
			<li>Regular performance reviews</li>
		</ul>
	</>
);

export default function Page() {
	return (
		<>
			<header className="border-b">
				<div className="container py-6">
					<PageHeader
						title="Benchmarks"
						description="Create and manage benchmarks for AI model evaluation."
						helpContent={helpContent}
					/>
				</div>
			</header>
			<main className="flex-1">
				<div className="container py-6">
					<BenchmarkList />
				</div>
			</main>
		</>
	);
}
