import {createRoot, Root} from 'react-dom/client';
import Handsontable from 'handsontable';
import {getValueForPath, setValueForPath} from '@/lib/object-utils';
import {CompanyHotCopy, getObjectsByCategory, getUniqueValuesForPath} from '@/lib/company';
import {CategoryValue} from '@/types/category';
import {CategoryDefinition} from '@/lib/category-definition';
import {CategoryColumn} from '@/lib/column-definition';
import {CATEGORIES} from '@/config/categories';
import {createReactCell} from '@/components/hot/react-cell';
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
	// Clear the cell content first
	Handsontable.dom.empty(td);

	// Get the correct row data when filtering is active
	const physicalRow = instance.toPhysicalRow(row);
	const rowData = instance.getSourceDataAtRow(physicalRow) as CompanyHotCopy;
	const isMainStatusCol = prop.toString().includes('INPUT.label') == true;

	if (!rowData && !isMainStatusCol) {
		return td;
	}

	const {categoryValuePath} = cellProperties;
	const categoryValue = getValueForPath(rowData, categoryValuePath) as CategoryValue;
	let {category, label, description, categoryKey} = categoryValue ?? {};

	if (!categoryKey && isMainStatusCol) {
		category = CATEGORIES.INPUT.NEW;
		label = CATEGORIES.INPUT.NEW.label;
		categoryKey = CATEGORIES.INPUT.NEW.categoryKey;
	}

	if (!category || !categoryKey) {
		return td;
	}

	// Create a new root for each render
	const root = createReactCell(td);

	// Render our interactive BadgeWithDialogue component
	const hotFilter = createHOTFilter(instance, categoryValuePath, category, col);
	const isFiltered = getValueForPath(instance, `categoryFilters.${category.categoryKey}`) == true;
	const badge = category.createBadge(label, rowData, description, hotFilter, isFiltered);

	// Render the badge
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
