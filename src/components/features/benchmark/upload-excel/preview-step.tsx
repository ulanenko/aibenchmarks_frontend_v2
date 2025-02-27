'use client';

import * as React from 'react';
import {useState, useEffect} from 'react';
import {Button} from '@/components/ui/button';
import {Loader2} from 'lucide-react';
import {StepProps} from './types';
import {Company} from '@/lib/company/company';
import {CompanyDTO} from '@/lib/company/type';

export function PreviewStep({state, updateState, onNext, onBack}: StepProps) {
	const [previewCount, setPreviewCount] = useState(5); // Number of rows to preview
	const {columnMappings} = state;
	const companiesMapped =
		state.extractedData?.jsonData?.map((row) => {
			return Object.entries(row).reduce((acc, [key, value]) => {
				const mappedKey = columnMappings?.[key];
				if (mappedKey) {
					acc[mappedKey] = value;
				}
				return acc;
			}, {} as Record<string, any>);
		}) || [];

	console.log(companiesMapped);

	const handleImport = () => {
		onNext();
	};

	if (state.isLoading) {
		return (
			<div className="flex flex-col items-center justify-center py-12">
				<Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
				<p className="text-muted-foreground">Loading preview data...</p>
			</div>
		);
	}

	return (
		<div className="grid gap-6 py-4">
			{state.error && <div className="bg-destructive/15 text-destructive p-3 rounded-md text-sm">{state.error}</div>}

			<div className="space-y-4">
				<h3 className="text-lg font-medium">Preview Data</h3>
				<p className="text-sm text-muted-foreground">
					Review the data before importing. Showing {Math.min(previewCount, companiesMapped.length)} of{' '}
					{companiesMapped.length} rows.
				</p>
			</div>

			<div className="border rounded-md overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full text-sm">
						<thead>
							<tr className="bg-muted">
								<th className="px-4 py-2 text-left font-medium">Company Name</th>
								<th className="px-4 py-2 text-left font-medium">Country</th>
								<th className="px-4 py-2 text-left font-medium">Website</th>
							</tr>
						</thead>
						<tbody>
							{companiesMapped.slice(0, previewCount).map((company, index) => (
								<tr key={index} className="border-t">
									<td className="px-4 py-2">{company.name}</td>
									<td className="px-4 py-2">{company.country}</td>
									<td className="px-4 py-2">{company.url}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			{companiesMapped.length > previewCount && (
				<Button
					variant="outline"
					onClick={() => setPreviewCount((prev) => Math.min(prev + 5, companiesMapped.length))}
					className="w-full"
				>
					Show more rows
				</Button>
			)}

			<div className="flex justify-between mt-4">
				<Button variant="outline" onClick={onBack} disabled={state.isProcessing}>
					← Back
				</Button>
				<Button onClick={handleImport} disabled={companiesMapped.length === 0 || state.isProcessing}>
					{state.isProcessing ? (
						<>
							<Loader2 className="h-4 w-4 mr-2 animate-spin" />
							Importing...
						</>
					) : (
						<>Import Data</>
					)}
				</Button>
			</div>
		</div>
	);
}
