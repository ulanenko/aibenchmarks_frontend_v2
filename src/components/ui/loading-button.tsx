'use client';

import * as React from 'react';
import {Button, ButtonProps} from '@/components/ui/button';
import {Loader2} from 'lucide-react';
import {cn} from '@/lib/utils';

export interface LoadingButtonProps extends ButtonProps {
	isLoading?: boolean;
	loadingText?: string;
	children: React.ReactNode;
	loadingIcon?: React.ReactNode;
}

const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
	({isLoading = false, loadingText, children, loadingIcon, className, disabled, ...props}, ref) => {
		return (
			<Button ref={ref} className={cn(className)} disabled={disabled || isLoading} {...props}>
				{isLoading ? (
					<>
						{loadingIcon || <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
						{loadingText || children}
					</>
				) : (
					children
				)}
			</Button>
		);
	},
);

LoadingButton.displayName = 'LoadingButton';

export {LoadingButton};
