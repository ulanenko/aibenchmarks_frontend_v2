import {Card, CardContent} from '@/components/ui/card';

interface StatisticCardProps {
	title: string;
	value: number | string;
	description?: string;
	className?: string;
	valueClassName?: string;
}

export function StatisticCard({title, value, description, className = '', valueClassName = ''}: StatisticCardProps) {
	return (
		<Card className={className}>
			<CardContent className="pt-6">
				<div className="text-sm font-medium text-muted-foreground">{title}</div>
				<div className={`mt-2 text-3xl font-bold ${valueClassName}`}>{value}</div>
				{description && <div className="mt-2 text-xs text-muted-foreground">{description}</div>}
			</CardContent>
		</Card>
	);
}
