import {getColorClass} from '@/lib/colors';
import {CompanyHotCopy} from '@/lib/company/company';
import {isEmpty} from '@/lib/utils';
import {CategoryColor} from '@/types/category';
import Handsontable from 'handsontable';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
// Optional: Import a theme if you want to customize the appearance
// import 'tippy.js/themes/light.css';

/**
 * Creates a URL cell with appropriate styling and tooltip
 */
function createUrlCell(url: string, isValid?: boolean, isUpdated?: boolean, sourceUrl?: string | null): HTMLElement {
	// Create container
	const container = document.createElement('div');
	container.className = 'w-full h-full relative';

	// Determine text color class based on validation status

	const textColorClass = isValid === false ? `!${getColorClass('red', 'text')}` : false;

	// Create link element with hover effects using Tailwind
	const link = document.createElement('a');
	link.href = url;
	link.textContent = isValid === false && isEmpty(url) ? 'N/A' : url;
	if (isEmpty(url)) {
		console.log('HOI HOI');
	}
	link.target = '_blank';
	link.rel = 'noopener noreferrer';
	link.className = `${textColorClass} inline-block max-w-full overflow-hidden text-ellipsis whitespace-nowrap hover:underline`;

	// Add border-bottom if URL has been replaced
	if (isUpdated) {
		const borderColorClass = getColorClass('red', 'border');
		link.style.borderBottom = `1px dashed `;
		link.classList.add(borderColorClass);
	}

	// Generate tooltip content
	let tooltipContent = '';

	if (isValid === undefined) {
		tooltipContent = 'URL not validated';
	} else if (isValid === false) {
		tooltipContent = 'Invalid URL';
	} else if (isValid === true) {
		tooltipContent = 'Valid URL';
	}

	if (isUpdated) {
		if (sourceUrl) {
			tooltipContent += `<br>Replaced from: ${sourceUrl}`;
		} else {
			tooltipContent += `<br>No source url provided`;
		}
	}

	// Create a tooltip content element
	const tooltipElement = document.createElement('div');
	tooltipElement.innerHTML = tooltipContent;
	tooltipElement.className = 'text-sm p-1';

	// Initialize Tippy.js tooltip with more options for better appearance
	tippy(link, {
		content: tooltipElement,
		allowHTML: true,
		placement: 'top',
		arrow: true,
		theme: 'light',
		zIndex: 9999,
		duration: [200, 0], // [show, hide] duration in ms
		interactive: true, // Allow interaction with tooltip content
		appendTo: document.body, // Append to body to avoid positioning issues
		maxWidth: 300,
		animation: 'scale',
	});

	// Append elements
	container.appendChild(link);

	return container;
}

/**
 * Handsontable renderer for URL cells
 */
export const urlRenderer = (
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

	if (instance.isEmptyRow(row)) {
		return td;
	}

	const physicalRow = instance.toPhysicalRow(row);
	const rowData = instance.getSourceDataAtRow(physicalRow) as CompanyHotCopy;
	const sourceUrl = rowData?.inputValues?.url;
	const urlIsValid = rowData?.categoryValues?.WEBSITE.category.passed;
	const urlIsUpdated = urlIsValid && rowData?.dynamicInputValues?.urlValidationStatus === 'updated';

	// Create and append the URL cell
	const urlCell = createUrlCell(value, urlIsValid, urlIsUpdated, sourceUrl);
	td.appendChild(urlCell);
	td.classList.add('htMiddle');
	td.style.color = 'inherit'; // Reset any color Handsontable might be applying

	return td;
};
