import Handsontable from 'handsontable';
import { useCompanyStore } from '@/stores/use-company-store';
import { CompanyHotCopy } from '@/lib/company/company';

/**
 * Renderer for a dedicated expand/collapse column
 */
export const expandToggleRenderer = (
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

  // Check if the company is expanded
  const isExpanded = rowData.frontendState?.expanded || false;
  
  // Create container div
  const container = document.createElement('div');
  container.className = 'flex justify-center items-center h-full';
  
  // Create the expand/collapse button
  const button = document.createElement('button');
  button.className = 'text-primary hover:text-primary/80 flex-shrink-0 p-1 rounded-full bg-gray-50 hover:bg-gray-100';
  button.innerHTML = isExpanded 
    ? '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>' 
    : '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>';
  
  button.onclick = (e) => {
    e.stopPropagation(); // Prevent triggering cell selection
    e.preventDefault(); // Prevent any default action
    
    // Get company ID and toggle via store
    const companyId = rowData.id;
    if (companyId !== null) {
      useCompanyStore.getState().toggleCompanyExpanded(companyId);
    }
  };
  
  container.appendChild(button);
  
  // Append the container to the td
  td.appendChild(container);
  
  // Set cell alignment
  td.classList.add('htMiddle', 'htCenter');
  
  return td;
}; 