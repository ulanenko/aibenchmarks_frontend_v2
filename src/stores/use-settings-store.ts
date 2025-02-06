import {create} from 'zustand';
import {persist} from 'zustand/middleware';

interface ColumnVisibility {
	[key: string]: boolean;
}

interface ColumnWidth {
	[key: string]: number;
}

interface ColumnOrder {
	[key: string]: number;
}

interface BenchmarkSettings {
	visibility: ColumnVisibility;
	widths: ColumnWidth;
	order: ColumnOrder;
}

interface SettingsStore {
	settings: Record<string, BenchmarkSettings>;
	getSettings: (benchmarkId: string) => BenchmarkSettings;
	updateColumnVisibility: (
		benchmarkId: string,
		columnKey: string,
		isVisible: boolean,
		newVisibility?: Record<string, boolean>,
	) => void;
	resetSettings: (benchmarkId: string, defaultVisibility?: Record<string, boolean>) => void;
	updateColumnWidth: (benchmarkId: string, columnKey: string, width: number) => void;
	updateColumnOrder: (benchmarkId: string, columnKey: string, order: number) => void;
	bulkUpdateSettings: (benchmarkId: string, settings: Partial<BenchmarkSettings>) => void;
}

const defaultSettings: BenchmarkSettings = {
	visibility: {},
	widths: {},
	order: {},
};

export const useSettingsStore = create<SettingsStore>()(
	persist(
		(set, get) => ({
			settings: {},

			getSettings: (benchmarkId) => {
				return get().settings[benchmarkId] ?? defaultSettings;
			},

			updateColumnVisibility: (benchmarkId, columnKey, isVisible, newVisibility) => {
				set((state) => {
					const currentSettings = state.settings[benchmarkId] ?? {...defaultSettings};
					return {
						settings: {
							...state.settings,
							[benchmarkId]: {
								...currentSettings,
								visibility: newVisibility ?? {
									...currentSettings.visibility,
									[columnKey]: isVisible,
								},
							},
						},
					};
				});
			},

			resetSettings: (benchmarkId, defaultVisibility = {}) => {
				set((state) => ({
					settings: {
						...state.settings,
						[benchmarkId]: {
							...defaultSettings,
							visibility: defaultVisibility,
						},
					},
				}));
			},

			updateColumnWidth: (benchmarkId, columnKey, width) => {
				set((state) => ({
					settings: {
						...state.settings,
						[benchmarkId]: {
							...(state.settings[benchmarkId] || defaultSettings),
							widths: {
								...(state.settings[benchmarkId]?.widths || {}),
								[columnKey]: width,
							},
						},
					},
				}));
			},

			updateColumnOrder: (benchmarkId, columnKey, order) => {
				set((state) => ({
					settings: {
						...state.settings,
						[benchmarkId]: {
							...(state.settings[benchmarkId] || defaultSettings),
							order: {
								...(state.settings[benchmarkId]?.order || {}),
								[columnKey]: order,
							},
						},
					},
				}));
			},

			bulkUpdateSettings: (benchmarkId, newSettings) => {
				set((state) => ({
					settings: {
						...state.settings,
						[benchmarkId]: {
							...(state.settings[benchmarkId] || defaultSettings),
							...newSettings,
						},
					},
				}));
			},
		}),
		{
			name: 'benchmark-settings',
		},
	),
);
