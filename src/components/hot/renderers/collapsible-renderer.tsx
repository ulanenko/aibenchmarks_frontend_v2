import Handsontable from 'handsontable';
import { useCompanyStore } from '@/stores/use-company-store';
import { CompanyHotCopy } from '@/lib/company/company';

/**
 * Simple renderer for collapsible text that shows only the first line by default
 * or the full text when expanded (controlled by the expand toggle column)
 */
export const collapsibleRenderer = (
  instance: Handsontable.Core,
  td: HTMLTableCellElement,
  row: number,
  col: number,
  prop: string | number,
  value: any,
  cellProperties: Handsontable.CellProperties
) => {
  // Clear the cell content
  Handsontable.dom.empty(td);

  // Get the correct row data when filtering is active
  const physicalRow = instance.toPhysicalRow(row);
  const rowData = instance.getSourceDataAtRow(physicalRow) as CompanyHotCopy;

  if (!rowData) {
    return td;
  }

  // Create a container for the cell content
  const container = document.createElement('div');
  container.className = 'flex flex-col w-full gap-1';

  // Skip rendering if no value
  if (value === null || value === undefined || value === '') {
    td.appendChild(container);
    td.classList.add('htMiddle');
    return td;
  }

  // Convert value to string to handle any data type
  const stringValue = String(value);
  
  // Check if the text should be expanded
  const isExpanded = rowData.frontendState?.expanded || false;
  
  // Create text content div
  const textDiv = document.createElement('div');
  textDiv.className = 'w-full';
  
  // Apply different styles based on expanded state
  if (isExpanded) {
    textDiv.style.whiteSpace = 'pre-wrap';
    textDiv.textContent = stringValue;
  } else {
    textDiv.style.whiteSpace = 'nowrap';
    textDiv.style.overflow = 'hidden';
    textDiv.style.textOverflow = 'ellipsis';
    textDiv.textContent = stringValue.split('\n')[0]; // Only show first line
  }
  
  // Add the text content to the container
  container.appendChild(textDiv);

  // Add double-click handler to toggle expanded state
  td.addEventListener('dblclick', (e) => {
    e.stopPropagation(); // Prevent other handlers
    e.preventDefault();
    
    // Get company ID and toggle via store
    const companyId = rowData.id;
    if (companyId !== null) {
      useCompanyStore.getState().updateCompany({
        id: companyId,
        frontendState: {
          expanded: !rowData.frontendState?.expanded
        }
      });
    }
  });
  
  // Append the container to the td
  td.appendChild(container);
  
  // Set cell alignment
  td.classList.add('htMiddle');
  
  return td;
}; 