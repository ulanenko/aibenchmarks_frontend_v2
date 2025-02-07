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
import {getAllClients} from '@/services/api/clients';
import {ClientFormDialog} from '@/components/clients/client-form-dialog';

export const benchmarkSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	year: z
		.number()
		.min(2000, 'Year must be 2000 or later')
		.max(new Date().getFullYear() + 10, 'Year cannot be too far in the future'),
	clientId: z.number().min(1, 'Client is required'),
	lang: z.string().optional(),
});

export const BenchmarkFields: Record<string, FieldDefinition> = {
	name: {
		type: 'text',
		label: 'Name',
		description: 'The name of the benchmark',
		placeholder: 'Enter benchmark name',
		icon: TagIcon,
	} satisfies TextFieldDefinition,
	year: {
		type: 'number',
		label: 'Year',
		description: 'The year this benchmark was created',
		placeholder: 'Enter year',
		icon: CalendarIcon,
		getDefaultValue: () => {
			// Default to previous year if in first half of current year
			return new Date().getFullYear() - (new Date().getMonth() < 6 ? 2 : 1);
		},
	} satisfies NumberFieldDefinition,
	clientId: {
		type: 'relationship',
		label: 'Client',
		description: 'The client this benchmark was created for',
		placeholder: 'Select a client',
		icon: BuildingIcon,
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
	} satisfies RelationshipFieldDefinition,
	lang: {
		type: 'text',
		label: 'Language',
		description: 'The primary language used in this benchmark (optional)',
		placeholder: 'Enter language',
		icon: GlobeIcon,
		optional: true,
	} satisfies TextFieldDefinition,
	createdAt: {
		type: 'date',
		label: 'Created At',
		description: 'When this benchmark was created',
		icon: ClockIcon,
		readOnly: true,
	} satisfies DateFieldDefinition,
	updatedAt: {
		type: 'date',
		label: 'Last Updated',
		description: 'When this benchmark was last updated',
		icon: ClockIcon,
		readOnly: true,
		optional: true,
	} satisfies DateFieldDefinition,
};
