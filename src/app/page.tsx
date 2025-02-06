import {db} from '@/db';
import {test} from '@/db/schema';
import {TestList} from '@/components/features/tests/test-list';
import {Metadata} from 'next';

export const metadata: Metadata = {
	title: 'Dashboard',
};

const helpContent = (
	<>
		<h3 className="text-lg font-semibold">Welcome to AI Benchmarks</h3>
		<p className="text-sm text-muted-foreground">Your central hub for managing and monitoring AI model evaluations.</p>

		<h3 className="text-lg font-semibold mt-6">Dashboard Overview</h3>
		<ul className="text-sm text-muted-foreground list-disc pl-4 space-y-2">
			<li>View quick statistics about your benchmarks</li>
			<li>Monitor recent evaluation activities</li>
			<li>Access frequently used tools and reports</li>
			<li>Track progress across different models</li>
		</ul>

		<h3 className="text-lg font-semibold mt-6">Quick Navigation</h3>
		<p className="text-sm text-muted-foreground">Use the sidebar to access different sections:</p>
		<ul className="text-sm text-muted-foreground list-disc pl-4 space-y-2">
			<li>
				<strong>Benchmarks:</strong> Create and manage model evaluations
			</li>
			<li>
				<strong>Criteria & Strategies:</strong> Define testing approaches
			</li>
		</ul>
	</>
);

export default async function Page() {
	const testData = await db.select().from(test);

	return <TestList initialData={testData} />;
}
