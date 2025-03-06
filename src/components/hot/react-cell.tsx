import {createRoot} from 'react-dom/client';

function createReactCell(td: HTMLTableCellElement) {
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
	// td.style.padding = '0';
	td.style.padding = '0.25rem';

	td.appendChild(container);

	// Create a root for React rendering
	const root = createRoot(container);
	return root;
}

export {createReactCell};
