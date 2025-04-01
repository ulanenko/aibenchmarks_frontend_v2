import Handsontable from 'handsontable';
import { useCompanyStore } from '@/stores/use-company-store';
import { CompanyHotCopy } from '@/lib/company/company';
import { getValueForPath } from '@/lib/object-utils';
import { isAcceptOrReject, isInProgress, isInQueue } from '@/lib/company/utils';
import { CATEGORIES } from '@/config/categories';
import { createExpansionTextDiv } from '../utils/expansionTextDiv';
import { getColorValue } from '@/lib/colors';
import { CategoryColor } from '@/types/category';
import { createStatusBar } from '../utils/animationBar';
/**
 * Renderer for comparability information with accept/reject icons
 * Shows loading animation when processing and can collapse/expand details
 */
export const comparabilityRenderer = (
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

  // Use utility functions to determine the status
  const acceptRejectCategory = rowData.categoryValues?.ACCEPT_REJECT?.category;
  const acceptRejectStatus = acceptRejectCategory?.categoryKey;
  const {ACCEPTED, REJECTED, IN_PROGRESS, IN_QUEUE} = CATEGORIES.ACCEPT_REJECT
 

  // Create a container for the cell content
  const container = document.createElement('div');
  container.className = 'flex flex-col w-full cursor-pointer';
  const isAccept = isAcceptOrReject(value);


  if(acceptRejectCategory && (acceptRejectStatus === ACCEPTED.categoryKey || acceptRejectStatus === REJECTED.categoryKey)){
    const motivationPath = cellProperties.motivationPath;
    const descriptionValue = getValueForPath(rowData, motivationPath);
    const description = typeof descriptionValue === 'string' ? descriptionValue : 'No motivation provided';


    const iconElement = document.createElement('div');
    iconElement.className = 'flex items-center justify-center w-5 h-5 rounded-full mr-2 flex-shrink-0';
    
    if (isAccept) {
      // Green checkmark for accepted
      iconElement.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>';
      iconElement.className += ' bg-green-100 text-green-600';
      // td.style.backgroundColor = '#f0fff4'; // Light green background
    } else if (!isAccept) {
      // Red X for rejected
      iconElement.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
      iconElement.className += ' bg-red-100 text-red-600';
    } 
    const color  = isAccept ? ACCEPTED.color : REJECTED.color;
    // td.style.backgroundColor = getColorValue(color as CategoryColor, 'soft') 
      // Create the status icon element
    const statusContainer = document.createElement('div');
    statusContainer.className = 'flex items-center';
    const expansionTextDiv = createExpansionTextDiv(description, rowData);
     // Add elements to status container
    statusContainer.appendChild(iconElement);
    statusContainer.appendChild(expansionTextDiv);
    
    // Add status container to main container
    container.appendChild(statusContainer);
  }else{
    td.style.backgroundColor = getColorValue(acceptRejectCategory?.color as CategoryColor, 'soft');
    if(acceptRejectStatus === IN_PROGRESS.categoryKey || acceptRejectStatus === IN_QUEUE.categoryKey){
      const statusBarElement = createStatusBar(true, acceptRejectCategory?.color as CategoryColor);
      container.appendChild(statusBarElement);
    }
    if(acceptRejectCategory?.passed === false){
      const statusBarElement = createStatusBar(false, acceptRejectCategory?.color as CategoryColor);
      container.appendChild(statusBarElement);
    }


  }
  

  
  // Append the container to the td
  td.appendChild(container);
  
  // Set cell alignment
  td.classList.add('htMiddle');
  
  return td;
}; 