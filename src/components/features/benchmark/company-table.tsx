import {use, useEffect, useMemo, useRef, useState} from 'react';
import {HotTable, HotColumn} from '@handsontable/react';
import {registerAllModules} from 'handsontable/registry';
import 'handsontable/dist/handsontable.full.min.css';
import {ColumnConfig} from '@/lib/company/company-columns';
import {useCompanyStore} from '@/stores/use-company-store';
import {Company} from '@/lib/company';
import {CellChange, ChangeSource} from 'handsontable/common';
import Handsontable from 'handsontable';
import {useSettingsStore} from '@/stores/use-settings-store';
import {useShallow} from 'zustand/react/shallow';

// Register all Handsontable modules
registerAllModules();

interface CompanyTableProps {
	benchmarkId: number;
	columnConfigs: ColumnConfig[];
}

export function CompanyTable({benchmarkId, columnConfigs}: CompanyTableProps) {
	const hotRef = useRef<any>(null);
	const {updateCompanyProperties, hotCopyCompanies} = useCompanyStore(
		useShallow((state) => ({
			updateCompanyProperties: state.updateCompanyProperties,
			hotCopyCompanies: state.hotCopyCompanies,
		})),
	);
	const {getSettings, bulkUpdateSettings} = useSettingsStore();
	const settings = getSettings(benchmarkId.toString());
	const [stretchH, setStretchH] = useState<'all' | 'none'>('all');
	const columns = columnConfigs.map((config) => config.column);

	// Get all columns and sort them based on stored order
	const orderedColumns = useMemo(() => {
		return columns.sort((a, b) => {
			const orderA = settings.order[a.data] ?? Number.MAX_SAFE_INTEGER;
			const orderB = settings.order[b.data] ?? Number.MAX_SAFE_INTEGER;
			return orderA - orderB;
		});
	}, [settings.order, columns]);

	const handleBeforeChange = (changes: (CellChange | null)[], source: ChangeSource) => {
		console.log('changes', changes);
		if (!changes) return true;
		const hot = hotRef.current?.hotInstance as Handsontable;

		const newRows: Record<number, number> = {};
		let newRowKey = -1;
		const lastRowIndex = hot?.countRows() - 1;

		// Group changes by row for the store to the updates and added companies
		// updating the store triggers a re-render of the table
		const changesByRow = changes.reduce((acc, change) => {
			if (!change) return acc;
			const [row, prop, , value] = change;
			// we first check if the row is already in the newRows object, if not we get the physical row
			// this is done because the sapre row has phyiscalrow, but we cannot use this
			// as we need to add a new company in the store for this row
			let physicalRow = newRows[row] ?? hot?.toPhysicalRow(row);
			const isSpareRow = physicalRow === lastRowIndex && newRows[row] === undefined && hot.isEmptyRow(row);

			// first we create a negative temporary row key for the new row or spare ro
			// the store creates a new company with a negative id, so we need to make sure that the row key is negative
			if (typeof physicalRow !== 'number' || isSpareRow) {
				physicalRow = newRowKey;
				newRows[row] = newRowKey;
				newRowKey--;
			}

			if (!acc[physicalRow]) {
				acc[physicalRow] = {
					row: physicalRow,
					changes: {},
				};
			}
			acc[physicalRow].changes[prop.toString()] = value;
			return acc;
		}, {} as Record<number, {row: number; changes: Record<string, any>}>);

		// Convert to array of updates
		const updates = Object.values(changesByRow);

		// Update the store with the changes
		updateCompanyProperties(updates);
		return false;
	};

	const handleAfterColumnResize = (newSize: number, column: number, isDoubleClick: boolean) => {
		const hot = hotRef.current?.hotInstance as Handsontable;
		if (!hot || stretchH !== 'all') return;

		const headerCells = hot.container.querySelectorAll('thead th');
		let visualCol = 1;
		const settings = hot.getSettings();
		const hotColumns = Array.isArray(settings.columns) ? settings.columns : [];
		const hiddenColumnsPlugin = hot.getPlugin('hiddenColumns');
		const hiddenCols = hiddenColumnsPlugin.isEnabled() ? hiddenColumnsPlugin.getHiddenColumns() : [];
		const newWidths: Record<string, number> = {};

		for (let i = 0; i < hotColumns.length; i++) {
			if (hiddenCols.includes(i)) continue;
			if (hot.getColWidth(i) > 0) {
				const headerCell = headerCells[visualCol] as HTMLElement;
				const width = column == i ? newSize : headerCell.offsetWidth;
				if (hotColumns[i]) {
					hotColumns[i].width = width;
					// Store the width for the column
					const columnData = orderedColumns[i]?.data;
					if (columnData) {
						newWidths[columnData] = width;
					}
				}
				visualCol++;
			}
		}
		setStretchH('none');
		// hot.updateSettings({
		// 	stretchH: 'none',
		// 	columns: hotColumns,
		// });

		// Persist the new widths
		bulkUpdateSettings(benchmarkId.toString(), {
			widths: newWidths,
		});
	};

	const handleAfterColumnMove = (movedColumns: number[], finalIndex: number) => {
		const hot = hotRef.current?.hotInstance as Handsontable;
		if (!hot) return;

		// Create new order mapping
		const newOrder: Record<string, number> = {};
		const columns = hot.getSettings().columns;

		if (Array.isArray(columns)) {
			columns.forEach((column: any, index: number) => {
				const visualIndex = hot.toVisualColumn(index);
				if (column.data) {
					newOrder[column.data] = visualIndex;
				}
			});

			// Update settings with new order and ensure stretchH is disabled
			setStretchH('none');
			// hot.updateSettings({
			// 	stretchH: 'none',
			// 	columns: columns,
			// });

			// Persist the new order
			bulkUpdateSettings(benchmarkId.toString(), {
				order: newOrder,
			});
		}
	};

	// Get all columns and their indices that should be hidden
	const hiddenColumnIndices = useMemo(() => {
		return columns
			.map((column, index) => ({
				index,
				visible:
					settings.visibility[column.data] ??
					columnConfigs.find((config) => config.column.data === column.data)?.show !== 'no',
			}))
			.filter((col) => !col.visible)
			.map((col) => col.index);
	}, [settings.visibility, columnConfigs]);

	return (
		<div className="h-full">
			<HotTable
				ref={hotRef}
				data={hotCopyCompanies}
				licenseKey="non-commercial-and-evaluation"
				contextMenu={true}
				minSpareRows={1}
				stretchH={stretchH}
				height="100%"
				width="100%"
				rowHeaders={true}
				filters={true}
				manualColumnResize={true}
				manualColumnMove={true}
				dropdownMenu={true}
				columnSorting={true}
				beforeChange={handleBeforeChange}
				afterColumnResize={handleAfterColumnResize}
				afterColumnMove={handleAfterColumnMove}
				className="htMiddle"
				hiddenColumns={{
					columns: hiddenColumnIndices,
					indicators: true,
					copyPasteEnabled: true,
				}}
			>
				{orderedColumns.map((column, index) => (
					<HotColumn key={index} {...column.toHotColumn()} width={settings.widths[column.data] ?? column.width} />
				))}
			</HotTable>
		</div>
	);
}
