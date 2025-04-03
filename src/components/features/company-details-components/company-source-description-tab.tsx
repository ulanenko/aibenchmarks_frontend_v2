import { useState, useEffect, useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Company } from "@/lib/company/company"
import { VALIDATION } from "@/config/validation"
import { useToast } from "@/hooks/use-toast"
import { updateCompany } from "@/services/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

// Utility function for word count calculation
const calculateWordCount = (text: string): number => {
    const trimmed = text.trim()
    return trimmed ? trimmed.split(/\s+/).length : 0
}

interface DescriptionSourceTabProps {
    company: Company
    onActionsChange?: (actions: React.ReactNode) => void
}

interface TabContentSectionProps {
    minWordCount: number
    defaultValue: string
    onChange?: (value: string) => void
    isEditable: boolean
}

function TabContentSection({ minWordCount, defaultValue, onChange, isEditable }: TabContentSectionProps) {
    const [customDescription, setCustomDescription] = useState<string>(defaultValue)
    const wordCount = useMemo(() => calculateWordCount(customDescription), [customDescription])
    const isValidWordCount = useMemo(() => calculateWordCount(customDescription) >= minWordCount, [customDescription, minWordCount])

    const handleCustomDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setCustomDescription(e.target.value)
        onChange?.(e.target.value)
    }

    return (
        <div className="rounded-md border p-1">
            <textarea
                className="w-full min-h-[200px] p-3 focus:outline-none resize-y"
                placeholder="Enter a custom description for this company..."
                value={customDescription}
                disabled={!isEditable}
                onChange={handleCustomDescriptionChange}
            ></textarea>
            <div className="flex justify-between items-center mt-2 px-3">
                <span className={`text-xs ${!isValidWordCount ? 'text-red-500' : 'text-gray-500'}`}>
                    <strong>Minimum {minWordCount} words required</strong>
                </span>
                <span className="text-xs text-gray-500">{wordCount} words</span>
            </div>
        </div>
    )
}

export function DescriptionSourceTab({ company, onActionsChange }: DescriptionSourceTabProps) {
    const [activeDescriptionTab, setActiveDescriptionTab] = useState<string>("trade-description")
    const minWordCount = VALIDATION.COMPANY_DESCRIPTION_MIN_WORDS
    const [customDescription, setCustomDescription] = useState(company.inputValues.fullOverviewManual || "")
    const [isSaving, setIsSaving] = useState(false)
    const { toast } = useToast()

    // Pass actions to parent component
    useEffect(() => {
        if (onActionsChange) {
            onActionsChange(
                <Button
                    onClick={handleSaveDescription}
                    disabled={isSaving || (activeDescriptionTab === 'custom-description' && calculateWordCount(customDescription) < minWordCount)}
                >
                    {isSaving ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                    ) : null}
                    Save Description
                </Button>
            )
        }
    }, [onActionsChange, activeDescriptionTab, customDescription, isSaving, minWordCount])

    const handleSaveDescription = async () => {
        if (activeDescriptionTab !== 'custom-description' || calculateWordCount(customDescription) < minWordCount) {
            toast({
                title: "Validation Error",
                description: `Description must be at least ${minWordCount} words.`,
                variant: "destructive"
            })
            return
        }

        setIsSaving(true)
        try {
            // Update the company with the new description
            await updateCompany(company.id, {
                fullOverviewManual: customDescription
            })

            // Update local state
            // company.inputValues.fullOverviewManual = customDescription

            toast({
                title: "Success",
                description: "Description updated successfully."
            })
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to update description",
                variant: "destructive"
            })
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <Tabs
            defaultValue="trade-description"
            value={activeDescriptionTab}
            onValueChange={setActiveDescriptionTab}
            className="w-full"
        >
            <div>
                <h3 className="text-lg font-medium">Company Description</h3>
                <p className="text-sm text-muted-foreground mt-1">
                    The descriptions below will be used as a <span className="font-medium">fallback</span> to determine the
                    company's functionality if no accessible website can be found.
                </p>
            </div>

            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="trade-description">Trade Description</TabsTrigger>
                <TabsTrigger value="full-overview">Full Overview</TabsTrigger>
                <TabsTrigger value="custom-description">Custom Description</TabsTrigger>
            </TabsList>

            {/* Trade Description Tab */}
            <TabsContent value="trade-description" className="space-y-4 py-4">
                <TabContentSection
                    minWordCount={minWordCount}
                    defaultValue={company.inputValues.tradeDescriptionEnglish || company.searchedCompanyData?.product_service_description || ""}
                    isEditable={false}
                />
            </TabsContent>

            {/* Full Overview Tab */}
            <TabsContent value="full-overview" className="space-y-4 py-4">
                <TabContentSection
                    minWordCount={minWordCount}
                    defaultValue={company.inputValues.fullOverview || company.searchedCompanyData?.business_description || ""}
                    isEditable={false}
                />
            </TabsContent>

            {/* Custom Description Tab */}
            <TabsContent value="custom-description" className="space-y-4 py-4">
                <TabContentSection
                    minWordCount={minWordCount}
                    defaultValue={customDescription}
                    onChange={setCustomDescription}
                    isEditable={true}
                />
            </TabsContent>

            <div className="bg-muted p-3 rounded-md">
                <p className="text-sm mb-2">
                    <span className="font-medium">For a successful analysis</span>, a description should be at least
                    50 words long and include the following:
                </p>
                <ol className="text-sm list-decimal pl-5 space-y-1">
                    <li>Main products/services</li>
                    <li>Key business activities</li>
                    <li>Legal structure</li>
                </ol>
            </div>
        </Tabs>
    )
} 