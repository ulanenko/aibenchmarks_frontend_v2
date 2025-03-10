import {create} from 'zustand';
import {Company} from '@/lib/company';
import {CreateCompanyDTO, UpdateCompanyDTO} from '@/lib/company/type';
import {MappingSettings} from '@/lib/benchmark/type';
import {setValueForPath} from '@/lib/object-utils';
import {toast} from '@/hooks/use-toast';
import {isEmpty} from '@/lib/utils';
import * as companyActions from '@/app/actions/company-actions';
import * as benchmarkActions from '@/app/actions/benchmark-actions';
import {WebsiteValidationStatus} from '@/lib/company/website-validation';

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
	updateWebsiteValidation: (
		companyId: number | number[],
		websiteValidation: WebsiteValidationStatus | WebsiteValidationStatus[],
	) => Company[];
	addMappedSourceData: (mappedSourceData: CreateCompanyDTO[]) => Promise<void>;
	saveMappingSettings: (settings: MappingSettings) => Promise<void>;
	loadMappingSettings: (benchmarkId: number) => Promise<{
		settings: MappingSettings | null;
		fileData?: {
			data: ArrayBuffer | null;
			fileName: string;
			contentType: string;
		} | null;
		error: string | null;
	}>;
	removeCompany: (id: number) => void;
	loadCompanies: (benchmarkId: number) => Promise<void>;
	saveChanges: () => Promise<void>;
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

	updateWebsiteValidation: (
		companyId: number | number[],
		websiteValidation: WebsiteValidationStatus | WebsiteValidationStatus[],
	): Company[] => {
		const companies = [...get().companies];
		const companyIds = Array.isArray(companyId) ? companyId : [companyId];
		const websiteValidations = Array.isArray(websiteValidation) ? websiteValidation : [websiteValidation];
		if (companyIds.length !== websiteValidations.length) {
			throw new Error('Company IDs and website validations must have the same length');
		}

		companyIds.forEach((id, index) => {
			const company = companies.find((c) => c.id === id);
			if (company) {
				company.updateWebsiteValidation(websiteValidations[index]);
			}
		});

		get().setCompanies(companies);
		return get().companies.filter((c) => companyIds.includes(c.id!));
	},

	addMappedSourceData: async (mappedSourceData: CreateCompanyDTO[]) => {
		set({isSaving: true});
		try {
			const benchmarkId = get().benchmarkId;
			if (isEmpty(benchmarkId)) {
				throw new Error('Benchmark ID is not set');
			}

			// Use the server action to save companies
			const {companies, error} = await companyActions.saveCompanies(benchmarkId as number, mappedSourceData, {
				replace: true,
			});

			if (error) {
				throw new Error(error);
			}

			// Set the companies array with only the new companies, effectively replacing all existing ones
			get().setCompanies(companies.map((dto) => new Company(dto)));
		} catch (error) {
			console.error('Error adding mapped source data:', error);
			throw error;
		} finally {
			set({isSaving: false});
		}
	},

	// New function to save mapping settings to the benchmark
	saveMappingSettings: async (settings: MappingSettings) => {
		try {
			const benchmarkId = get().benchmarkId;
			if (isEmpty(benchmarkId)) {
				throw new Error('Benchmark ID is not set');
			}

			// Use the server action to save mapping settings
			const {success, error} = await benchmarkActions.saveMappingSettings(benchmarkId as number, settings);

			if (!success) {
				throw new Error(error || 'Failed to save mapping settings');
			}

			toast({
				title: 'Mapping settings saved',
				description: 'Your mapping settings have been saved for future use.',
			});
		} catch (error) {
			console.error('Error saving mapping settings:', error);
			toast({
				variant: 'destructive',
				title: 'Error saving mapping settings',
				description: error instanceof Error ? error.message : 'Failed to save mapping settings',
			});
			throw error;
		}
	},

	// Load mapping settings and file data from the benchmark
	loadMappingSettings: async (benchmarkId: number) => {
		try {
			// Use the server action to load mapping settings and file data
			const result = await benchmarkActions.loadMappingSettings(benchmarkId);

			if (result.error) {
				console.warn('Warning loading benchmark data:', result.error);
				// Don't throw here, as we might still have partial data
			}

			return result;
		} catch (error) {
			console.error('Error loading benchmark data:', error);
			toast({
				variant: 'destructive',
				title: 'Error loading benchmark data',
				description: error instanceof Error ? error.message : 'Failed to load benchmark data',
			});
			return {
				settings: null,
				fileData: null,
				error: error instanceof Error ? error.message : 'Unknown error occurred',
			};
		}
	},

	removeCompany: (id) =>
		set((state) => ({
			companies: state.companies.filter((c) => c.id !== id),
		})),

	loadCompanies: async (benchmarkId: number) => {
		set({isLoading: true, benchmarkId});
		try {
			// Use the server action to get companies
			const {companies, error} = await companyActions.getCompanies(benchmarkId);

			if (error) {
				throw new Error(error);
			}

			get().setCompanies(companies.map((dto) => new Company(dto)));
		} catch (error) {
			console.error('Error loading companies:', error);
			toast({
				variant: 'destructive',
				title: 'Error loading companies',
				description: error instanceof Error ? error.message : 'Failed to load companies',
			});
		} finally {
			set({isLoading: false});
		}
	},

	saveChanges: async () => {
		set({isSaving: true});
		try {
			const benchmarkId = get().benchmarkId;
			if (benchmarkId === null) {
				throw new Error('Benchmark ID is not set');
			}

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

			// Use the server action to save companies
			const {companies: savedCompanies, error} = await companyActions.saveCompanies(benchmarkId, changedCompanies);

			if (error) {
				throw new Error(error);
			}

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
