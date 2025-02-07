'use client';

import * as React from 'react';
import {Button} from '@/components/ui/button';
import {BenchmarkFormDialog} from './benchmark-form-dialog';
import {ConfirmDialog} from '@/components/layout/dialogues/confirm-dialog';
import {useBenchmarkListStore} from '@/stores/use-benchmark-store';
import {Pencil, Trash2} from 'lucide-react';
import {useRouter} from 'next/navigation';
import {Benchmark} from '@/lib/benchmark/benchmark';
import {routes} from '@/lib/routes';

interface BenchmarkItemProps {
	benchmark: Benchmark;
}

export function BenchmarkItem({benchmark}: BenchmarkItemProps) {
	const {deleteBenchmark} = useBenchmarkListStore();
	const router = useRouter();

	const handleClick = (e: React.MouseEvent) => {
		// Don't navigate if clicking on buttons or within a dialog
		if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('[role="dialog"]')) return;
		router.push(routes.benchmarks.companies(benchmark.id));
	};

	return (
		<div
			className="p-4 bg-muted rounded-md flex items-center justify-between group hover:bg-muted/80 cursor-pointer"
			onClick={handleClick}
		>
			<div className="space-y-1">
				<div className="flex items-center gap-2">
					<h3 className="font-medium">{benchmark.name}</h3>
					<span className="text-sm text-muted-foreground">({benchmark.year})</span>
				</div>
				{(benchmark.clientName || benchmark.lang || benchmark.userName) && (
					<p className="text-sm text-muted-foreground">
						{[benchmark.clientName, benchmark.lang, benchmark.userName].filter(Boolean).join(' • ')}
					</p>
				)}
			</div>
			<div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
				<BenchmarkFormDialog
					mode="edit"
					benchmark={benchmark}
					trigger={
						<Button variant="ghost" size="sm">
							<Pencil className="h-4 w-4 mr-2" />
							Edit
						</Button>
					}
				/>
				<ConfirmDialog
					title="Delete Benchmark"
					description="Are you sure you want to delete this benchmark? This action cannot be undone."
					trigger={
						<Button variant="ghost" size="sm">
							<Trash2 className="h-4 w-4 mr-2" />
							Delete
						</Button>
					}
					onConfirm={() => deleteBenchmark(benchmark.id)}
				/>
			</div>
		</div>
	);
}
