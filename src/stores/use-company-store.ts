import {create} from 'zustand';
import * as companyService from '@/services/api/companies';
import {Company, updateCategories} from '@/lib/company';
import {setValueForPath} from '@/lib/object-utils';
import {toast} from '@/hooks/use-toast';

interface CompanyStore {
	companies: Company[];
	hotCopyCompanies: {[key: string]: any}[];
	isLoading: boolean;
	isSaving: boolean;
	setCompanies: (companies: Company[]) => void;
	// addCompany: (company: Company) => void;
	// updateCompany: (id: number, company: Partial<Company>) => void;
	updateCompanyProperties: (updates: Array<{row: number; changes: Record<string, any>}>) => void;
	removeCompany: (id: number) => void;
	loadCompanies: (benchmarkId: number) => Promise<void>;
	saveChanges: (benchmarkId: number) => Promise<void>;
}

export const useCompanyStore = create<CompanyStore>((set, get) => ({
	companies: [],
	isLoading: true,
	isSaving: false,
	hotCopyCompanies: [],
	setCompanies: (companies: Company[]) => {
		set({companies});
		// console.log(companies);
		set({hotCopyCompanies: companies.map((c) => c.hotCopy)});
	},

	// addCompany: (company) =>
	// 	set((state) => ({
	// 		companies: [...state.companies, company],
	// 	})),

	// updateCompany: (id, company) =>
	// 	set((state) => ({
	// 		companies: state.companies.map((c) => (c.id === id ? {...c, ...company} : c)),
	// 	})),

	updateCompanyProperties: (updates) => {
		const newCompanies = [...get().companies];
		updates.forEach(({row, changes}) => {
			const isNew = row < 0;
			let company = isNew ? new Company() : newCompanies[row];
			company.update(changes);
			if (isNew) {
				newCompanies.push(company);
			} else {
				newCompanies[row] = company;
			}
		});
		get().setCompanies(newCompanies);
	},

	removeCompany: (id) =>
		set((state) => ({
			companies: state.companies.filter((c) => c.id !== id),
		})),

	loadCompanies: async (benchmarkId) => {
		set({isLoading: true});
		try {
			const companyDTOs = await companyService.getCompanies(benchmarkId);
			const companies = companyDTOs.map((dto) => new Company(dto));
			get().setCompanies(companies);
		} catch (error) {
			console.error('Error loading companies:', error);
			toast({
				variant: 'destructive',
				title: 'Error loading companies',
				description: error instanceof Error ? error.message : 'Failed to load companies',
			});
			throw error;
		} finally {
			set({isLoading: false});
		}
	},

	saveChanges: async (benchmarkId) => {
		set({isSaving: true});
		try {
			const changedCompanies = get()
				.companies.map((c) => c.getUpdateDTO())
				.filter((v) => v !== null);
			if (changedCompanies.length === 0) {
				toast({
					title: 'No changes to save',
					description: 'No modifications were made to any companies.',
				});
				return;
			}

			toast({
				title: 'Saving changes',
				description: `Saving ${changedCompanies.length} companies...`,
			});

			const savedCompanies = await companyService.saveCompanies(benchmarkId, changedCompanies);
			const newCompanies = get().companies.map((c) => {
				const changedCompanyIndex = changedCompanies.findIndex((sc) => sc.id === c.id);
				if (changedCompanyIndex !== -1) {
					return new Company(savedCompanies[changedCompanyIndex]);
				}
				return c;
			});
			get().setCompanies(newCompanies);

			toast({
				title: 'Changes saved',
				description: `Successfully saved ${changedCompanies.length} companies`,
			});
		} catch (error) {
			console.error('Error saving companies:', error);
			toast({
				variant: 'destructive',
				title: 'Error saving companies',
				description: error instanceof Error ? error.message : 'Failed to save companies',
			});
			throw error;
		} finally {
			set({isSaving: false});
		}
	},
}));
