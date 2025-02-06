import type {LucideIcon} from 'lucide-react';
import {z} from 'zod';

export interface BaseFieldDefinition {
	type: 'text' | 'number' | 'date' | 'select' | 'relationship';
	label: string;
	description?: string;
	placeholder?: string;
	icon?: LucideIcon;
	optional?: boolean;
	readOnly?: boolean;
}

export interface NumberFieldDefinition extends BaseFieldDefinition {
	type: 'number';
	getDefaultValue: () => number;
}

export interface TextFieldDefinition extends BaseFieldDefinition {
	type: 'text';
}

export interface DateFieldDefinition extends BaseFieldDefinition {
	type: 'date';
}

export interface RelationshipFieldDefinition extends BaseFieldDefinition {
	type: 'relationship';
	options: Promise<Array<{value: number; label: string}>>;
	formComponent: React.ComponentType<{
		mode?: 'standalone' | 'embedded';
		onCreated: (entity: {id: number; name: string}) => void;
		onCancel?: () => void;
	}>;
}

export type FieldDefinition =
	| NumberFieldDefinition
	| TextFieldDefinition
	| DateFieldDefinition
	| RelationshipFieldDefinition;

export class EntityDefinition<TSchema extends z.ZodObject<any, any>, TFields extends Record<string, FieldDefinition>> {
	constructor(public readonly schema: TSchema, public readonly fields: TFields) {}

	getDefaultValues(initialData?: any): z.infer<TSchema> {
		const defaults = {} as Record<string, any>;
		for (const [key, field] of Object.entries(this.fields)) {
			if (field.type === 'number' && 'getDefaultValue' in field) {
				defaults[key] = field.getDefaultValue();
			} else {
				defaults[key] = '';
			}
		}

		if (initialData) {
			// Convert null to undefined for optional fields
			const converted = Object.fromEntries(
				Object.entries(initialData).map(([key, value]) => [key, value === null ? undefined : value]),
			);
			return {...defaults, ...converted} as z.infer<TSchema>;
		}

		return defaults as z.infer<TSchema>;
	}

	getFieldProps(field: keyof TFields) {
		return this.fields[field];
	}

	getFieldLabel(field: keyof TFields) {
		const fieldDef = this.fields[field];
		return fieldDef.optional ? `${fieldDef.label} (Optional)` : fieldDef.label;
	}

	getFieldDescription(field: keyof TFields) {
		return this.fields[field].description;
	}

	getFieldPlaceholder(field: keyof TFields) {
		return this.fields[field].placeholder;
	}

	getFieldIcon(field: keyof TFields) {
		return this.fields[field].icon;
	}

	getFieldType(field: keyof TFields) {
		return this.fields[field].type;
	}
}
