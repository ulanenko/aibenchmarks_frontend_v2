interface LoadingSpinnerProps {
	message?: string;
	className?: string;
}

export function LoadingSpinner({message = 'Loading...', className = ''}: LoadingSpinnerProps) {
	return (
		<div className={`h-full flex items-center justify-center ${className}`}>
			<div className="flex flex-col items-center gap-2">
				<div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
				<div className="text-sm text-muted-foreground">{message}</div>
			</div>
		</div>
	);
}
