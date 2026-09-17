/**
 * My Tax Plan — the system of record behind TaxLens.
 *
 * Pure state transitions only. The extension persists this through
 * `browser.storage`; the Taxfix app persists it through its own adapter. The
 * engine itself never touches a storage API, so both surfaces agree on the
 * numbers by construction.
 */

import { clampProfessionalUse, estimateTaxLens, formatEuro } from "./estimate";

export type OpportunityStatus = "considering" | "purchased" | "declined";

export type OpportunitySource = "extension" | "share-sheet" | "email-inbox";

export interface Opportunity {
	id: string;
	productName: string;
	retailer: string;
	productUrl: string;
	priceEuro: number;
	/** Expected professional-use share (0–1). */
	professionalUse: number;
	estimatedTaxBenefitEuro: number;
	taxYear: number;
	savedAt: string;
	status: OpportunityStatus;
	invoiceUploaded: boolean;
	reminderEnabled: boolean;
	source: OpportunitySource;
}

export interface TaxPlanState {
	/** Whether the extension holds a scoped connection to the Taxfix account. */
	connected: boolean;
	opportunities: Opportunity[];
}

export interface TaxPlanSummary {
	savedCount: number;
	/** Sum of the tax-relevant share across items still in play, in EUR. */
	taxRelevantEuro: number;
	estimatedTaxEffectEuro: number;
	/** Purchased items whose invoice is still missing. */
	missingInvoices: number;
	/** Items the user has not yet decided on. */
	awaitingDecision: number;
	/** 0–100, how far the next return has been prepared. */
	readinessPercent: number;
}

export const emptyTaxPlan: TaxPlanState = {
	connected: false,
	opportunities: [],
};

export function newOpportunityId(): string {
	return `opp_${Math.random().toString(36).slice(2, 10)}`;
}

/** Steps a single opportunity contributes to return readiness. */
function readinessSteps(opportunity: Opportunity): {
	done: number;
	total: number;
} {
	// Saved is always one completed step.
	if (opportunity.status === "declined") {
		// Decided against it: saved + decided is all the preparation it needs.
		return { done: 2, total: 2 };
	}
	if (opportunity.status === "purchased") {
		return { done: opportunity.invoiceUploaded ? 3 : 2, total: 3 };
	}
	return { done: 1, total: 3 };
}

export function summarizeTaxPlan(
	opportunities: readonly Opportunity[],
): TaxPlanSummary {
	let taxRelevantEuro = 0;
	let estimatedTaxEffectEuro = 0;
	let missingInvoices = 0;
	let awaitingDecision = 0;
	let done = 0;
	let total = 0;

	for (const opportunity of opportunities) {
		const steps = readinessSteps(opportunity);
		done += steps.done;
		total += steps.total;

		if (opportunity.status === "declined") {
			continue;
		}
		taxRelevantEuro += opportunity.priceEuro * opportunity.professionalUse;
		estimatedTaxEffectEuro += opportunity.estimatedTaxBenefitEuro;
		if (opportunity.status === "purchased" && !opportunity.invoiceUploaded) {
			missingInvoices += 1;
		}
		if (opportunity.status === "considering") {
			awaitingDecision += 1;
		}
	}

	return {
		savedCount: opportunities.length,
		taxRelevantEuro: Math.round(taxRelevantEuro * 100) / 100,
		estimatedTaxEffectEuro: Math.round(estimatedTaxEffectEuro * 100) / 100,
		missingInvoices,
		awaitingDecision,
		readinessPercent: total === 0 ? 0 : Math.round((done / total) * 100),
	};
}

/** The one-line nudge the app shows when something needs the user. */
export function nextBestAction(summary: TaxPlanSummary): string {
	if (summary.savedCount === 0) {
		return "Nothing saved yet. TaxLens will add items while you shop.";
	}
	if (summary.missingInvoices > 0) {
		return `${summary.missingInvoices} invoice${
			summary.missingInvoices === 1 ? "" : "s"
		} still missing — upload while you can still find them.`;
	}
	if (summary.awaitingDecision > 0) {
		return `${summary.awaitingDecision} item${
			summary.awaitingDecision === 1 ? "" : "s"
		} waiting on your decision.`;
	}
	return "Your tax plan is up to date. We'll ping you when something changes.";
}

/** The monthly digest that earns an app open without a daily notification. */
export function monthlyDigest(
	summary: TaxPlanSummary,
	month: string,
): readonly string[] {
	return [
		`${summary.savedCount} potential work expense${
			summary.savedCount === 1 ? "" : "s"
		} saved in ${month}`,
		`${summary.missingInvoices} invoice${
			summary.missingInvoices === 1 ? "" : "s"
		} still missing`,
		`${formatEuro(summary.estimatedTaxEffectEuro)} estimated tax effect added`,
		`Your next return is now ${summary.readinessPercent}% ready`,
	];
}

export interface SaveOpportunityInput {
	productName: string;
	retailer: string;
	productUrl: string;
	priceEuro: number;
	professionalUse: number;
	marginalTaxRate: number;
	taxYear: number;
	reminderEnabled?: boolean;
	source?: OpportunitySource;
	savedAt?: string;
	id?: string;
}

export function buildOpportunity(input: SaveOpportunityInput): Opportunity {
	const professionalUse = clampProfessionalUse(input.professionalUse);
	const estimate = estimateTaxLens(
		input.priceEuro,
		professionalUse,
		input.marginalTaxRate,
	);

	return {
		id: input.id ?? newOpportunityId(),
		productName: input.productName,
		retailer: input.retailer,
		productUrl: input.productUrl,
		priceEuro: input.priceEuro,
		professionalUse,
		estimatedTaxBenefitEuro: estimate.estimatedTaxBenefit,
		taxYear: input.taxYear,
		savedAt: input.savedAt ?? new Date().toISOString(),
		status: "considering",
		invoiceUploaded: false,
		reminderEnabled: input.reminderEnabled ?? false,
		source: input.source ?? "extension",
	};
}

export function addOpportunity(
	state: TaxPlanState,
	input: SaveOpportunityInput,
): { state: TaxPlanState; opportunity: Opportunity } {
	const opportunity = buildOpportunity(input);
	const next: TaxPlanState = {
		connected: true,
		opportunities: [opportunity, ...state.opportunities],
	};
	return { state: next, opportunity };
}

function mapOpportunity(
	state: TaxPlanState,
	id: string,
	update: (opportunity: Opportunity) => Opportunity,
): TaxPlanState {
	return {
		...state,
		opportunities: state.opportunities.map((opportunity) =>
			opportunity.id === id ? update(opportunity) : opportunity,
		),
	};
}

export function setOpportunityStatus(
	state: TaxPlanState,
	id: string,
	status: OpportunityStatus,
): TaxPlanState {
	return mapOpportunity(state, id, (opportunity) => ({
		...opportunity,
		status,
		// Walking back a purchase drops the document that belonged to it.
		invoiceUploaded:
			status === "purchased" ? opportunity.invoiceUploaded : false,
	}));
}

/** Simulated upload: the prototype records the fact, never a file. */
export function markInvoiceUploaded(
	state: TaxPlanState,
	id: string,
): TaxPlanState {
	return mapOpportunity(state, id, (opportunity) => ({
		...opportunity,
		status: "purchased",
		invoiceUploaded: true,
	}));
}

export function setReminder(
	state: TaxPlanState,
	id: string,
	reminderEnabled: boolean,
): TaxPlanState {
	return mapOpportunity(state, id, (opportunity) => ({
		...opportunity,
		reminderEnabled,
	}));
}

export function removeOpportunity(
	state: TaxPlanState,
	id: string,
): TaxPlanState {
	return {
		...state,
		opportunities: state.opportunities.filter(
			(opportunity) => opportunity.id !== id,
		),
	};
}

/**
 * Seed a plan that already carries a few months of captured moments, so the
 * accumulated-value screen can be demoed without replaying every save.
 * Each entry shows a different entry point into the same tax plan.
 */
export function demoTaxPlan(
	taxYear: number,
	marginalTaxRate: number,
): TaxPlanState {
	const seeds: readonly (SaveOpportunityInput & {
		status: OpportunityStatus;
		invoiceUploaded: boolean;
	})[] = [
		{
			id: "opp_demo_desk",
			productName: "Standing desk 160×80",
			retailer: "Büro Direkt",
			productUrl: "https://example.shop/standing-desk",
			priceEuro: 540,
			professionalUse: 0.9,
			marginalTaxRate,
			taxYear,
			savedAt: "2026-06-14T10:12:00.000Z",
			source: "extension",
			reminderEnabled: true,
			status: "purchased",
			invoiceUploaded: true,
		},
		{
			id: "opp_demo_course",
			productName: "Advanced TypeScript course",
			retailer: "LernHub",
			productUrl: "https://example.shop/typescript-course",
			priceEuro: 300,
			professionalUse: 1,
			marginalTaxRate,
			taxYear,
			savedAt: "2026-07-02T08:45:00.000Z",
			source: "share-sheet",
			reminderEnabled: true,
			status: "purchased",
			invoiceUploaded: false,
		},
		{
			id: "opp_demo_headset",
			productName: "Noise-cancelling headset",
			retailer: "Elektromarkt",
			productUrl: "https://example.shop/headset",
			priceEuro: 240,
			professionalUse: 0.7,
			marginalTaxRate,
			taxYear,
			savedAt: "2026-08-21T17:30:00.000Z",
			source: "email-inbox",
			status: "considering",
			invoiceUploaded: false,
		},
	];

	return {
		connected: true,
		opportunities: seeds.map((seed) => ({
			...buildOpportunity(seed),
			status: seed.status,
			invoiceUploaded: seed.invoiceUploaded,
		})),
	};
}
