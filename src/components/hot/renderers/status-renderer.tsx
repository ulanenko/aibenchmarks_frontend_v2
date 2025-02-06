import React, {useState} from 'react';
import {createRoot, Root} from 'react-dom/client';
import Handsontable from 'handsontable';
import {Badge} from '@/components/ui/badge';
import {getValueForPath, setValueForPath} from '@/lib/object-utils';
import {StepType} from '@/types/stepType';
import {Dialog} from '@/components/ui/dialog';
import {CategoryDefinition} from '@/lib/category-definition';
import {getObjectsByCategory, getUniqueValuesForPath} from '@/lib/company';
// A wrapper component that renders a Badge which opens a dialogue on click.

export const StatusRenderer = (
	instance: Handsontable.Core,
	td: HTMLTableCellElement,
	row: number,
	col: number,
	prop: string | number,
	value: any,
	cellProperties: Handsontable.CellProperties,
) => {
	// Get the correct row data when filtering is active
	const physicalRow = instance.toPhysicalRow(row);
	const rowData = instance.getSourceDataAtRow(physicalRow);

	if (!rowData) {
		td.innerHTML = '';
		return td;
	}

	const {statusPath, categories} = cellProperties;

	const {status, description} = (getValueForPath(rowData, statusPath) as StepType | null) ?? {};

	// Center the content in the cell

	// Reuse the existing React root, if any, to avoid multiple mounts.
	let root: Root;
	if ((td as any)._reactRoot) {
		root = (td as any)._reactRoot;
	} else {
		root = createRoot(td);
		(td as any)._reactRoot = root;
	}
	// td.classList.add('htCenter', 'htMiddle');
	td.style.display = 'flex';
	td.style.alignItems = 'center';
	td.style.justifyContent = 'center';
	td.style.padding = '0.25rem';

	const category = (status ? categories[status] : categories['completed']) as CategoryDefinition;

	// Render our interactive BadgeWithDialogue component
	const hotFilter = createHOTFilter(instance, col, statusPath, rowData);
	const isFiltered = getValueForPath(instance, `categoryFilters.${statusPath}`) == true;
	const badge = category.createBadge(value, description, hotFilter, isFiltered);
	root.render(badge);

	return td;
};

function createHOTFilter(
	hotInstance: Handsontable,
	colIndex: number,
	statusPath: string,
	rowData: {[key: string]: any},
) {
	// const colIndex = hotInstance.getSettings().columns.findIndex((col) => col.key == category.columnKey);

	const filterPlugin = hotInstance.getPlugin('filters');

	return function hotFilter() {
		const {status, value} = (getValueForPath(rowData, statusPath) as StepType | null) ?? {};
		const companies = hotInstance.getSourceData();
		const objectByCategory = getObjectsByCategory(companies, `${statusPath}.status`);
		const otherObjectsWithSameStatus = objectByCategory[status ?? 'na'];
		const uniqueValues = getUniqueValuesForPath(otherObjectsWithSameStatus, `${statusPath}.value`);
		const isFilterApplied = getValueForPath(hotInstance, `categoryFilters.${statusPath}`) == true;

		if (isFilterApplied) {
			filterPlugin.removeConditions(colIndex);
			setValueForPath(hotInstance, `categoryFilters.${statusPath}`, false);
		} else {
			uniqueValues.forEach((value) => {
				filterPlugin.addCondition(colIndex, 'contains', [value], 'disjunction');
			});
			setValueForPath(hotInstance, `categoryFilters.${statusPath}`, true);
		}

		filterPlugin.filter();
	};
}
