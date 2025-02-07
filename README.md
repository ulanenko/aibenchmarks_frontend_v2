# Benchmark Management System

A modern web application for managing benchmarks and company data, built with Next.js, TypeScript, and a robust type-safe API layer.

## Project Structure

```
src/
├── app/                    # Next.js app router pages and API routes
│   ├── api/               # API routes with consistent patterns
│   └── (routes)/          # App pages and layouts
├── components/            # React components
│   ├── features/         # Feature-specific components
│   ├── layout/           # Layout components
│   └── ui/               # Reusable UI components
├── db/                   # Database schema and configurations
├── lib/                  # Shared utilities and types
│   ├── auth/            # Authentication configuration
│   └── */type.ts        # Domain-specific types
├── services/            # Service layer
│   ├── api/            # API client services
│   └── server/         # Server-side services
└── stores/             # Client-side state management
```

## Key Features

- Type-safe API layer with consistent patterns
- Server-side and client-side service separation
- Robust error handling
- Clean architecture with separation of concerns
- Modern UI with responsive design

## Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: NextAuth.js
- **State Management**: Zustand
- **UI Components**: Shadcn/ui
- **Styling**: Tailwind CSS

## API Design

Our API follows a consistent design pattern documented in [API Design Guidelines](docs/api-design.md). Key features include:

- RESTful endpoints
- Consistent response formats
- Type-safe requests and responses
- Proper error handling
- Clear separation of concerns

### Type System

```typescript
// Database Types
type CompanyDBType = typeof company.$inferSelect;

// DTOs
type CompanyDTO = {
	id: number;
	name: string;
	// ... other fields
};

// API Responses
type APIResponse<T> = {
	error?: string;
} & T;
```

### Service Layer

```typescript
// Server Service
export async function getById(id: number): Promise<ResourceDBType | null> {
	const [result] = await db.select().from(resource).where(eq(resource.id, id));
	return result || null;
}

// API Client
export async function getResource(id: number): Promise<ResourceDTO> {
	const response = await fetch(`/api/resource/${id}`);
	const data = (await response.json()) as APIResponse<{resource: ResourceDTO}>;

	if (!response.ok) {
		throw new Error(data.error || 'Failed to fetch resource');
	}

	return data.resource;
}
```

## Development Setup

1. Clone the repository

   ```bash
   git clone [repository-url]
   cd [project-directory]
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Set up environment variables

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your values
   ```

4. Set up the database

   ```bash
   npm run db:push  # Apply schema changes
   npm run db:seed  # (Optional) Seed initial data
   ```

5. Start the development server
   ```bash
   npm run dev
   ```

## Code Style and Best Practices

1. **Type Safety**

   - Use explicit types for all functions and variables
   - Leverage TypeScript's type inference where appropriate
   - Keep DTOs and database types separate

2. **API Patterns**

   - Follow RESTful conventions
   - Use consistent response formats
   - Implement proper error handling
   - Document API changes

3. **Component Structure**

   - Keep components focused and reusable
   - Use proper TypeScript types for props
   - Implement error boundaries where needed

4. **State Management**
   - Use Zustand for global state
   - Keep state logic in dedicated stores
   - Implement proper type safety for stores

## Testing

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- [test-file-pattern]

# Run tests in watch mode
npm test -- --watch
```

## Deployment

The application can be deployed to any platform that supports Next.js applications. We recommend Vercel for the best integration experience.

1. Push your changes to the main branch
2. Vercel will automatically deploy the changes
3. Review the deployment and verify functionality

## Contributing

1. Create a feature branch

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes following our code style guidelines

3. Submit a pull request with:
   - Clear description of changes
   - Any relevant documentation updates
   - Test coverage for new features

## License

[Your License] - See LICENSE file for details
