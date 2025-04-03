import { Globe, Bot } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Company } from "@/lib/company/company"
import { validateCompanyWebsite } from "@/services/client/validate-company-website"
import { useToast } from "@/hooks/use-toast"
import { useCompanyStore } from "@/stores/use-company-store"
import { useState, useEffect, useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { useBenchmarkStore } from "@/stores/use-benchmark-store"
import { saveValidationResultAction } from "@/app/actions/website-validation-actions"
import { createInputSettings, WebsiteValidationStatus } from "@/lib/company/website-validation"

interface WebsiteSourceTabProps {
  company: Company
  onActionsChange?: (actions: React.ReactNode) => void
}

const reviewValueToTextMap: Record<string, {
  text: string
  onlyShowIfDescriptionIsSufficent: boolean
  description: string
  reject: boolean
}> = {
  website_na: {
    text: 'Website N/A',
    onlyShowIfDescriptionIsSufficent: false,
    description: 'Website is not available',
    reject: true,
  },
  website_na_try_description: {
    text: 'Website N/A (use description)',
    onlyShowIfDescriptionIsSufficent: true,
    description: 'Website N/A, try using the description',
    reject: false,
  },
  website_not_working: {
    text: 'Website not working',
    onlyShowIfDescriptionIsSufficent: false,
    description: 'Website is not working',
    reject: true,
  },
  website_not_working_try_description: {
    text: 'Website not working (use description)',
    onlyShowIfDescriptionIsSufficent: true,
    description: 'Website not working, try using the description',
    reject: false,
  },
}

export function WebsiteSourceTab({ company, onActionsChange }: WebsiteSourceTabProps) {
  const { toast } = useToast()
  const [url, setUrl] = useState(company.backendState.urlValidationUrl || company.inputValues.url || "")
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [validatedURL, setValidatedURL] = useState<string | null>(company.backendState.urlValidationUrl || null)
  const [validationPassed, setValidationPassed] = useState<boolean | null>(company.backendState.urlValidationValid ?? null)
  const [resolutionOption, setResolutionOption] = useState<string>(Object.keys(reviewValueToTextMap).find(key => reviewValueToTextMap[key].text === company.inputValues.cfSufficientDataHRMotivation) || "none")
  // TODO: get from benchmark store
  const descriptionIsEnabled = useBenchmarkStore?.getState().benchmark?.useDescription || false
  const descriptionForCompanyIsSufficent = company.categoryValues?.DESCRIPTION.category.passed
  const { companyDescriptionIsSufficent, descriptionCanBeUsed } = useMemo(() => {
    return {
      companyDescriptionIsSufficent: descriptionForCompanyIsSufficent,
      descriptionCanBeUsed: descriptionForCompanyIsSufficent && descriptionIsEnabled
    }
  }, [descriptionForCompanyIsSufficent, descriptionIsEnabled])

  const validationValid = useMemo(() => {
    if (validatedURL === url) {
      return validationPassed
    }
    return null
  }, [company.backendState.urlValidationValid, validatedURL, url])

  // Pass actions to parent component
  useEffect(() => {
    if (onActionsChange) {
      onActionsChange(
        <Button
          onClick={handleSave}
          disabled={isSaving || (!url && resolutionOption === "none")}
        >
          {isSaving ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : resolutionOption !== "none" ? (
            "Reject (no website)"
          ) : validationValid ? (
            "Update URL"
          ) : (
            "Validate & Update URL"
          )}
        </Button>
      )
    }
  }, [onActionsChange, url, validatedURL, validationPassed, resolutionOption, isLoading, isSaving])

  const handleValidation = async (): Promise<WebsiteValidationStatus | false> => {
    try {
      setIsLoading(true)

      company.inputValues.url = url
      const DONOTUPDATESTORESTATE = false;
      const { result, error } = await validateCompanyWebsite(company, DONOTUPDATESTORESTATE)

      if (error) {
        toast({
          title: "Validation Error",
          description: error,
          variant: "destructive",
        })
        return false
      }

      if (result) {
        setValidatedURL(result.urlValidationUrl)
        setValidationPassed(result.urlValidationValid)
        setUrl(result.urlValidationUrl)

        if (!result.urlValidationValid) {
          if (descriptionCanBeUsed) {
            setResolutionOption("website_na_try_description")
          } else {
            setResolutionOption("website_na")
          }
        } else {
          setResolutionOption("none")
        }

        toast({
          title: "Website Validated",
          description: result.urlValidationValid
            ? "The website has been successfully validated and updated."
            : "No valid website could be found for this company.",
          variant: result.urlValidationValid ? "default" : "destructive",
        })

        return result
      }
      return false
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred during validation",
        variant: "destructive",
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSearch = () => {
    const searchQuery = encodeURIComponent(`${company.inputValues.name} ${company.inputValues.country}`)
    window.open(`https://www.google.com/search?q=${searchQuery}`, '_blank')
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      const benchmarkId = useBenchmarkStore.getState().benchmark?.id
      const { name, country, url: urlFromInput } = company.inputValues
      if (!benchmarkId || !name || !country) {
        toast({
          title: "Error",
          description: "Benchmark ID or company name not found",
          variant: "destructive",
        })
        return
      }

      // creat the initial validation result
      let validationResult: WebsiteValidationStatus = {
        urlValidationInput: createInputSettings(name, country, urlFromInput),
        urlValidationUrl: url || "N/A",
        urlValidationValid: validationValid,
      }


      let resolutionOptionObject = reviewValueToTextMap[resolutionOption]
      let resolutionOptionChanged = resolutionOptionObject?.text !== company.inputValues.cfSufficientDataHRMotivation
      // we have an invlaid validation result if the resolution option has changed 
      const needsValidation = (validationValid === null || resolutionOptionChanged) && resolutionOption === "none"
      if (needsValidation) {
        // we validate the url and update the resolution option, this will manage 
        const validationResultUpdated = await handleValidation()
        if (validationResultUpdated) {
          // the input values cannot be used because the url may be different than the input url
          validationResult.urlValidationValid = validationResultUpdated.urlValidationValid
          validationResult.urlValidationUrl = validationResultUpdated.urlValidationUrl
        }
        // Return early if validation failed or was cancelled
      }
      resolutionOptionObject = reviewValueToTextMap[resolutionOption]
      resolutionOptionChanged = resolutionOptionObject?.text !== company.inputValues.cfSufficientDataHRMotivation




      // this means that we manually set the resolution option and the website validation
      // we set the validation value to invalid

      // we set the validation result to invalid if the resolution option is not none
      if (resolutionOption !== "none") {
        setValidationPassed(false)
        setValidatedURL(url)
        validationResult.urlValidationValid = false
      }
      // store the  website validation result
      await saveValidationResultAction(benchmarkId, company.id, validationResult)

      // we need to update the resolution option if it has changed
      if (resolutionOptionChanged) {
        // we udpate the resolution option
        useCompanyStore.getState().updateCompany({
          id: company.id,
          inputValues: {
            cfSufficientDataHRMotivation: resolutionOptionObject?.text ?? null,
          },
        })
        // this will update the company in the store (including the new url validation result)
        useCompanyStore.getState().saveChanges([company.id])
      } else {
        // otherwise we update the company in the store (including the new url validation result)
        useCompanyStore.getState().updateCompaniesWithAction(company.id, (company) => {
          company.updateWebsiteValidation(validationResult)
        })
      }

      toast({
        title: "Success",
        description: "Website information has been updated.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred while saving",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const getWarningMessage = () => {
    if (isLoading || isSaving) return null
    if (validationPassed === false) return "The provided URL could not be validated."
    if (resolutionOption !== "none") return null
    if (!url) return "Please enter a valid URL to continue."
    if (url === company.inputValues.url) return "Please enter a different URL from the current one to restart the search."
    return null
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">Website Source</h3>
        <p className="text-sm text-muted-foreground mt-1">
          A websearch was performed for this company. Updating the URL will remove previous search results and
          accept/reject made by AI.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="url"
          placeholder="https://www.example.com/"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={resolutionOption !== "none"}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
        <Button
          variant={validationValid === true ? "default" : validationValid === false ? "destructive" : "outline"}
          size="icon"
          className="h-10 w-10"
          onClick={handleValidation}
          disabled={isLoading || !company.inputValues.name || !company.inputValues.country || resolutionOption !== "none"}
        >
          {isLoading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <Bot className="h-5 w-5" />
          )}
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10"
          onClick={handleGoogleSearch}
          disabled={!company.inputValues.name || !company.inputValues.country || resolutionOption !== "none"}
        >
          <Globe className="h-5 w-5" />
        </Button>
      </div>

      {getWarningMessage() && (
        <div className="rounded-md bg-amber-50 border border-amber-200 p-3 text-amber-800">
          {getWarningMessage()}
        </div>
      )}

      {!company.inputValues.name || !company.inputValues.country ? (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-red-800">
          Company name and country are required for website validation.
        </div>
      ) : null}

      <div className="mt-6">
        <h3 className="text-lg font-medium mb-4">Resolution Options</h3>
        <p>{company.inputValues.cfSufficientDataHRMotivation ?? "none"}</p>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <input
              type="radio"
              id="try-website"
              name="resolution"
              className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
              checked={resolutionOption === "none"}
              onChange={() => setResolutionOption("none")}
            />
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-gray-600" />
              <label htmlFor="try-website" className="text-sm font-medium">
                Try website
              </label>
            </div>
            <span className="text-sm text-muted-foreground ml-auto">Analyse website</span>
          </div>

          {Object.entries(reviewValueToTextMap).map(([key, value]) => (
            <div key={key} className="flex items-center gap-3">
              <input
                type="radio"
                id={key}
                name="resolution"
                className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                checked={resolutionOption === key}
                onChange={() => setResolutionOption(key)}
              />
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-gray-600" />
                <label htmlFor={key} className="text-sm font-medium">
                  {value.text}
                </label>
              </div>
              <span className="text-sm text-muted-foreground ml-auto">
                {value.description}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 