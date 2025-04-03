// "use client"

// import { useState, useEffect, useCallback } from "react"
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogDescription } from "@/components/ui/dialog"
// import { Button } from "@/components/ui/button"
// import { Globe, FileText, BarChart } from "lucide-react"
// import { Company } from "@/lib/company/company"
// import { WebsiteSourceTab } from "./WebsiteSourceTab"
// import { DescriptionSourceTab } from "./features/company-details-components/company-source-description-tab"
// import { WebAnalysisTab } from "./WebAnalysisTab"
// import { cn } from "@/lib/utils"
// import { useCompanyStore } from "@/stores/use-company-store"
// import { useShallow } from 'zustand/react/shallow'

// // Define the possible pages/tabs of the modal
// export type CompanyDetailsTab = "website" | "description" | "analysis" | "source-used";

// interface CompanyDetailsDialogueProps {
//   open?: boolean
//   onOpenChange?: (open: boolean) => void
// }

// export function CompanyDetailsDialogue({ open: controlledOpen, onOpenChange: controlledOnOpenChange }: CompanyDetailsDialogueProps) {
//   // Internal state
//   const [isOpen, setIsOpen] = useState(false)
//   const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null)

//   // For footer actions
//   const [activeTabActions, setActiveTabActions] = useState<React.ReactNode>(null)

//   // Get companies from the store
//   const { companies } = useCompanyStore(
//     useShallow((state) => ({
//       companies: state.companies
//     }))
//   )

//   // Get the selected company from the store
//   const selectedCompany = selectedCompanyId
//     ? companies.find(company => company.id === selectedCompanyId)
//     : null

//   // Default to "website" if url exists, otherwise "description"
//   const [activeSource, setActiveSource] = useState<CompanyDetailsTab>("website")

//   // Reset active source when company changes
//   useEffect(() => {
//     if (selectedCompany) {
//       setActiveSource(selectedCompany.inputValues.url ? "website" : "description")
//     }
//   }, [selectedCompany])

//   // Handle the open source information modal event
//   const handleOpenModal = useCallback((event: CustomEvent<{
//     companyId: number,
//     initialPage?: CompanyDetailsTab
//   }>) => {
//     const { companyId, initialPage } = event.detail
//     if (!companyId) return

//     setSelectedCompanyId(companyId)
//     setIsOpen(true)

//     // Set the initial page if provided
//     if (initialPage) {
//       setActiveSource(initialPage)
//     }

//     // Call the controlled onOpenChange if provided
//     if (controlledOnOpenChange) {
//       controlledOnOpenChange(true)
//     }
//   }, [controlledOnOpenChange])

//   // Handle close
//   const handleClose = useCallback((open: boolean) => {
//     setIsOpen(open)

//     // When closing, clear the selected company
//     if (!open) {
//       setSelectedCompanyId(null)
//       setActiveTabActions(null)
//     }

//     // Call the controlled onOpenChange if provided
//     if (controlledOnOpenChange) {
//       controlledOnOpenChange(open)
//     }
//   }, [controlledOnOpenChange])

//   // Set up the event listener
//   useEffect(() => {
//     window.addEventListener(
//       'openCompanyDetailsDialogue',
//       handleOpenModal as EventListener
//     )

//     return () => {
//       window.removeEventListener(
//         'openCompanyDetailsDialogue',
//         handleOpenModal as EventListener
//       )
//     }
//   }, [handleOpenModal])

//   // Sync with controlled state if provided
//   useEffect(() => {
//     if (controlledOpen !== undefined && controlledOpen !== isOpen) {
//       setIsOpen(controlledOpen)

//       // Clear company ID when externally closed
//       if (!controlledOpen) {
//         setSelectedCompanyId(null)
//         setActiveTabActions(null)
//       }
//     }
//   }, [controlledOpen, isOpen])

//   // Handler to receive actions from child tabs
//   const handleTabActions = useCallback((actions: React.ReactNode) => {
//     setActiveTabActions(actions);
//   }, []);

//   // If no company is selected, don't render
//   if (!selectedCompany) return null

//   const { WEBSITE, DESCRIPTION, SOURCE_USED, SITE_MATCH, INPUT, WEBSEARCH } = selectedCompany.categoryValues!

//   return (
//     <Dialog open={isOpen} onOpenChange={handleClose}>
//       <DialogContent className="max-w-5xl h-[90vh] overflow-hidden p-0 flex flex-col gap-0">
//         {/* Dialog Header */}
//         <div className="border-b bg-background p-6 flex-none">
//           <DialogTitle className="text-xl">Sources for {selectedCompany.inputValues.name}</DialogTitle>
//           <DialogDescription className="mt-2">
//             View and manage the sources used to analyze this company, including website information and company descriptions.
//           </DialogDescription>
//         </div>

//         {/* Main Content Area */}
//         <div className="flex flex-1 min-h-0"> {/* min-h-0 is crucial for nested flex scroll */}
//           {/* Sidebar */}
//           <div className="w-64 border-r bg-muted/10 flex flex-col flex-none">
//             {/* Sidebar Navigation */}
//             <div className="px-2 py-4 space-y-4 flex-1 overflow-y-auto">
//               {/* Sources Section */}
//               <div className="space-y-1">
//                 <p className="text-xs uppercase tracking-wider text-muted-foreground px-2">Sources</p>
//                 <div className="bg-secondary/50 flex items-center justify-between gap-3 w-full p-2 rounded-lg transition-colors">
//                   <span className="italic">
//                     Step status:
//                   </span>
//                   {INPUT.category.getBadgeIcon(selectedCompany, true, 'sm')}
//                 </div>

//                 <button
//                   onClick={() => setActiveSource("website")}
//                   className={cn(
//                     "flex items-center gap-3 w-full p-2 rounded-lg transition-colors",
//                     activeSource === "website"
//                       ? "bg-secondary text-secondary-foreground"
//                       : "hover:bg-muted"
//                   )}
//                 >
//                   {WEBSITE.category.getBadgeIcon(selectedCompany, false, 'md')}
//                   <span>Website</span>
//                 </button>
//                 <button
//                   onClick={() => setActiveSource("description")}
//                   className={cn(
//                     "flex items-center gap-3 w-full p-2 rounded-lg transition-colors",
//                     activeSource === "description"
//                       ? "bg-secondary text-secondary-foreground font-medium"
//                       : "hover:bg-muted"
//                   )}
//                 >
//                   {DESCRIPTION.category.getBadgeIcon(selectedCompany, false, 'md')}
//                   <span>Descriptions</span>
//                 </button>
//               </div>

//               {/* Company Analysis Section */}
//               <div className="space-y-1 ">
//                 <p className="text-xs uppercase tracking-wider text-muted-foreground px-2">Company Analysis</p>

//                 <div className="bg-secondary/50 flex items-center justify-between gap-3 w-full p-2 rounded-lg transition-colors">
//                   <span className="italic">
//                     Step status:
//                   </span>
//                   {WEBSEARCH.category.getBadgeIcon(selectedCompany, true, 'sm')}
//                 </div>

//                 <button
//                   onClick={() => setActiveSource("source-used")}
//                   className={cn(
//                     "flex items-center gap-3 w-full p-2 rounded-lg transition-colors",
//                     activeSource === "source-used"
//                       ? "bg-secondary text-secondary-foreground"
//                       : "hover:bg-muted"
//                   )}
//                 >
//                   {SOURCE_USED.category.getBadgeIcon(selectedCompany, false, 'md')}
//                   <span>Source used: <span className="italic">{SOURCE_USED.category.label}</span></span>
//                 </button>

//                 <button
//                   onClick={() => setActiveSource("analysis")}
//                   className={cn(
//                     "flex items-center gap-3 w-full p-2 rounded-lg transition-colors",
//                     activeSource === "analysis"
//                       ? "bg-secondary text-secondary-foreground"
//                       : "hover:bg-muted"
//                   )}
//                 >
//                   {SITE_MATCH.category.getBadgeIcon(selectedCompany, false, 'md')}
//                   <span>Website details</span>
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* Main Content */}
//           <div className="flex-1 flex flex-col min-h-0"> {/* min-h-0 ensures proper scroll containment */}
//             {/* Scrollable Content Area */}
//             <div className="flex-1 overflow-y-auto p-6">
//               {activeSource === "website" && (
//                 <WebsiteSourceTab
//                   company={selectedCompany}
//                   onActionsChange={handleTabActions}
//                 />
//               )}
//               {activeSource === "description" && (
//                 <DescriptionSourceTab
//                   company={selectedCompany}
//                   onActionsChange={handleTabActions}
//                 />
//               )}
//               {activeSource === "analysis" && (
//                 <WebAnalysisTab
//                   company={selectedCompany}
//                   onActionsChange={handleTabActions}
//                 />
//               )}
//               {activeSource === "source-used" && (
//                 <div className="space-y-6">
//                   <div>
//                     <h3 className="text-lg font-medium">Source Used</h3>
//                     <p className="text-sm text-muted-foreground mt-1">
//                       Information about which source was used for the company analysis.
//                     </p>
//                   </div>
//                   <div className="border rounded-lg p-4">
//                     <h4 className="font-medium mb-2">Source Status</h4>
//                     <div className="flex items-center gap-2">
//                       {SOURCE_USED.category.getBadgeIcon(selectedCompany)}
//                       <span>{SOURCE_USED.category.label}</span>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Sticky Footer - now properly anchored */}
//             <div className="border-t bg-background p-4 flex justify-end flex-none">

//               {activeTabActions}
//             </div>
//           </div>
//         </div>
//       </DialogContent>
//     </Dialog>
//   )
// } 