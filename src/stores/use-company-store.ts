import {create} from 'zustand';
import {Company, CompanyHotCopy, FrontendState, InputValues, UpdateState} from '@/lib/company';
import {CreateCompanyDTO, UpdateCompanyDTO} from '@/lib/company/type';
import {MappingSettings} from '@/lib/benchmark/type';
import {setValueForPath} from '@/lib/object-utils';
import {toast} from 'sonner';
import {isEmpty} from '@/lib/utils';
import * as companyActions from '@/app/actions/company-actions';
import * as benchmarkAction from '@/app/actions/benchmark-actions';
import {WebsiteValidationStatus} from '@/lib/company/website-validation';

interface UpdateCompany {
	frontendState: FrontendState;
	inputValues:InputValues
}

interface CompanyStore {
	companies: Company[];
	hotCopyCompanies: CompanyHotCopy[];
	isLoading: boolean;
	isSaving: boolean;
	isRefreshing: boolean;
	benchmarkId: number | null;
	autoRefreshEnabled: boolean;
	setCompanies: (companies: Company[]) => void;
	// addCompany: (company: Company) => void;
	// updateCompany: (id: number, company: Partial<Company>) => void;
	updateCompany: (update: UpdateState) => void;	
	updateCompanies: (
		updates: Array<UpdateState>,
		newCompanies?: Array<UpdateState>,
	) => void;
	updateWebsiteValidation: (
		companyId: number | number[],
		websiteValidation: WebsiteValidationStatus | WebsiteValidationStatus[],
	) => Company[];
	updateWebSearchState: (
		companyId: number | number[],
		webSearchInitialized: boolean,
		searchId: string | string[] | null,
	) => Company[];
	updateAcceptRejectState: (
		companyId: number | number[],
		acceptRejectInitialized: boolean,
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
	loadCompanies: (benchmarkId: number, options?: {includeSearchData?: boolean}) => Promise<void>;
	saveChanges: () => Promise<void>;
	refreshSearchData: () => Promise<void>;
	areAllCompaniesProcessed: () => boolean;
	startAutoRefresh: () => void;
	stopAutoRefresh: () => void;
}

export const useCompanyStore = create<CompanyStore>((set, get) => {
	// Variables for auto-refresh functionality
	let autoRefreshInterval: NodeJS.Timeout | null = null;
	let autoRefreshStartTime: number | null = null;
	const MAX_AUTO_REFRESH_DURATION = 7 * 60 * 1000; // 7 minutes in milliseconds
	const AUTO_REFRESH_INTERVAL = 30000; // 30 seconds

	return {
		companies: [],
		isLoading: true,
		benchmarkId: null,
		isSaving: false,
		isRefreshing: false,
		autoRefreshEnabled: false,
		hotCopyCompanies: [],
		setCompanies: (companies: Company[]) => {
			// Sort companies: positive IDs first in ascending order, then negative IDs in descending order (so -1 before -2)
			const sortedCompanies = [...companies].sort((a, b) => {
				const aId = a.id || 0;
				const bId = b.id || 0;

				// If one ID is negative and the other is positive, put positive first
				if (aId >= 0 && bId < 0) return -1;
				if (aId < 0 && bId >= 0) return 1;

				// If both are negative, sort in descending order (higher negative values first)
				if (aId < 0 && bId < 0) {
					return bId - aId; // This will put -1 before -2
				}

				// If both are positive or zero, sort in ascending order
				return aId - bId;
			});

			set({companies: sortedCompanies});
			set({hotCopyCompanies: sortedCompanies.map((c) => c.hotCopy)});
		},

		// addCompany: (company) =>
		// 	set((state) => ({
		// 		companies: [...state.companies, company],
		// 	})),

		// updateCompany: (id, company) =>
		// 	set((state) => ({
		// 		companies: state.companies.map((c) => (c.id === id ? {...c, ...company} : c)),
		// 	})),

		updateCompanies: (updates, newCompanies = []) => {
			const currentCompanies = [...get().companies];
			const companiesById = new Map(currentCompanies.map(c => [c.id, c]));

			// Update existing companies
			updates.forEach((update) => {
				if (!isEmpty(update.id)) {
					const company = companiesById.get(update.id!);
					if (company) {
						company.update(update);
					}
				}
			});
			// Add new companies
			newCompanies.forEach((dto) => {
				const company = new Company(dto.inputValues);
				currentCompanies.push(company);
			});

			get().setCompanies(currentCompanies);
		},
		updateCompany: (update: UpdateState) => {
			get().updateCompanies([update]);
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

		updateWebSearchState: (
			companyId: number | number[],
			webSearchInitialized: boolean,
			searchId: string | string[] | null,
		): Company[] => {
			const companies = [...get().companies];
			const companyIds = Array.isArray(companyId) ? companyId : [companyId];
			const searchIds = Array.isArray(searchId) ? searchId : [searchId];
			if(webSearchInitialized === false && searchIds.length !== companyIds.length) {
				throw new Error('Company IDs and search IDs must have the same length');
			}
			const updatedCompanies: Company[] = [];
			companies.forEach((company, index) => {
				if (companyIds.includes(company.id!)) {
					if(webSearchInitialized) {
						company.markAsSearchStarted();
						}else if(searchIds[index]) {
								company.updateSearchData(searchIds[index], null);
						}
					updatedCompanies.push(company);
				}
			});
			get().setCompanies(companies);
			return updatedCompanies;
		},

		updateAcceptRejectState: (
			companyId: number | number[],
			acceptRejectInitialized: boolean,
		): Company[] => {
			const companies = [...get().companies];
			const companyIds = Array.isArray(companyId) ? companyId : [companyId];
			
			const updatedCompanies: Company[] = [];
			companies.forEach((company) => {
				if (companyIds.includes(company.id!)) {
					if(acceptRejectInitialized) {
						company.markAsAcceptRejectStarted();
					} else {
						company.updateAcceptRejectData();
					}
					updatedCompanies.push(company);
				}
			});
			get().setCompanies(companies);
			return updatedCompanies;
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
				const {success, error} = await benchmarkAction.saveMappingSettings(benchmarkId as number, settings);

				if (!success) {
					throw new Error(error || 'Failed to save mapping settings');
				}

				toast.success('Mapping settings saved', {
					description: 'Your mapping settings have been saved for future use.',
				});
			} catch (error) {
				console.error('Error saving mapping settings:', error);
				toast.error('Error saving mapping settings', {
					description: error instanceof Error ? error.message : 'Failed to save mapping settings',
				});
				throw error;
			}
		},

		// Load mapping settings and file data from the benchmark
		loadMappingSettings: async (benchmarkId: number) => {
			try {
				// Use the server action to load mapping settings and file data
				const result = await benchmarkAction.loadMappingSettings(benchmarkId);

				if (result.error) {
					console.warn('Warning loading benchmark data:', result.error);
					// Don't throw here, as we might still have partial data
				}

				return result;
			} catch (error) {
				console.error('Error loading benchmark data:', error);
				toast.error('Error loading benchmark data', {
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

		loadCompanies: async (benchmarkId: number, options?: {includeSearchData?: boolean}) => {
			set({isLoading: true, benchmarkId});
			try {
				// Determine whether to include search data (default to false for backward compatibility)
				const includeSearchData = options?.includeSearchData ?? false;

				// Use the appropriate server action based on the includeSearchData option
				const {companies, error} = includeSearchData
					? await companyActions.getCompaniesWithSearchData(benchmarkId)
					: await companyActions.getCompanies(benchmarkId);

				if (error) {
					throw new Error(error);
				}

				get().setCompanies(companies.map((dto) => new Company(dto)));

				// Only show additional toast notification when loading with search data
				if (includeSearchData) {
					toast.success('Companies loaded', {
						description: `Loaded ${companies.length} companies with search data`,
					});
				}
			} catch (error) {
				console.error(`Error loading companies${options?.includeSearchData ? ' with search data' : ''}:`, error);
				toast.error('Error loading companies', {
					description:
						error instanceof Error
							? error.message
							: `Failed to load companies${options?.includeSearchData ? ' with search data' : ''}`,
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
					toast.info('No changes to save', {
						description: 'No modifications were made to any companies.',
					});
					return;
				}

				// Get DTOs for changed companies
				const changedCompanies = companiesWithChanges
					.map((c) => c.getUpdateDTO())
					.filter((dto) => dto !== null) as UpdateCompanyDTO[];

				toast.info('Saving changes', {
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

				toast.success('Changes saved', {
					description: `Successfully saved ${changedCompanies.length} companies`,
				});
			} catch (error) {
				console.error('Error saving companies:', error);
				toast.error('Error saving companies', {
					description: error instanceof Error ? error.message : 'Failed to save companies',
				});
				throw error;
			} finally {
				set({isSaving: false});
			}
		},

		refreshSearchData: async () => {
			const {benchmarkId} = get();
			if (!benchmarkId) {
				toast.error('Error', {
					description: 'No benchmark selected',
				});
				return;
			}

			set({isRefreshing: true});

			try {
				const {companies: searchData, error} = await companyActions.getCompaniesSearchData(benchmarkId);

				if (error) {
					toast.error('Error', {
						description: error,
					});
					return;
				}

				// Create a dictionary of companies by ID for efficient lookups
				const companiesById = new Map(
					searchData.map(company => [company.id, company])
				);

				// Update companies in the store
				const companies = get().companies.map(company => {
					const searchData = companiesById.get(company.id);
						if (!searchData) return company;

						company.updateSearchData(searchData.searchId, searchData.searchedCompanyData);
						return company;
				});

				get().setCompanies(companies);

				toast.success('Success', {
					description: 'Search data refreshed successfully',
				});
			} catch (error) {
				console.error('Error refreshing search data:', error);
				toast.error('Error refreshing search data', {
					description: error instanceof Error ? error.message : 'Failed to refresh search data',
				});
			} finally {
				set({isRefreshing: false});
			}
		},

		areAllCompaniesProcessed: () => {
			const companies = get().companies;
			// Check if there are any companies with search in progress
			return !companies.some(company => {
				// Check if the company has a search in progress based on categories
				if (!company.categoryValues) return false;
				
				const searchCategory = company.categoryValues.WEBSEARCH;
				if (!searchCategory) return false;
				
				// Check for the in_progress status which includes "FRONTEND_INITIALIZED", "IN_QUEUE", and "IN_PROGRESS" 
				return searchCategory.category.status === 'in_progress';
			});
		},

		startAutoRefresh: () => {
			// Only start if not already running
			if (autoRefreshInterval) {
				return;
			}

			// Set the start time
			autoRefreshStartTime = Date.now();
			
			// Set autoRefreshEnabled flag
			set({ autoRefreshEnabled: true });
			
			// Perform initial refresh
			get().refreshSearchData();

			// Create interval for auto-refresh
			autoRefreshInterval = setInterval(async () => {
				// Check if maximum duration has elapsed
				const currentTime = Date.now();
				if (autoRefreshStartTime && currentTime - autoRefreshStartTime > MAX_AUTO_REFRESH_DURATION) {
					get().stopAutoRefresh();
					toast.info('Auto-refresh stopped after 7 minutes');
					return;
				}

				// Execute refresh
				await get().refreshSearchData();

				// Check if all companies are processed
				if (get().areAllCompaniesProcessed()) {
					get().stopAutoRefresh();
					toast.success('All company searches completed!');
				}
			}, AUTO_REFRESH_INTERVAL);
		},

		stopAutoRefresh: () => {
			// Clear the interval if it exists
			if (autoRefreshInterval) {
				clearInterval(autoRefreshInterval);
				autoRefreshInterval = null;
				autoRefreshStartTime = null;
				set({ autoRefreshEnabled: false });
			}
		},
	};
});
