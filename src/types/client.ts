// Base type from database schema
export type ClientType = {
	id: number;
	name: string;
	createdAt: Date;
	updatedAt: Date | null;
	description: string | null;
};

// Core client type for the application
export type Client = ClientType;

// Type for client creation
export type CreateClientInput = Omit<ClientType, 'id' | 'createdAt' | 'updatedAt'>;

// Type for client update
export type UpdateClientInput = Partial<CreateClientInput>;

// Type for client with UI-specific properties
export interface ClientWithUI extends Client {
	isSelected?: boolean;
	isEditing?: boolean;
	validationErrors?: Record<string, string>;
}

// Export the base type for use in other type definitions
export type ClientBase = Client;
