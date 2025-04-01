import Handsontable from 'handsontable';
import { CompanyHotCopy } from '@/lib/company/company';
import { getValueForPath } from '@/lib/object-utils';
import { isAcceptOrReject } from '@/lib/company/utils';
import { CATEGORIES } from '@/config/categories';
import { createExpansionTextDiv } from '../utils/expansionTextDiv';
import { getColorValue } from '@/lib/colors';
import { CategoryColor } from '@/types/category';
import { comparabilityColumnDefinitionNew } from '@/lib/company/company-columns';

/**
 * Renderer for human review that shows AI decisions by default
 * but allows overriding with human decisions
 */
export const humanReviewRenderer = (
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

  // Get the paths from hotProps instead of trying to access the column definition
  const aiDecisionPath = cellProperties.aiDecisionPath as string;
  const humanDecisionPath = cellProperties.humanDecisionPath as string;
  const aiMotivationPath = cellProperties.aiMotivationPath as string;
  const humanMotivationPath = cellProperties.humanMotivationPath as string;
  const cfFactor = cellProperties.cfFactor as string;
  const cfFactorColumn  = Object.values(comparabilityColumnDefinitionNew).find(column => column.cfFactor === cfFactor);
  
  if (!cfFactorColumn) {
    return td;
  }

  // Get AI and human decisions/motivations
  // const aiDecision = getValueForPath(rowData, aiDecisionPath);
  // const humanDecision = getValueForPath(rowData, humanDecisionPath);
  // const aiMotivation = getValueForPath(rowData, aiMotivationPath);
  // const humanMotivation = getValueForPath(rowData, humanMotivationPath);
  const {aiDecision, aiMotivation, humanDecision, humanMotivation} = cfFactorColumn?.getValues(rowData);

  // Determine if accept for both AI and human decisions
  const isAiAccept = isAcceptOrReject(aiDecision);
  const isHumanAccept = humanDecision ? isAcceptOrReject(humanDecision) : null;
  
  // Current decision (human overrides AI)
  const currentDecision = humanDecision || aiDecision;
  const isCurrentAccept = isAcceptOrReject(currentDecision);

  // Get motivation
  const motivation = humanMotivation || aiMotivation;

  // Create a container for the cell content
  const container = document.createElement('div');
  container.className = 'flex items-start w-full py-2';
  
  // Create description area
  const descriptionContainer = document.createElement('div');
  descriptionContainer.className = 'flex-1 mr-3 break-words';
  
  // Create buttons container
  const buttonsContainer = document.createElement('div');
  buttonsContainer.className = 'flex flex-col space-y-2 w-20 flex-shrink-0';
  
  // Create Accept button
  const acceptButton = document.createElement('div');
  acceptButton.className = 'flex items-center px-1 py-1 rounded-md  justify-center cursor-pointer text-sm';
  
  // Create Reject button
  const rejectButton = document.createElement('div');
  rejectButton.className = 'flex items-center px-1 py-1 rounded-md justify-center cursor-pointer text-sm';
  
  // Create text display with expansion capability for the motivation
  const descriptionText = typeof motivation === 'string' ? motivation : 'No motivation provided';
  const expansionTextDiv = createExpansionTextDiv(descriptionText, rowData);
  expansionTextDiv.style.wordBreak = 'break-word';
  expansionTextDiv.style.whiteSpace = 'normal';
  descriptionContainer.appendChild(expansionTextDiv);
  
  // SVG icons
  const humanSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';
  const robotSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path><line x1="8" y1="16" x2="8" y2="16"></line><line x1="16" y1="16" x2="16" y2="16"></line></svg>';
  const checkSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>';
  const xSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
  
  // Create icon elements
  const iconAccept = document.createElement('span');
  iconAccept.className = 'mr-1';
  
  const iconReject = document.createElement('span');
  iconReject.className = 'mr-1';
  
  // Set appropriate icon for Accept button based on state
  if (isHumanAccept === true) {
    // Human selected Accept
    iconAccept.innerHTML = humanSvg;
    acceptButton.className += ' bg-green-200 text-green-700 border-2 border-green-500 font-medium';
  } else if (isAiAccept === true) {
    // AI suggested Accept
    iconAccept.innerHTML = robotSvg;
    acceptButton.className += ' bg-green-100 text-green-600';
  } else {
    // Unselected
    iconAccept.innerHTML = checkSvg;
    acceptButton.className += ' bg-green-50 text-green-500 hover:bg-green-100';
  }
  
  // Set appropriate icon for Reject button based on state
  if (isHumanAccept === false) {
    // Human selected Reject
    iconReject.innerHTML = humanSvg;
    rejectButton.className += ' bg-red-200 text-red-700 border-2 border-red-500 font-medium';
  } else if (isAiAccept === false) {
    // AI suggested Reject
    iconReject.innerHTML = robotSvg;
    rejectButton.className += ' bg-red-100 text-red-600';
  } else {
    // Unselected
    iconReject.innerHTML = xSvg;
    rejectButton.className += ' bg-red-50 text-red-500 hover:bg-red-100';
  }
  
  // Set button text
  acceptButton.textContent = 'Accept';
  acceptButton.prepend(iconAccept);
  
  rejectButton.textContent = 'Reject';
  rejectButton.prepend(iconReject);

  const onClickCallback = (decision:boolean) => {
    return () => {
      // Only update if different from current decision
        const event = new CustomEvent('updateHumanReview', {
          detail: {
            companyId: rowData.id,
            factor: cfFactor,
          }
        });
        window.dispatchEvent(event);
      }
    }

  
  
  // Add click handlers to buttons
  acceptButton.onclick = onClickCallback(true);
  rejectButton.onclick = onClickCallback(false);
  

  
  // Set cell background color based on current decision
//   td.style.backgroundColor = isCurrentAccept ? '#f0fff4' : '#fff5f5';
  
  // Add buttons to container - Reject first (top), then Accept (bottom)
  buttonsContainer.appendChild(rejectButton);
  buttonsContainer.appendChild(acceptButton);
  
  // Add elements to main container
  container.appendChild(descriptionContainer);
  container.appendChild(buttonsContainer);
  
  // Add tooltip instructions
  td.title = 'Click a button to accept or reject';
  
  // Append the container to the td
  td.appendChild(container);
  
  // Set cell height to be taller
  td.style.height = 'auto';
  td.style.minHeight = '80px';
  td.classList.add('htMiddle');
  
  return td;
}; 