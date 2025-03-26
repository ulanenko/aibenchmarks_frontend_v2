import {use, useEffect, useMemo, useRef, useState} from 'react';
import {HotTable, HotColumn} from '@handsontable/react';
import {registerAllModules} from 'handsontable/registry';
import 'handsontable/dist/handsontable.full.min.css';
import {ColumnConfig} from '@/lib/company/company-columns';
import {useCompanyStore} from '@/stores/use-company-store';
import {Company, UpdateState} from '@/lib/company';
import {CellChange, ChangeSource, ColumnDataGetterSetterFunction} from 'handsontable/common';
import Handsontable from 'handsontable';
import {BenchmarkSettings, useSettingsStore} from '@/stores/use-settings-store';
import {useShallow} from 'zustand/react/shallow';
import {UpdateCompanyDTO} from '@/lib/company/type';
import {setValueForPath} from '@/lib/object-utils';
import { isEmpty } from '@/lib/utils';

// Register all Handsontable modules
registerAllModules();

interface CompanyTableProps {
	benchmarkId: number;
	columnConfigs: ColumnConfig[];
	onHotInstanceReady?: (instance: Handsontable) => void;
}

export function CompanyTable({benchmarkId, columnConfigs, onHotInstanceReady}: CompanyTableProps) {
	const hotRef = useRef<any>(null);
	const {updateCompanies, hotCopyCompanies} = useCompanyStore(
		useShallow((state) => ({
			updateCompanies: state.updateCompanies,
			hotCopyCompanies: state.hotCopyCompanies,
		})),
	);
	const {getSettings, bulkUpdateSettings} = useSettingsStore();
	const settings: BenchmarkSettings = getSettings(benchmarkId.toString());
	const [stretchH, setStretchH] = useState<'all' | 'none'>('all');
	const columns = columnConfigs.map((config) => config.column);

	// Initialize column order based on stored settings
	const initiallyOrderedColumns = useMemo(() => {
		// Create a new array to avoid mutating the original
		return [...columns]
			.sort((a, b) => {
				const orderA = settings.order[a.data] ?? Number.MAX_SAFE_INTEGER;
				const orderB = settings.order[b.data] ?? Number.MAX_SAFE_INTEGER;
				return orderA - orderB;
			})
			.map((column) => {
				if (settings.widths[column.data]) {
					column.width = settings.widths[column.data];
				}
				return column;
			});
	}, []);

	// Share the Handsontable instance with the parent component
	useEffect(() => {
		if (hotRef.current?.hotInstance && onHotInstanceReady) {
			onHotInstanceReady(hotRef.current.hotInstance);
		}
	}, [hotRef.current?.hotInstance, onHotInstanceReady]);

	const handleBeforeChange = (changes: (CellChange | null)[], source: ChangeSource) => {
		console.log('changes', changes);
		if (!changes) return true;
		const hot = hotRef.current?.hotInstance as Handsontable;

		const newRows: Record<number, number> = {};
		let newRowIndex = -1;
		const spareRowCount = hot.getSettings().minSpareRows ?? 0;
		const lastRowIndex = hot?.countRows() - spareRowCount;

		// Group changes by row for the store to the updates and added companies
		const updatesByRow: Record<number, UpdateState> = {};
		const newCompanies: Record<number, UpdateState> = {};

		function updatePropInDto(
			dto: UpdateState,
			prop: string | number | ColumnDataGetterSetterFunction,
			value: any,
		) {
			const propPath = prop.toString();
			if(propPath.includes('inputValues.') || propPath.includes('frontendState.')){
				setValueForPath(dto, propPath, value);
			}
		}

		changes.forEach((change) => {
			if (!change) return;
			const [row, prop, , value] = change;

			// Get the physical row index
			// let physicalRow = newRows[row] ??
			const physicalRow = hot?.toPhysicalRow(row);
			const isNewRow = isEmpty(hotCopyCompanies[physicalRow]?.id);

			// Handle new rows (spare row or manually added row)
			if (isNewRow) {
				let idForNewCompany = newRows[physicalRow];
				if (!idForNewCompany) {
					idForNewCompany = newRowIndex;
					newRows[physicalRow] = newRowIndex;
					newCompanies[idForNewCompany] = {id: idForNewCompany} as UpdateState;
					newRowIndex--;
				}

				// Get the property path and set the value
				updatePropInDto(newCompanies[idForNewCompany], prop, value);
			} else {
				
				// Handle existing rows
				if (!updatesByRow[physicalRow]) {
					updatesByRow[physicalRow] = {
						id: hotCopyCompanies[physicalRow]?.id,
					} as UpdateState;
				}
				updatePropInDto(updatesByRow[physicalRow], prop, value);
			}
		});

		// Add new companies and update existing ones
		updateCompanies(Object.values(updatesByRow), Object.values(newCompanies));
		return false;
	};

	const handleBeforePaste = (data: any, source: string) => {
		console.log('beforePaste', data, source);
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
					const columnData = initiallyOrderedColumns[i]?.data;
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

			// Persist the new order without affecting the Handsontable instance
			bulkUpdateSettings(benchmarkId.toString(), {
				order: newOrder,
			});
		}
	};

	// Get all columns and their indices that should be hidden
	const hiddenColumnIndices = useMemo(() => {
		const hot = hotRef.current?.hotInstance as Handsontable;
		return initiallyOrderedColumns
			.map((column, index) => ({
				index,
				visible:
					settings.visibility[column.data] ??
					columnConfigs.find((config) => config.column.data === column.data)?.show !== 'no',
			}))
			.filter((col) => !col.visible)
			.map((col) => hot?.toVisualColumn(col.index) ?? col.index);
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
				beforePaste={handleBeforePaste}
				beforeChange={handleBeforeChange}
				afterColumnResize={handleAfterColumnResize}
				afterColumnMove={handleAfterColumnMove}
				afterGetRowHeader={(row, TH) => {
					TH.className = 'htMiddle';
				}}
				className="htMiddle"
				hiddenColumns={{
					columns: hiddenColumnIndices,
					indicators: true,
					copyPasteEnabled: true,
				}}
			>
				{initiallyOrderedColumns.map((column, index) => (
					<HotColumn key={index} {...column.toHotColumn()} />
				))}
			</HotTable>
		</div>
	);
}
