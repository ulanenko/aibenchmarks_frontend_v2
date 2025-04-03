import { Categorizer } from "@/types/category";
import {CATEGORIES} from '@/config/categories';



const SourceUsedCategorizer: Categorizer = [
	// If the company has not completed web search, it cannot be analyzed
	(company) => {
		const websearchCategory = company.categoryValues?.WEBSEARCH;
        // if the websearch is not done, then no source is used
		if (websearchCategory?.category.passed === undefined) {
			return CATEGORIES.SOURCE_USED.NOT_READY.toCategoryValue();
			// so this means that a decision has been made
		}
		return false;
	},
    (company) => {
        const websearchCategory = company.categoryValues?.WEBSEARCH;
        const source = company.searchedCompanyData?.analysis_method as 'WEBSITE' | 'DATABASE' | 'BOTH' ?? 'WEBSITE'
        if (websearchCategory?.category.passed === true) {
            switch (source) {
                case 'WEBSITE':
                    return CATEGORIES.SOURCE_USED.WEBSITE.toCategoryValue();
                case 'DATABASE':
                    return CATEGORIES.SOURCE_USED.DESCRIPTION.toCategoryValue();
                case 'BOTH':
                    return CATEGORIES.SOURCE_USED.FAILED.toCategoryValue({description: 'Both website and database were used'});
            }
        }else{
            const description = {
                WEBSITE: 'Website was not found',
                DATABASE: 'Description was not sufficient',
                BOTH: 'Both website and database were not found',
            }
            return CATEGORIES.SOURCE_USED.FAILED.toCategoryValue({description: description[source]});
        }
        return false;
    }
]

export default SourceUsedCategorizer;