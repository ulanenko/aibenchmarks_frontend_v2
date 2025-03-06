import {useCompanyStore} from '@/stores/use-company-store';
import {toast} from '@/hooks/use-toast';
import * as companyActions from '@/app/actions/company-actions';
import {Company} from '@/lib/company';
import {UpdateCompanyDTO} from '@/lib/company/type';

/**
 * Updates a company by saving it to the backend first, then updating the store if successful
 * @param companyId - The ID of the company to update
 * @param updates - The partial company data to update
 * @returns Promise resolving to the updated company or null if update failed
 */
export async function updateCompany(
	companyId: number,
	updates: Partial<Omit<UpdateCompanyDTO, 'id'>>,
): Promise<Company | null> {
	try {
		const store = useCompanyStore.getState();

		// Find the company in the store to verify it exists
		const companyIndex = store.companies.findIndex((c) => c.id === companyId);

		if (!companyId) {
			throw new Error(`Company with ID ${companyId} not found`);
		}
		const company = store.companies[companyIndex];

		// Create the DTO with the ID and updates
		const updateDTO: UpdateCompanyDTO = {
			id: companyId,
			...company.changedFields,
			...updates,
		};

		// Show loading toast
		toast({
			title: 'Saving company',
			description: 'Updating company information...',
		});

		// Get the benchmark ID from the store
		const benchmarkId = store.benchmarkId;
		if (!benchmarkId) {
			throw new Error('Benchmark ID is not set');
		}

		// Save the changes to the backend first
		const {companies: savedCompanies, error} = await companyActions.saveCompanies(benchmarkId, [updateDTO]);

		if (error) {
			throw new Error(error);
		}

		if (!savedCompanies || savedCompanies.length === 0) {
			throw new Error('No companies returned from server');
		}

		// Only update the store after successful save to backend
		const companies = [...store.companies];
		const updatedCompany = new Company(savedCompanies[0]);
		companies[companyIndex] = updatedCompany;

		// Reset original values
		// updatedCompany.resetOriginalValues();

		// Update the store with the saved data
		store.setCompanies(companies);

		// Show success toast
		toast({
			title: 'Company updated',
			description: 'Successfully saved company changes',
		});

		return updatedCompany;
	} catch (error) {
		console.error('Error updating company:', error);

		// Show error toast
		toast({
			variant: 'destructive',
			title: 'Error updating company',
			description: error instanceof Error ? error.message : 'Failed to update company',
		});

		return null;
	}
}
