import Handsontable from 'handsontable';

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
	// td.innerHTML = '';
	// use default renderer
	// empty the cell
	Handsontable.dom.empty(td);

	if (!value) {
		return td;
	}
	// Create an anchor element
	const link = document.createElement('a');
	link.href = value;
	link.target = '_blank';
	link.rel = 'noopener noreferrer';
	link.textContent = value;
	// Style the link
	link.style.color = '#2563eb'; // Blue color
	link.style.textDecoration = 'none';
	link.style.display = 'block';
	link.style.width = '100%';
	link.style.overflow = 'hidden';
	link.style.textOverflow = 'ellipsis';
	link.style.whiteSpace = 'nowrap';

	// Add hover effect
	link.addEventListener('mouseover', () => {
		link.style.textDecoration = 'underline';
	});
	link.addEventListener('mouseout', () => {
		link.style.textDecoration = 'none';
	});
	td.classList.add('htMiddle');

	// Append the link to the cell
	td.appendChild(link);

	return td;
};
