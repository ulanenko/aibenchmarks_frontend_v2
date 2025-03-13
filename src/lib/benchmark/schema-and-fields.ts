import {CalendarIcon, BuildingIcon, GlobeIcon, TagIcon, ClockIcon} from 'lucide-react';
import {
	EntityDefinition,
	type TextFieldDefinition,
	type NumberFieldDefinition,
	type FieldDefinition,
	type DateFieldDefinition,
	type RelationshipFieldDefinition,
} from '@/lib/field-definition';
import {z} from 'zod';
import {getAllClients} from '@/services/client/clients';
import {ClientFormDialog} from '@/components/clients/client-form-dialog';
import {Benchmark} from './benchmark';
import {LucideIcon} from 'lucide-react';
import {ElementType} from 'react';
import {Building2, CalendarDays, Clock, Tag, Globe} from 'lucide-react';
import {BenchmarkDTO} from './type';

// Define a type for sort functions
export type SortFunction = (a: BenchmarkDTO, b: BenchmarkDTO) => number;

// Define sortable field properties
export type SortableField = {
	sortable?: boolean;
	getSortFunction?: () => SortFunction;
};

export const benchmarkSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	year: z
		.number()
		.min(2000, 'Year must be 2000 or later')
		.max(new Date().getFullYear() + 10, 'Year cannot be too far in the future'),
	clientId: z.number().min(1, 'Client is required'),
	lang: z.string().optional(),
	mappingSettings: z.any().optional(),
});

// Helper function for type safety
function extendField<T extends FieldDefinition>(field: T, sortable?: SortableField): T & SortableField {
	return {...field, ...(sortable || {})};
}

export const BenchmarkFields = {
	name: extendField<TextFieldDefinition>(
		{
			type: 'text',
			label: 'Name',
			icon: Tag,
			placeholder: 'Enter benchmark name',
			description: 'The name of the benchmark',
		},
		{
			sortable: true,
			getSortFunction: () => (a: BenchmarkDTO, b: BenchmarkDTO) => a.name.localeCompare(b.name),
		},
	),
	year: extendField<NumberFieldDefinition>(
		{
			type: 'number',
			label: 'Year',
			icon: CalendarDays,
			placeholder: 'Enter year',
			description: 'The year this benchmark was created',
			getDefaultValue: () => {
				// Default to previous year if in first half of current year
				return new Date().getFullYear() - (new Date().getMonth() < 6 ? 2 : 1);
			},
		},
		{
			sortable: true,
			getSortFunction: () => (a: BenchmarkDTO, b: BenchmarkDTO) => b.year - a.year,
		},
	),
	clientId: extendField<RelationshipFieldDefinition>(
		{
			type: 'relationship',
			label: 'Client',
			icon: Building2,
			placeholder: 'Select client',
			description: 'The client this benchmark was created for',
			options:
				typeof window === 'undefined'
					? Promise.resolve([])
					: getAllClients().then((clients) =>
							clients.map((client) => ({
								value: client.id,
								label: client.name,
							})),
					  ),
			formComponent: ClientFormDialog,
		},
		{
			sortable: true,
			getSortFunction: () => (a: BenchmarkDTO, b: BenchmarkDTO) => {
				const clientA = a.clientName || '';
				const clientB = b.clientName || '';
				return clientA.localeCompare(clientB);
			},
		},
	),
	lang: {
		type: 'text',
		label: 'Language',
		description: 'The primary language used in this benchmark (optional)',
		placeholder: 'Enter language',
		icon: Globe,
		optional: true,
	} as TextFieldDefinition,
	createdAt: extendField<DateFieldDefinition>(
		{
			type: 'date',
			label: 'Date Added',
			icon: Clock,
			description: 'When this benchmark was created',
			readOnly: true,
		},
		{
			sortable: true,
			getSortFunction: () => (a: BenchmarkDTO, b: BenchmarkDTO) =>
				new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
		},
	),
	updatedAt: extendField<DateFieldDefinition>(
		{
			type: 'date',
			label: 'Last Edited',
			icon: Clock,
			description: 'When this benchmark was last updated',
			readOnly: true,
			optional: true,
		},
		{
			sortable: true,
			getSortFunction: () => (a: BenchmarkDTO, b: BenchmarkDTO) => {
				const dateA = a.updatedAt || a.createdAt;
				const dateB = b.updatedAt || b.createdAt;
				return new Date(dateB).getTime() - new Date(dateA).getTime();
			},
		},
	),
};

// Helper function to get sortable fields
export function getSortableFields() {
	return Object.entries(BenchmarkFields)
		.filter(([_, field]) => 'sortable' in field && field.sortable)
		.map(([key, field]) => {
			// Use type assertion to tell TypeScript this is a field with sortable properties
			const sortableField = field as FieldDefinition & SortableField;
			return {
				key,
				label: sortableField.label,
				icon: sortableField.icon,
				sortFn: sortableField.getSortFunction
					? sortableField.getSortFunction()
					: (a: BenchmarkDTO, b: BenchmarkDTO) => 0,
			};
		});
}
