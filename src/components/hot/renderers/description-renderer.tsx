import Handsontable from 'handsontable';
import { useCompanyStore } from '@/stores/use-company-store';
import { CompanyHotCopy } from '@/lib/company/company';
import { getColorValue, getColorClass, getGradientForAnimation, getColorClassSimple } from '@/lib/colors';
import { CategoryColor } from '@/types/category';
import { createStatusBar } from '../utils/animationBar';
import { createExpansionTextDiv } from '../utils/expansionTextDiv';


/**
 * Renderer for AI-generated descriptions that shows only the first line by default
 * or the full text when expanded (controlled by the expand toggle column)
 */
export const descriptionRenderer = (
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

  // Get the search status from the WEBSEARCH category
  const websearchCategory = rowData.categoryValues?.WEBSEARCH?.category;
  const searchStatus = websearchCategory?.status || 'not_ready';
  // Determine the visual state based on category status and key
  const isSearching = searchStatus === 'in_progress';
  const isCompleted = searchStatus === 'completed' 

  
  // Create a container for the cell content
  const container = document.createElement('div');
  container.className = 'flex flex-col w-full gap-1';
  if(!isCompleted && websearchCategory?.color){
    td.style.backgroundColor = getColorValue(websearchCategory.color, 'soft');
  }
  
  if(isSearching){
    const statusBarElement = createStatusBar(true, websearchCategory?.color as CategoryColor);
    container.appendChild(statusBarElement);
  }
  if(websearchCategory?.passed === false){
    const statusBarElement = createStatusBar(false, websearchCategory?.color as CategoryColor);
    container.appendChild(statusBarElement);
  }

  
  // Skip rendering text content if search is not successful
  if (!isCompleted) {
    td.appendChild(container);
    td.classList.add('htMiddle');
    return td;
  }

  // If search is successful, prepare to show the text content
  if (value !== null && value !== undefined && value !== '') {
   const expansionTextDiv = createExpansionTextDiv(value, rowData);
    
    // Add the text content to the container
    container.appendChild(expansionTextDiv);
  }
  
  // Append the container to the td
  td.appendChild(container);
  
  // Set cell alignment
  td.classList.add('htMiddle');
  
  return td;
}; 