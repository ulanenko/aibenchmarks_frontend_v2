import { ExternalLink, Globe, Info, Search } from "lucide-react"
import { Company } from "@/lib/company"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface CompanyInfoBarProps {
    company: Company
}

export function CompanyInfoBar({ company }: CompanyInfoBarProps) {
    const { inputValues } = company
    const { url, country, naceRev2 } = inputValues

    const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(inputValues.name || '')}`

    return (
        <div className="border-b bg-muted/30 px-6 py-2 flex items-center justify-between">
            <div className="flex items-center gap-6">
                {url && (
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Website:</span>
                        <Link href={url.startsWith('http') ? url : `https://${url}`} target="_blank" className="text-sm hover:underline flex items-center gap-1">
                            {url} <ExternalLink className="h-3 w-3" />
                        </Link>
                    </div>
                )}
                {country && (
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Country:</span>
                        <span className="text-sm">{country}</span>
                    </div>
                )}
                {naceRev2 && (
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Industry Code:</span>
                        <span className="text-sm">{naceRev2}</span>
                    </div>
                )}
            </div>
            <Button variant="ghost" size="sm" asChild>
                <Link href={googleSearchUrl} target="_blank" className="flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    Search on Google
                </Link>
            </Button>
        </div>
    )
} 