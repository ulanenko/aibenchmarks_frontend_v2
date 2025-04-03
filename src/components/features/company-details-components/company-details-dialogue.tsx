"use client"

import { useState, useEffect, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Globe, FileText, BarChart } from "lucide-react"
import { Company } from "@/lib/company/company"
import { DescriptionSourceTab } from "./company-source-description-tab"
import { WebAnalysisTab } from "./company-website-match-tab"
import { cn } from "@/lib/utils"
import { useCompanyStore } from "@/stores/use-company-store"
import { useShallow } from 'zustand/react/shallow'
import { WebsiteSourceTab } from "./company-source-website-tab"
import { SourceUsedTab } from "./company-source-used-tab"
import { CompanyComparabilityTab } from "./company-comparability-tab"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { CompanyInfoBar } from "./company-info-bar"

// Define the possible pages/tabs of the modal
export type CompanyDetailsTab = "website" | "description" | "analysis" | "source-used" | "comparability";

interface CompanyDetailsDialogueProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function CompanyDetailsDialogue({ open: controlledOpen, onOpenChange: controlledOnOpenChange }: CompanyDetailsDialogueProps) {
  // Internal state
  const [isOpen, setIsOpen] = useState(false)
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null)
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  // For footer actions
  const [activeTabActions, setActiveTabActions] = useState<React.ReactNode>(null)

  // Get companies from the store
  const { companies } = useCompanyStore(
    useShallow((state) => ({
      companies: state.companies
    }))
  )

  // Get the selected company from the store
  const selectedCompany = selectedCompanyId
    ? companies.find(company => company.id === selectedCompanyId)
    : null

  // Default to "website" if url exists, otherwise "description"
  const [activeSource, setActiveSource] = useState<CompanyDetailsTab>(() => {
    // Initialize from URL parameters if they exist
    const tab = searchParams.get('tab') as CompanyDetailsTab
    const companyId = searchParams.get('companyId')
    if (tab && companyId) {
      return tab
    }
    return "website"
  })

  // Function to update URL parameters
  const updateUrlParams = useCallback((companyId: number, tab: CompanyDetailsTab) => {
    const params = new URLSearchParams(searchParams)
    params.set('companyId', companyId.toString())
    params.set('tab', tab)
    router.replace(`${pathname}?${params.toString()}`)
  }, [pathname, router, searchParams])

  // Function to clear URL parameters
  const clearUrlParams = useCallback(() => {
    const params = new URLSearchParams(searchParams)
    params.delete('companyId')
    params.delete('tab')
    router.replace(pathname)
  }, [pathname, router, searchParams])

  // Handle the open source information modal event
  const handleOpenModal = useCallback((event: CustomEvent<{
    companyId: number,
    initialPage?: CompanyDetailsTab
  }>) => {
    const { companyId, initialPage } = event.detail
    if (!companyId) return

    setSelectedCompanyId(companyId)
    setIsOpen(true)

    // Set the initial page if provided and update URL
    if (initialPage) {
      setActiveSource(initialPage)
      updateUrlParams(companyId, initialPage)
    } else {
      updateUrlParams(companyId, "website")
    }

    // Call the controlled onOpenChange if provided
    if (controlledOnOpenChange) {
      controlledOnOpenChange(true)
    }
  }, [controlledOnOpenChange, updateUrlParams])

  // Handle tab changes
  const handleTabChange = useCallback((tab: CompanyDetailsTab) => {
    setActiveSource(tab)
    if (selectedCompanyId) {
      updateUrlParams(selectedCompanyId, tab)
    }
  }, [selectedCompanyId, updateUrlParams])

  // Handle close
  const handleClose = useCallback((open: boolean) => {
    setIsOpen(open)

    // When closing, clear the selected company and URL parameters
    if (!open) {
      setSelectedCompanyId(null)
      setActiveTabActions(null)
      clearUrlParams()
    }

    // Call the controlled onOpenChange if provided
    if (controlledOnOpenChange) {
      controlledOnOpenChange(open)
    }
  }, [controlledOnOpenChange, clearUrlParams])

  // Check URL parameters on mount and when they change
  useEffect(() => {
    const tab = searchParams.get('tab') as CompanyDetailsTab
    const companyId = searchParams.get('companyId')

    if (companyId && tab) {
      const id = parseInt(companyId, 10)
      if (!isNaN(id) && companies.some(c => c.id === id)) {
        setSelectedCompanyId(id)
        setActiveSource(tab)
        setIsOpen(true)
        if (controlledOnOpenChange) {
          controlledOnOpenChange(true)
        }
      }
    }
  }, [searchParams, companies, controlledOnOpenChange])

  // Set up the event listener
  useEffect(() => {
    window.addEventListener(
      'openCompanyDetailsDialogue',
      handleOpenModal as EventListener
    )

    return () => {
      window.removeEventListener(
        'openCompanyDetailsDialogue',
        handleOpenModal as EventListener
      )
    }
  }, [handleOpenModal])

  // Sync with controlled state if provided
  useEffect(() => {
    if (controlledOpen !== undefined && controlledOpen !== isOpen) {
      setIsOpen(controlledOpen)

      // Clear company ID when externally closed
      if (!controlledOpen) {
        setSelectedCompanyId(null)
        setActiveTabActions(null)
      }
    }
  }, [controlledOpen, isOpen])

  // Handler to receive actions from child tabs
  const handleTabActions = useCallback((actions: React.ReactNode) => {
    setActiveTabActions(actions);
  }, []);

  // If no company is selected, don't render
  if (!selectedCompany) return null

  const { WEBSITE, DESCRIPTION, SOURCE_USED, SITE_MATCH, INPUT, WEBSEARCH, ACCEPT_REJECT, HUMAN_REVIEW, REVIEW_PRIORITY } = selectedCompany.categoryValues!

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl h-[90vh] overflow-hidden p-0 flex  flex-col gap-0">
        {/* Dialog Header */}
        <div className="border-b bg-background p-6 pb-2 flex-none">
          <DialogTitle className="text-xl">Sources for {selectedCompany.inputValues.name}</DialogTitle>

        </div>

        <CompanyInfoBar company={selectedCompany} />

        {/* Main Content Area */}
        <div className="flex flex-1 min-h-0"> {/* min-h-0 is crucial for nested flex scroll */}
          {/* Sidebar */}
          <div className="w-64 border-r bg-muted/10 flex flex-col flex-none">
            {/* Sidebar Navigation */}
            <div className="px-2 py-4 space-y-6 flex-1 overflow-y-auto">
              {/* Sources Section */}
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground px-2">Sources</p>

                <div className="rounded-lg border overflow-hidden">
                  <div className="flex items-center justify-between w-full p-2 bg-muted/50">
                    <span className="text-sm font-normal text-muted-foreground">Progress</span>
                    {INPUT.category.getBadgeIcon(selectedCompany, true, 'md')}
                  </div>
                  <button
                    onClick={() => handleTabChange("website")}
                    className={cn(
                      "flex items-center gap-3 w-full p-2 transition-colors border-t",
                      activeSource === "website"
                        ? "bg-secondary text-secondary-foreground"
                        : "hover:bg-muted"
                    )}
                  >
                    {WEBSITE.category.getBadgeIcon(selectedCompany, false, 'md')}
                    <span>Website</span>
                  </button>
                  <button
                    onClick={() => handleTabChange("description")}
                    className={cn(
                      "flex items-center gap-3 w-full p-2 transition-colors border-t",
                      activeSource === "description"
                        ? "bg-secondary text-secondary-foreground"
                        : "hover:bg-muted"
                    )}
                  >
                    {DESCRIPTION.category.getBadgeIcon(selectedCompany, false, 'md')}
                    <span>Description</span>
                  </button>
                </div>
              </div>

              {/* Company Analysis Section */}
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground px-2">Analysis</p>

                <div className="rounded-lg border overflow-hidden">
                  <div className="flex items-center justify-between w-full p-2 bg-muted/50">
                    <span className="text-sm font-normal text-muted-foreground">Progress</span>
                    {WEBSEARCH.category.getBadgeIcon(selectedCompany, true, 'md')}
                  </div>
                  <button
                    onClick={() => handleTabChange("source-used")}
                    className={cn(
                      "flex items-center gap-3 w-full p-2 transition-colors border-t",
                      activeSource === "source-used"
                        ? "bg-secondary text-secondary-foreground"
                        : "hover:bg-muted"
                    )}
                  >
                    {SOURCE_USED.category.getBadgeIcon(selectedCompany, false, 'md')}
                    <span>Source Used</span>
                  </button>
                  <button
                    onClick={() => handleTabChange("analysis")}
                    className={cn(
                      "flex items-center gap-3 w-full p-2 transition-colors border-t",
                      activeSource === "analysis"
                        ? "bg-secondary text-secondary-foreground"
                        : "hover:bg-muted"
                    )}
                  >
                    {SITE_MATCH.category.getBadgeIcon(selectedCompany, false, 'md')}
                    <span>Website Match</span>
                  </button>
                </div>
              </div>

              {/* Comparability Section */}
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground px-2">Review</p>

                <div className="rounded-lg border overflow-hidden">
                  <div className="flex flex-col divide-y">
                    <div className="flex items-center justify-between w-full p-2 bg-muted/50">
                      <span className="text-sm font-normal text-muted-foreground">AI Review</span>
                      {ACCEPT_REJECT.category.getBadgeIcon(selectedCompany, true, 'md')}
                    </div>
                    <div className="flex items-center justify-between w-full p-2 bg-muted/50">
                      <span className="text-sm font-normal text-muted-foreground">Priority</span>
                      {REVIEW_PRIORITY.category.getBadgeIcon(selectedCompany, true, 'md')}
                    </div>
                  </div>
                  <button
                    onClick={() => handleTabChange("comparability")}
                    className={cn(
                      "flex items-center gap-3 w-full p-2 transition-colors border-t",
                      activeSource === "comparability"
                        ? "bg-secondary text-secondary-foreground"
                        : "hover:bg-muted"
                    )}
                  >
                    {HUMAN_REVIEW.category.getBadgeIcon(selectedCompany, false, 'md')}
                    <span>Human Review</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col min-h-0"> {/* min-h-0 ensures proper scroll containment */}
            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeSource === "website" && (
                <WebsiteSourceTab
                  company={selectedCompany}
                  onActionsChange={handleTabActions}
                />
              )}
              {activeSource === "description" && (
                <DescriptionSourceTab
                  company={selectedCompany}
                  onActionsChange={handleTabActions}
                />
              )}
              {activeSource === "analysis" && (
                <WebAnalysisTab
                  company={selectedCompany}
                  onActionsChange={handleTabActions}
                />
              )}
              {activeSource === "source-used" && (
                <SourceUsedTab
                  company={selectedCompany}
                  onActionsChange={handleTabActions}
                />
              )}
              {activeSource === "comparability" && (
                <CompanyComparabilityTab
                  company={selectedCompany}
                  onActionsChange={handleTabActions}
                />
              )}
            </div>

            {/* Sticky Footer - now properly anchored */}
            <div className="border-t bg-background p-4 flex justify-end flex-none">

              {activeTabActions}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 