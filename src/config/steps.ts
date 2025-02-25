export type StepId = 'input' | 'websearch' | 'review' | 'humanreview';

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
		id: 'review',
		number: 3,
		label: 'Accept/Reject',
		description: 'Review the found data and accept or reject the matches for each company.',
		configs: {
			completed: {
				value: 'Reviewed',
				label: 'Data Reviewed',
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
