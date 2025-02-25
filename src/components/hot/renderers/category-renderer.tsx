import {createRoot, Root} from 'react-dom/client';
import Handsontable from 'handsontable';
import {getValueForPath, setValueForPath} from '@/lib/object-utils';
import {getObjectsByCategory, getUniqueValuesForPath} from '@/lib/company';
import {CategoryValue} from '@/types/category';
// A wrapper component that renders a Badge which opens a dialogue on click.

export const CategoryRenderer = (
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

	const {categoryValuePath} = cellProperties;

	const {category, label, description, categoryKey} =
		(getValueForPath(rowData, categoryValuePath) as CategoryValue) ?? {};
	// Center the content in the cell
	if (!category || !categoryKey) {
		console.log('categoryKey', categoryKey);
		td.innerHTML = '';
		return td;
	}

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

	// Render our interactive BadgeWithDialogue component
	const hotFilter = createHOTFilter(instance, col, categoryValuePath, rowData);
	const isFiltered = getValueForPath(instance, `categoryFilters.${categoryValuePath}`) == true;
	const badge = category.createBadge(label, description, hotFilter, isFiltered);
	root.render(badge);

	return td;
};

function createHOTFilter(
	hotInstance: Handsontable,
	colIndex: number,
	categoryKeyPath: string,
	rowData: {[key: string]: any},
) {
	// const colIndex = hotInstance.getSettings().columns.findIndex((col) => col.key == category.columnKey);

	const filterPlugin = hotInstance.getPlugin('filters');

	return function hotFilter() {
		const {category, categoryKey} = getValueForPath(rowData, categoryKeyPath) as CategoryValue;
		if (!category) {
			return;
		}
		const companies = hotInstance.getSourceData();
		const objectByCategory = getObjectsByCategory(companies, `${categoryKeyPath}.categoryKey`);
		console.log('objectByCategory', objectByCategory);
		const otherObjectsWithSameCategory = objectByCategory[categoryKey];
		const uniqueValues = getUniqueValuesForPath(otherObjectsWithSameCategory, `${categoryKeyPath}.label`);
		const isFilterApplied = getValueForPath(hotInstance, `categoryFilters.${categoryKeyPath}`) == true;

		if (isFilterApplied) {
			filterPlugin.removeConditions(colIndex);
			setValueForPath(hotInstance, `categoryFilters.${categoryKeyPath}`, false);
		} else {
			uniqueValues.forEach((value) => {
				filterPlugin.addCondition(colIndex, 'contains', [value], 'disjunction');
			});
			setValueForPath(hotInstance, `categoryFilters.${categoryKeyPath}`, true);
		}

		filterPlugin.filter();
	};
}
