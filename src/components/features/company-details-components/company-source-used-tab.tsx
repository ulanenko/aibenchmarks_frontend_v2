import { Company } from "@/lib/company/company"
import { Badge } from "@/components/ui/badge"
import { fetchScrapedWebsites } from "@/app/actions/scraped-websites-actions"
import { useState, useEffect } from "react"
import { Image, Info } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

/**
 * Interface for a scraped website
 */
interface ScrapedWebsite {
    id: number;
    searched_company: string | null;
    url: string | null;
    content: string | null;
    screenshot: string | null;
    search_id: string | null;
    auth_code: string | null;
    accessed_on: Date | null;
    screenshot_status: string | null;
    page_title: string | null;
}

interface SourceUsedTabProps {
    company: Company
    onActionsChange?: (actions: React.ReactNode) => void
}

export function SourceUsedTab({ company, onActionsChange }: SourceUsedTabProps) {
    const [scrapedWebsites, setScrapedWebsites] = useState<ScrapedWebsite[]>([])
    const [isLoadingScrapedWebsites, setIsLoadingScrapedWebsites] = useState(false)
    const [showScreenshots, setShowScreenshots] = useState(true)
    const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null)

    const { SOURCE_USED, WEBSEARCH } = company.categoryValues!
    const sourceIsDescription = SOURCE_USED.category.label === "Description"

    // Fetch scraped websites when the component mounts or when the search ID changes
    useEffect(() => {
        const fetchWebsites = async () => {
            if (company.searchedCompanyData?.search_id && !sourceIsDescription) {
                setIsLoadingScrapedWebsites(true)
                try {
                    const websites = await fetchScrapedWebsites(company.searchedCompanyData.search_id)
                    setScrapedWebsites(websites)
                } catch (error) {
                    console.error('Error fetching scraped websites:', error)
                } finally {
                    setIsLoadingScrapedWebsites(false)
                }
            }
        }
        fetchWebsites()
    }, [company.searchedCompanyData?.search_id, sourceIsDescription])

    // Pass actions to parent component
    useEffect(() => {
        if (onActionsChange) {
            onActionsChange(null)
        }
    }, [onActionsChange])

    if (sourceIsDescription) {
        return (
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-medium">Source Used</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        The analysis for this company was based on its description.
                    </p>
                </div>
                <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Source Status</h4>
                    <div className="flex items-center gap-2">
                        {SOURCE_USED.category.getBadgeIcon(company)}
                        <span>{SOURCE_USED.category.label}</span>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Source Used</h3>
                <p className="text-sm text-muted-foreground mt-1">
                    View the sources used for the company analysis.
                </p>
            </div>

            <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">Source Status</h4>
                <div className="flex items-center gap-2">
                    {SOURCE_USED.category.getBadgeIcon(company)}
                    <span>{SOURCE_USED.category.label}</span>
                </div>
            </div>

            {company.searchedCompanyData ? (
                <div className="space-y-4">
                    {/* Scraped Websites Section */}
                    <div className="rounded-lg border p-3">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="font-medium">Scraped Websites</h4>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Show screenshots</span>
                                <Switch
                                    checked={showScreenshots}
                                    onCheckedChange={setShowScreenshots}
                                    className="data-[state=checked]:bg-primary"
                                />
                            </div>
                        </div>
                        {isLoadingScrapedWebsites ? (
                            <div className="text-sm text-muted-foreground mt-2">Loading scraped websites...</div>
                        ) : scrapedWebsites.length > 0 ? (
                            <div className="space-y-4 mt-2">
                                {scrapedWebsites.map((website, index) => (
                                    <div key={index} className="border rounded-md p-3">
                                        <div className="space-y-2">
                                            <p className="text-sm">
                                                <strong>URL:</strong>{" "}
                                                <a
                                                    href={website.url || "#"}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-primary hover:underline"
                                                >
                                                    {website.url || "N/A"}
                                                </a>
                                            </p>
                                            {website.page_title && (
                                                <p className="text-sm">
                                                    <strong>Page Title:</strong> {website.page_title}
                                                </p>
                                            )}
                                            {website.accessed_on && (
                                                <p className="text-sm">
                                                    <strong>Accessed:</strong>{" "}
                                                    {new Date(website.accessed_on).toLocaleString()}
                                                </p>
                                            )}
                                        </div>
                                        {showScreenshots ? (
                                            website.screenshot && (
                                                <div className="mt-3">
                                                    <div
                                                        className="relative group cursor-pointer"
                                                        onClick={() => setSelectedScreenshot(website.screenshot)}
                                                    >
                                                        <img
                                                            src={website.screenshot}
                                                            alt={`Screenshot of ${website.url}`}
                                                            className="w-full max-h-[200px] object-contain rounded-md border border-border hover:border-primary transition-colors"
                                                        />
                                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-md">
                                                            <span className="text-white text-sm flex items-center gap-1">
                                                                <Image className="h-4 w-4" />
                                                                View Full Size
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        ) : null}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
                                <Info className="h-4 w-4" />
                                <span>No scraped websites available.</span>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="rounded-lg border p-4">
                    <p className="text-muted-foreground flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        <span>
                            {WEBSEARCH.category.status === 'completed' ? 'No source information found.' : 'Source information is not available or is still being processed.'}
                        </span>
                    </p>
                </div>
            )}

            {/* Full-sized screenshot dialog */}
            <Dialog
                open={!!selectedScreenshot}
                onOpenChange={(open) => {
                    if (!open) setSelectedScreenshot(null)
                }}
            >
                <DialogContent className="max-w-screen-lg max-h-[90vh] flex flex-col overflow-hidden">
                    <DialogHeader>
                        <DialogTitle>Website Screenshot</DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 overflow-auto p-1">
                        {selectedScreenshot && (
                            <img
                                src={selectedScreenshot}
                                alt="Full-sized website screenshot"
                                className="w-full h-auto"
                            />
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setSelectedScreenshot(null)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
} 