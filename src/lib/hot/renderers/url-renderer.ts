import Handsontable from 'handsontable';

export const urlRenderer = (
	instance: Handsontable.Core,
	td: HTMLTableCellElement,
	row: number,
	col: number,
	prop: string | number,
	value: string,
) => {
	// Clear the cell content
	td.innerHTML = '';

	// If no value, return early
	if (!value) {
		return td;
	}

	// Create link element
	const link = document.createElement('a');
	link.href = value.startsWith('http') ? value : `https://${value}`;
	link.target = '_blank';
	link.rel = 'noopener noreferrer';
	link.textContent = value;
	link.className = 'text-blue-600 hover:text-blue-800 hover:underline';

	// Center the content
	td.style.display = 'flex';
	td.style.alignItems = 'center';
	td.style.padding = '0.25rem 0.5rem';

	// Append link to cell
	td.appendChild(link);

	return td;
};
