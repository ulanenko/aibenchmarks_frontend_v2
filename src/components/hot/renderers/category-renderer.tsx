import {createRoot, Root} from 'react-dom/client';
import Handsontable from 'handsontable';
import {getValueForPath, setValueForPath} from '@/lib/object-utils';
import {getObjectsByCategory, getUniqueValuesForPath} from '@/lib/company';
import {CategoryValue} from '@/types/category';
import {CategoryDefinition} from '@/lib/category-definition';
import {CategoryColumn} from '@/lib/column-definition';
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
	const categoryValue = getValueForPath(rowData, categoryValuePath) as CategoryValue;
	const {category, label, description, categoryKey} = categoryValue ?? {};
	// Center the content in the cell
	if (!category || !categoryKey) {
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
	const hotFilter = createHOTFilter(instance, categoryValuePath, category, col);
	const isFiltered = getValueForPath(instance, `categoryFilters.${category.categoryKey}`) == true;
	const badge = category.createBadge(label, description, hotFilter, isFiltered);
	root.render(badge);

	return td;
};

export function createHOTFilter(
	hotInstance: Handsontable,
	categoryColumnOrCategoryKeyPath: CategoryColumn | string,
	category: CategoryDefinition,
	colIndexProp?: number,
) {
	let categoryValuePath: string;
	let colIndex: number;
	if (categoryColumnOrCategoryKeyPath instanceof CategoryColumn) {
		const catColumn = categoryColumnOrCategoryKeyPath;
		// @ts-ignore
		const physicalCol = hotInstance!.getSettings().columns.findIndex((col) => col.data == catColumn.data);
		colIndex = hotInstance.toVisualColumn(physicalCol);
		categoryValuePath = catColumn.getCategoryValuePath();
	} else {
		categoryValuePath = categoryColumnOrCategoryKeyPath;
		if (colIndexProp !== undefined) {
			colIndex = colIndexProp;
		} else {
			throw new Error('colIndexProp is required when categoryColumnOrCategoryKeyPath is a string');
		}
	}

	const filterPlugin = hotInstance.getPlugin('filters');

	return function hotFilter() {
		const companies = hotInstance.getSourceData();
		const objectByCategory = getObjectsByCategory(companies, `${categoryValuePath}.categoryKey`);
		console.log('objectByCategory', objectByCategory);
		const otherObjectsWithSameCategory = objectByCategory[category.categoryKey];
		const uniqueValues = getUniqueValuesForPath(otherObjectsWithSameCategory, `${categoryValuePath}.label`);
		const isFilterApplied = getValueForPath(hotInstance, `categoryFilters.${category.categoryKey}`) == true;

		if (isFilterApplied) {
			filterPlugin.removeConditions(colIndex);
			setValueForPath(hotInstance, `categoryFilters.${category.categoryKey}`, false);
		} else {
			uniqueValues.forEach((value) => {
				filterPlugin.addCondition(colIndex, 'contains', [value], 'disjunction');
			});
			setValueForPath(hotInstance, `categoryFilters.${category.categoryKey}`, true);
		}

		filterPlugin.filter();
	};
}
