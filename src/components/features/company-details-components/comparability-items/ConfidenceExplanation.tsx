import React from 'react';
import { AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { AlertCircle, Loader, ThumbsUp } from 'lucide-react';
import { ComparabilityAnalysisResultsDTO } from '@/services/backend/models/comparabilityAnalysisResults';

interface ConfidenceExplanationProps {
    analysisData: ComparabilityAnalysisResultsDTO | null;
    isLoading: boolean;
    error: string | null;
}

export function ConfidenceExplanation({
    analysisData,
    isLoading,
    error
}: ConfidenceExplanationProps) {

    // Get confidence level from analysis results
    const confidenceLevel = analysisData?.conclusion?.confidence || null;

    // Map confidence level to appropriate styling
    const getConfidenceStyle = () => {
        switch (confidenceLevel?.toLowerCase()) {
            case 'high':
                return 'text-success bg-success/10 px-1.5 py-0.5 text-xs rounded';
            case 'medium':
                return 'text-amber-500 bg-amber-100 px-1.5 py-0.5 text-xs rounded';
            case 'low':
                return 'text-destructive bg-destructive/10 px-1.5 py-0.5 text-xs rounded';
            default:
                return 'text-muted-foreground text-xs';
        }
    };

    return (
        <AccordionItem value="confidence" className="overflow-hidden">
            <AccordionTrigger className="px-4 py-3 hover:no-underline bg-muted/30">
                {isLoading ? (
                    <div className="flex items-center gap-2">
                        <Loader className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Loading confidence data...</span>
                    </div>
                ) : error ? (
                    <div className="flex items-center gap-2 text-destructive">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm">Confidence data unavailable</span>
                    </div>
                ) : !analysisData ? (
                    <span className="text-sm">Confidence information not available</span>
                ) : (
                    <div className="flex items-center gap-2">
                        <span className="text-sm">Confidence level for AI suggestion</span>
                        {confidenceLevel && (
                            <span className={`ml-2 font-medium ${getConfidenceStyle()}`}>
                                {confidenceLevel}
                            </span>
                        )}
                    </div>
                )}
            </AccordionTrigger>

            <AccordionContent className="p-0">
                <div className="p-4">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-6">
                            <Loader className="h-8 w-8 animate-spin mb-2" />
                            <p>Loading confidence data...</p>
                        </div>
                    ) : error ? (
                        <div className="p-4 bg-destructive/10 text-destructive rounded-md">
                            {error}
                        </div>
                    ) : !analysisData || !analysisData.conclusion ? (
                        <div className="p-4 bg-muted rounded-md">
                            No confidence data available for this analysis.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Confidence explanation */}
                            {analysisData.conclusion.confidenceExplanation && (
                                <div>
                                    <h4 className="text-sm font-medium mb-2">Confidence Explanation:</h4>
                                    <div className="bg-muted/50 p-3 rounded-md text-sm">
                                        {analysisData.conclusion.confidenceExplanation}
                                    </div>
                                </div>
                            )}

                            {/* General explanation */}
                            {analysisData.conclusion.explanation && (
                                <div>
                                    <h4 className="text-sm font-medium mb-2">Explanation:</h4>
                                    <div className="bg-muted/50 p-3 rounded-md text-sm">
                                        {analysisData.conclusion.explanation}
                                    </div>
                                </div>
                            )}

                            {/* Concerns (if any) */}
                            {analysisData.conclusion.concerns && (
                                <div>
                                    <h4 className="text-sm font-medium mb-2 text-amber-500">Concerns:</h4>
                                    <div className="bg-amber-50 p-3 rounded-md text-sm border border-amber-200">
                                        {analysisData.conclusion.concerns}
                                    </div>
                                </div>
                            )}

                            {/* No concerns */}
                            {!analysisData.conclusion.concerns && (
                                <div className="flex items-center gap-2 text-success">
                                    <ThumbsUp className="h-4 w-4" />
                                    <span>No concerns identified</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </AccordionContent>
        </AccordionItem>
    );
} 