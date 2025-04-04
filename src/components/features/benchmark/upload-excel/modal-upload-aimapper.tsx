'use client';

import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
	Stepper,
	StepperIndicator,
	StepperItem,
	StepperSeparator,
	StepperTitle,
	StepperTrigger,
} from '@/components/ui/stepper';
import { FileSelectionStep } from './file-selection-step';
import { ColumnMappingStep } from './column-mapping-step';
import { PreviewStep } from './preview-step';
import { UploadState, UploadStep } from './types';
import { useToast } from '@/hooks/use-toast';

interface UploadExcelModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onUploadComplete?: (success: boolean) => void;
}

// Define step configuration in one place
const STEPS_CONFIG = [
	{
		id: 'file-selection' as UploadStep,
		label: 'File Selection',
		title: 'Select Excel File',
		component: FileSelectionStep,
	},
	{
		id: 'column-mapping' as UploadStep,
		label: 'Column Mapping',
		title: 'Map Columns',
		component: ColumnMappingStep,
	},
	{
		id: 'preview' as UploadStep,
		label: 'Preview Data',
		title: 'Preview Data',
		component: PreviewStep,
	},
];

// Initial state for the upload process
const INITIAL_STATE: UploadState = {
	file: null,
	sheet: '',
	database: '',
	sheets: [],
	step: STEPS_CONFIG[0].id,
	isLoading: false,
	isProcessing: false,
	error: null,
};

export function ModalUploadAimapper({ open, onOpenChange, onUploadComplete }: UploadExcelModalProps) {
	const { toast } = useToast();
	const [state, setState] = useState<UploadState>(INITIAL_STATE);
	const isMountedRef = useRef(true);

	// Set up mount/unmount tracking
	useEffect(() => {
		isMountedRef.current = true;
		return () => {
			isMountedRef.current = false;
		};
	}, []);

	// Reset the state when the modal closes
	useEffect(() => {
		if (!open) {
			// Small delay to ensure clean reset after animation completes
			const timeout = setTimeout(() => {
				if (isMountedRef.current) {
					setState(INITIAL_STATE);
				}
			}, 300);
			return () => clearTimeout(timeout);
		}
	}, [open]);

	const updateState = (newState: Partial<UploadState>) => {
		if (isMountedRef.current) {
			setState((prev) => ({ ...prev, ...newState }));
		}
	};

	const handleNext = () => {
		// Find current step index
		const currentIndex = STEPS_CONFIG.findIndex((step) => step.id === state.step);
		// Get next step or go back to first step if we're at the end
		const nextStep = currentIndex < STEPS_CONFIG.length - 1 ? STEPS_CONFIG[currentIndex + 1].id : STEPS_CONFIG[0].id;

		updateState({ step: nextStep, error: null });
	};

	const handleBack = () => {
		// Find current step index
		const currentIndex = STEPS_CONFIG.findIndex((step) => step.id === state.step);
		// Get previous step or stay on current step if we're at the beginning
		const prevStep = currentIndex > 0 ? STEPS_CONFIG[currentIndex - 1].id : state.step;

		updateState({ step: prevStep, error: null });
	};

	const handleComplete = async () => {
		// Immediately close the modal
		onOpenChange(false);

		// Let parent know upload was completed
		if (onUploadComplete) {
			onUploadComplete(true);
		}
	};

	// Handle modal closing
	const safeOnOpenChange = (newOpen: boolean) => {
		if (!newOpen) {
			// Reset state immediately when closing
			setTimeout(() => {
				if (isMountedRef.current) {
					setState(INITIAL_STATE);
				}
			}, 0);
		}
		onOpenChange(newOpen);
	};

	// Common props for all steps
	const stepProps = {
		state,
		updateState,
		onNext: state.step === STEPS_CONFIG[2].id ? handleComplete : handleNext,
		onBack: handleBack,
	};

	// Get current step configuration
	const currentStep = STEPS_CONFIG.find((step) => step.id === state.step) || STEPS_CONFIG[0];
	const currentStepIndex = STEPS_CONFIG.findIndex((step) => step.id === state.step);

	// Handle stepper value change
	const handleStepChange = (stepIndex: number) => {
		// Only allow navigating to previous steps or the current step
		if (stepIndex <= currentStepIndex) {
			updateState({ step: STEPS_CONFIG[stepIndex].id, error: null });
		}
	};

	return (
		<Dialog open={open} onOpenChange={safeOnOpenChange}>
			<DialogContent className="sm:max-w-[1100px] max-h-[90vh] flex flex-col">
				<DialogHeader>
					<DialogTitle>{currentStep.title}</DialogTitle>
				</DialogHeader>

				<div className="pb-6 border-b-2 border-border/40">
					<Stepper value={currentStepIndex} onValueChange={handleStepChange}>
						{STEPS_CONFIG.map((step, index) => {
							const isCompleted = currentStepIndex > index;
							return (
								<StepperItem
									key={step.id}
									step={index + 1}
									completed={isCompleted}
									className="[&:not(:last-child)]:flex-1"
								>
									<StepperTrigger>
										<StepperIndicator />
										<div className="ml-2">
											<StepperTitle>{step.label}</StepperTitle>
										</div>
									</StepperTrigger>
									{index < STEPS_CONFIG.length - 1 && <StepperSeparator />}
								</StepperItem>
							);
						})}
					</Stepper>
				</div>

				{/* Fixed: Made scrollable container take up remaining height */}
				<div className="flex-1 flex flex-col min-h-0">
					{STEPS_CONFIG.map((step) => state.step === step.id && <step.component key={step.id} {...stepProps} />)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
