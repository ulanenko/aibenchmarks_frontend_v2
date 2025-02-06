'use client';

import * as React from 'react';
import {Button} from '@/components/ui/button';
import {useTestStore} from '@/stores/use-test-store';
import {TestFormDialog} from './test-form-dialog';
import {TestItem} from './test-item';
import type {InferSelectModel} from 'drizzle-orm';
import {test} from '@/db/schema';

type Test = InferSelectModel<typeof test>;

interface TestListProps {
	initialData: Test[];
}

export function TestList({initialData}: TestListProps) {
	const {tests, setTests} = useTestStore();

	React.useEffect(() => {
		setTests(initialData);
	}, [initialData, setTests]);

	return (
		<main className="flex-1">
			<div className="container py-6">
				<div className="space-y-8">
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						<div className="bg-card p-6 rounded-lg shadow-sm">
							<div className="flex items-center justify-between mb-2">
								<h2 className="text-lg font-semibold">Quick Stats</h2>
								<TestFormDialog mode="create" trigger={<Button>Create Test</Button>} />
							</div>
							<p className="text-3xl font-bold text-primary">{tests.length}</p>
							<p className="text-muted-foreground">Total Records</p>
						</div>
					</div>

					<div className="bg-card p-6 rounded-lg shadow-sm">
						<h2 className="text-xl font-semibold mb-4">Test Data</h2>
						<div className="space-y-2">
							{tests.map((test) => (
								<TestItem key={test.id} test={test} />
							))}
						</div>
					</div>
				</div>
			</div>
		</main>
	);
}
