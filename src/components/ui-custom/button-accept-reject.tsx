import * as React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';

// SVG components for human and AI indicators
const HumanIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
    </svg>
);

const RobotIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="10" rx="2"></rect>
        <circle cx="12" cy="5" r="2"></circle>
        <path d="M12 7v4"></path>
        <line x1="8" y1="16" x2="8" y2="16"></line>
        <line x1="16" y1="16" x2="16" y2="16"></line>
    </svg>
);

export interface ButtonAcceptRejectProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant: 'accept' | 'reject';
    isHumanDecision?: boolean;
    isAiSuggestion?: boolean;
    isSelected?: boolean;
}

export const ButtonAcceptReject = React.forwardRef<HTMLButtonElement, ButtonAcceptRejectProps>(
    ({ className, variant, isHumanDecision, isAiSuggestion, isSelected, ...props }, ref) => {
        const isAccept = variant === 'accept';

        return (
            <Button
                ref={ref}
                className={cn(
                    "flex items-center px-3 py-1.5 rounded-md justify-center cursor-pointer text-sm",
                    // Accept styling
                    isAccept && isSelected && isHumanDecision && "bg-green-200 text-green-700 border-2 border-green-500 font-medium",
                    isAccept && isAiSuggestion && !isHumanDecision && "bg-green-100 text-green-600",
                    isAccept && !isSelected && !isAiSuggestion && "bg-green-50 text-green-500 hover:bg-green-100",
                    // Reject styling
                    !isAccept && isSelected && isHumanDecision && "bg-red-200 text-red-700 border-2 border-red-500 font-medium",
                    !isAccept && isAiSuggestion && !isHumanDecision && "bg-red-100 text-red-600",
                    !isAccept && !isSelected && !isAiSuggestion && "bg-red-50 text-red-500 hover:bg-red-100",
                    className
                )}
                variant="ghost"
                {...props}
            >
                {/* Icon selection based on state */}
                <span className="mr-1">
                    {isSelected && isHumanDecision ? (
                        <HumanIcon />
                    ) : isAiSuggestion && !isHumanDecision ? (
                        <RobotIcon />
                    ) : isAccept ? (
                        <Check className="h-4 w-4" />
                    ) : (
                        <X className="h-4 w-4" />
                    )}
                </span>
                {isAccept ? 'Accept' : 'Reject'}
            </Button>
        );
    }
);

ButtonAcceptReject.displayName = 'ButtonAcceptReject'; 