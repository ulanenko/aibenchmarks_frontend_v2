'use client';

import * as React from 'react';
import {Button} from '@/components/ui/button';
import {useBenchmarkListStore} from '@/stores/use-benchmark-store';
import {BenchmarkFormDialog} from './benchmark-form-dialog';
import {BenchmarkItem} from './benchmark-item';
import {LoadingSpinner} from '@/components/ui/loading-spinner';
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from '@/components/ui/dropdown-menu';
import {ChevronDown, ArrowUpDown, Plus, Search, LucideIcon} from 'lucide-react';
import {Input} from '@/components/ui/input';
import {useRouter} from 'next/navigation';
import {routes} from '@/lib/routes';
import {BenchmarkDTO} from '@/lib/benchmark/type';
import {getSortableFields, SortFunction} from '@/lib/benchmark/schema-and-fields';

// Sorting options for the benchmarks
type SortOption = {
	key: string;
	label: string;
	icon: LucideIcon;
	sortFn: SortFunction;
};

export function BenchmarkList() {
	const {benchmarks, isLoading, loadBenchmarks} = useBenchmarkListStore();
	const [searchQuery, setSearchQuery] = React.useState('');
	const router = useRouter();

	// Get sort options from the schema and ensure all options have the required properties
	const sortOptions = React.useMemo(() => {
		const fields = getSortableFields();
		return fields.filter((field): field is SortOption => field.icon !== undefined && field.label !== undefined);
	}, []);

	// Default to "Last Edited" sort option
	const [sortOption, setSortOption] = React.useState<SortOption>(
		sortOptions.find((option) => option.key === 'updatedAt') || sortOptions[0],
	);

	React.useEffect(() => {
		loadBenchmarks();
	}, [loadBenchmarks]);

	// Filter benchmarks based on search query
	const filteredBenchmarks = React.useMemo(() => {
		if (!searchQuery.trim()) {
			return benchmarks;
		}

		const query = searchQuery.toLowerCase();
		return benchmarks.filter(
			(benchmark) =>
				benchmark.name.toLowerCase().includes(query) ||
				(benchmark.clientName && benchmark.clientName.toLowerCase().includes(query)) ||
				benchmark.year.toString().includes(query),
		);
	}, [benchmarks, searchQuery]);

	// Sort the benchmarks based on the current sort option
	const sortedBenchmarks = React.useMemo(() => {
		return [...filteredBenchmarks].sort(sortOption.sortFn);
	}, [filteredBenchmarks, sortOption.sortFn]);

	// Handle navigation to the new benchmark
	const handleBenchmarkCreated = (benchmark: BenchmarkDTO) => {
		// Navigate to the benchmark companies page
		router.push(routes.benchmarks.companies(benchmark.id));
	};

	return (
		<main className="flex-1">
			<div className="container py-6">
				<div className="space-y-6">
					{/* Header: Title and Actions Row */}
					<div className="flex items-center justify-between">
						<h1 className="text-2xl font-semibold">Your Benchmarks</h1>

						<div className="flex gap-4 items-center">
							{/* Search Input */}
							<div className="relative w-[350px]">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
								<Input
									placeholder="Search benchmarks, client or year..."
									className="pl-10"
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
								/>
							</div>

							{/* Sort Dropdown */}
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="outline" size="default" className="min-w-[180px] justify-between">
										<div className="flex items-center">
											<ArrowUpDown className="mr-2 h-4 w-4" />
											<span>Sort by: {sortOption.label}</span>
										</div>
										<ChevronDown className="h-4 w-4" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end" className="w-[180px]">
									{sortOptions.map((option) => {
										const Icon = option.icon;
										return (
											<DropdownMenuItem
												key={option.key}
												onClick={() => setSortOption(option)}
												className={`px-3 py-2 cursor-pointer ${sortOption.key === option.key ? 'bg-muted' : ''}`}
											>
												<Icon className="mr-2 h-4 w-4" />
												{option.label}
											</DropdownMenuItem>
										);
									})}
								</DropdownMenuContent>
							</DropdownMenu>

							{/* Add Benchmark Button */}
							<BenchmarkFormDialog
								mode="create"
								onComplete={handleBenchmarkCreated}
								trigger={
									<Button size="default" className="gap-2">
										<Plus className="h-4 w-4" />
										Add benchmark
									</Button>
								}
							/>
						</div>
					</div>

					{/* Benchmarks List */}
					<div className="bg-card py-6 rounded-lg shadow-sm">
						<div className="space-y-2">
							{isLoading ? (
								<LoadingSpinner message="Loading benchmarks..." />
							) : sortedBenchmarks.length > 0 ? (
								sortedBenchmarks.map((benchmark) => <BenchmarkItem key={benchmark.id} benchmark={benchmark} />)
							) : (
								<div className="text-center py-8 text-muted-foreground">
									{searchQuery ? 'No matching benchmarks found.' : 'No benchmarks yet. Create your first one!'}
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</main>
	);
}
