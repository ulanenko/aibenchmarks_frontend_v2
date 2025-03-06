'use client';

import React, {useState, useEffect} from 'react';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from '@/components/ui/dialog';
import {Button} from '@/components/ui/button';
import {Info, FileText} from 'lucide-react';
import {Company, CompanyHotCopy} from '@/lib/company/company';
import {useToast} from '@/hooks/use-toast';
import {Tabs, TabsList, TabsTrigger, TabsContent} from '@/components/ui/tabs';
import {useCompanyStore} from '@/stores/use-company-store';
import {UpdateCompanyDTO} from '@/lib/company/type';
import {updateCompany} from '@/services/client';
import {VALIDATION} from '@/config/validation';

interface DescriptionModalProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	company?: Company | CompanyHotCopy;
}

export function DescriptionModal({isOpen, onOpenChange, company}: DescriptionModalProps) {
	const [activeTab, setActiveTab] = useState<string>('trade');
	const [customDescription, setCustomDescription] = useState<string>('');
	const [wordCount, setWordCount] = useState<number>(0);
	const {toast} = useToast();
	const companies = useCompanyStore((state) => state.companies);
	const [isSaving, setIsSaving] = useState(false);

	// Reset state when modal is opened or closed
	useEffect(() => {
		// When modal opens, reset to the company's state
		if (isOpen) {
			if (!company) {
				setActiveTab('trade'); // Default tab
				setCustomDescription('');
				setWordCount(0);
			} else if (company.inputValues?.fullOverviewManual) {
				setActiveTab('custom'); // Select custom tab if there's a custom description
				setCustomDescription(company.inputValues.fullOverviewManual);
				setWordCount(company.inputValues.fullOverviewManual.trim().split(/\s+/).length);
			} else {
				setActiveTab('trade'); // Default tab
				setCustomDescription('');
				setWordCount(0);
			}
		}
	}, [isOpen, company]);

	const handleCustomDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const text = e.target.value;
		setCustomDescription(text);
		setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
	};

	const handleSaveChanges = async () => {
		if (!company) return;

		try {
			// Update the company with the custom description
			if (activeTab === 'custom' && customDescription.trim()) {
				// Get the company ID
				const companyId = 'id' in company ? company.id : null;
				if (!companyId) {
					throw new Error('Company ID is missing');
				}

				setIsSaving(true);

				// Use our new updateCompany service to save the change
				const result = await updateCompany(companyId, {
					fullOverviewManual: customDescription.trim(),
				});

				if (!result) {
					throw new Error('Failed to update company');
				}

				// Toast notification is handled within the updateCompany service
			}

			onOpenChange(false);
		} catch (error) {
			// Show error toast
			toast({
				title: 'Error saving description',
				description: error instanceof Error ? error.message : 'Failed to save description',
				variant: 'destructive',
			});
		} finally {
			setIsSaving(false);
		}
	};

	// Get the company name or a default
	const companyName = company?.inputValues?.name || 'Company';

	// Get the minimum word count from config
	const minWordCount = VALIDATION.COMPANY_DESCRIPTION_MIN_WORDS;

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-3xl">
				<DialogHeader>
					<DialogTitle>{companyName} - (custom) description for AI analysis</DialogTitle>
				</DialogHeader>
				<p className="text-sm text-black mt-2">
					<Info className="inline-block h-4 w-4 mr-2 align-text-bottom" />
					This description will be used as a <strong>fallback</strong> to determine the company&apos;s functionality if{' '}
					<strong>no accessible website</strong> can be found.
				</p>
				<div className="mb-4">
					<p className="text-sm text-gray-600 mb-2">
						<strong>Custom description</strong>
					</p>
					<p className="text-sm text-gray-600">
						You can also upload a custom description that will be used instead of the database. The format and language
						of the description don't matter, but for a <strong>successful analysis</strong>, a description should be at
						least <strong>{minWordCount} words</strong> long and include the following: 1. Main products/services, 2.
						Key business activities, 3. Legal structure
					</p>
				</div>

				<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full ">
					<TabsList className="grid grid-cols-3">
						<TabsTrigger value="trade">Trade Description</TabsTrigger>
						<TabsTrigger value="full">Full Overview</TabsTrigger>
						<TabsTrigger value="custom">Custom Description</TabsTrigger>
					</TabsList>

					<TabsContent value="trade">
						{company?.inputValues?.tradeDescriptionEnglish ? (
							<textarea
								className="w-full border border-gray-200 rounded-md p-3 h-48 text-sm bg-gray-50"
								value={company.inputValues.tradeDescriptionEnglish}
								readOnly
							/>
						) : (
							<p className="text-sm italic text-gray-500 p-3 border border-gray-200 rounded-md bg-gray-50 h-48 flex items-center justify-center">
								No trade description available
							</p>
						)}
					</TabsContent>

					<TabsContent value="full">
						{company?.inputValues?.fullOverview ? (
							<textarea
								className="w-full border border-gray-200 rounded-md p-3 h-48 text-sm bg-gray-50"
								value={company.inputValues.fullOverview}
								readOnly
							/>
						) : (
							<p className="text-sm italic text-gray-500 p-3 border border-gray-200 rounded-md bg-gray-50 h-48 flex items-center justify-center">
								No full overview available
							</p>
						)}
					</TabsContent>

					<TabsContent value="custom">
						<textarea
							className="w-full border border-gray-300 rounded-md p-3 h-48 text-sm"
							placeholder="Enter a custom description..."
							value={customDescription}
							onChange={handleCustomDescriptionChange}
						/>
						<div className="flex justify-between items-center mt-2">
							<span className={`text-xs ${wordCount < minWordCount ? 'text-red-500' : 'text-gray-500'}`}>
								<strong>Minimum {minWordCount} words required</strong>
							</span>
							<span className="text-xs text-gray-500">{wordCount} words</span>
						</div>
					</TabsContent>
				</Tabs>

				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Cancel
					</Button>
					<Button
						onClick={handleSaveChanges}
						disabled={(activeTab === 'custom' && wordCount < minWordCount) || isSaving}
					>
						{isSaving ? 'Saving...' : 'Save Changes'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
