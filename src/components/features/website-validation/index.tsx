import React, {useState} from 'react';
import {useToast} from '@/hooks/use-toast';
import {WebsiteValidationResultsDialog} from './results-dialog';
import {WebsiteValidationConfirmDialog} from './confirm-dialog';
import {WebsiteValidationLoadingDialog} from './loading-dialog';
import {CATEGORIES} from '@/config/categories';
import {useCompanyStore} from '@/stores/use-company-store';
import {useShallow} from 'zustand/react/shallow';
import {DTO_ValidateAndFindWebsiteResponse} from '@/services/support-services/website-validation/types';
import {validateCompanyWebsiteBatch} from '@/services/client/validate-company-website';
import {Company} from '@/lib/company/company';

// Export all components and types
export * from './confirm-dialog';
export * from './loading-dialog';
export * from './results-dialog';

// Define validation callback types
export interface ValidationCallbacks {
	onValidationStart?: () => void;
	onValidationComplete?: () => void;
}

// Interface for the useValidation wrapper hook return value
export interface ValidationUtils {
	isValidating: boolean;
	canValidate: boolean;
	openValidationModal: () => void;
	ValidationDialogs: () => React.ReactElement;
}

// Wrapper hook to provide simplified validation interface with local state
export function useValidation(): ValidationUtils {
	const [isValidating, setIsValidating] = useState(false);

	const {openValidationModal, ValidationDialogs, canValidate} = useWebsiteValidation({
		onValidationStart: () => setIsValidating(true),
		onValidationComplete: () => setIsValidating(false),
	});

	return {
		isValidating,
		canValidate,
		openValidationModal,
		ValidationDialogs,
	};
}

// Create a validation manager for handling validation flow
export function useWebsiteValidation(callbacks?: ValidationCallbacks) {
	const {toast} = useToast();
	const [isConfirmOpen, setIsConfirmOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [isResultOpen, setIsResultOpen] = useState(false);
	const [validationResults, setValidationResults] = useState<Company[]>([]);

	const {companies} = useCompanyStore(
		useShallow((state) => ({
			companies: state.companies,
		})),
	);

	// Get companies that need validation (have proper URLs and are ready)
	const companiesToValidate = companies.filter((company) => {
		return company.categoryValues?.INPUT.categoryKey === CATEGORIES.INPUT.READY.categoryKey;
	});

	// Get companies that are incomplete and need more information
	const incompleteCompanies = companies.filter((company) => {
		return company.categoryValues?.INPUT.categoryKey === CATEGORIES.INPUT.INPUT_REQUIRED.categoryKey;
	});

	// Function to start the validation process
	const startValidation = async (callbacksParam?: ValidationCallbacks) => {
		try {
			setIsLoading(true);
			setIsConfirmOpen(false);

			// Call both callbacks if provided
			callbacks?.onValidationStart?.();
			callbacksParam?.onValidationStart?.();

			if (companiesToValidate.length === 0) {
				toast({
					title: 'No companies to validate',
					description: 'There are no companies with websites to validate.',
					variant: 'destructive',
				});
				return;
			}

			const {validatedCompanies, error} = await validateCompanyWebsiteBatch();

			if (error) {
				toast({
					title: 'Validation Error',
					description: error,
					variant: 'destructive',
				});
				return;
			}

			if (validatedCompanies && validatedCompanies.length > 0) {
				// Format the results for display
				setValidationResults(validatedCompanies);
				setIsResultOpen(true);
			} else {
				toast({
					title: 'No companies validated',
					description: 'No companies were found that needed validation.',
					variant: 'default',
				});
			}
		} catch (error) {
			toast({
				title: 'Error',
				description: error instanceof Error ? error.message : 'An error occurred during validation',
				variant: 'destructive',
			});
		} finally {
			setIsLoading(false);
			callbacks?.onValidationComplete?.();
			callbacksParam?.onValidationComplete?.();
		}
	};

	// Open the confirmation dialog
	const openValidationModal = () => {
		setIsConfirmOpen(true);
	};

	// Render validation dialogs
	const ValidationDialogs = () => (
		<>
			<WebsiteValidationConfirmDialog
				isOpen={isConfirmOpen}
				onOpenChange={setIsConfirmOpen}
				onConfirm={() => startValidation()}
				companiesToValidate={companiesToValidate}
				incompleteCompanies={incompleteCompanies}
			/>

			<WebsiteValidationLoadingDialog isOpen={isLoading} />

			<WebsiteValidationResultsDialog
				isOpen={isResultOpen}
				onOpenChange={setIsResultOpen}
				validatedCompanies={validationResults}
			/>
		</>
	);

	return {
		openValidationModal,
		startValidation,
		ValidationDialogs,
		canValidate: companiesToValidate.length > 0,
		isValidating: isLoading,
		hasResults: isResultOpen,
	};
}
