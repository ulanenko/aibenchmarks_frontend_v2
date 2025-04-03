import React, { useState, useEffect } from 'react';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Loader2, ExternalLink, Languages, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { translateTextAction } from '@/app/actions/support-services';
import { getDecisionSubstantiation } from '@/app/actions/support-services';
import { Company } from '@/lib/company/company';
import { ComparabilityFactorOptions } from '@/lib/column-comparability-definition';

interface DecisionSubstantiationProps {
    company: Company;
    activeTab: ComparabilityFactorOptions;
}

type SubstantiationState = 'no_data' | 'not_loaded' | 'loading' | 'loaded' | 'loading_failed_1' | 'loading_failed_2';
type QuoteDisplayMode = 'original' | 'translated' | 'translating';

interface Source {
    id: number;
    SourceName: string;
    URL: string;
    Quotes: string[];
    quotesTranslated?: string[];
}

interface Connection {
    from: number;
    to: number[];
}

interface DecisionSubstantiationData {
    sources: Source[];
    connections: Connection[];
    substantiation?: string;
}

export function DecisionSubstantiationAccordion({ company, activeTab }: DecisionSubstantiationProps) {
    const [substantiationState, setSubstantiationState] = useState<SubstantiationState>('not_loaded');
    const [quoteDisplayMode, setQuoteDisplayMode] = useState<QuoteDisplayMode>('original');
    const [substantiationData, setSubstantiationData] = useState<DecisionSubstantiationData | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Map the comparability factor to the connection ID
    const factorToConnectionIdMap: Record<ComparabilityFactorOptions, number> = {
        'products': 1,
        'functions': 2,
        'independence': 3,
        'dataQuality': 0 // Added to match ComparabilityFactorOptions type
    };

    // Effect to determine initial state
    useEffect(() => {
        if (!company.backendState?.searchId) {
            setSubstantiationState('no_data');
            return;
        }

        // Check if the company has accept/reject decisions set
        const hasDecisions = company.inputValues.cfProductsServicesHRDecision ||
            company.inputValues.cfFunctionalProfileHRDecision ||
            company.inputValues.cfIndependenceHRDecision;

        if (!hasDecisions) {
            setSubstantiationState('no_data');
            return;
        }

        // Reset state when company or tab changes
        setSubstantiationState(substantiationData ? 'loaded' : 'not_loaded');
        setQuoteDisplayMode('original');
    }, [company.id, activeTab, substantiationData, company.backendState?.searchId, company.inputValues]);

    // Function to load substantiation data
    const loadSubstantiation = async (retry = false) => {
        // Only proceed if not loaded or explicitly retrying after first failure
        if (!(substantiationState === 'not_loaded' || (retry && substantiationState === 'loading_failed_1'))) {
            return;
        }

        setSubstantiationState('loading');
        setError(null);

        try {
            if (!company.backendState?.searchId || !company.benchmarkId) {
                throw new Error('Missing search ID or benchmark ID');
            }

            const result = await getDecisionSubstantiation(company.backendState.searchId, company.benchmarkId);

            if (result.error) {
                throw new Error(result.error);
            }

            // Create mock data structure if needed until the API returns the correct format
            const mockData: DecisionSubstantiationData = {
                sources: [],
                connections: [],
                substantiation: result.data?.substantiation || ''
            };

            // If API doesn't return sources and connections in the right format,
            // create them from functionsMatches and productMatches
            if (result.data?.functionsMatches || result.data?.productMatches) {
                let sourceId = 1;
                const sources: Source[] = [];
                const connections: Connection[] = [];

                // Function matches
                if (result.data.functionsMatches && result.data.functionsMatches.length > 0) {
                    sources.push({
                        id: sourceId,
                        SourceName: 'Functions Match Source',
                        URL: 'https://example.com',
                        Quotes: result.data.functionsMatches
                    });
                    connections.push({
                        from: factorToConnectionIdMap.functions,
                        to: [sourceId]
                    });
                    sourceId++;
                }

                // Product matches
                if (result.data.productMatches && result.data.productMatches.length > 0) {
                    sources.push({
                        id: sourceId,
                        SourceName: 'Products Match Source',
                        URL: 'https://example.com',
                        Quotes: result.data.productMatches
                    });
                    connections.push({
                        from: factorToConnectionIdMap.products,
                        to: [sourceId]
                    });
                }

                mockData.sources = sources;
                mockData.connections = connections;
            }

            setSubstantiationData(mockData);
            setSubstantiationState('loaded');
        } catch (error) {
            console.error('Failed to load decision substantiation:', error);
            setError(error instanceof Error ? error.message : 'Unknown error');
            setSubstantiationState(substantiationState === 'loading_failed_1' ? 'loading_failed_2' : 'loading_failed_1');
        }
    };

    // Function to translate quotes
    const translateQuotes = async () => {
        if (quoteDisplayMode === 'translating') {
            return;
        }

        if (quoteDisplayMode === 'translated') {
            setQuoteDisplayMode('original');
            return;
        }

        // Check if we've already translated the quotes
        if (substantiationData?.sources[0]?.quotesTranslated) {
            setQuoteDisplayMode('translated');
            return;
        }

        setQuoteDisplayMode('translating');

        const quotesToTranslate: string[] = [];
        const quoteOrigins: [number, number][] = [];

        substantiationData?.sources.forEach((source, sourceIndex) => {
            source.Quotes.forEach((quote, quoteIndex) => {
                quotesToTranslate.push(quote);
                quoteOrigins.push([sourceIndex, quoteIndex]);
            });
        });

        try {
            // Translate each quote
            const translatedQuotes = await Promise.all(
                quotesToTranslate.map(quote => translateTextAction(quote, 'en'))
            );

            // Create a deep copy of the sources to avoid modifying state directly
            const updatedSources = JSON.parse(JSON.stringify(substantiationData?.sources));

            translatedQuotes.forEach((result, index) => {
                if (result.data) {
                    const [sourceIndex, quoteIndex] = quoteOrigins[index];
                    if (!updatedSources[sourceIndex].quotesTranslated) {
                        updatedSources[sourceIndex].quotesTranslated = [];
                    }
                    updatedSources[sourceIndex].quotesTranslated[quoteIndex] = result.data;
                }
            });

            setSubstantiationData({
                ...substantiationData!,
                sources: updatedSources
            });
            setQuoteDisplayMode('translated');
        } catch (error) {
            console.error('Failed to translate quotes:', error);
            setQuoteDisplayMode('original');
        }
    };

    // Get relevant sources based on the active tab
    const getRelevantSources = () => {
        if (!substantiationData || !substantiationData.sources || substantiationData.sources.length === 0)
            return [];

        const connectionId = factorToConnectionIdMap[activeTab];
        const relevantConnection = substantiationData.connections.find(
            connection => connection.from === connectionId
        );

        if (!relevantConnection) return [];

        return relevantConnection.to.map(sourceId =>
            substantiationData.sources.find(source => source.id === sourceId)
        ).filter(Boolean) as Source[];
    };

    // Generate the appropriate title for the accordion
    const getSubstantiationTitle = () => {
        return "Source and substantiation analysis";
    };

    // Determine if we're in a loading or error state
    const isLoadingState = substantiationState === 'loading';
    const isErrorState = error !== null || substantiationState === 'loading_failed_1' || substantiationState === 'loading_failed_2';

    return (
        <AccordionItem value="substantiation" className="overflow-hidden">
            <AccordionTrigger
                className="px-4 py-3 hover:no-underline bg-muted/30"
                onClick={() => {
                    setIsExpanded(!isExpanded);
                    if (!substantiationData && substantiationState === 'not_loaded') {
                        loadSubstantiation();
                    }
                }}
            >
                {isLoadingState ? (
                    <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Loading substantiation data...</span>
                    </div>
                ) : isErrorState ? (
                    <div className="flex items-center gap-2 text-destructive">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm">Substantiation data unavailable</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <span className="text-sm">{getSubstantiationTitle()}</span>
                        <Badge variant="outline" className="ml-2 bg-blue-100 text-blue-800">Beta</Badge>
                    </div>
                )}
            </AccordionTrigger>

            <AccordionContent className="p-0">
                <div className="p-4">
                    {substantiationState === 'no_data' && (
                        <Alert className="bg-muted rounded-md">
                            <AlertDescription>
                                Finalize accept/reject evaluation to show sources and substantiation
                            </AlertDescription>
                        </Alert>
                    )}

                    {substantiationState === 'loading_failed_1' && (
                        <Alert className="bg-destructive/10 text-destructive rounded-md">
                            <div className="flex justify-between items-center">
                                <AlertDescription>Failed to retrieve substantiation.</AlertDescription>
                                <Button variant="outline" size="sm" onClick={() => loadSubstantiation(true)} className="ml-2">
                                    Try again
                                </Button>
                            </div>
                        </Alert>
                    )}

                    {substantiationState === 'loading_failed_2' && (
                        <Alert className="bg-destructive/10 text-destructive rounded-md">
                            <AlertDescription>
                                Could not load sources and substantiation. Please try again later.
                            </AlertDescription>
                        </Alert>
                    )}

                    {substantiationState === 'loading' && (
                        <div className="flex flex-col items-center justify-center py-6">
                            <Loader2 className="h-8 w-8 animate-spin mb-2" />
                            <p>Loading sources and substantiation (takes ~30 seconds)...</p>
                        </div>
                    )}

                    {substantiationState === 'loaded' && (
                        <div className="overflow-auto max-h-[500px]">
                            {substantiationData?.substantiation && (
                                <div className="mb-6">
                                    <h4 className="text-md font-medium mb-3">Decision Substantiation</h4>
                                    <div className="border rounded-md p-4 bg-muted/20">
                                        <p className="whitespace-pre-line">{substantiationData.substantiation}</p>
                                    </div>
                                </div>
                            )}

                            {getRelevantSources().length > 0 && (
                                <div className="mb-6">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-md font-medium">Relevant Sources</h4>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex items-center text-xs"
                                            onClick={translateQuotes}
                                            disabled={quoteDisplayMode === 'translating'}
                                        >
                                            {quoteDisplayMode !== 'translated' ? 'Translate All' : 'Show Original'}
                                            {quoteDisplayMode === 'translating' ? (
                                                <Loader2 className="h-3 w-3 ml-1 animate-spin" />
                                            ) : (
                                                <Languages className="h-3 w-3 ml-1" />
                                            )}
                                        </Button>
                                    </div>

                                    <div className="border rounded-md overflow-hidden">
                                        {getRelevantSources().map((source, index) => (
                                            <div
                                                key={`source-${index}`}
                                                className={`p-4 ${index % 2 === 0 ? 'bg-white' : 'bg-muted/20'}`}
                                            >
                                                <div className="flex justify-between items-center mb-3">
                                                    <a
                                                        href={source.URL}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="font-semibold flex items-center text-primary"
                                                    >
                                                        <ExternalLink className="h-4 w-4 mr-1" />
                                                        {source.SourceName}
                                                    </a>
                                                </div>

                                                {(quoteDisplayMode !== 'translated' ? source.Quotes : source.quotesTranslated || source.Quotes).map((quote, qIndex) => (
                                                    <blockquote
                                                        key={`quote-${qIndex}`}
                                                        className="italic border-l-4 border-gray-300 pl-4 py-2 my-2 bg-gray-50 rounded text-sm"
                                                    >
                                                        {quote}
                                                    </blockquote>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {getRelevantSources().length === 0 && !substantiationData?.substantiation && (
                                <Alert>
                                    <AlertDescription>No substantiation data found for this category.</AlertDescription>
                                </Alert>
                            )}
                        </div>
                    )}
                </div>
            </AccordionContent>
        </AccordionItem>
    );
} 