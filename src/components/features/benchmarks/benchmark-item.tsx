'use client';

import * as React from 'react';
import {Button} from '@/components/ui/button';
import {BenchmarkFormDialog} from './benchmark-form-dialog';
import {ConfirmDialog} from '@/components/layout/dialogues/confirm-dialog';
import {useBenchmarkListStore} from '@/stores/use-benchmark-list-store';
import {Pencil, Trash2, Copy, LayoutGrid, ChevronDown} from 'lucide-react';
import {useRouter} from 'next/navigation';
import {Benchmark} from '@/lib/benchmark/benchmark';
import {routes} from '@/lib/routes';
import {format, isToday} from 'date-fns';
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from '@/components/ui/tooltip';
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from '@/components/ui/dropdown-menu';
import {Badge} from '@/components/ui/badge';
import {BenchmarkFields} from '@/lib/benchmark/schema-and-fields';

interface BenchmarkItemProps {
	benchmark: Benchmark;
}

export function BenchmarkItem({benchmark}: BenchmarkItemProps) {
	const {deleteBenchmark} = useBenchmarkListStore();
	const router = useRouter();
	const editBenchmarkRef = React.useRef<HTMLButtonElement>(null);
	const deleteBenchmarkRef = React.useRef<HTMLButtonElement>(null);

	const handleClick = (e: React.MouseEvent) => {
		// Don't navigate if clicking on buttons or within a dialog
		if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('[role="dialog"]')) return;
		router.push(routes.benchmarks.companies(benchmark.id));
	};

	// Format dates for display
	const formatDate = (date: Date | null) => {
		if (!date) return '';
		return format(new Date(date), 'dd/MM/yyyy');
	};

	// Check if benchmark was created today
	const isNewBenchmark = isToday(new Date(benchmark.createdAt));

	const handleDelete = async () => {
		await deleteBenchmark(benchmark.id);
	};

	// Stats to display with metadata from schema
	const statsToDisplay = [
		{
			key: 'updatedAt',
			field: BenchmarkFields.updatedAt,
			value: formatDate(benchmark.updatedAt || benchmark.createdAt),
			label: benchmark.updatedAt ? 'Last Edited' : 'Created',
		},
		{
			key: 'clientId',
			field: BenchmarkFields.clientId,
			value: benchmark.clientName || 'asgdasg',
			label: 'Client',
		},
		{
			key: 'year',
			field: BenchmarkFields.year,
			value: benchmark.year.toString(),
			label: 'Year',
		},
		{
			key: 'companies',
			field: {
				icon: LayoutGrid,
				label: 'Companies',
			},
			value: '351',
			label: 'Companies',
		},
	];

	return (
		<div
			className="px-4 pt-1 pb-3 bg-background rounded-md flex flex-col space-y-3 group hover:bg-muted/10 cursor-pointer border border-border"
			onClick={handleClick}
		>
			{/* Hidden trigger buttons for dialogs */}
			<div className="hidden">
				<BenchmarkFormDialog mode="edit" benchmark={benchmark} trigger={<button ref={editBenchmarkRef}>Edit</button>} />

				<ConfirmDialog
					title="Delete Benchmark"
					description="Are you sure you want to delete this benchmark? This action cannot be undone."
					trigger={<button ref={deleteBenchmarkRef}>Delete</button>}
					onConfirm={handleDelete}
				/>
			</div>

			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					{isNewBenchmark && (
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<div className="h-2 w-2 rounded-full bg-blue-500 mr-1" />
								</TooltipTrigger>
								<TooltipContent side="top">
									<p>Created today</p>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					)}
					<h3 className="text-lg font-medium text-foreground">{benchmark.name}</h3>
					<Badge variant="secondary" className="font-normal text-xs px-2 py-0.5">
						Owner
					</Badge>
				</div>

				<div className="flex items-center">
					<div className="flex">
						<Button
							variant="outline"
							size="sm"
							className="rounded-r-none border-r-0"
							onClick={(e) => {
								e.stopPropagation();
								router.push(routes.benchmarks.companies(benchmark.id));
							}}
						>
							Open
						</Button>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="outline" size="sm" className="rounded-l-none px-2">
									<ChevronDown className="h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuItem
									onClick={(e) => {
										e.stopPropagation();
										editBenchmarkRef.current?.click();
									}}
								>
									<Pencil className="h-4 w-4 mr-2" />
									Edit
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={(e) => {
										e.stopPropagation();
										deleteBenchmarkRef.current?.click();
									}}
								>
									<Trash2 className="h-4 w-4 mr-2" />
									Delete
								</DropdownMenuItem>
								<DropdownMenuItem onClick={(e) => e.stopPropagation()}>
									<Copy className="h-4 w-4 mr-2" />
									Duplicate
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>
			</div>

			{/* Stats Grid */}
			<div className="grid grid-cols-4 gap-3">
				{statsToDisplay.map((stat) => {
					const Icon = stat.field.icon;
					return (
						<div key={stat.key} className="flex items-center">
							{Icon && <Icon className="h-4 w-4 mr-2 text-blue-400" />}
							<div>
								<p className="text-xs text-muted-foreground">{stat.label}</p>
								<p className="text-sm font-medium">{stat.value}</p>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
