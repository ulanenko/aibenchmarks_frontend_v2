import {create} from 'zustand';
import * as companyService from '@/services/api/companies';
import {Company} from '@/lib/company';
import {CreateCompanyDTO, UpdateCompanyDTO} from '@/lib/company/type';
import {setValueForPath} from '@/lib/object-utils';
import {toast} from '@/hooks/use-toast';
import {isEmpty} from '@/lib/utils';

interface CompanyStore {
	companies: Company[];
	hotCopyCompanies: {[key: string]: any}[];
	isLoading: boolean;
	isSaving: boolean;
	benchmarkId: number | null;
	setCompanies: (companies: Company[]) => void;
	// addCompany: (company: Company) => void;
	// updateCompany: (id: number, company: Partial<Company>) => void;
	updateCompaniesWithDTO: (
		updates: Array<{row: number; dto: UpdateCompanyDTO}>,
		newCompanies?: UpdateCompanyDTO[],
	) => void;
	addMappedSourceData: (mappedSourceData: CreateCompanyDTO[]) => Promise<void>;
	removeCompany: (id: number) => void;
	loadCompanies: (benchmarkId: number) => Promise<void>;
	saveChanges: (benchmarkId: number) => Promise<void>;
}

export const useCompanyStore = create<CompanyStore>((set, get) => ({
	companies: [],
	isLoading: true,
	benchmarkId: null,
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

	updateCompaniesWithDTO: (updates, newCompanies = []) => {
		const currentCompanies = [...get().companies];

		// Update existing companies
		updates.forEach(({row, dto}) => {
			if (row >= 0 && row < currentCompanies.length) {
				const company = currentCompanies[row];
				company.updateFromDTO(dto);
				currentCompanies[row] = company;
			}
		});

		// Add new companies
		newCompanies.forEach((dto) => {
			const company = new Company();
			company.updateFromDTO(dto);
			currentCompanies.push(company);
		});

		get().setCompanies(currentCompanies);
	},

	addMappedSourceData: async (mappedSourceData: CreateCompanyDTO[]) => {
		set({isSaving: true});
		try {
			const benchmarkId = get().benchmarkId;
			if (isEmpty(benchmarkId)) {
				throw new Error('Benchmark ID is not set');
			}

			// Use the saveCompanies function with replace flag set to true
			const savedCompanies = await companyService.saveCompanies(benchmarkId!, mappedSourceData, {replace: true});
			const companies = savedCompanies.map((dto) => new Company(dto));

			// Set the companies array with only the new companies, effectively replacing all existing ones
			get().setCompanies(companies);
		} catch (error) {
			console.error('Error adding mapped source data:', error);
			throw error;
		} finally {
			set({isSaving: false});
		}
	},

	removeCompany: (id) =>
		set((state) => ({
			companies: state.companies.filter((c) => c.id !== id),
		})),

	loadCompanies: async (benchmarkId) => {
		set({isLoading: true});
		set({benchmarkId});
		try {
			const companyDTOs = await companyService.getCompanies(benchmarkId);
			const companies = companyDTOs.map((dto) => {
				const company = new Company(dto);
				// Ensure original values are set to the loaded values
				company.resetOriginalValues();
				return company;
			});
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
			// Filter companies that have changes
			const companiesWithChanges = get().companies.filter((company) => company.hasChanges());

			if (companiesWithChanges.length === 0) {
				toast({
					title: 'No changes to save',
					description: 'No modifications were made to any companies.',
				});
				return;
			}

			// Get DTOs for changed companies
			const changedCompanies = companiesWithChanges
				.map((c) => c.getUpdateDTO())
				.filter((dto) => dto !== null) as UpdateCompanyDTO[];

			toast({
				title: 'Saving changes',
				description: `Saving ${changedCompanies.length} companies...`,
			});

			const savedCompanies = await companyService.saveCompanies(benchmarkId, changedCompanies);
			const newCompanies = get().companies.map((c) => {
				const changedCompanyIndex = changedCompanies.findIndex((sc) => sc.id === c.id);
				if (changedCompanyIndex !== -1) {
					const company = new Company(savedCompanies[changedCompanyIndex]);
					return company;
				}
				return c;
			});

			// Reset original values for all companies after saving
			newCompanies.forEach((company) => company.resetOriginalValues());

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
