'use client';

import React, { useState, useEffect, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useCompanyStore } from '@/stores/use-company-store';
import { Loader2, ThumbsUp, Filter } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { toast } from 'sonner';
import { comparabilityAnalysisService } from '@/lib/company/services/comparabilityAnalysisService';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Company } from '@/lib/company';
import { getObjectsByCategory } from '@/lib/company/utils';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

interface AcceptRejectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCompanyIds?: number[];
}

type SelectionMode = "category" | "selected";

interface Category {
  companies: Company[];
  selected: boolean;
  title: string;
}

type Categories = Record<string, Category>;

export function AcceptRejectModal({ open, onOpenChange }: AcceptRejectModalProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectionMode, setSelectionMode] = useState<SelectionMode>("category");
  const [categories, setCategories] = useState<Categories>({
    ready: { companies: [], selected: true, title: 'Ready for Comparability Analysis' },
    in_progress: { companies: [], selected: false, title: 'Analysis In Progress' },
    completed: { companies: [], selected: false, title: 'Analysis Completed' },
    not_ready: { companies: [], selected: false, title: 'Not Ready (requires web search)' }
  });
  const [selectedCompanies, setSelectedCompanies] = useState<Company[]>([]);

  // Analysis parameters
  const [idealProductService, setIdealProductService] = useState('');
  const [idealFunctionalProfile, setIdealFunctionalProfile] = useState('');
  const [relaxedProduct, setRelaxedProduct] = useState(false);
  const [relaxedFunction, setRelaxedFunction] = useState(false);
  
  const { companies, startAutoRefresh } = useCompanyStore(
    useShallow((state) => ({
      companies: state.companies,
      startAutoRefresh: state.startAutoRefresh
    }))
  );

  // Company classifications based on their status
  useEffect(() => {
    // Filter companies based on selection if needed
    setSelectedCompanies(companies.filter(company => company.frontendState?.selected));

    // Get companies by ACCEPT_REJECT status
    const companiesByStatus = getObjectsByCategory(
      companies,
      'categoryValues.ACCEPT_REJECT.category.status'
    );
    setCategories((state) => {
      const newState = {...state};
      Object.entries(newState).forEach(([key, value]) => {
        value.companies = companiesByStatus[key as keyof typeof companiesByStatus] || [];
      });
      return newState;
    });
  }, [companies]);

  // Calculate total companies to be processed based on selected categories or selection mode
  const getTotalCompaniesToProcess = () => {
    if (selectionMode === "selected") {
      return selectedCompanies.length;
    }
    
    return Object.values(categories).reduce((total, { companies, selected }) => {
      if (!selected) return total;
      return total + companies.length;
    }, 0);
  };

  // Calculate total credits needed (1 credit per company)
  const totalCredits = getTotalCompaniesToProcess();

  // Validate form inputs
  const isFormValid = () => {
    if (!idealProductService.trim()) {
      toast.error('Please enter an ideal product/service description');
      return false;
    }
    
    if (!idealFunctionalProfile.trim()) {
      toast.error('Please enter an ideal functional profile description');
      return false;
    }
    
    if (getTotalCompaniesToProcess() === 0) {
      toast.error('Please select at least one company for analysis');
      return false;
    }
    
    return true;
  };

  // Handle analysis button click
  const handleAnalysis = async () => {
    if (!isFormValid()) return;
    
    setIsAnalyzing(true);
    
    try {
      // Get companies based on selection mode
      let companiesToAnalyze: Company[] = [];
      
      if (selectionMode === "category") {
        Object.values(categories).forEach(({ companies, selected }) => {
          if (selected) {
            companiesToAnalyze.push(...companies);
          }
        });
      } else {
        // Use all selected companies
        companiesToAnalyze = selectedCompanies;
      }
      
      // Filter to only include companies with searchId
      companiesToAnalyze = companiesToAnalyze.filter(company => 
        company.backendState?.searchId && 
        company.categoryValues?.WEBSEARCH.category.status === 'completed'
      );
      
      if (companiesToAnalyze.length === 0) {
        toast.warning("No companies with completed web search available for analysis");
        setIsAnalyzing(false);
        return;
      }
      
      const result = await comparabilityAnalysisService(companiesToAnalyze, {
        idealProductService,
        idealFunctionalProfile,
        language: 'en',
        relaxedProduct,
        relaxedFunction,
        authCode: 6666666, // Default auth code
      });
      
      if (result.success) {
        toast.success(result.message);
        startAutoRefresh();
        if(selectionMode === "selected"){
          useCompanyStore.getState().updateCompanies(companiesToAnalyze.map(company => ({
            id: company.id,
            frontendState: {
              selected: false
            }
          })));
        }
        onOpenChange(false);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error starting analysis:', error);
      toast.error('Error starting analysis', {
        description: error instanceof Error ? error.message : 'Failed to start analysis'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Comparability Analysis</DialogTitle>
          <DialogDescription>
            Analyze company comparability based on product/service and functional profiles.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="idealProductService">Ideal Product/Service Profile</Label>
              <Textarea 
                id="idealProductService" 
                placeholder="Enter ideal product/service description, e.g. 'Consumer electronics; reject companies involved in industrial electronics'" 
                value={idealProductService}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setIdealProductService(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="idealFunctionalProfile">Ideal Functional Profile</Label>
              <Textarea 
                id="idealFunctionalProfile" 
                placeholder="Enter ideal functional profile description, e.g. 'Manufacturing; reject retail, distribution'" 
                value={idealFunctionalProfile}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setIdealFunctionalProfile(e.target.value)}
              />
            </div>
            
            <div className="flex items-center space-x-4 pt-2">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="relaxedProduct" 
                  checked={relaxedProduct}
                  onCheckedChange={setRelaxedProduct}
                />
                <Label htmlFor="relaxedProduct">Relaxed product matching</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="relaxedFunction" 
                  checked={relaxedFunction}
                  onCheckedChange={setRelaxedFunction}
                />
                <Label htmlFor="relaxedFunction">Relaxed function matching</Label>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm font-medium mb-2">Select companies to analyze:</p>
            <Tabs value={selectionMode} onValueChange={(value) => setSelectionMode(value as SelectionMode)}>
              <TabsList className="w-full mb-4">
                <TabsTrigger value="category" className="flex-1">
                  By Category
                </TabsTrigger>
                <TabsTrigger 
                  value="selected" 
                  className="flex-1"
                  disabled={selectedCompanies.length === 0}
                >
                  Selected ({selectedCompanies.length})
                </TabsTrigger>
              </TabsList>
              
              <div className="space-y-4">
                {selectionMode === "category" ? (
                  <div className="flex flex-col space-y-2">
                    {Object.entries(categories).map(([key, { companies, selected, title }]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`${key}-category`}
                          checked={selected}
                          onCheckedChange={(checked) => setCategories(prev => ({
                            ...prev,
                            [key]: { ...prev[key], selected: checked === true }
                          }))}
                          disabled={companies.length === 0}
                        />
                        <Label htmlFor={`${key}-category`}>
                          {title} ({companies.length})
                        </Label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    {selectedCompanies.length} companies selected
                  </div>
                )}

                <div className="bg-muted p-3 rounded-md">
                  <p className="text-sm">
                    <span className="font-semibold">Total Credits Required:</span> {totalCredits}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Each company analysis costs 1 credit
                  </p>
                </div>
              </div>
            </Tabs>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleAnalysis} 
            disabled={isAnalyzing || totalCredits === 0}
            className="bg-primary hover:bg-primary/90"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <ThumbsUp className="mr-2 h-4 w-4" />
                Start Analysis
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 