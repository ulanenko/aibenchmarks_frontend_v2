import {client} from '@/db/schema';

export type ClientDBType = typeof client.$inferSelect;

// Core client type for the application
export type ClientDTO = ClientDBType;

// Type for client creation
export type CreateClientDTO = Omit<ClientDTO, 'id' | 'createdAt' | 'updatedAt'>;

// Type for client update
export type UpdateClientDTO = Partial<Omit<CreateClientDTO, 'id'>> & {id: number};
