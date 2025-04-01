import { Bot, LucideIcon, MessageCircleQuestion, MessageCircleQuestionIcon, User, HelpCircle, CircleHelp, Icon } from "lucide-react";
import { ColumnConfig } from "./column-definition";
import { Column } from "./column-definition";
import { Company, CompanyHotCopy, isAcceptOrReject } from "./company";
import { getValueForPath } from "./object-utils";
import { getColorClass } from "./colors";
import { get } from "http";
import { cn } from "@/lib/utils";
import { JSX, ReactNode } from "react";
import { CATEGORIES } from "@/config/categories";
import { CategoryDefinition } from "./category-definition";

export type ComparabilityFactorOptions = 'products' | 'functions' | 'independence' | 'dataQuality';
type ColumnComparabilityDefinitionConfig = Omit<ColumnConfig, 'data'> & {
	cfFactor: ComparabilityFactorOptions;
	columnType: 'humanreview' | 'ai';
	aiDescriptionPath: string;
	aiDecisionPath: string;
	humanDecisionPath: string;
	aiMotivationPath: string;
	humanMotivationPath: string;
}

class ColumnComparabilityDefinition extends Column {
	aiDecisionPath: string;
	humanDecisionPath: string;
	aiMotivationPath: string;
	aiDescriptionPath: string;
	humanMotivationPath: string;
	columnType: 'humanreview' | 'ai';
	cfFactor: ComparabilityFactorOptions;

	constructor(config: ColumnComparabilityDefinitionConfig) {
		const data = `dynamicInputValues.${config.cfFactor}`;
		const configWithData = {...config, data};
		configWithData.hotProps = {
			aiDecisionPath: config.aiDecisionPath,
			humanDecisionPath: config.humanDecisionPath,
			aiMotivationPath: config.aiMotivationPath,
			humanMotivationPath: config.humanMotivationPath,
			aiDescriptionPath: config.aiDescriptionPath,
			cfFactor: config.cfFactor,
		}
		super(configWithData);
		this.aiDecisionPath = config.aiDecisionPath;
		this.humanDecisionPath = config.humanDecisionPath;
		this.aiMotivationPath = config.aiMotivationPath;
		this.humanMotivationPath = config.humanMotivationPath;
		this.aiDescriptionPath = config.aiDescriptionPath;
		this.columnType = config.columnType;
		this.cfFactor = config.cfFactor;
	}

	getValues(company: Company | CompanyHotCopy) {
		const aiDecision = getValueForPath(company, this.aiDecisionPath);
		const humanDecision = getValueForPath(company, this.humanDecisionPath);
		const aiMotivation = getValueForPath(company, this.aiMotivationPath);
		const humanMotivation = getValueForPath(company, this.humanMotivationPath);
		const aiDescription = getValueForPath(company, this.aiDescriptionPath);
		const aiDecisionBoolean = isAcceptOrReject(aiDecision);
		const humanDecisionBoolean = isAcceptOrReject(humanDecision);
		const isHumanDecision = humanDecisionBoolean !== undefined;
		const decisionBoolean = isHumanDecision ? humanDecisionBoolean : aiDecisionBoolean;
		return {aiDecision, humanDecision, aiMotivation, humanMotivation, aiDescription, aiDecisionBoolean, humanDecisionBoolean, decisionBoolean, isHumanDecision};
	}



	getBadgeIcon(company: Company, showText: boolean = false, onlyConsiderAi: boolean = false): ReactNode {
		const {isHumanDecision,aiDecisionBoolean, decisionBoolean} = this.getValues(company);
        const {ACCEPT_AI, ACCEPT_HR, REJECT_AI, REJECT_HR, NO_DECISION} = CATEGORIES.HUMAN_REVIEW
        const useHumanDecision = isHumanDecision && !onlyConsiderAi;
        let category:CategoryDefinition;
        if(useHumanDecision){
            category = decisionBoolean ? ACCEPT_HR : REJECT_HR;
        } else {
            if(aiDecisionBoolean === undefined){
                category = NO_DECISION;
            } else {
                category = aiDecisionBoolean ? ACCEPT_AI : REJECT_AI;
            }
        }
        if(!category){
            return null;
        }
        const Icon = category.icon;
        const backgroundColor = category.getColorClass()

		return (
			<div className={cn(backgroundColor, showText ? 'h-5 gap-1 px-2' : 'w-5 h-5', ' inline-flex items-center justify-center  rounded-full ')}>
				<Icon className="w-3 h-3 text-white" />
				{showText && <span className="text-xs text-white">{category.label}</span>}
			</div>
		);
	}
}

export { ColumnComparabilityDefinition, type ColumnComparabilityDefinitionConfig }; 