'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
import { Loader2, Search } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { toast } from 'sonner';
import { analyzeCompanyService } from '@/lib/company/services/companyAnalysisService';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Company } from '@/lib/company';
import { getObjectsByCategory } from '@/lib/company/utils';

interface SearchModalProps {
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

export function SearchModal({ open, onOpenChange }: SearchModalProps) {
  const [isSearching, setIsSearching] = useState(false);
  const [selectionMode, setSelectionMode] = useState<SelectionMode>("category");
  const [categories, setCategories] = useState<Categories>({
    ready: { companies: [], selected: true, title: 'Ready for Analysis' },
    in_progress: { companies: [], selected: false, title: 'In Progress' },
    completed: { companies: [], selected: false, title: 'Analysis Completed' },
    failed: { companies: [], selected: false, title: 'Analysis Failed' },
    not_ready: { companies: [], selected: false, title: 'Not Ready (can\'t be analyzed)' }
  });
  const [selectedCompanies, setSelectedCompanies] = useState<Company[]>([]);
  
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

    // Get companies by WEBSEARCH status
    const companiesByStatus = getObjectsByCategory(
      companies,
      'categoryValues.WEBSEARCH.category.status'
    );
    setCategories((state) => {
      const newState = {...state};
      Object.entries(newState).forEach(([key, value]) => {
        value.companies = companiesByStatus[key as keyof typeof companiesByStatus] || [];
      });
      return newState;
    });

    // // Get companies that are not ready (missing required fields)
    // const notReadyCompanies = filteredCompanies.filter(company => {
    //   const inputValues = company.inputValues;
    //   return !inputValues?.name || !inputValues?.country;
    // });

    // return {
    //   ready: { 
    //     companies: companiesByStatus['ready'] || [], 
    //     selected: categories.ready.selected, 
    //     title: 'Ready for Analysis' 
    //   },
    //   in_progress: { 
    //     companies: companiesByStatus['in_progress'] || [], 
    //     selected: categories.in_progress.selected, 
    //     title: 'In Progress' 
    //   },
    //   completed: { 
    //     companies: companiesByStatus['completed'] || [], 
    //     selected: categories.completed.selected, 
    //     title: 'Analysis Completed' 
    //   },
    //   failed: { 
    //     companies: companiesByStatus['failed'] || [], 
    //     selected: categories.failed.selected, 
    //     title: 'Analysis Failed' 
    //   },
    //   not_ready: { 
    //     companies: notReadyCompanies, 
    //     selected: categories.not_ready.selected, 
    //     title: 'Not Ready' 
    //   }
    // };
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

  // Handle search button click
  const handleSearch = async () => {
    setIsSearching(true);
    
    try {
      // Get companies based on selection mode
      let companiesToSearch: Company[] = [];
      
      if (selectionMode === "category") {
        Object.values(categories).forEach(({ companies, selected }) => {
          if (selected) {
            companiesToSearch.push(...companies);
          }
        });
      } else {
        // Selected mode - use all selected companies that are valid for search
        companiesToSearch = selectedCompanies.filter(company => 
          company.categoryValues?.INPUT.category.status === 'completed'
        );
      }
      
      if (companiesToSearch.length === 0) {
        toast.warning("No companies available for search. Please select valid companies.");
        setIsSearching(false);
        return;
      }
      
      const result = await analyzeCompanyService(companiesToSearch, {
        authCode: 6666666, // Default auth code
      });
      
      if (result.success) {
        toast.success(result.message);
        startAutoRefresh();
        if(selectionMode === "selected"){
          useCompanyStore.getState().updateCompanies(companiesToSearch.map(company => ({
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
      console.error('Error starting search:', error);
      toast.error('Error starting search', {
        description: error instanceof Error ? error.message : 'Failed to start search'
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Company Analysis</DialogTitle>
          <DialogDescription>
            This module creates a comprehensive analysis of the selected companies using a combination of web crawling and the company description.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex flex-col space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Total companies:</span>
              <span className="font-semibold">{companies.length}</span>
            </div>
          </div>

          <div className="pt-4 border-t">
            <Tabs value={selectionMode} onValueChange={(value) => setSelectionMode(value as SelectionMode)}>
              <TabsList className="w-full mb-4">
                <TabsTrigger value="category" className="flex-1">
                  Search Category
                </TabsTrigger>
                <TabsTrigger 
                  value="selected" 
                  className="flex-1"
                  disabled={selectedCompanies.length === 0}
                >
                  Search Selected ({selectedCompanies.length})
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
                          disabled={companies.length === 0 || key === 'not_ready'}
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

        <DialogFooter className="flex justify-between sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSearching}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSearch}
            disabled={
              isSearching || 
              totalCredits === 0 ||
              (selectionMode === "selected" && selectedCompanies.length === 0)
            }
            className="bg-primary hover:bg-primary/90"
          >
            {isSearching ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Start Search ({totalCredits} credits)
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 