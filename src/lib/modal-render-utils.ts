import { Company, CompanyHotCopy } from './company/company';
import { CompanyDetailsTab } from '@/components/features/company-details-components/company-details-dialogue';

export const openCompanyDetailsDialogue = (company: Company | CompanyHotCopy, initialPage?: CompanyDetailsTab, subtab?: string) => {
    if (!company.id) return;
    window.dispatchEvent(new CustomEvent('openCompanyDetailsDialogue', {
        detail: {
            companyId: company.id,
            initialPage,
            subtab
        }
    }));
};

export const openWebsiteTab = (company: Company | CompanyHotCopy) => openCompanyDetailsDialogue(company, "website");
export const openDescriptionTab = (company: Company | CompanyHotCopy) => openCompanyDetailsDialogue(company, "description");
export const openSitematchTab = (company: Company | CompanyHotCopy) => openCompanyDetailsDialogue(company, "analysis");
export const openSourceUsedTab = (company: Company | CompanyHotCopy) => openCompanyDetailsDialogue(company, "source-used");
export const openComparabilityTab = (company: Company | CompanyHotCopy, subtab?: string) => openCompanyDetailsDialogue(company, "comparability", subtab); 