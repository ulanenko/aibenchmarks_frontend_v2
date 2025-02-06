import {Button} from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
	DropdownMenuCheckboxItem,
	DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import {Settings2, RotateCcw} from 'lucide-react';
import {useSettingsStore} from '@/stores/use-settings-store';
import {ColumnConfig} from '@/lib/company/company-columns';

interface ColumnVisibilityProps {
	benchmarkId: number;
	columnConfigs: ColumnConfig[];
}

export function ColumnVisibility({benchmarkId, columnConfigs}: ColumnVisibilityProps) {
	const {getSettings, updateColumnVisibility, resetSettings} = useSettingsStore();
	const settings = getSettings(benchmarkId.toString());

	const handleColumnToggle = (columnKey: string, isVisible: boolean) => {
		const newVisibility = {...settings.visibility};

		// Only store visibility if it differs from default
		const config = columnConfigs.find((c) => c.column.data === columnKey);
		if (config) {
			const defaultVisible = config.show === 'yes';
			if (isVisible === defaultVisible) {
				delete newVisibility[columnKey];
			} else {
				newVisibility[columnKey] = isVisible;
			}
		}

		updateColumnVisibility(benchmarkId.toString(), columnKey, isVisible, newVisibility);
	};

	const handleReset = () => {
		// Only store visibility for columns that default to hidden
		const defaultVisibility = columnConfigs.reduce((acc, config) => {
			if (config.show === 'no') {
				acc[config.column.data] = false;
			}
			return acc;
		}, {} as Record<string, boolean>);

		resetSettings(benchmarkId.toString(), defaultVisibility);
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" size="sm" className="ml-auto">
					<Settings2 className="h-4 w-4 mr-2" />
					Columns
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-[200px]">
				<DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
				<DropdownMenuSeparator />
				{columnConfigs.map((config) => {
					const isVisible = settings.visibility[config.column.data] ?? config.show === 'yes';
					const isDisabled = config.show === 'always';

					return (
						<DropdownMenuCheckboxItem
							key={config.column.data}
							checked={isVisible}
							onCheckedChange={(checked) => handleColumnToggle(config.column.data, checked)}
							disabled={isDisabled}
						>
							{config.column.title}
						</DropdownMenuCheckboxItem>
					);
				})}
				<DropdownMenuSeparator />
				<DropdownMenuItem onClick={handleReset} className="text-muted-foreground">
					<RotateCcw className="h-4 w-4 mr-2" />
					Reset to Default
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
