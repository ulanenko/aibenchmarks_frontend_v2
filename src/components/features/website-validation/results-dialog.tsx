import {useState} from 'react';
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import {Button} from '@/components/ui/button';
import {Check, X, AlertCircle, FileEdit, LucideIcon, ArrowRight} from 'lucide-react';
import {useToast} from '@/hooks/use-toast';
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from '@/components/ui/accordion';
import {Company} from '@/lib/company/company';

export interface WebsiteValidationResultsDialogProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	validatedCompanies: Company[];
}

interface CategoryItem {
	title: string;
	companies: Company[];
	colorClass: string;
	bgClass: string;
	icon: LucideIcon;
	iconColorClass: string;
}

// Helper function to normalize URLs for comparison
const normalizeUrl = (url: string | null): string => {
	if (!url) return '';
	let normalized = url.toLowerCase();
	// Remove protocol
	normalized = normalized.replace(/^https?:\/\//, '');
	// Remove www.
	normalized = normalized.replace(/^www\./, '');
	// Remove trailing slash
	normalized = normalized.replace(/\/$/, '');
	return normalized;
};

// Check if two URLs are essentially the same, ignoring protocol, www, and trailing slashes
const areSimilarUrls = (url1: string | null, url2: string | null): boolean => {
	if (!url1 || !url2) return false;
	return normalizeUrl(url1) === normalizeUrl(url2);
};

// Check if a URL has been fine-tuned (same core domain but with differences)
const isFineTunedUrl = (original: string | null, updated: string | null): boolean => {
	if (!original || !updated) return false;
	// If they're exactly the same, it's not fine-tuned
	if (original === updated) return false;

	// If they're completely different, it's not fine-tuned
	const originalNormalized = normalizeUrl(original);
	const updatedNormalized = normalizeUrl(updated);

	// Check if they're similar but not exactly the same
	return areSimilarUrls(original, updated);
};

// Helper function to ensure URL has protocol
const ensureProtocol = (url: string | null): string => {
	if (!url) return '';
	if (url.startsWith('http://') || url.startsWith('https://')) return url;
	return `https://${url}`;
};

export function WebsiteValidationResultsDialog({
	isOpen,
	onOpenChange,
	validatedCompanies,
}: WebsiteValidationResultsDialogProps) {
	const {toast} = useToast();
	const [isSaving, setIsSaving] = useState(false);

	const companyCategories: CategoryItem[] = [
		{
			title: 'Valid',
			companies: validatedCompanies.filter((comp) => comp.dynamicInputValues?.urlValidationStatus === 'correct'),
			colorClass: 'bg-green-500',
			bgClass: 'bg-green-50',
			icon: Check,
			iconColorClass: 'text-green-500',
		},
		{
			title: 'Fine-tuned',
			companies: validatedCompanies.filter((comp) => comp.dynamicInputValues?.urlValidationStatus === 'fine-tuned'),
			colorClass: 'bg-blue-500',
			bgClass: 'bg-blue-50',
			icon: FileEdit,
			iconColorClass: 'text-blue-500',
		},
		{
			title: 'Updated',
			companies: validatedCompanies.filter((comp) => comp.dynamicInputValues?.urlValidationStatus === 'updated'),
			colorClass: 'bg-yellow-500',
			bgClass: 'bg-yellow-50',
			icon: AlertCircle,
			iconColorClass: 'text-yellow-500',
		},
		{
			title: 'Invalid',
			companies: validatedCompanies.filter((comp) => comp.dynamicInputValues?.urlValidationStatus === 'invalid'),
			colorClass: 'bg-red-500',
			bgClass: 'bg-red-50',
			icon: X,
			iconColorClass: 'text-red-500',
		},
	];

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
				<DialogHeader>
					<DialogTitle>Website Validation Completed</DialogTitle>
				</DialogHeader>

				<div className="mt-2 overflow-y-auto flex-grow">
					<h3 className="text-muted-foreground text-sm mb-4">Website Validation Results</h3>

					<Accordion
						type="multiple"
						defaultValue={companyCategories.map((cat) => cat.title.toLowerCase())}
						className="space-y-4"
					>
						{companyCategories.map((category) => (
							<AccordionItem
								key={category.title.toLowerCase()}
								value={category.title.toLowerCase()}
								className="border rounded-md overflow-hidden"
							>
								<AccordionTrigger className={`px-4 py-3 ${category.bgClass} hover:no-underline`}>
									<div className="flex items-center gap-2">
										<div
											className={`${category.colorClass} text-white rounded-full h-6 w-6 flex items-center justify-center text-xs font-semibold`}
										>
											{category.companies.length}
										</div>
										<span className="font-medium">Companies with {category.title} Websites</span>
									</div>
								</AccordionTrigger>
								<AccordionContent className="px-0">
									<div className="p-3 divide-y max-h-[40vh] overflow-y-auto">
										{category.companies.map((company) => (
											<div key={company.id} className="py-2">
												<div className="flex items-center justify-between">
													<div className="flex items-center gap-2">
														<category.icon className={`h-4 w-4 ${category.iconColorClass}`} />
														<span className="font-medium">{company.name}</span>
													</div>
												</div>
												<div className="mt-1 ml-6 text-sm grid grid-cols-[1fr,auto,1fr] items-center gap-4">
													<div className="overflow-hidden">
														<a
															href={ensureProtocol(company.inputValues.url)}
															target="_blank"
															rel="noopener noreferrer"
															className={`text-muted-foreground hover:underline truncate inline-block max-w-full ${
																category.title === 'Fine-tuned' ? 'line-through text-red-400' : ''
															}`}
														>
															{company.inputValues.url || 'No URL'}
														</a>
													</div>
													<ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
													<div className="overflow-hidden">
														<a
															href={ensureProtocol(company.dynamicInputValues.url || company.inputValues.url)}
															target="_blank"
															rel="noopener noreferrer"
															className={`${category.iconColorClass} hover:underline truncate inline-block max-w-full`}
														>
															{company.dynamicInputValues.url || company.inputValues.url || 'No URL'}
														</a>
													</div>
												</div>
											</div>
										))}
										{category.companies.length === 0 && (
											<div className="py-2 text-center text-muted-foreground">
												No {category.title.toLowerCase()} websites found
											</div>
										)}
									</div>
								</AccordionContent>
							</AccordionItem>
						))}
					</Accordion>
				</div>

				<DialogFooter className="mt-4">
					<Button variant="default" onClick={() => onOpenChange(false)}>
						Close
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
