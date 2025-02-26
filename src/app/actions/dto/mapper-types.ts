/**
 * Data Transfer Objects (DTOs) for column mapping functionality
 * These types define the shape of data transferred between client and server
 */

// Source column from an Excel file or other data source
export type SourceColumn = {
	key: string;
	title: string;
	sample?: string | number;
};

// Target column in our system
export type TargetColumn = {
	key: string;
	title: string;
	required?: boolean;
};

// Column mapping result - matches the type in upload-excel/types.ts
export type ColumnMapping = {
	targetColumn: string;
	sourceColumn: string;
};

// Result from the AI mapper
export type MappingResult = {
	mappings: Record<string, string> | null;
	success: boolean;
};
