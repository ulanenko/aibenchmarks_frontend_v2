# Benchmark Process Components

This directory contains reusable components for the benchmark process workflow.

## BenchmarkStepLayout

The `BenchmarkStepLayout` component provides a consistent layout for all benchmark step pages. It encapsulates common UI elements and behavior, allowing each step to customize specific content while maintaining a uniform structure and user experience.

### Usage

```tsx
import {BenchmarkStepLayout} from '@/components/features/benchmark/benchmark-step-layout';

// Inside your page component
return (
	<BenchmarkStepLayout
		stepNumber={1}
		pageTitle="Step Title"
		pageDescription="Description of this step"
		helpSheetTitle="Help Sheet Title"
		helpSheetContent={<YourHelpContent />}
		companies={companies}
		isLoading={isLoading}
		categoryColumn={companyColumns.someStatusColumn}
		hotInstance={hotInstance}
		toolbarContent={<YourToolbarContent />}
		mainContent={<YourMainContent />}
		footerActions={<YourFooterActions />}
		additionalContent={<YourAdditionalContent />}
	/>
);
```

### Props

| Prop                | Type             | Description                                                    |
| ------------------- | ---------------- | -------------------------------------------------------------- |
| `stepNumber`        | `number`         | Current step number in the benchmark process                   |
| `pageTitle`         | `string`         | Title of the page                                              |
| `pageDescription`   | `string`         | Brief description of the step                                  |
| `helpSheetTitle`    | `string`         | Title for the help sheet dialog                                |
| `helpSheetContent`  | `ReactNode`      | Content for the help sheet dialog                              |
| `companies`         | `Company[]`      | List of companies being processed                              |
| `isLoading`         | `boolean`        | Loading state                                                  |
| `categoryColumn`    | `CategoryColumn` | Column definition used for categorizing companies in this step |
| `hotInstance`       | `Handsontable`   | Reference to the Handsontable instance                         |
| `toolbarContent`    | `ReactNode`      | Custom content for the toolbar area                            |
| `mainContent`       | `ReactNode`      | Main content area of the step                                  |
| `footerActions`     | `ReactNode`      | Action buttons for the footer                                  |
| `additionalContent` | `ReactNode`      | Optional additional content (modals, dialogs, etc.)            |

## Creating a New Step Page

To create a new benchmark step page using the common layout:

1. Create a new directory for your step under `src/app/benchmarks/[id]/steps/your-step-name/`
2. Create a `page.tsx` file in this directory
3. Import the `BenchmarkStepLayout` component
4. Implement step-specific logic and UI components
5. Render the `BenchmarkStepLayout` with appropriate props

### Example Structure

```tsx
'use client';

import {use, useEffect, useState} from 'react';
import {BenchmarkStepLayout} from '@/components/features/benchmark/benchmark-step-layout';
import {useCompanyStore} from '@/stores/use-company-store';
import {useShallow} from 'zustand/react/shallow';
import {companyColumns} from '@/lib/company/company-columns';
import Handsontable from 'handsontable';

// Step-specific imports
import {YourStepSpecificComponent} from './your-step-specific-component';

interface Props {
	params: Promise<{id: string}>;
}

export default function YourBenchmarkStepPage({params}: Props) {
	const {id} = use(params);
	const benchmarkId = parseInt(id);
	const [hotInstance, setHotInstance] = useState<Handsontable | undefined>(undefined);

	// Step-specific state and logic

	// Help content for this step
	const helpContent = <div className="prose prose-sm">{/* Your help content */}</div>;

	// Main content
	const mainContent = <YourStepSpecificComponent onHotInstanceReady={setHotInstance} />;

	// Footer actions
	const footerActions = <>{/* Your action buttons */}</>;

	return (
		<BenchmarkStepLayout
			stepNumber={X} // Your step number
			pageTitle="Your Step Title"
			pageDescription="Description of your step"
			helpSheetTitle="Your Step Help"
			helpSheetContent={helpContent}
			companies={companies}
			isLoading={isLoading}
			categoryColumn={companyColumns.yourStepStatusColumn}
			hotInstance={hotInstance}
			mainContent={mainContent}
			footerActions={footerActions}
		/>
	);
}
```

## Best Practices

1. Keep step-specific logic and UI components separate from the layout
2. Maintain consistent naming conventions for files and components
3. Reuse existing column definitions where possible
4. Follow the established pattern for hooks and state management
5. Document any step-specific components or behavior
