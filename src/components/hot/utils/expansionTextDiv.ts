import { CompanyHotCopy } from "@/lib/company/company";

export const createExpansionTextDiv = (value: any, rowData: CompanyHotCopy) => {
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
     return textDiv;
}