import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Company } from '@/lib/company/company';
import { isAcceptOrReject } from '@/lib/company/utils';
import { useCompanyStore } from '@/stores/use-company-store';
import { MessageCircle, User, Bot, ExternalLink, Info } from 'lucide-react';
import { comparabilityColumnDefinitionNew } from '@/lib/company/company-columns';
import { useShallow } from 'zustand/react/shallow';
import { ColumnComparabilityDefinition, ComparabilityFactorOptions } from '@/lib/column-comparability-definition';
import ReactMarkdown from 'react-markdown';
import { CATEGORIES } from '@/config/categories';
import { setValueForPath } from '@/lib/object-utils';

type ComparabilityFactor = 'products' | 'functions' | 'independence';

interface ComparabilityReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId?: number;
  initialFactor?: ComparabilityFactorOptions;
}

export function ComparabilityReviewModal({ 
  open, 
  onOpenChange, 
  companyId, 
  initialFactor = 'products'
}: ComparabilityReviewModalProps) {
  const [activeTab, setActiveTab] = useState<ComparabilityFactorOptions>(initialFactor);
  const [motivation, setMotivation] = useState<string>('');
  const [company, setCompany] = useState<Company | null>(null);
  const compFactors = Object.values(comparabilityColumnDefinitionNew)
  const compFactorsKeys = compFactors.map(factor => factor.cfFactor)
  let columnDef = compFactors.find(factor => factor.cfFactor === activeTab)!;
  
  const { companies, updateCompany } = useCompanyStore(
    useShallow((state) => ({
      companies: state.companies,
      updateCompany: state.updateCompany,
    }))
  );

  // Reset state when the modal opens with a new company
  useEffect(() => {
    if (open && companyId) {
      const selectedCompany = companies.find(c => c.id === companyId);
      if (selectedCompany) {
        setCompany(selectedCompany);
        setActiveTab(initialFactor);
        
        // Set initial motivation based on the active factor
        columnDef = compFactors.find(factor => factor.cfFactor === initialFactor)!;
        if (columnDef) {
          const humanMotivation = selectedCompany.inputValues[columnDef.humanMotivationPath as keyof typeof selectedCompany.inputValues];
          setMotivation(humanMotivation as string || '');
        }
      }
    }
  }, [open, companyId, companies, initialFactor]);

  // Update motivation when tab changes
  useEffect(() => {
    if (company) {
      const columnDef = Object.values(comparabilityColumnDefinitionNew).find(factor => factor.cfFactor === activeTab)!;
      if (columnDef) {
        const humanMotivation = company.inputValues[columnDef.humanMotivationPath as keyof typeof company.inputValues];
        setMotivation(humanMotivation as string || '');
      }
    }
  }, [activeTab, company]);


  const handleAcceptOrReject = (accept: boolean|undefined) => {
    if (company) {
      const decision = accept === undefined ? null : accept ? 'Accept' : 'Reject';
      const humanDecisionPath = columnDef.humanDecisionPath;
      const humanMotivationPath = columnDef.humanMotivationPath;
      const updateObject = {  
        id: company.id,
      }
      setValueForPath(updateObject, humanDecisionPath, decision);
      setValueForPath(updateObject, humanMotivationPath, motivation);
      updateCompany(updateObject);
      onOpenChange(false);
    }
  }

  const handleAccept = () => {
    handleAcceptOrReject(true);
  };

  const handleReject = () => {
    handleAcceptOrReject(false);
  };

  const handleDefer = () => {
    handleAcceptOrReject(undefined);
  };


  if (!company) {
    return null;
  }

  // Get the current column definition
  
  // Get AI and human decisions/motivations using the column definition
  const aiDecision = columnDef && company.searchedCompanyData ? 
    (company.searchedCompanyData as any)[columnDef.aiDecisionPath.split('.')[1]] : null;
  const humanDecision = columnDef ? 
    company.inputValues[columnDef.humanDecisionPath as keyof typeof company.inputValues] : null;
  const aiMotivation = columnDef && company.searchedCompanyData ? 
    (company.searchedCompanyData as any)[columnDef.aiMotivationPath.split('.')[1]] : null;
  const description = columnDef && company.searchedCompanyData ? 
    (company.searchedCompanyData as any)[columnDef.aiDescriptionPath.split('.')[1]] : null;

  const currentDecision = humanDecision || aiDecision;
  const isAccepted = isAcceptOrReject(currentDecision);
  const isHumanDecision = !!humanDecision;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {company.name} - Human Review - {columnDef.title}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
       {/* Company Information */}
       <div className="flex items-center gap-4 p-2 mb-3 bg-muted/40 rounded-md justify-between">
                      <div className="flex items-center gap-2 ">
                        <ExternalLink size={16} />
                        <a 
                          href={company.url || '#'} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-sm font-medium underline"
                        >
                          Company website: {company.url}
                        </a>
                      </div>

                      <div className="flex items-center gap-2">
                        <Info size={16} />
                        <span className="text-sm">
                          {company.categoryValues?.SITE_MATCH?.category.createBadge(
                            company.categoryValues.SITE_MATCH.label,
                            company,
                            company.searchedCompanyData?.site_match?.explanation || 'No explanation available'
                          )}
                        </span>
                      </div>
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
                      <Bot size={14} /> Comparability Suggestion
                    </p>
                    <div className={`p-2 w-full rounded-md text-sm bg-muted/50`}>
                      {columnDef.getBadgeIcon(company, true, true)}
                     
                      <span className='ms-2'>
                        {aiMotivation || "No motivation provided"}
                      </span>
                    </div>
                    </div>
                  </div>

                  {/* Human Review Input */}
                  
                  <div className="space-y-3">
                    <h3 className="flex items-center gap-1 text-xs text-muted-foreground uppercase tracking-wide">
                      <User size= {14} /> Manual Motivation
                    </h3>
                    <Textarea
                      value={motivation}
                      onChange={(e) => setMotivation(e.target.value)}
                      placeholder="Please provide your custom motivation for this decision here..."
                      className="h-32"
                    />
                    <p className="text-xs text-muted-foreground">
                      Your comment will be saved automatically when clicking Accept, Reject, or Defer buttons, or you can click Save button above.
                    </p>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        <DialogFooter className="flex justify-between">
          <Button variant="secondary" className='me-auto' onClick={handleDefer}>
            Defer
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              <MessageCircle className="mr-2 h-4 w-4" />
              Feedback
            </Button>
            <Button 
              variant="destructive"
              className={CATEGORIES.HUMAN_REVIEW.REJECT_HR.getColorClass()}
              onClick={handleReject}
            >
              <CATEGORIES.HUMAN_REVIEW.REJECT_HR.icon className="mr-2 h-4 w-4" />
              Reject
            </Button>
            <Button 
              variant="default"
              className={CATEGORIES.HUMAN_REVIEW.ACCEPT_HR.getColorClass()}
              onClick={handleAccept}
            >
              <CATEGORIES.HUMAN_REVIEW.ACCEPT_HR.icon className="mr-2 h-4 w-4" />
              Accept
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 