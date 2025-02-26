'use client';

import * as React from 'react';
import {useState} from 'react';
import {Dialog, DialogContent, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import {
	Stepper,
	StepperIndicator,
	StepperItem,
	StepperSeparator,
	StepperTitle,
	StepperTrigger,
} from '@/components/ui/stepper';
import {FileSelectionStep} from './file-selection-step';
import {ColumnMappingStep} from './column-mapping-step';
import {PreviewStep} from './preview-step';
import {UploadState, UploadStep} from './types';
import {useToast} from '@/hooks/use-toast';
import {supportedDatabases} from '@/lib/excel/excel-parser';

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

export function ModalUploadAimapper({open, onOpenChange, onUploadComplete}: UploadExcelModalProps) {
	const {toast} = useToast();
	const [state, setState] = useState<UploadState>({
		file: null,
		sheet: '',
		database: '',
		sheets: [],
		step: STEPS_CONFIG[0].id,
		isLoading: false,
		isProcessing: false,
		error: null,
	});

	const updateState = (newState: Partial<UploadState>) => {
		setState((prev) => ({...prev, ...newState}));
	};

	const handleNext = () => {
		// Find current step index
		const currentIndex = STEPS_CONFIG.findIndex((step) => step.id === state.step);
		// Get next step or go back to first step if we're at the end
		const nextStep = currentIndex < STEPS_CONFIG.length - 1 ? STEPS_CONFIG[currentIndex + 1].id : STEPS_CONFIG[0].id;

		updateState({step: nextStep, error: null});
	};

	const handleBack = () => {
		// Find current step index
		const currentIndex = STEPS_CONFIG.findIndex((step) => step.id === state.step);
		// Get previous step or stay on current step if we're at the beginning
		const prevStep = currentIndex > 0 ? STEPS_CONFIG[currentIndex - 1].id : state.step;

		updateState({step: prevStep, error: null});
	};

	const handleComplete = () => {
		toast({
			title: 'Upload Successful',
			description: 'Your Excel data has been successfully imported.',
			variant: 'default',
		});

		// Reset state and close modal
		updateState({
			file: null,
			sheet: '',
			sheets: [],
			step: STEPS_CONFIG[0].id,
			isLoading: false,
			isProcessing: false,
			error: null,
		});

		if (onUploadComplete) {
			onUploadComplete(true);
		}

		onOpenChange(false);
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
			updateState({step: STEPS_CONFIG[stepIndex].id, error: null});
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[1100px] max-h-[90vh] overflow-hidden">
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

				<div className="overflow-y-auto pr-2">
					{/* Render the appropriate step component based on current step */}
					{STEPS_CONFIG.map((step) => state.step === step.id && <step.component key={step.id} {...stepProps} />)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
