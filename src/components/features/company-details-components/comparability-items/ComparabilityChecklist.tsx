import React from 'react';
import { AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Check, X, Loader, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ComparabilityAnalysisResultsDTO } from '@/services/backend/models/comparabilityAnalysisResults';
import { ComparabilityFactorOptions } from '@/lib/column-comparability-definition';

interface ComparabilityChecklistProps {
    analysisData: ComparabilityAnalysisResultsDTO | null;
    isLoading: boolean;
    error: string | null;
    activeTab: ComparabilityFactorOptions;
}

export function ComparabilityChecklist({
    analysisData,
    isLoading,
    error,
    activeTab
}: ComparabilityChecklistProps) {

    // Helper function to determine if any items exist in a category
    const hasItems = (category: 'acceptable' | 'rejectable' | 'other') => {
        return Boolean(analysisData?.checklist?.[category]?.length);
    };

    // Helper function to check if any items exist at all
    const hasAnyItems = () => {
        return hasItems('acceptable') || hasItems('rejectable') || hasItems('other');
    };

    // Helper function to count present items in a category
    const getPresentCount = (category: 'acceptable' | 'rejectable') => {
        return analysisData?.checklist?.[category]?.filter(item => item.present)?.length || 0;
    };

    // Don't show ancillary column for independence analysis
    const showAncillaryColumn = activeTab !== 'independence';

    return (
        <AccordionItem value="checklist" className="overflow-hidden">
            <AccordionTrigger className="px-4 py-3 hover:no-underline bg-muted/30">
                {isLoading ? (
                    <div className="flex items-center gap-2">
                        <Loader className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Loading checklist data...</span>
                    </div>
                ) : error ? (
                    <div className="flex items-center gap-2 text-destructive">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm">Checklist data unavailable</span>
                    </div>
                ) : !analysisData ? (
                    <span className="text-sm">Checklist information not available</span>
                ) : (
                    <div className="flex items-center gap-2">
                        <span className="text-sm">
                            {activeTab !== 'independence' ? 'Comparability checklist' : 'Independence checklist'}
                        </span>
                    </div>
                )}
            </AccordionTrigger>

            <AccordionContent className="p-0">
                <div className="p-4">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-6">
                            <Loader className="h-8 w-8 animate-spin mb-2" />
                            <p>Loading checklist data...</p>
                        </div>
                    ) : error ? (
                        <div className="p-4 bg-destructive/10 text-destructive rounded-md">
                            {error}
                        </div>
                    ) : !analysisData ? (
                        <div className="p-4 bg-muted rounded-md">
                            No checklist data available for this analysis.
                        </div>
                    ) : (
                        <div className="overflow-auto max-h-[500px]">
                            {/* Acceptable items table */}
                            {hasItems('acceptable') && activeTab !== 'independence' && (
                                <div className="mb-6">
                                    <div className="flex items-center gap-2 mb-3">
                                        <h4 className="text-md font-medium text-success">Acceptable Items</h4>
                                        <Badge variant="outline" className="ml-2 text-success bg-success/10 border-success/30 text-xs px-1.5 py-0">
                                            {getPresentCount('acceptable')}/{analysisData.checklist.acceptable.length}
                                        </Badge>
                                    </div>

                                    <div className="border rounded-md overflow-hidden">
                                        <table className="w-full">
                                            <thead className="bg-muted/50">
                                                <tr>
                                                    <th className="p-2 text-left text-xs font-medium text-muted-foreground" style={{ width: '65%' }}>Item</th>
                                                    <th className="p-2 text-center text-xs font-medium text-muted-foreground" style={{ width: '20%' }}>Present</th>
                                                    {showAncillaryColumn && (
                                                        <th className="p-2 text-center text-xs font-medium text-muted-foreground" style={{ width: '15%' }}>Ancillary</th>
                                                    )}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {analysisData.checklist.acceptable.map((item, index) => (
                                                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-muted/20'}>
                                                        <td className="p-2 text-sm">{item.name}</td>
                                                        <td className="p-2 text-center">
                                                            {item.present ? (
                                                                <Check className="h-4 w-4 text-success mx-auto" />
                                                            ) : (
                                                                <X className="h-4 w-4 text-destructive mx-auto" />
                                                            )}
                                                        </td>
                                                        {showAncillaryColumn && (
                                                            <td className="p-2 text-center">
                                                                {item.isAncillary ? (
                                                                    <Check className="h-4 w-4 text-primary mx-auto" />
                                                                ) : (
                                                                    <X className="h-4 w-4 text-muted-foreground mx-auto" />
                                                                )}
                                                            </td>
                                                        )}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Rejectable items table */}
                            {hasItems('rejectable') && (
                                <div className="mb-6">
                                    <div className="flex items-center gap-2 mb-3">
                                        <h4 className="text-md font-medium text-destructive">Rejectable Items</h4>
                                        <Badge variant="outline" className="ml-2 text-destructive bg-destructive/10 border-destructive/30 text-xs px-1.5 py-0">
                                            {getPresentCount('rejectable')}/{analysisData.checklist.rejectable.length}
                                        </Badge>
                                    </div>

                                    <div className="border rounded-md overflow-hidden">
                                        <table className="w-full">
                                            <thead className="bg-muted/50">
                                                <tr>
                                                    <th className="p-2 text-left text-xs font-medium text-muted-foreground" style={{ width: '65%' }}>Item</th>
                                                    <th className="p-2 text-center text-xs font-medium text-muted-foreground" style={{ width: '20%' }}>Present</th>
                                                    {showAncillaryColumn && (
                                                        <th className="p-2 text-center text-xs font-medium text-muted-foreground" style={{ width: '15%' }}>Ancillary</th>
                                                    )}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {analysisData.checklist.rejectable.map((item, index) => (
                                                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-muted/20'}>
                                                        <td className="p-2 text-sm">{item.name}</td>
                                                        <td className="p-2 text-center">
                                                            {item.present ? (
                                                                <Check className="h-4 w-4 text-destructive mx-auto" />
                                                            ) : (
                                                                <X className="h-4 w-4 text-success mx-auto" />
                                                            )}
                                                        </td>
                                                        {showAncillaryColumn && (
                                                            <td className="p-2 text-center">
                                                                {item.isAncillary ? (
                                                                    <Check className="h-4 w-4 text-primary mx-auto" />
                                                                ) : (
                                                                    <X className="h-4 w-4 text-muted-foreground mx-auto" />
                                                                )}
                                                            </td>
                                                        )}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Other items table */}
                            {hasItems('other') && (
                                <div className="mb-6">
                                    <div className="flex items-center gap-2 mb-3">
                                        <h4 className="text-md font-medium text-primary">Other Items</h4>
                                        <Badge variant="outline" className="ml-2 text-xs px-1.5 py-0">
                                            {analysisData.checklist.other.length}
                                        </Badge>
                                    </div>

                                    <div className="border rounded-md overflow-hidden">
                                        <table className="w-full">
                                            <thead className="bg-muted/50">
                                                <tr>
                                                    <th className="p-2 text-left text-xs font-medium text-muted-foreground" style={{ width: '65%' }}>Item</th>
                                                    <th className="p-2 text-center text-xs font-medium text-muted-foreground" style={{ width: '20%' }}>Similar To</th>
                                                    {showAncillaryColumn && (
                                                        <th className="p-2 text-center text-xs font-medium text-muted-foreground" style={{ width: '15%' }}>Ancillary</th>
                                                    )}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {analysisData.checklist.other.map((item, index) => (
                                                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-muted/20'}>
                                                        <td className="p-2 text-sm">{item.name}</td>
                                                        <td className="p-2 text-center text-sm">
                                                            {item.similarTo || 'N/A'}
                                                        </td>
                                                        {showAncillaryColumn && (
                                                            <td className="p-2 text-center">
                                                                {item.isAncillary ? (
                                                                    <Check className="h-4 w-4 text-primary mx-auto" />
                                                                ) : (
                                                                    <X className="h-4 w-4 text-muted-foreground mx-auto" />
                                                                )}
                                                            </td>
                                                        )}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* No items message */}
                            {!hasAnyItems() && (
                                <div className="p-4 bg-muted rounded-md">
                                    No checklist items available in this analysis.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </AccordionContent>
        </AccordionItem>
    );
} 