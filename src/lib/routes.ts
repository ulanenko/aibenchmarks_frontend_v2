export const routes = {
	dashboard: {
		home: () => '/',
	},
	benchmarks: {
		list: () => '/benchmarks',
		detail: (id: number) => `/benchmarks/${id}`,
		companies: (id: number) => `/benchmarks/${id}/steps/companies`,
	},
	strategies: {
		list: () => '/strategies',
	},
	// Add other route categories...
} as const;
