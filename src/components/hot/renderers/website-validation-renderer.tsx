import {createRoot, Root} from 'react-dom/client';
import Handsontable from 'handsontable';
import {getValueForPath, setValueForPath} from '@/lib/object-utils';
import {validateAndFindWebsite} from '@/app/actions/website-validation-actions';
import {WebsiteValidationStatus, createInputSettings, getValidationStatus} from '@/lib/company/website-validation';
import {updateCategories} from '@/lib/company/utils';
import {companyColumns} from '@/lib/company/company-columns';
import {CategoryValue} from '@/types/category';
import {CompanyHotCopy} from '@/lib/company/company';
import {validateCompanyWebsite} from '@/services/client/validate-company-website';
import {Button} from '@/components/ui/button';
import {createReactCell} from '../react-cell';

// The actual renderer for HandsOnTable
export const websiteValidationRenderer = (
	instance: Handsontable.Core,
	td: HTMLTableCellElement,
	row: number,
	col: number,
	prop: string | number,
	value: any,
	cellProperties: Handsontable.CellProperties,
) => {
	// Clear the cell content
	Handsontable.dom.empty(td);

	// Get the physical row when filtering is active
	const physicalRow = instance.toPhysicalRow(row);
	const rowData = instance.getSourceDataAtRow(physicalRow) as CompanyHotCopy;

	if (!rowData || !rowData.categoryValues?.WEBSITE?.categoryKey) {
		return td;
	}

	const root = createReactCell(td);

	// Function to handle validation

	const websiteCategory = rowData.categoryValues.WEBSITE;
	const descriptionCategory = rowData.categoryValues.DESCRIPTION;

	const IconButton = websiteCategory.category.createIconButton(rowData);
	const DescriptionButton = descriptionCategory.category.createIconButton(rowData);

	// Render the button component
	root.render(
		<div className="flex flex-row gap-2">
			{IconButton}
			{DescriptionButton}
		</div>,
	);

	return td;
};
