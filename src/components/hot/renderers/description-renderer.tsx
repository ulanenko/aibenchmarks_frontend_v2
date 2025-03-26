import Handsontable from 'handsontable';
import { useCompanyStore } from '@/stores/use-company-store';
import { CompanyHotCopy } from '@/lib/company/company';

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
  const categoryName = websearchCategory?.categoryKey?.split('.')?.pop() || 'NOT_READY';
  
  // Determine the visual state based on category status and key
  const isSearching = searchStatus === 'in_progress';
  const isSuccessful = searchStatus === 'completed' && websearchCategory?.passed === true;
  const isNotStartedOrFailed = searchStatus === 'not_ready' || searchStatus === 'ready' || 
                              (searchStatus === 'completed' && websearchCategory?.passed === false);
  
  // Create a container for the cell content
  const container = document.createElement('div');
  container.className = 'flex flex-col w-full gap-1';
  
  // Add background color based on state
  if (isSearching) {
    // Light blue background for searching
    td.style.backgroundColor = '#f0f7ff';
  } else if (categoryName === 'READY') {
    // Light blue background for ready (same as searching)
    td.style.backgroundColor = '#f0f7ff';
  } else if (isNotStartedOrFailed) {
    // Light gray background for not started and failed states
    td.style.backgroundColor = '#f9fafb';
  }
  
  // Add the status bar only for searching and failed states
  if (isSearching || (searchStatus === 'completed' && websearchCategory?.passed === false)) {
    // Create a wrapper to center the bar
    const barWrapper = document.createElement('div');
    barWrapper.className = 'flex justify-center w-full py-1';
    
    const statusBar = document.createElement('div');
    statusBar.className = 'h-2 w-28 rounded overflow-hidden'; // Add overflow-hidden for the animation
    
    if (isSearching) {
      // Create a more dynamic loading animation for the bar
      statusBar.className += ' bg-blue-100'; // Light blue background
      
      // Add an animated gradient that moves horizontally
      const animatedGradient = document.createElement('div');
      animatedGradient.className = 'h-full';
      animatedGradient.style.width = '100%';
      animatedGradient.style.backgroundImage = 'linear-gradient(to right, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.6), rgba(59, 130, 246, 0.2))';
      animatedGradient.style.backgroundSize = '200% 100%';
      animatedGradient.style.animation = 'gradient-slide 1.5s ease-in-out infinite';
      
      // Add a keyframe animation to the document head if it doesn't exist
      if (!document.getElementById('gradient-animation')) {
        const style = document.createElement('style');
        style.id = 'gradient-animation';
        style.textContent = `
          @keyframes gradient-slide {
            0% { background-position: 100% 0; }
            100% { background-position: -100% 0; }
          }
        `;
        document.head.appendChild(style);
      }
      
      statusBar.appendChild(animatedGradient);
    } else if (searchStatus === 'completed' && websearchCategory?.passed === false) {
      // Gray bar for failed
      statusBar.className += ' bg-gray-300';
    }
    
    barWrapper.appendChild(statusBar);
    container.appendChild(barWrapper);
  }
  
  // Skip rendering text content if search is not successful
  if (!isSuccessful) {
    td.appendChild(container);
    td.classList.add('htMiddle');
    return td;
  }

  // If search is successful, prepare to show the text content
  if (value !== null && value !== undefined && value !== '') {
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
  }
  
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