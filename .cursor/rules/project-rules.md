# Benchmark Management System - Project Rules

This document outlines the code standards and project structure for the Benchmark Management System.

## Code Style and Formatting

- **Tab Width**: 2 spaces
- **Indentation**: Use tabs, not spaces
- **Line Length**: Maximum 120 characters
- **Quotes**: Use single quotes for strings
- **Trailing Commas**: Required in objects and arrays
- **Bracket Spacing**: No spaces inside braces for object literals
- **Semicolons**: Required at the end of statements
- **Line Endings**: LF (Unix-style)

## ESLint Rules

- **No Unused Variables**: Error level
- **No Explicit Any**: Warning level
- **React Hooks Rules**: Error level
- **React Hooks Exhaustive Dependencies**: Warning level

## Project Structure

### Directory Organization

- `/src/app`: Next.js App Router pages and layouts
- `/src/components`: React components, organized as follows:
  - `/ui`: Reusable UI components
  - `/features`: Feature-specific components
  - `/layout`: Layout components
  - `/providers`: Context providers
  - `/clients`: Client-side components
  - `/hot`: Hot-reloading components
  - `/company`: Company-related components
- `/src/db`: Database schema and configurations
- `/src/lib`: Shared utilities and helper functions
- `/src/services`: Service layer (API clients, server services)
- `/src/stores`: Client-side state management
- `/src/hooks`: Custom React hooks
- `/src/types`: TypeScript type definitions
- `/src/fonts`: Font assets

## Naming Conventions

### Files

- React components: `PascalCase.tsx`
- Utilities and libraries: `camelCase.ts`
- Custom hooks: `use-hookName.tsx`
- Next.js pages: `page.tsx`

### Code

- React components: `PascalCase`
- Custom hooks: `useHookName`
- Functions: `camelCase`
- Constants: `UPPER_SNAKE_CASE`

## Component Patterns

### UI Components

- Use Tailwind CSS for styling
- Use class-variance-authority for component variants
- Use forwardRef for components that need to forward refs
- Include proper TypeScript interfaces for props

### Custom Hooks

- Prefix with 'use' per React convention
- Include detailed TypeScript typing

## State Management

- Use Zustand for global state management
- Keep state logic in dedicated stores in `/src/stores`

## API Patterns

### Type Safety

- Separate database types and DTOs
- Use explicit typing for API responses
- Follow consistent response formats

### Service Layer

- Separation between server services and API client services
- Consistent error handling approach
- Server services in `/src/services/server`
- API clients in `/src/services/api`

## Authentication

- Use NextAuth.js for authentication
- Auth configuration in `/src/lib/auth`

## Database

- Use Drizzle ORM with PostgreSQL
- Schema definitions in `/src/db`

## Frameworks and Libraries

- UI: shadcn/ui
- Form Handling: react-hook-form
- Validation: zod

## Import Aliases

- `@/*` for imports from the `src` directory
