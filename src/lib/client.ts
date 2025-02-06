import {BuildingIcon, FileTextIcon} from 'lucide-react';
import {EntityDefinition, type TextFieldDefinition, type FieldDefinition} from './field-definition';
import {z} from 'zod';

export const clientSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	description: z.string().optional(),
});

export type ClientSchemaType = z.infer<typeof clientSchema>;

export const ClientFields: Record<string, FieldDefinition> = {
	name: {
		type: 'text',
		label: 'Name',
		description: 'The name of the client',
		placeholder: 'Enter client name',
		icon: BuildingIcon,
	} satisfies TextFieldDefinition,
	description: {
		type: 'text',
		label: 'Description',
		description: 'Additional information about the client',
		placeholder: 'Enter client description',
		icon: FileTextIcon,
		optional: true,
	} satisfies TextFieldDefinition,
};
