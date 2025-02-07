# API Design Guidelines

## Type System

The API uses a layered type system for end-to-end type safety:

1. **Database Types** (e.g., `CompanyDBType`)

   - Direct representation of database schema
   - Used for internal database operations

   ```typescript
   type CompanyDBType = typeof company.$inferSelect;
   ```

2. **Insert Types** (e.g., `CompanyInsert`)

   - Used for database insertions
   - Excludes auto-generated fields

   ```typescript
   type CompanyInsert = Omit<CompanyDBType, 'id' | 'createdAt' | 'updatedAt'>;
   ```

3. **DTOs (Data Transfer Objects)**

   - Define the API contract
   - Used for client-server communication

   ```typescript
   // Base DTO
   type CompanyDTO = {
   	id: number;
   	name: string;
   	// ... other fields
   };

   // Create DTO - for new resources
   type CreateCompanyDTO = Omit<CompanyDTO, 'id' | 'createdAt' | 'updatedAt'>;

   // Update DTO - for mutations
   type UpdateCompanyDTO = Partial<Omit<CompanyDTO, 'id'>> & {id: number};
   ```

## Response Format

All API responses follow a consistent format:

### Success Responses

```typescript
// Single resource
{
  [resourceName]: ResourceDTO;  // e.g., { benchmark: BenchmarkDTO }
}

// Collection of resources
{
  [resourceName]: ResourceDTO[];  // e.g., { benchmarks: BenchmarkDTO[] }
}
```

### Error Responses

```typescript
{
	error: string; // Human-readable error message
}
```

## API Client Response Type

```typescript
// Generic type for handling API responses
type APIResponse<T> = {
	error?: string;
} & T;

// Usage examples
type GetBenchmarksResponse = APIResponse<{benchmarks: BenchmarkDTO[]}>;
type CreateBenchmarkResponse = APIResponse<{benchmark: BenchmarkDTO}>;
```

## HTTP Status Codes

- `200`: Successful GET/PUT request
- `201`: Successful POST request (resource created)
- `400`: Bad Request (invalid input)
- `401`: Unauthorized
- `404`: Resource not found
- `500`: Server error

## Route Structure

Routes follow a RESTful pattern:

### Collection Routes

- `GET /api/[resource]` - List all resources
- `POST /api/[resource]` - Create new resource

### Single Resource Routes

- `GET /api/[resource]/{id}` - Get single resource
- `PUT /api/[resource]/{id}` - Update resource
- `DELETE /api/[resource]/{id}` - Delete resource

### Nested Resources

- `GET /api/[parent]/{id}/[child]` - List child resources
- `POST /api/[parent]/{id}/[child]` - Create child resource

## Service Layer

### Server Services

- Handle database operations
- Return nullable results for not found cases
- Use transactions for multi-operation changes
- Example:
  ```typescript
  export async function getById(id: number): Promise<ResourceDBType | null> {
  	const [result] = await db.select().from(resource).where(eq(resource.id, id));
  	return result || null;
  }
  ```

### API Client Services

- Handle HTTP requests
- Properly type and unwrap API responses
- Consistent error handling
- Example:

  ```typescript
  export async function getResource(id: number): Promise<ResourceDTO> {
  	const response = await fetch(`/api/resource/${id}`);
  	const data = (await response.json()) as APIResponse<{resource: ResourceDTO}>;

  	if (!response.ok) {
  		throw new Error(data.error || 'Failed to fetch resource');
  	}

  	return data.resource;
  }
  ```

## Error Handling

1. **Server-Side**

   - Log errors with stack traces
   - Return appropriate HTTP status codes
   - Provide descriptive error messages

   ```typescript
   catch (error) {
       console.error('Error description:', error);
       return NextResponse.json(
           { error: error instanceof Error ? error.message : 'Error description' },
           { status: 500 }
       );
   }
   ```

2. **Client-Side**
   - Check response.ok status
   - Handle error responses consistently
   - Throw errors with descriptive messages
   ```typescript
   if (!response.ok) {
   	throw new Error(data.error || 'Default error message');
   }
   ```

## Best Practices

1. **Type Safety**

   - Use explicit types for all requests and responses
   - Leverage TypeScript's type inference where appropriate
   - Keep DTOs and database types separate

2. **Response Consistency**

   - Always wrap responses in a named object
   - Use plural names for collections
   - Include appropriate status codes

3. **Error Handling**

   - Provide specific error messages
   - Use appropriate status codes
   - Log errors on the server side

4. **Code Organization**
   - Separate database logic into service layer
   - Keep API routes focused on HTTP concerns
   - Use consistent naming conventions
