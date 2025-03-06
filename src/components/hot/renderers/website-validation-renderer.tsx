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

	const categoryValue = rowData.categoryValues.WEBSITE;

	// Create a container for the React component
	const container = document.createElement('div');
	container.style.width = '100%';
	container.style.height = '100%';
	container.style.position = 'absolute';
	container.style.inset = '0';
	container.style.display = 'flex';
	container.style.justifyContent = 'center';
	container.style.alignItems = 'center';

	// Ensure the td has position relative for absolute positioning
	td.style.position = 'relative';
	td.style.padding = '0';
	td.appendChild(container);

	// Create a root for React rendering
	const root = createRoot(container);

	// Function to handle validation
	const handleValidate = async () => {
		await validateCompanyWebsite(rowData);
	};
	const IconButton = categoryValue.category.createIconButton(handleValidate);

	// Render the button component
	root.render(IconButton);

	return td;
};
