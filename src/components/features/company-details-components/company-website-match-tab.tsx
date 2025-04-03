import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Info, AlertCircle, CheckCircle, ChevronUp, ChevronDown } from "lucide-react"
import { Company } from "@/lib/company/company"
import { CATEGORIES } from "@/config/categories"
import { SiteMatch, SiteMatchStatus } from "@/services/backend/models/searchedCompany"
import { CategoryDefinition } from "@/lib/category-definition"

const statusToCategoryMap: Record<SiteMatchStatus | "N/A", CategoryDefinition> = {
    "Likely": CATEGORIES.SITE_MATCH.LIKELY,
    "Possibly": CATEGORIES.SITE_MATCH.POSSIBLY,
    "Not Likely": CATEGORIES.SITE_MATCH.NOT_LIKELY,
    "No Match": CATEGORIES.SITE_MATCH.NO_MATCH,
    "Partial Match": CATEGORIES.SITE_MATCH.PARTIAL_MATCH,
    "No Data": CATEGORIES.SITE_MATCH.NOT_AVAILABLE,
    "Uncertain": CATEGORIES.SITE_MATCH.UNCERTAIN,
    "N/A": CATEGORIES.SITE_MATCH.NOT_AVAILABLE,
}

interface WebAnalysisTabProps {
    company: Company
    onActionsChange?: (actions: React.ReactNode) => void
}

export function WebAnalysisTab({ company, onActionsChange }: WebAnalysisTabProps) {
    const [visibleExplanations, setVisibleExplanations] = useState<Record<string, boolean>>({})

    // Get site match from company data
    const siteMatch = company.searchedCompanyData?.site_match
    const { SITE_MATCH, WEBSEARCH } = company.categoryValues!

    // Pass actions to parent component
    useEffect(() => {
        if (onActionsChange) {
            onActionsChange(
                <Button onClick={handleRefreshAnalysis}>Refresh Analysis</Button>
            )
        }
    }, [onActionsChange])

    // Function to toggle explanation visibility
    const toggleExplanation = (matchType: string) => {
        setVisibleExplanations(prev => ({
            ...prev,
            [matchType]: !prev[matchType]
        }))
    }

    const getBadgeForMatchStatus = (result: SiteMatchStatus | null) => {
        const category = statusToCategoryMap[result ?? 'N/A']
        return category?.createBadge(result ?? 'N/A', company) || <Badge variant="outline">{result ?? 'N/A'}</Badge>
    }

    const handleRefreshAnalysis = () => {
        console.log('Refreshing analysis for', company.inputValues.name)
    }

    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-lg font-medium">Website Match Analysis</h3>
                <p className="text-sm text-muted-foreground mt-1">
                    Review how well the website content matches the company information.
                </p>
            </div>

            {!siteMatch && (
                <div className="rounded-lg border p-4">
                    <p className="text-muted-foreground flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        <span>
                            {WEBSEARCH.category.status === 'completed' ? 'No site match analysis found.' : 'Site match analysis is not performed or is still running.'}
                        </span>
                    </p>
                </div>
            )}
            {siteMatch && (
                <>
                    {(() => {
                        const matchTypes = [
                            { label: "Overall Result", status: siteMatch.overall_result, isOverall: true, explanation: siteMatch.explanation },
                            { label: "Name Match", status: siteMatch.name_match_status, isOverall: false, explanation: siteMatch.name_match_notes },
                            { label: "Registration ID Match", status: siteMatch.registration_id_match_status, isOverall: false, explanation: siteMatch.registration_id_match_notes },
                            { label: "Address Match", status: siteMatch.address_match_status, isOverall: false, explanation: siteMatch.address_match_notes },
                            { label: "Description Match", status: siteMatch.description_match_status, isOverall: false, explanation: siteMatch.description_match_notes },
                        ];

                        return (
                            <div className="space-y-3">
                                {matchTypes.map((matchType, index) => (
                                    <div className="rounded-lg border p-4" key={index}>
                                        <div className={`flex justify-between items-center ${matchType.isOverall ? 'mb-4' : ''}`}>
                                            <h3 className={matchType.isOverall ? "text-lg font-medium" : "font-medium"}>
                                                {matchType.label}
                                            </h3>
                                            {getBadgeForMatchStatus(matchType.status)}
                                        </div>

                                        {matchType.explanation && (
                                            <div className="mt-2">
                                                {!matchType.isOverall && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
                                                        onClick={() => toggleExplanation(matchType.label)}
                                                    >
                                                        {visibleExplanations[matchType.label] ? "Hide details" : "See details"}
                                                        <ChevronDown
                                                            className={`h-4 w-4 transition-transform duration-200 ${visibleExplanations[matchType.label] ? "rotate-180" : ""
                                                                }`}
                                                        />
                                                    </Button>
                                                )}
                                                <div
                                                    className={`overflow-hidden transition-all duration-200 ease-in-out ${matchType.isOverall || visibleExplanations[matchType.label]
                                                        ? 'max-h-[500px] opacity-100'
                                                        : 'max-h-0 opacity-0'
                                                        }`}
                                                >
                                                    <div className="p-4 bg-muted rounded-md mt-2">{matchType.explanation}</div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        );
                    })()}
                </>
            )}
        </div>
    )
} 