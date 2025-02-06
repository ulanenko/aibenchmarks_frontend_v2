'use client';

import * as React from 'react';
import {Button} from '@/components/ui/button';
import {useBenchmarkListStore} from '@/stores/use-benchmark-store';
import {BenchmarkFormDialog} from './benchmark-form-dialog';
import {BenchmarkItem} from './benchmark-item';
import {LoadingSpinner} from '@/components/ui/loading-spinner';

export function BenchmarkList() {
	const {benchmarks, isLoading, loadBenchmarks} = useBenchmarkListStore();

	React.useEffect(() => {
		loadBenchmarks();
	}, [loadBenchmarks]);

	return (
		<main className="flex-1">
			<div className="container py-6">
				<div className="space-y-8">
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						<div className="bg-card p-6 rounded-lg shadow-sm">
							<div className="flex items-center justify-between mb-2">
								<h2 className="text-lg font-semibold">Quick Stats</h2>
								<BenchmarkFormDialog mode="create" trigger={<Button>Create Benchmark</Button>} />
							</div>
							<p className="text-3xl font-bold text-primary">{benchmarks.length}</p>
							<p className="text-muted-foreground">Total Benchmarks</p>
						</div>
					</div>

					<div className="bg-card p-6 rounded-lg shadow-sm">
						<h2 className="text-xl font-semibold mb-4">Benchmarks</h2>
						<div className="space-y-2">
							{isLoading ? (
								<LoadingSpinner message="Loading benchmarks..." />
							) : (
								benchmarks.map((benchmark) => <BenchmarkItem key={benchmark.id} benchmark={benchmark} />)
							)}
						</div>
					</div>
				</div>
			</div>
		</main>
	);
}
