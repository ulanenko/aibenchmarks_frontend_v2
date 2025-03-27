import { z } from 'zod';

// Field definitions for strategies
export const strategyFields = [
    { 
        key: 'name',
        label: 'Name', 
        placeholder: 'Enter strategy name',
        type: 'input', // Use input component
        validation: z.string().min(1, "Name is required")
    },
    { 
        key: 'idealProducts', 
        label: 'Ideal Products/Services to Accept',
        placeholder: 'Describe the products/services that should be accepted (e.g. new and used cars)',
        type: 'textarea', // Use textarea component
        validation: z.string().min(1, "Ideal products/services is required").optional().default("")
    },
    { 
        key: 'rejectProducts', 
        label: 'Products/Services to Reject',
        placeholder: 'Describe the products/services that should be rejected (e.g. motorcycles and bicycles)',
        type: 'textarea',
        validation: z.string().min(1, "Products to reject is required").optional().default("")
    },
    { 
        key: 'idealFunctionalProfile', 
        label: 'Ideal Functional Profile',
        placeholder: 'Describe the ideal functional profile (e.g. Distribution and wholesale)',
        type: 'textarea',
        validation: z.string().min(1, "Ideal functional profile is required").optional().default("")
    },
    { 
        key: 'rejectFunctions', 
        label: 'Functions/Activities to Reject',
        placeholder: 'Describe the functions/activities that should be rejected (e.g. Manufacturing and production)',
        type: 'textarea',
        validation: z.string().min(1, "Functions to reject is required").optional().default("")
    },
];

// Settings definitions for strategies
export const strategySettings = [
    { 
        key: 'relaxedProduct', 
        label: 'Products/Services Strict Mode',
        description: 'When enabled, products and services matching will be more strict, requiring exact matches.',
        inversed: true, // These are inverted in the UI
        validation: z.boolean().default(true)
    },
    { 
        key: 'relaxedFunction', 
        label: 'Functions Strict Mode',
        description: 'When enabled, functional profile matching will be more strict, requiring exact matches.',
        inversed: true,
        validation: z.boolean().default(true)
    },
    { 
        key: 'disabledIndependence', 
        label: 'Disable Independence Test',
        description: 'When enabled, independence status will not be considered in the analysis.',
        inversed: false, // This one isn't inverted
        validation: z.boolean().default(false)
    },
];

// Extract field keys for TypeScript types
export type StrategyFieldKey = typeof strategyFields[number]['key'];
export type StrategySettingKey = typeof strategySettings[number]['key'];

// Create Zod schema from fields
export const createStrategySchema = () => {
    const schemaObj: Record<string, any> = {};
    
    strategyFields.forEach(field => {
        schemaObj[field.key] = field.validation;
    });
    
    strategySettings.forEach(setting => {
        schemaObj[setting.key] = setting.validation;
    });
    
    return z.object(schemaObj);
};

// Base schema for forms
export const strategyBaseSchema = createStrategySchema();

// Full schema with DB fields
export const strategySchema = strategyBaseSchema.extend({
    id: z.number().optional(),
    userId: z.number().optional(),
    createdAt: z.date().optional(),
    updatedAt: z.date().nullable().optional(),
}); 