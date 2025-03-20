import React, {useState} from 'react';
import {useWebsiteValidation} from './index';

/**
 * Interface for the useValidation hook return value
 */
export interface ValidationUtils {
	isValidating: boolean;
	canValidate: boolean;
	openValidationModal: () => void;
	ValidationDialogs: () => React.ReactElement;
}

/**
 * Wrapper hook to provide simplified validation interface with local state
 * This simplifies the usage of validation functionality across the application
 */
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
