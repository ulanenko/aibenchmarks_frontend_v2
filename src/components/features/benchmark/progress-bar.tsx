import {useMemo} from 'react';

interface ProgressBarProps {
	total: number;
	valid: number;
	invalid: number;
	className?: string;
}

export function ProgressBar({total, valid, invalid}: ProgressBarProps) {
	const segments = useMemo(() => {
		if (total === 0) return [];
		const validPercent = (valid / total) * 100;
		const invalidPercent = (invalid / total) * 100;

		return [
			{
				type: 'reject' as const,
				width: invalidPercent,
				label: `Reject (data availability) (${invalid})`,
				color: 'bg-red-500',
			},
			{
				type: 'valid' as const,
				width: validPercent,
				label: `Valid (${valid})`,
				color: 'bg-blue-500',
			},
		];
	}, [total, valid, invalid]);

	if (total === 0) {
		return <div className="flex items-center gap-2 text-sm text-muted-foreground">No companies added yet</div>;
	}

	return (
		<div className="space-y-2 min-w-0">
			<div className="text-sm text-muted-foreground whitespace-nowrap">PROGRESS (TOTAL COMPANIES: {total})</div>
			<div className="flex items-center gap-2 flex-wrap">
				<div className="flex items-center gap-4 text-sm flex-wrap">
					{segments.map((segment) => (
						<div key={segment.type} className="flex items-center gap-1 whitespace-nowrap">
							<div className={`h-3 w-3 rounded-full ${segment.color}`} />
							<span>{segment.label}</span>
						</div>
					))}
				</div>
			</div>
			<div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden flex-shrink">
				<div className="flex h-full">
					{segments.map((segment) => (
						<div
							key={segment.type}
							className={`h-full ${segment.color} transition-all duration-300`}
							style={{width: `${segment.width}%`}}
						/>
					))}
				</div>
			</div>
		</div>
	);
}
