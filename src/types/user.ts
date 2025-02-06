// Base type from database schema
export type UserType = {
	id: number;
	name: string;
	createdAt: Date;
	updatedAt: Date | null;
	email: string;
	isAdmin: boolean;
	password: string;
};

// Core user type for the application
export type User = UserType;

// Type for user creation
export type CreateUserInput = Omit<UserType, 'id' | 'createdAt' | 'updatedAt'>;

// Type for user update
export type UpdateUserInput = Partial<Omit<CreateUserInput, 'password'>>;

// Type for user with UI-specific properties
export interface UserWithUI extends Omit<User, 'password'> {
	isSelected?: boolean;
	isEditing?: boolean;
	validationErrors?: Record<string, string>;
}

// Public user type (without sensitive information)
export type UserBase = Omit<User, 'password'>;
