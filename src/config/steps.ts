export type StepId = 'input' | 'websearch' | 'accept-reject' | 'humanreview';

export const BENCHMARK_STEPS = [
	{
		id: 'upload',
		number: 1,
		label: 'Upload Data',
		description: 'Upload your company data in Excel format. The system will validate and process your data.',
		configs: {
			completed: {
				value: 'Uploaded',
				label: 'Data Uploaded',
				color: 'blue',
			},
		},
	},
	{
		id: 'websearch',
		number: 2,
		label: 'Web Search',
		description: 'The system will automatically search for additional company information from reliable web sources.',
		configs: {
			completed: {
				value: 'Searched',
				label: 'Web Search Complete',
				color: 'blue',
			},
		},
	},
	{
		id: 'accept-reject',
		number: 3,
		label: 'Accept/Reject',
		description: 'Analyze company comparability based on product/service and functional profiles.',
		configs: {
			completed: {
				value: 'Analyzed',
				label: 'Comparability Analyzed',
				color: 'blue',
			},
		},
	},
	{
		id: 'humanreview',
		number: 4,
		label: 'Human Review',
		description: 'Perform a final review of the data and make any necessary manual adjustments.',
		configs: {
			completed: {
				value: 'Verified',
				label: 'Review Complete',
				color: 'blue',
			},
		},
	},
];
