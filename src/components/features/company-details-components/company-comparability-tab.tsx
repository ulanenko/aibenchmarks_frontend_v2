import React, { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Company } from '@/lib/company/company';
import { Bot, User, Save } from 'lucide-react';
import { comparabilityColumnDefinitionNew } from '@/lib/company/company-columns';
import { ComparabilityFactorOptions } from '@/lib/column-comparability-definition';
import ReactMarkdown from 'react-markdown';
import { CATEGORIES } from '@/config/categories';
import { useCompanyStore } from '@/stores/use-company-store';
import { useShallow } from 'zustand/react/shallow';
import { setValueForPath } from '@/lib/object-utils';
import { ButtonAcceptReject } from '@/components/ui-custom/button-accept-reject';
import { updateCompany } from '@/services/client/update-company';

interface CompanyComparabilityTabProps {
    company: Company;
    onActionsChange?: (actions: React.ReactNode) => void;
}

export function CompanyComparabilityTab({ company, onActionsChange }: CompanyComparabilityTabProps) {
    const [activeTab, setActiveTab] = useState<ComparabilityFactorOptions>('products');
    const [motivation, setMotivation] = useState<string>('');
    const compFactors = Object.values(comparabilityColumnDefinitionNew);

    // Get the current column definition
    const columnDef = compFactors.find(factor => factor.cfFactor === activeTab)!;

    // Get all values using the column definition's getValues utility
    const {
        aiDecision,
        humanDecision,
        aiMotivation,
        humanMotivation,
        aiDescription: description,
        isHumanDecision
    } = columnDef.getValues(company);

    // Determine if accept or reject
    const isAiSuggestingAccept = aiDecision === "Accept";
    const isAiSuggestingReject = aiDecision === "Reject";
    const isHumanAccept = humanDecision === "Accept";
    const isHumanReject = humanDecision === "Reject";

    // Save motivation without changing decision
    const handleSaveMotivation = useCallback(async () => {
        if (motivation.trim() && columnDef) {
            const updates = {};
            setValueForPath(updates, columnDef.humanMotivationPath, motivation);
            await updateCompany(company.id, updates);
        }
    }, [motivation, columnDef, company.id]);

    // Accept the current factor
    const handleAcceptReject = (isAccept: boolean) => {
        return async () => {
            if (columnDef) {
                const updates = {
                    id: company.id,
                };
                setValueForPath(updates, columnDef.humanDecisionPath, isAccept ? 'Accept' : 'Reject');
                setValueForPath(updates, columnDef.humanMotivationPath, motivation);
                useCompanyStore.getState().updateCompany(updates);
                useCompanyStore.getState().saveChanges([company.id]);
            }
        }
    }


    // Update motivation when tab changes
    useEffect(() => {
        if (columnDef) {
            setMotivation(humanMotivation || '');
        }
    }, [company, columnDef, activeTab, humanMotivation]);

    // Set actions in parent component
    useEffect(() => {
        if (onActionsChange) {
            onActionsChange(
                <div className="flex items-center gap-3">
                    <Button
                        onClick={handleSaveMotivation}
                        variant="outline"
                    >
                        <Save className="mr-2 h-4 w-4" />
                        Save Motivation
                    </Button>
                    <div className="flex flex-row space-x-2">
                        <ButtonAcceptReject
                            variant="reject"
                            onClick={handleAcceptReject(false)}
                            isHumanDecision={isHumanDecision}
                            isAiSuggestion={isAiSuggestingReject}
                            isSelected={isHumanReject}
                        />
                        <ButtonAcceptReject
                            variant="accept"
                            onClick={handleAcceptReject(true)}
                            isHumanDecision={isHumanDecision}
                            isAiSuggestion={isAiSuggestingAccept}
                            isSelected={isHumanAccept}
                        />
                    </div>
                </div>
            );
        }
    }, [
        onActionsChange,
        activeTab,
        isAiSuggestingAccept,
        isAiSuggestingReject,
        isHumanAccept,
        isHumanReject,
        isHumanDecision,
        handleSaveMotivation
    ]);

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Comparability Analysis</h3>
                <p className="text-sm text-muted-foreground mt-1">
                    Review the comparability analysis for this company.
                </p>
            </div>

            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ComparabilityFactorOptions)}>
                <TabsList className="mb-4 w-full justify-around">
                    {compFactors.map((factor) => (
                        <TabsTrigger key={factor.cfFactor} value={factor.cfFactor}>
                            <div className="flex items-center gap-2">
                                {factor.getBadgeIcon(company)}
                                {factor.title}
                            </div>
                        </TabsTrigger>
                    ))}
                </TabsList>

                {(['products', 'functions', 'independence'] as const).map((factor) => (
                    <TabsContent key={factor} value={factor}>
                        <div className="space-y-6">
                            {/* AI Description and Suggestion */}
                            <div className='flex gap-4 w-full'>
                                <div className="space-y-3 w-2/3">
                                    <p className="flex items-center gap-1 text-xs text-muted-foreground uppercase tracking-wide">
                                        <Bot size={14} /> AI Description
                                    </p>
                                    <div className="bg-muted/50 p-2 rounded-md text-sm prose prose-sm max-w-none max-h-[300px] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-gray-400 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-200 relative">
                                        <ReactMarkdown>{description || "No description available"}</ReactMarkdown>
                                        <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-muted via-muted/80 to-transparent pointer-events-none"></div>
                                    </div>
                                </div>
                                <div className="space-y-3 w-1/3">
                                    <p className="flex items-center gap-1 text-xs text-muted-foreground uppercase tracking-wide">
                                        <Bot size={14} /> AI Suggestion
                                    </p>
                                    <div className={`p-2 w-full rounded-md text-sm bg-muted/50`}>
                                        {columnDef.getBadgeIcon(company, true, true)}
                                        <span className='ms-2'>
                                            {aiMotivation || "No motivation provided"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Human Decision and Motivation */}
                            {humanDecision && (
                                <div className="space-y-3">
                                    <p className="flex items-center gap-1 text-xs text-muted-foreground uppercase tracking-wide">
                                        <User size={14} /> Human Decision
                                    </p>
                                    <div className={`p-2 w-full rounded-md text-sm bg-muted/50`}>
                                        {humanDecision === "Accept" ?
                                            CATEGORIES.HUMAN_REVIEW.ACCEPT_HR.getBadgeIcon(company, true) :
                                            CATEGORIES.HUMAN_REVIEW.REJECT_HR.getBadgeIcon(company, true)
                                        }
                                        <span className='ms-2'>
                                            {humanMotivation || "No human motivation provided"}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Motivation Input */}
                            <div className="space-y-3">
                                <p className="flex items-center gap-1 text-xs text-muted-foreground uppercase tracking-wide">
                                    <User size={14} /> Manual Motivation
                                </p>
                                <Textarea
                                    value={motivation}
                                    onChange={(e) => setMotivation(e.target.value)}
                                    placeholder="Please provide your custom motivation for this decision here..."
                                    className="h-32"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Your motivation will be saved when clicking Accept, Reject, or Save Motivation buttons.
                                </p>
                            </div>
                        </div>
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
} 