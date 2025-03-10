import React from 'react';
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from '@/components/ui/dialog';
import {Button} from '@/components/ui/button';
import {Globe, Check, X, AlertCircle, Info} from 'lucide-react';
import {Accordion, AccordionItem, AccordionTrigger, AccordionContent} from '@/components/ui/accordion';
import {Company} from '@/lib/company/company';
import {Alert, AlertDescription} from '@/components/ui/alert';

export interface WebsiteValidationConfirmDialogProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
	companiesToValidate: Array<Company>;
	incompleteCompanies: Array<Company>;
}

export function WebsiteValidationConfirmDialog({
	isOpen,
	onOpenChange,
	onConfirm,
	companiesToValidate,
	incompleteCompanies,
}: WebsiteValidationConfirmDialogProps) {
	// Limit displayed companies to 10 for performance
	const displayedCompanies = companiesToValidate.slice(0, 10);
	const hasMoreCompanies = companiesToValidate.length > 10;
	const canValidate = companiesToValidate.length > 0;

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-xl">
				<DialogHeader>
					<DialogTitle>AI Company Validator</DialogTitle>
					<DialogDescription>
						This module validates the data before we start analysing the companies. It's a mandatory step to ensure that
						the data is correct and the websites are live.
					</DialogDescription>
				</DialogHeader>

				<div className="mt-4 space-y-4">
					<div className="flex items-start gap-3">
						<div className="mt-0.5 bg-blue-50 rounded-full p-1">
							<Check className="h-4 w-4 text-blue-600" />
						</div>
						<div>
							<h3 className="text-base font-medium text-gray-700">Validate Country and URLs</h3>
							<p className="text-sm text-muted-foreground">
								Check if a country is assigned and if the URL is valid and accessible
							</p>
						</div>
					</div>

					<div className="flex items-start gap-3">
						<div className="mt-0.5 bg-blue-50 rounded-full p-1">
							<Globe className="h-4 w-4 text-blue-600" />
						</div>
						<div>
							<h3 className="text-base font-medium text-gray-700">Find Missing Websites</h3>
							<p className="text-sm text-muted-foreground">Search for official company websites using AI</p>
						</div>
					</div>

					<div className="flex items-start gap-3">
						<div className="mt-0.5 bg-blue-50 rounded-full p-1">
							<X className="h-4 w-4 text-blue-600" />
						</div>
						<div>
							<h3 className="text-base font-medium text-gray-700">Fix Incorrect URLs</h3>
							<p className="text-sm text-muted-foreground">Correct and update invalid website addresses</p>
						</div>
					</div>

					<div className="flex items-start gap-3">
						<div className="mt-0.5 bg-blue-50 rounded-full p-1">
							<AlertCircle className="h-4 w-4 text-blue-600" />
						</div>
						<div>
							<h3 className="text-base font-medium text-gray-700">Ask for confirmation</h3>
							<p className="text-sm text-muted-foreground">
								Ask for confirmation before saving the URLs or rejecting companies with incomplete information
							</p>
						</div>
					</div>
				</div>

				<div className="bg-blue-50 p-4 rounded-md mt-4">
					<Accordion type="single" collapsible className="border-none space-y-4">
						<AccordionItem value="companies-list" className="border-none">
							<AccordionTrigger className="py-0 hover:no-underline">
								<div className="flex items-center gap-2">
									<Globe className="h-5 w-5 text-blue-600" />
									<span className="text-blue-600 font-medium">
										{companiesToValidate.length} {companiesToValidate.length === 1 ? 'company needs' : 'companies need'}{' '}
										website validation
									</span>
								</div>
							</AccordionTrigger>
							<AccordionContent>
								{companiesToValidate.length > 0 && (
									<div className="mt-3 max-h-60 overflow-y-auto">
										{displayedCompanies.map((company) => (
											<div key={company.id} className="p-3 bg-white rounded border border-blue-100 mb-2">
												<div className="flex flex-col gap-1">
													<div className="flex items-center justify-between gap-2">
														<span className="text-gray-700 font-medium">{company.inputValues.name}</span>
													</div>
													{company.inputValues.url && (
														<a
															href={company.inputValues.url}
															target="_blank"
															rel="noopener noreferrer"
															className="text-sm text-blue-500 hover:underline"
														>
															{company.inputValues.url}
														</a>
													)}
												</div>
											</div>
										))}
										{hasMoreCompanies && (
											<div className="p-3 bg-white rounded border border-blue-100 mb-2 text-center text-muted-foreground">
												And {companiesToValidate.length - 10} more companies...
											</div>
										)}
									</div>
								)}
								{companiesToValidate.length === 0 && (
									<div className="mt-3 p-3 bg-white rounded border border-blue-100">
										<div className="text-center text-muted-foreground">No companies available for validation</div>
									</div>
								)}
							</AccordionContent>
						</AccordionItem>

						<AccordionItem value="incomplete-companies" className="border-none">
							<AccordionTrigger className="py-0 hover:no-underline">
								<div className="flex items-center gap-2">
									<AlertCircle className="h-5 w-5 text-yellow-600" />
									<span className="text-yellow-600 font-medium">
										{incompleteCompanies.length} {incompleteCompanies.length === 1 ? 'company has' : 'companies have'}{' '}
										incomplete information
									</span>
								</div>
							</AccordionTrigger>
							<AccordionContent>
								{incompleteCompanies.length > 0 && (
									<div className="mt-3 max-h-60 overflow-y-auto">
										{incompleteCompanies.slice(0, 10).map((company) => (
											<div key={company.id} className="p-3 bg-white rounded border border-yellow-100 mb-2">
												<div className="flex flex-col gap-1">
													<div className="flex items-center justify-between gap-2">
														<span className="text-gray-700 font-medium">{company.inputValues.name}</span>
														{company.categoryValues?.INPUT && (
															<div>
																{company.categoryValues.INPUT.category.createBadge(
																	company.categoryValues.INPUT.description ?? company.categoryValues.INPUT.label,
																	company,
																	company.categoryValues.INPUT.description,
																)}
															</div>
														)}
													</div>
													{company.inputValues.url && (
														<a
															href={company.inputValues.url}
															target="_blank"
															rel="noopener noreferrer"
															className="text-sm text-blue-500 hover:underline"
														>
															{company.inputValues.url}
														</a>
													)}
												</div>
											</div>
										))}
										{incompleteCompanies.length > 10 && (
											<div className="p-3 bg-white rounded border border-yellow-100 mb-2 text-center text-muted-foreground">
												And {incompleteCompanies.length - 10} more companies...
											</div>
										)}
									</div>
								)}
							</AccordionContent>
						</AccordionItem>
					</Accordion>
				</div>

				{!canValidate && (
					<Alert className="mt-4 bg-amber-50 border-amber-200">
						<Info className="h-4 w-4 text-amber-500" />
						<AlertDescription className="text-amber-700">
							No companies are ready for validation. Please make sure there are companies with complete information and
							properly formatted websites.
						</AlertDescription>
					</Alert>
				)}

				<DialogFooter className="sm:justify-between mt-4">
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Cancel
					</Button>
					<Button onClick={onConfirm} disabled={!canValidate}>
						Start Validation
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
